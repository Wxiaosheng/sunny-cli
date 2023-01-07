const fs = require('fs')
const path = require('path')
const semver = require('semver')
const npminstall = require('npminstall')
const { getLatestVersion } = require('@sunny-cli/get-npm-info')
const { isObject } = require('@sunny-cli/utils')

class Package {
    constructor(opts) {
        if (!opts) throw new Error('Package 类的 opts 参数不能为空！') 
        if (!isObject(opts)) throw new Error('Package 类的 opts 参数必须为对象！') 
        if (!opts.name) throw new Error('Package 类必须出入 name！')
        // package的name
        this.name = opts.name
        // package的version
        this.version = opts?.version || 'latest'
        // package的目标路径
        this.targetPath = opts.targetPath;
        // 缓存package的路径 (存在，即为 远程包实例对象，不存在，则为调试本地包)
        this.storeDir = opts.storeDir;
        // package的缓存目录的前缀
        this.cechedPrefix = this.name.replace('/', '_')
    }

    static cacheDir = '.sunny-cli'

    normalPath (path) {
        const pkgDir = require('pkg-dir')
        const rootPath = pkgDir.sync(path)
        if (!rootPath) {
            throw new Error('本地调试地址错误，无对应的 npm 包')
        }
        return rootPath
    }

    pkgPath () {
        let pkgPath = ''
        if (this.storeDir) { // 远程包
            pkgPath = this.getCachedPath()
        } else { // 本地包
            pkgPath = this.normalPath(this.targetPath)
        }
        return pkgPath
    }

    getPkgInfo () {
        return require(path.resolve(this.pkgPath(), 'package.json'))
    }

    getMainPath () {
        const info = this.getPkgInfo()
        return path.resolve(this.pkgPath(), info?.main || info?.lib)
    }

    isCached () {
        const cachePath = this.getCachedPath()
        return fs.existsSync(cachePath)
    }

    getCachedPath () {
        // @imooc-cli => _@imooc-cli_init@1.1.3@@imooc-cli
        const cacheName = `node_modules/_${this.cechedPrefix}@${this.version}@${this.name}`
        return path.resolve(this.targetPath, cacheName)
    }

    async update () {
        const latest = await getLatestVersion(this.name)
        if (latest && semver.lt(this.version, latest)) {
            this.version = latest
        }
    }

    async install () {
        await this.update()

        await npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            pkgs: [{
                name: this.name,
                version: this.version
            }]
        })
    }

}

module.exports = Package