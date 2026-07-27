import axios from 'axios'



const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://joblune-2.onrender.com'



export const api = axios.create({

baseURL: BASE_URL

})



api.interceptors.request.use((config) => {

const token = localStorage.getItem('token')

if (token) {

config.headers = config.headers ?? {}

config.headers.Authorization = `Bearer ${token}`

}

return config

})



api.interceptors.response.use(

(response) => response,

(error) => {

if (error.response?.status === 401) {

localStorage.removeItem('token')

localStorage.removeItem('user')

if (typeof window !== 'undefined' && window.location.pathname !== '/login') {

window.location.href = '/login'

}

}

return Promise.reject(error)

}

)



export const authApi = {

signup: (payload) => api.post('/api/auth/signup', payload).then((res) => res.data),

login: (payload) => api.post('/api/auth/login', payload).then((res) => res.data)

}



export const jobsApi = {

getAll: (params) => api.get('/api/jobs', { params }).then((res) => res.data),

getById: (id) => api.get(`/api/jobs/${id}`).then((res) => res.data),

create: (payload) => api.post('/api/jobs', payload).then((res) => res.data),

update: (id, payload) => api.put(`/api/jobs/${id}`, payload).then((res) => res.data),

remove: (id) => api.delete(`/api/jobs/${id}`).then((res) => res.data)

} 

