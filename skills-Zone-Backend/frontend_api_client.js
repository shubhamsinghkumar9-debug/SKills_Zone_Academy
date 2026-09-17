// src/api/index.js
// Drop this into your sheryians-clone/src/ folder

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── Token helpers ──────────────────────────────────────────────
const getToken   = () => localStorage.getItem('access_token')
const getRefresh = () => localStorage.getItem('refresh_token')
const setTokens  = (access, refresh) => {
  localStorage.setItem('access_token', access)
  if (refresh) localStorage.setItem('refresh_token', refresh)
}
export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// ── Base fetch with auto-refresh ───────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res = await fetch(`${BASE}${path}`, { ...options, headers })

  // Try refreshing token once on 401
  if (res.status === 401 && getRefresh()) {
    const refreshRes = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getRefresh()}` },
    })
    if (refreshRes.ok) {
      const data = await refreshRes.json()
      setTokens(data.data.access_token)
      headers['Authorization'] = `Bearer ${data.data.access_token}`
      res = await fetch(`${BASE}${path}`, { ...options, headers })
    } else {
      clearTokens()
    }
  }

  return res.json()
}

// ── Auth ───────────────────────────────────────────────────────
export const authAPI = {
  register: (data) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }).then(r => {
      if (r.success) setTokens(r.data.access_token, r.data.refresh_token)
      return r
    }),

  login: (data) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }).then(r => {
      if (r.success) setTokens(r.data.access_token, r.data.refresh_token)
      return r
    }),

  logout: () => clearTokens(),

  me: () => apiFetch('/auth/me'),

  updateProfile: (data) =>
    apiFetch('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),

  forgotPassword: (email) =>
    apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token, password) =>
    apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
}

// ── Courses ────────────────────────────────────────────────────
export const coursesAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/courses/${qs ? '?' + qs : ''}`)
  },

  get: (id) => apiFetch(`/courses/${id}`),

  enroll: (id) =>
    apiFetch(`/courses/${id}/enroll`, { method: 'POST' }),

  getEnrollment: (id) => apiFetch(`/courses/${id}/enrollment`),

  updateProgress: (id, progress) =>
    apiFetch(`/courses/${id}/progress`, { method: 'PUT', body: JSON.stringify({ progress }) }),

  getReviews: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/courses/${id}/reviews${qs ? '?' + qs : ''}`)
  },

  addReview: (id, data) =>
    apiFetch(`/courses/${id}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
}

// ── Callbacks ──────────────────────────────────────────────────
export const callbacksAPI = {
  submit: (data) =>
    apiFetch('/callbacks/', { method: 'POST', body: JSON.stringify(data) }),

  myCallbacks: () => apiFetch('/callbacks/my'),
}

// ── Student dashboard ──────────────────────────────────────────
export const studentAPI = {
  dashboard: () => apiFetch('/students/dashboard'),
  enrollments: () => apiFetch('/students/enrollments'),
}

// ── Admin ──────────────────────────────────────────────────────
export const adminAPI = {
  stats: () => apiFetch('/admin/stats'),
  listStudents: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/students/all${qs ? '?' + qs : ''}`)
  },
  listCallbacks: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/callbacks/${qs ? '?' + qs : ''}`)
  },
  updateCallbackStatus: (id, status) =>
    apiFetch(`/callbacks/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
}

export default apiFetch
