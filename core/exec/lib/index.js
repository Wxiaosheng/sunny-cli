/**
 * 动态执行 远程脚本（可调试本地包）
 * 
 * 是否本地调试
 *  Y - 确定调试包根路径，找到对应入口文件
 *  N - 
 *      根据用户输入的命令名，生成对应的远程包名
 *      获取远程包最新的版本
 *      生成缓存路径
 *          查找要下载的包 最新版本，是否存在缓存
 *          否，在缓存路径下，下载安装远程包
 *      找到缓存路径下远程包的入口文件
 * 
 *  通过多线程 加载远程包的执行
 * 
 */

const log = require('@sunny-cli/log')

const COMMAND_MAP = {
    'init': '@imooc-cli/init'
}

const exec = (projectName, options, comObj) => {
    const cliName = COMMAND_MAP[comObj.name()]
    console.log('exec', projectName, options, cliName)
    const { targetPath } = options
    if (targetPath) {
        log.verbose('进入调试本地包流程')
    } else {
        log.verbose('进入加载远程包流程')
    }
}

module.exports = exec