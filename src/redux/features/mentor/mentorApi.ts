import { baseApi } from "@/redux/baseApi";

export const mentorApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getAllMentors: builder.query({
            query: () => ({
                url: "/users/directory?role=Teacher",
                method: "GET",
            }),
        }),

        getMentorById: builder.query({
            query: (mentorId) => ({
                url: `/users/directory/${mentorId}`,
                method: "GET",
            }),
        }),

        createMentor: builder.mutation({
            query: (mentorData) => ({
                url: "/users/directory",
                method: "POST",
                body: mentorData,
            }),
        }),
        

         

    })
})

export const {useGetAllMentorsQuery, useGetMentorByIdQuery, useCreateMentorMutation} = mentorApi