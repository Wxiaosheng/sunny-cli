const axios = require('axios')

const BASE_URL = 'http://www.sunny.com:7001'

const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 5000
})

instance.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return response.data
        }
    }, error => {
        return Promise.reject(error)
    }
)

module.exports = instance