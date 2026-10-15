import { baseApi } from "@/redux/baseApi";
import { mentorApi } from "../mentor/mentorApi";

export const courseApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getAllCourses: builder.query({
            query: () => ({
                url: "/courses",
                method: "GET",
            }),
        }),

        getCourseById: builder.query({
            query: (id) => ({
                url: `/courses/${id}`,
                method: "GET",
            }),
        }),

        updateCourse: builder.mutation({
            query: ({id, data}) => ({
                url: `/courses/${id}`,
                method: "PUT",
                body: data,
            }),
        }),

        deleteCourse: builder.mutation({
            query: (id) => ({
                url: `/courses/${id}`,
                method: "DELETE",
            }),
        }),

        createCourse: builder.mutation({
            query: (data) => {
                return {
                    url: '/courses',
                    method: 'POST',
                    body : data
                }
            }
        })

         
    })
})

export const {useGetAllCoursesQuery, useGetCourseByIdQuery, useUpdateCourseMutation, useDeleteCourseMutation, useCreateCourseMutation} = courseApi