/**
 * INUA API client
 * Author: Michelle Mutinda (Adm 154727) — BICS Year 4, Strathmore University
 *
 * Wraps axios with:
 *  - Automatic Bearer token injection from localStorage
 *  - Base URL pointing to FastAPI backend via Vite proxy
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inua_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear stale credentials
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('inua_token')
      localStorage.removeItem('inua_user')
    }
    return Promise.reject(err)
  },
)

export default api
