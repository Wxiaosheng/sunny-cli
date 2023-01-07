const semver = require('semver')
const axios = require('axios')
const urlJoin = require('url-join')

const DEFAULT_REGISTER = 'https://registry.npm.taobao.org'

const getNpmInfo = (pkgName, register = DEFAULT_REGISTER) => {
    const url = urlJoin(register, pkgName)
    return axios.get(url).then(response => {
        if (response.status === 200) {
            return response.data
        }
        return Promise.reject()
    }).catch(error => {
        return Promise.resolve(error)
    })
}

const getLatestVersion = async (pkgName, register) => {
    const info = await getNpmInfo(pkgName)
    return latestVersion = info['dist-tags']?.latest || null
}

module.exports = {
    getNpmInfo,
    getLatestVersion
}