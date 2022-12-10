class Command {
    constructor(otps) {

        const runner = new Promise(() => {
            let chain = Promise.resolve()
            chain = chain.then(() => this.initArgs(otps))
            chain = chain.then(() => this.init())
            chain = chain.then(() => this.exec())
        })
    }

    initArgs (otps) {
        this._args = otps.args
    }

    init () {
        throw new Error('Command 子类必须实现 init 方法')
    }

    exec () {
        throw new Error('Command 子类必须实现 exec 方法')
    }
}

module.exports = Command