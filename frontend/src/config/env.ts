const defaultApiBaseUrl = 'http://localhost:5000'

export const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl
).replace(/\/$/, '')

