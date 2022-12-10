const inquirer = require('inquirer')
const semver = require('semver')
const fse = require('fs-extra')
const log = require('@sunny-cli/log')
const Command = require('@sunny-cli/command')
const { isEmptyDir } = require('@sunny-cli/utils')
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
            // if (force) {
            //     fse.emptyDirSync(this.localPath)
            // }
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
        let questions
        if (projectType === TYPE_PROJECT) {
            questions = [{
                type: 'input',
                name: 'projectName',
                default: '',
                message: '请输入要创建的项目名称：',
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
                },
                filter: (v) => {
                    return v
                }
            },{
                type: 'input',
                name: 'projectVersion',
                default: '',
                message: '请输入要创建的项目版本号：',
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
            }]
        } else if (projectType === TYPE_COMPONENT) {
            questions.push()
        }
        
        const info = await inquirer.prompt(questions)
        console.log('info', info)
    }

    async exec () {
        // 1、准备阶段
        this.prepare()
        // 2、下载模板
        // 3、安装模板
    }
}

module.exports.InitCommand = InitCommand

module.exports = (args) => {
    new InitCommand(args)
}