import { baseApi } from "@/redux/baseApi";

export const studentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getAllStudents: builder.query({
            query: () => ({
                url: "/users/directory?role=Student",
                method: "GET",
            }),
        }),

        createStudent: builder.mutation({
            query: (data) => ({
                url: "/student/create-student",
                method: "POST",
                body: data,
            }),

        }),
        getStudentById: builder.query({
            query: (id) => ({
                url: `/users/directory/${id}`,
                method: "GET",
                
            }),

        }),
    })
})

export const { useGetAllStudentsQuery, useCreateStudentMutation, useGetStudentByIdQuery } = studentApi