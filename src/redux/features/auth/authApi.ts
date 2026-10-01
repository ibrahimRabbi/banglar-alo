import { baseApi } from "@/redux/baseApi";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        signIn: builder.mutation({
            query: (data) => ({
                url: "/auth/admin-signin",
                method: "POST",
                body: data,
            }),
        }),

        uploadImage: builder.mutation({
            query: (formData) => ({
                url: "/auth/upload-image",
                method: "POST",
                body: formData,
            }),
        }),

         

    })
})

export const { useSignInMutation, useUploadImageMutation } = authApi