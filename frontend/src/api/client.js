import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
export const AUTH_SESSION_CLEARED_EVENT = 'joblune-auth-session-cleared'

export const api = axios.create({
  baseURL: BASE_URL
})

export function clearSession() {
  localStorage.removeItem('joblune_access_token')
  localStorage.removeItem('joblune_refresh_token')
  localStorage.removeItem('joblune_user')
  window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT))
}

function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('joblune_access_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearSession()
      redirectToLogin()
    }

    return Promise.reject(error)
  }
)
