import { baseApi } from "@/redux/baseApi";

export const mentorApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getAllMentors: builder.query({
            query: () => ({
                url: "/mentor/get-all-mentors",
                method: "GET",
            }),
        }),

        getMentorById: builder.query({
            query: (mentorId) => ({
                url: `/mentor/get-mentor/${mentorId}`,
                method: "GET",
            }),
        }),

        createMentor: builder.mutation({
            query: (mentorData) => ({
                url: "/mentor/create-mentor",
                method: "POST",
                body: mentorData,
            }),
        }),
        

         

    })
})

export const {useGetAllMentorsQuery, useGetMentorByIdQuery, useCreateMentorMutation} = mentorApi