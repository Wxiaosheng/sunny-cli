const path = require('path')

class Package {
    constructor(otps) {
        if (!otps.name) throw new Error('Package 必须出入 name')
        this.name = otps.name

        if (otps.path) {
            this.path = this.normalPath(otps.path)
        }
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


}

module.exports = Package