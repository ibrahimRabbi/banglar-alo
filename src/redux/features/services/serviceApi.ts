import { baseApi } from "@/redux/baseApi";

export const serviceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

       getAllBookings: builder.query({
            query: (payload) => ({
                url: `/services/bookings`,
                method: "GET",
                params: {
                    page: payload.page,
                    limit: payload.limit,
                }
            }),
       }),
        
        getSingleBookings: builder.query({
            query: (id) => ({
                url: `/services/bookings/${id}`,
                method: "GET",
                 
            }),
        }),

        updateBookingStatus: builder.mutation({
            query: (payload) => ({
                url: `/services/bookings/${payload.id}/status`,
                method: 'PATCH',
                body: payload.data,
            }),
            invalidatesTags: ['Booking'],
        }),




        createOrder: builder.mutation({
            query: (data) => ({
                url: `/services/orders`,
                method: 'POST',
                body: data,
            })
        }),

        getAllOrders: builder.query({
            query: (payload) => ({
                url: `/services/orders`,
                method: "GET",
                params: {
                    ...payload
                }

            }),
        }),

        getSingleOrders: builder.query({
            query: (id: string) => ({
                url: `/services/orders/${id}`,
                method: 'GET',
            }),
            providesTags: ['Order'],
        }),

        updateOrder: builder.mutation({
            query: (payload) => ({
                url: `/services/orders/${payload.id}`,
                method: "PUT",
                body: payload.data
            }),
            invalidatesTags: ['Order'],
        }),

        updateMilstone: builder.mutation({
            query: (payload) => ({
                url: `/services/milestones/${payload.id}/deliver`,
                method: "PATCH",
                body: payload.data
            }),
            invalidatesTags: ['Order'],
        }),



        getAllservices: builder.query({
            query: (payload) => {
                return {
                    url: '/services',
                    method: 'GET',
                    params: {
                        page: payload.page,
                        limit : payload.limit
                    }
                }
            }
        }),

        getSingleServices: builder.query({
            query: (id) => {
                return {
                    url: `/services/${id}`,
                    method: 'GET',
                }
            }
        }),

        createService: builder.mutation({
            query: (data) => ({
                url: `/services`,
                method: "POST",
                body:data
            }),
        }),
        deleteService: builder.mutation({
            query: (id) => ({
                url: `/services/${id}`,
                method: "DELETE",
            }),
        }),
        updateService: builder.mutation({
            query: (payload) => ({
                url: `/services/${payload?.id}`,
                method: "PUT",
                body : payload?.data
            }),
        }),

    })
})

export const { useGetAllBookingsQuery, useUpdateBookingStatusMutation, useGetSingleBookingsQuery, useCreateOrderMutation, useGetAllOrdersQuery, useGetSingleOrdersQuery, useUpdateOrderMutation, useUpdateMilstoneMutation, useGetAllservicesQuery, useCreateServiceMutation, useDeleteServiceMutation, useGetSingleServicesQuery, useUpdateServiceMutation } = serviceApi