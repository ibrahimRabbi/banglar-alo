import { baseApi } from "@/redux/baseApi";

export const enrollApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getAllEnrollment: builder.query({
            query: (payload) => ({
                url: `/courses/students`,
                method: "GET",
                params: {
                    page: payload.page,
                    limit: payload.limit,
                    title: payload.title,
                    batch: payload.batch
                }
            }),
        }),





    })
})

export const { useGetAllEnrollmentQuery } = enrollApi