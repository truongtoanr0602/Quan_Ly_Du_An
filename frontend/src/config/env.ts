const defaultApiBaseUrl = 'http://localhost:5296/api'

export const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl
).replace(/\/$/, '')

