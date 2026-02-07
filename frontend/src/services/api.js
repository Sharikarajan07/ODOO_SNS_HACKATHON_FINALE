import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if available - update dynamically on each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add interceptor to handle 401s (token invalid/expired)
api.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('[API ERROR]', error.config?.url, error.response?.status, error.message);
    if (error.response && error.response.status === 401) {
      // Only redirect for protected routes, not for public lesson views
      const isPublicRoute = error.config?.url?.includes('/lessons/')
      if (!isPublicRoute) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
