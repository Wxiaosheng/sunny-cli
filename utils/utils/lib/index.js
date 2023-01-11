const fs = require('fs')
const cp = require('child_process')
const path = require('path')

const isEmptyDir = (path, ignore  = ['node_modules']) => {
    return fs.readdirSync(path)
            .filter(file => file.startsWith('.') || !ignore.includes(file))
            .length < 1
}

const isObject = (obj) => {
    return Object.prototype.toString(obj) === '[object Object]'
}

// 跨 OS 多进程执行命令
const spawnOS = (command, args, options) => {
    const win32 = process.platform === 'win32';
    const cmd = win32 ? 'cmd' : command;
    const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
    return cp.spawn(cmd, cmdArgs, options || {});
}
const spawnOSSync = (command, args, options) => {
    return new Promise((resolve, reject) => {
        const child = spawnOS(command, args, options)
        child.on('error', () => reject(1))
        child.on('exit', e => resolve(e))
    })
}

const formatOSPath = (p) => {
    if (typeof p !== 'string') return p
    if (path.sep === '/') return p
    return p.replace(/\\/g, '/')
}

module.exports = {
    isEmptyDir,
    isObject,
    spawnOS,
    spawnOSSync,
    formatOSPath
}