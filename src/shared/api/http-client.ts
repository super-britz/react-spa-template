import axios, { type AxiosError, isAxiosError } from 'axios'

export class ApiError extends Error {
  readonly status: number
  readonly original: unknown

  constructor(message: string, status: number, original: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.original = original
  }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10_000,
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      return Promise.reject(toApiError(error))
    }
    return Promise.reject(error)
  },
)

function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0
  const data = error.response?.data as { error_message?: string; message?: string } | undefined
  const message = data?.error_message ?? data?.message ?? error.message
  return new ApiError(message, status, error)
}
