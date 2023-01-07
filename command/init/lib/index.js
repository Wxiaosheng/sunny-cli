const path = require('path')
const inquirer = require('inquirer')
const semver = require('semver')
const fse = require('fs-extra')
const log = require('@sunny-cli/log')
const Command = require('@sunny-cli/command')
const Package = require('@sunny-cli/package')
const request = require('@sunny-cli/request')
const { isEmptyDir, spawnOSSync } = require('@sunny-cli/utils')
const { TYPE_PROJECT, TYPE_COMPONENT } = require('./constant')

class InitCommand extends Command {
    init () {
        this.projectName = this._args[0] || ''
        this.localPath = process.cwd()
    }

    async prepare () {
        // 1、判断当前文件夹是否为空
        if (!isEmptyDir(this.localPath)) {
            const { force } = await inquirer.prompt([{
                type: 'confirm',
                name: 'force',
                message: '当前文件夹不为空，是否继续？',
                default: false
            }])
            this.force = force
            if (force) {
                fse.emptyDirSync(this.localPath)
            } else {
                log.error('您选择不覆盖当前路径，已退出初始化流程！！！')
                return
            }
        }
        // 2、是否启动强制更新
        // 3、获取用户初始化信息
        const { projectType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'projectType',
                message: '请选择要创建的项目类型？',
                default: TYPE_PROJECT,
                choices: [
                    { name: '项目', value: TYPE_PROJECT },
                    { name: '组件', value: TYPE_COMPONENT }
                ]
            }
        ])
        log.verbose('您已选择创建 ', projectType)

        const typeText = projectType === TYPE_PROJECT ? '项目' : '组件'
        const questions = [
            {
                type: 'input',
                name: 'projectName',
                default: '',
                message: `请输入要创建的${typeText}名称：`,
                validate: function(v) {
                    // 1、首字符 必须为英文字符
                    // 2、尾字符 必须为英文或数字，不能为字符
                    // 3、字符仅允许 "-_"
                    const done = this.async();
                    setTimeout(function() {
                        if (!/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v)) {
                            done('您输入的名称不合法！！！');
                            return;
                        }
                        done(null, true);
                    }, 0);
                }
            },
            {
                type: 'input',
                name: 'projectVersion',
                default: '',
                message: `请输入要创建的${typeText}版本号：`,
                validate: function (v) {
                    const done = this.async();
                    setTimeout(function() {
                        if (!!!semver.valid(v)) {
                            done('您输入的版本号不合法！！！');
                            return;
                        }
                        done(null, true);
                    }, 0);
                    return 
                }
            }
        ]
        if (projectType === TYPE_COMPONENT) {
            questions.push({
                type: 'input',
                name: 'descriptions',
                default: '',
                message: '请输入组件描述信息：',
                validate: function(v) {
                    // 不能为空
                    const done = this.async();
                    setTimeout(function() {
                        if (v?.trim()?.length < 1) {
                            done('组件描述信息不能为空！！！');
                            return;
                        }
                        done(null, true);
                    }, 0);
                },
            })
        }
        const info = await inquirer.prompt(questions)

        // 选择模板
        const templates = await this.getTemplates(projectType)
        const { template } = await inquirer.prompt({
            type: 'list',
            name: 'template',
            choices: templates,
            message: `请选择${typeText}模板：`,
        })
        const currentTmp = templates.find(tmp => tmp.value === template)

        this.projectInfo = {
            ...info,
            ...currentTmp
        }
    }

    async downTemplate () {
        const { npmName, npmVersion } = this.projectInfo
        const homePath = process.env.CLI_USER_HOME
        const targetPath = path.resolve(homePath, Package.cacheDir, 'template')
        const storeDir = path.resolve(targetPath, 'node_modules')
        const pkg = new Package({ // 远程模板包
            name: npmName,
            version: npmVersion,
            targetPath,
            storeDir
        })
        // 安装模板
        await pkg.install()
        // 拷贝模板内容至当前目录
        const templatePath = path.resolve(pkg.getCachedPath(), 'template')
        fse.copySync(templatePath, process.cwd())
    }

    async ejsRender(options = {}) {
        const glob = require('glob')
        const ejs = require('ejs')
        const filePaths = glob.sync('**', {
            cwd: process.cwd(),
            nodir: true,
            ...options
        })

        filePaths.map(async (filePath) => {
            const result = await ejs.renderFile(
                filePath, 
                this.projectInfo, 
                { async: true }
            )
            fse.writeFileSync(filePath, result);
        })
        
      }

    async start () {
        const { installCommand, startCommand, ignore = [] } = this.projectInfo
        // ejs 渲染
        const templateIgnore = ['**/node_modules/**', ...ignore];
        await this.ejsRender({ ignore: templateIgnore });

        // 安装依赖
        if (installCommand) {
            const [command, ...args] = installCommand.split(' ')
            // 白名单校验
            await this.validCommand(command)
            await spawnOSSync(command, args, {
                cwd: process.cwd(),
                stdio: 'inherit'
            })
        }

        // 启动服务
        if (startCommand) {
            const [command, ...args] = startCommand.split(' ')
            // 白名单校验
            await this.validCommand(command)
            await spawnOSSync(command, args, {
                cwd: process.cwd(),
                stdio: 'inherit'
            })
        }
    }

    async exec () {
        // 1、准备阶段
        await this.prepare()
        if (this.force === false) return
        // 2、下载/安装模板
        await this.downTemplate()
        // 3、安装启动
        this.start()
    }

    // 获取 项目/组件 模板列表
    async getTemplates (type) {
        const url = type === TYPE_PROJECT ? '/getProjectTemplates' : '/getComponentTemplates'
        const list = await request.get(url)
        return list.map(item => ({ 
            ...item,
            name: item.name, 
            value: item.npmName 
        }));
    }

    // 仅运行白名单命令
    async validCommand (com) {
        const list = await request.get('/getWhiteCommands')
        const commands = list.map(item => item.command)
        if (!commands.includes(com)) {
            log.error(`您运行的命令 (${com}) 不正确，请检查后重试！！！（仅支持 ${commands.join('、')} 等命令）`)
            return Promise.reject(false)
        }
        return Promise.resolve(true)
    }
}

module.exports.InitCommand = InitCommand

module.exports = (args) => {
    new InitCommand(args)
}