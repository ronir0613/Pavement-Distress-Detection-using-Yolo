import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_URL,
  timeout: 60000,
})

// Response interceptor — surface API error details as toasts
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail =
      error?.response?.data?.detail ||
      error?.message ||
      'An unexpected error occurred.'
    toast.error(String(detail))
    return Promise.reject(error)
  }
)

export default client
