const fs = require('fs')
const semver = require('semver')
const log = require('@sunny-cli/log')
const command = require('commander')
const exec = require('@sunny-cli/exec')
const pkg = require('../package.json')
const CONST = require('./const')

const checkCliVersion = async () => {
  const { getLatestVersion } = require('@sunny-cli/get-npm-info')
  const latestVersion = await getLatestVersion(pkg.name)
  if (latestVersion && semver.lt(pkg.version, latestVersion)) {
    log.notice(`您当前 cli 的版本过低，可升级到 v${latestVersion} 体验最新版！`)
  }
}

const checkNodeVersion = () => {
  const nodeVersion = process.version
  if (semver.lt(nodeVersion, CONST.DEFAULT_NODE_VERSION)) {
    throw new Error(`您的 Node 版本太低，请升级为 v${CONST.DEFAULT_NODE_VERSION} 及以上版本！！！`)
  }
}

const checkUserHome = () => {
  const os = require('os')
  const userHome = os.homedir()
  if (!userHome || !fs.existsSync(userHome)) {
    throw new Error('无法访问当前用户主目录，请检查是否存在！')
  }
}

const checkRoot = () => {
  const rootCheck = require('root-check')
  rootCheck()
}

const checkInputArgv = () => {
  // 可开启 debug 模式
  const minimist = require('minimist')
  const argv = minimist(process.argv.slice(2))
  if (argv.debug) {
    log.level = 'verbose'
    log.verbose('您已开启调试模式')
  }
}

// 1、执行准备
const preExce = async () => {
  try {
    await checkCliVersion()
    checkNodeVersion()
    checkUserHome()
    checkRoot()
    checkInputArgv()
  } catch (error) {
    log.error(error.message)
  }
}

// 2、注册命令
const registerCommand = () => {
  const program = new command.Command()

  program
    .name('sunny-cli')
    .version(pkg.version)
    .usage('command <command>')
    .option('-d, --debug', '开启调试模式');
  
  program
    .command('init <projectName>')
    .option('-tp, --targetPath <targetPath>', '本地调试包文件路径')
    .option('-f, --force', '强行覆盖当前文件夹', false)
    .action(exec);

  program.on('command:*', (args) => {
    log.error(`您输入的 ${
      args.join(', ')
    } 命令无法识别, 暂时仅支持 ${
      program.commands.map(com => com.name())
    }`)
  });
  
  program.parse(process.argv);

}

const cli = () => {
  
  preExce()

  registerCommand()

}

module.exports = cli