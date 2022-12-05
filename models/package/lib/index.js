const fs = require('fs')
const path = require('path')
const npminstall = require('npminstall')
const { getLatestVersion } = require('@sunny-cli/get-npm-info')

class Package {
    constructor(opts) {
        if (!opts.name) throw new Error('Package 必须出入 name')
        this.name = opts?.name
        this.cechedPrefix = this.name.replace('/', '_')
        this.version = opts?.version || 'latest'

        if (opts.path) {
            this.path = this.normalPath(opts.path)
            const info = this.getPkgInfo()
            this.version = info.version
        } else {
            this.path = this.getCachedPath()
        }

    }

    static cacheDir = '.sunny-cli/dependencies'

    static get cachePath () {
        return path.resolve(process.env.CLI_USER_HOME, Package.cacheDir)
    }

    normalPath (path) {
        const pkgDir = require('pkg-dir')
        const rootPath = pkgDir.sync(path)
        if (!rootPath) {
            throw new Error('本地调试地址错误，无对应的 npm 包')
        }
        return rootPath
    }

    getPkgPath () {
        return path.resolve(this.path, 'package.json')
    }

    getPkgInfo () {
        return require(this.getPkgPath())
    }

    getMainPath () {
        const info = this.getPkgInfo()
        return path.resolve(this.path, info?.main || info?.lib)
    }

    isCached () {
        const cachePath = this.getCachedPath()
        return fs.existsSync(cachePath)
    }

    getCachedPath () {
        // @imooc-cli => _@imooc-cli_init@1.1.3@@imooc-cli
        const cacheName = `node_modules/_${this.cechedPrefix}@${this.version}@${this.name}`
        return path.resolve(Package.cachePath, cacheName)
    }

    async install () {
        await npminstall({
            root: Package.cachePath,
            pkgs: [{
                name: this.name,
                version: this.version
            }]
        })
    }

}

module.exports = Package