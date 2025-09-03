export interface ApiResponse<T = any> {
  success: boolean
  data: T
  error?: string
  language?: string
}

export interface ApiError {
  detail: string
  message?: string
  code?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}