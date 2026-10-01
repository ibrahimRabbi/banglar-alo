import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from 'cookies-next/client'

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL,
        credentials: 'include',
        prepareHeaders: (headers) => {
            const token = getCookie('token')
            headers.set('Authorization', `Bearer ${token}`)
            return headers
        }
    }),
    tagTypes: ['auth','center'],
    endpoints: () => ({}),
})