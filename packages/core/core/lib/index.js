const fs = require('fs')
const semver = require('semver')
const log = require('@sunny-cli/log')
const pkg = require('../package.json')
const CONST = require('./const')

const checkCliVersion = () => {
  console.log('cli version', pkg.version)
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

// 1、执行准备
const preExce = () => {
  try {
    checkCliVersion()
    checkNodeVersion()
    checkUserHome()
    checkRoot()
  } catch (error) {
    log.error(error.message)
  }
}

const cli = () => {
  
  preExce()

}

module.exports = cli