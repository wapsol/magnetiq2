import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: string
  is_active: boolean
  last_login?: string
  created_at: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isLoading: false,
  error: null,
}

// Check if there's a stored token on initialization
if (initialState.accessToken) {
  initialState.isAuthenticated = true
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{
      user: User
      access_token: string
      refresh_token: string
    }>) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.accessToken = action.payload.access_token
      state.refreshToken = action.payload.refresh_token
      state.isLoading = false
      state.error = null
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', action.payload.access_token)
      localStorage.setItem('refresh_token', action.payload.refresh_token)
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isLoading = false
      state.error = action.payload
      
      // Remove tokens from localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isLoading = false
      state.error = null
      
      // Remove tokens from localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    refreshTokenSuccess: (state, action: PayloadAction<{
      access_token: string
      refresh_token: string
    }>) => {
      state.accessToken = action.payload.access_token
      state.refreshToken = action.payload.refresh_token
      
      // Update tokens in localStorage
      localStorage.setItem('access_token', action.payload.access_token)
      localStorage.setItem('refresh_token', action.payload.refresh_token)
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setUser,
  clearError,
  refreshTokenSuccess,
} = authSlice.actions

export default authSlice.reducer