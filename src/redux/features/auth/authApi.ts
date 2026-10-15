import { baseApi } from "@/redux/baseApi";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        signIn: builder.mutation({
            query: (data) => ({
                url: "/auth/login",
                method: "POST",
                body: data,
            }),
        }),

        getProfile: builder.mutation({
            query: (data) => ({
                url: "/users/profile",
                method: "GET",
            }),
        }),

        uploadImage: builder.mutation({
            query: (file) => {
                return {
                    url: '/uploade',
                    method: 'POST',
                    data : file
                }
            }
        })


    })
})

export const { useSignInMutation, useGetProfileMutation, useUploadImageMutation } = authApi