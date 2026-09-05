import axios, { AxiosError } from 'axios'

// Single source of truth for API communication. Every API call in the
// app goes through this instance - never call axios.get/post directly
// from a component or page. This is what makes it possible to add
// cross-cutting behavior (auth headers, 401 handling, base URL) in
// exactly one place instead of every call site.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT to every outgoing request automatically, if present.
// Individual API functions never need to know or care about auth headers.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Centralized 401 handling: if the backend ever says "your token is
// invalid/expired", clear it and redirect to login - instead of every
// page having to check for this individually. A hard redirect (not a
// React Router navigate) is intentional here: this runs outside React's
// render cycle, and we want a full, clean reset of app state.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Shared shape for extracting a readable message from a failed request.
// Backend error responses are typically { error: "message" } (from
// GlobalExceptionHandler) or, for validation failures, a field->message
// map - this handles both without every caller reimplementing the logic.
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'object' && data !== null) {
      if ('error' in data && typeof (data as Record<string, unknown>).error === 'string') {
        return (data as Record<string, string>).error
      }
      // Validation error map: { fieldName: "message", ... } - join into
      // one readable string rather than showing raw JSON to the user.
      const values = Object.values(data as Record<string, string>)
      if (values.length > 0) return values.join(', ')
    }
    if (error.message) return error.message
  }
  return 'Something went wrong. Please try again.'
}
