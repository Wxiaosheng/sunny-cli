class Command {
    constructor(otps) {
        console.log('constructor', otps)
    }

    init () {
        throw new Error('Command 子类必须实现 init 方法')
    }

    exec () {
        throw new Error('Command 子类必须实现 exec 方法')
    }
}

module.exports = Command