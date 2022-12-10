const fs = require('fs')

const isEmptyDir = (path, ignore  = ['node_modules']) => {
    return fs.readdirSync(path)
            .filter(file => file.startsWith('.') || !ignore.includes(file))
            .length < 1
}

module.exports = {
    isEmptyDir
}