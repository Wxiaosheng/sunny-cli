const fs = require('fs')
const semver = require('semver')
const log = require('@sunny-cli/log')
const pkg = require('../package.json')
const CONST = require('./const')

const checkCliVersion = async () => {
  console.log('cli version', pkg.version)
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

const cli = () => {
  
  preExce()

}

module.exports = cli