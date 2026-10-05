import { baseApi } from "@/redux/baseApi";
import { mentorApi } from "../mentor/mentorApi";

export const courseApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getAllCourses: builder.query({
            query: () => ({
                url: "/course/get-all-course",
                method: "GET",
            }),
        })

         
    })
})

export const {useGetAllCoursesQuery} = courseApi