const axios = require('axios')

const BASE_URL = 'http://www.sunny.com:70001'

const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 5000
})

module.exports = instance