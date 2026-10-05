import { baseApi } from "@/redux/baseApi";

export const studentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getAllStudents: builder.query({
            query: () => ({
                url: "/student/get-all-student",
                method: "GET",
            }),
        }),

        createStudent: builder.mutation({
            query: (data) => ({
                url: "/student/create-student",
                method: "POST",
                body: data,
            }),

        })
    })
})

export const { useGetAllStudentsQuery, useCreateStudentMutation } = studentApi