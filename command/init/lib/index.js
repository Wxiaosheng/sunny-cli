const inquirer = require('inquirer')
const fse = require('fs-extra')
const Command = require('@sunny-cli/command')
const { isEmptyDir } = require('@sunny-cli/utils')

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
        const questions = [
            {
                type: 'list',
                name: 'projectName',
                message: '请选择要创建的项目类型？',
                default: 'project',
                choices: [
                    { name: '项目', value: 'project' },
                    { name: '组件', value: 'component' }
                ]
            }
        ]
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