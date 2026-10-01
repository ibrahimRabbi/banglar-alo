import { baseApi } from "@/redux/baseApi";

export const centerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createCenter: builder.mutation({
            query: (data) => ({
                url: "/center/create-center",
                method: "POST",
                body: data,
            }),
        }),

        getAllcenter: builder.query({
            query: () => ({
                url: "/center/get-all-centers",
                method: "GET",
            }),
           
        }),
        deleteCenter: builder.mutation({
            query: (id: string) => ({
                url: `/center/delete-center/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['center'],
        }),
    })
})

export const { useCreateCenterMutation, useGetAllcenterQuery, useDeleteCenterMutation } = centerApi