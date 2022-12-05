const Command = require('@sunny-cli/command')

class InitCommand extends Command {
    init () {
        console.log('InitCommand init')
    }

    exec () {
        console.log('InitCommand exec')
    }
}

module.exports.InitCommand = InitCommand

module.exports = (args) => {
    console.log('InitCommand')
    new InitCommand(args)
}