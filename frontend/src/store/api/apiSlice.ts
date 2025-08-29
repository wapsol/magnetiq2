import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { RootState } from '../index'
import { logout, refreshTokenSuccess } from '../slices/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  
  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshToken = (api.getState() as RootState).auth.refreshToken
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refresh_token: refreshToken }
        },
        api,
        extraOptions
      )
      
      if (refreshResult.data) {
        // Store the new tokens
        api.dispatch(refreshTokenSuccess(refreshResult.data as any))
        
        // Retry the original query
        result = await baseQuery(args, api, extraOptions)
      } else {
        // Refresh failed, logout
        api.dispatch(logout())
      }
    } else {
      // No refresh token, logout
      api.dispatch(logout())
    }
  }
  
  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Page', 'Webinar', 'WebinarRegistration', 'Whitepaper', 'Booking'],
  endpoints: (builder) => ({
    // We'll define specific endpoints in separate files
  }),
})