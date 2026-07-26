import { api } from './client'

export const authApi = {
  register: (payload) => api.post('/api/auth/register', payload).then((r) => r.data),
  login: (payload) => api.post('/api/auth/login', payload).then((r) => r.data)
}

export const usersApi = {
  me: () => api.get('/api/users/me').then((r) => r.data),
  updateMe: (payload) => api.put('/api/users/me', payload).then((r) => r.data)
}

export const jobsApi = {
  search: (params) => api.get('/api/jobs', { params }).then((r) => r.data),
  getById: (id) => api.get(`/api/jobs/${id}`).then((r) => r.data),
  mine: () => api.get('/api/jobs/mine').then((r) => r.data),
  create: (payload) => api.post('/api/jobs', payload).then((r) => r.data),
  apply: (jobId, payload) => api.post('/api/applications', { jobId, ...payload }).then((r) => r.data),
  update: (id, payload) => api.put(`/api/jobs/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/api/jobs/${id}`)
}

export const applicationsApi = {
  apply: (payload) => api.post('/api/applications', payload).then((r) => r.data),
  myApplications: () => api.get('/api/applications/me').then((r) => r.data),
  forJob: (jobId) => api.get(`/api/applications/job/${jobId}`).then((r) => r.data),
  updateStatus: (applicationId, status) => {
    const normalizedStatus = status === 'ACCEPTED' ? 'HIRED' : status
    return api.patch(`/api/applications/${applicationId}/status`, { status: normalizedStatus }).then((r) => r.data)
  }
}

export const uploadsApi = {
  resume: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post('/api/uploads/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  }
}
