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

// 1、执行准备
const preExce = () => {
  try {
    checkCliVersion()
    checkNodeVersion()
  } catch (error) {
    log.error(error.message)
  }
}

const cli = () => {
  
  preExce()

}

module.exports = cli