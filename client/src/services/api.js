import axios from 'axios'
import { getBaseURL } from '../config/api.config'

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// Track if we're already redirecting to prevent loops
let isRedirecting = false

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if not already redirecting and not on login page
    if (error.response?.status === 401 && !isRedirecting && window.location.pathname !== '/login') {
      isRedirecting = true
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      // Reset flag after redirect
      setTimeout(() => { isRedirecting = false }, 1000)
    }
    return Promise.reject(error)
  }
)

export default api
