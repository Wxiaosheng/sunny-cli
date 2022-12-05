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

const cp = require('child_process')
const log = require('@sunny-cli/log')
const Package = require('@sunny-cli/package')
const { getLatestVersion } = require('@sunny-cli/get-npm-info')

const COMMAND_MAP = {
    'init': '@sunny-cli/init'
}

const exec = async (projectName, options, comObj) => {
    try {
        const cliName = comObj.name()
        const pkgName = COMMAND_MAP[cliName]
        const { targetPath } = options
        let pkg
        if (targetPath) {
            log.verbose('进入调试本地包流程')
            pkg = new Package({
                name: pkgName,
                path: targetPath
            })
        } else {
            log.verbose('进入加载远程包流程')
            const latestVersion = await getLatestVersion(pkgName)
            pkg = new Package({ 
                name: pkgName,
                version: latestVersion
            })
            if (!pkg.isCached()) {
                await pkg.install()
            }
        }
        
        const childArgv = Object.create(null)
        Object.keys(comObj).forEach(key => {
            if (
                !key.startsWith('_') &&
                key !== 'parent' && key !== 'options'
            ) childArgv[key] = comObj[key]
        })

        // 生成指令
        const code = `require('${pkg.getMainPath()}').call(null, ${JSON.stringify(childArgv)})`
        console.log(code)
        // 多线程执行
        const child = cp.spawn('node', ['-e', code], {
            cwd: process.cwd(),
            stdio: 'inherit'
        })
        child.on('error', e => {
            log.error(e.message)
            process.exit(1)
        })
        child.on('exit', e => {
            log.verbose('命令执行成功：', e)
            process.exit(1)
        })
    } catch (e) {
        log.error(e.message)
        if (process.env.CLI_DEBUG) {
            console.log(e)
        }
    }
}

module.exports = exec