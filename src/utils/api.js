const API_BASE = 'http://localhost:5000/api'

const TOKEN_KEY = 'tf_token'


export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)


const request = async (endpoint, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`)
  }

  return data
}


export const authApi = {
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    request('/auth/me'),
}


export const jobsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return request(`/jobs${params ? '?' + params : ''}`)
  },

  getById: (id) => request(`/jobs/${id}`),

  create: (jobData) =>
    request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),

  update: (id, jobData) =>
    request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    }),

  delete: (id) =>
    request(`/jobs/${id}`, {
      method: 'DELETE',
    }),

  getMyListings: () => request('/jobs/my/listings'),
}

export const applicationsApi = {
  apply: (data) =>
    request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMine: () => request('/applications/me'),

  getForEmployer: () => request('/applications/employer'),

  getForJob: (jobId) => request(`/applications/job/${jobId}`),

  updateStatus: (id, status) =>
    request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  withdraw: (id) =>
    request(`/applications/${id}`, {
      method: 'DELETE',
    }),
}

export const postsApi = {
  getAll: (sort = 'recent') =>
    request(`/posts?sort=${sort}`),

  create: (postData) =>
    request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    }),

  delete: (id) =>
    request(`/posts/${id}`, {
      method: 'DELETE',
    }),

  toggleLike: (id) =>
    request(`/posts/${id}/like`, {
      method: 'POST',
    }),

  addComment: (id, text) =>
    request(`/posts/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  deleteComment: (postId, commentId) =>
    request(`/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    }),
}

export const profileApi = {
  getMe: () => request('/profile/me'),

  getByUserId: (userId) => request(`/profile/user/${userId}`),

  updateMe: (data) =>
    request('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  addEducation: (data) =>
    request('/profile/me/education', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteEducation: (itemId) =>
    request(`/profile/me/education/${itemId}`, {
      method: 'DELETE',
    }),

  addExperience: (data) =>
    request('/profile/me/experience', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteExperience: (itemId) =>
    request(`/profile/me/experience/${itemId}`, {
      method: 'DELETE',
    }),

  addLink: (data) =>
    request('/profile/me/links', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteLink: (itemId) =>
    request(`/profile/me/links/${itemId}`, {
      method: 'DELETE',
    }),

  addSkill: (skill) =>
    request('/profile/me/skills', {
      method: 'POST',
      body: JSON.stringify({ skill }),
    }),

  deleteSkill: (skillName) =>
    request(`/profile/me/skills/${encodeURIComponent(skillName)}`, {
      method: 'DELETE',
    }),
}

export default request