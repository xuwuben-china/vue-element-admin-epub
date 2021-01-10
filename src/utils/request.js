import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import constan from './constan'
const { CODE_SUCCESS,  CODE_TOKEN_EXPIRED } = constan

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = `Bearer ${getToken()}`
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== CODE_SUCCESS) {
      const errMsg = res.msg || '请求失败'
      Message({
        message: errMsg,
        type: 'error',
        duration: 5 * 1000
      })
      // 50008: Illegal token; 50012: Other clients logged in; CODE_TOKEN_EXPIRED: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === CODE_TOKEN_EXPIRED) {
        // to re-login
        MessageBox.confirm('登录失效，是否重新登录', '确认登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then((res) => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(errMsg))
    } else {
      return res
    }
  },
  error => {
    const { msg, code } = error.response.data
    Message({
      message: msg,
      type: 'error',
      duration: 5 * 1000
    })
    if (code === CODE_TOKEN_EXPIRED) {
      setTimeout(() => {
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
      }, 200)
    }
    return Promise.reject(error)
  }
)

export default service
