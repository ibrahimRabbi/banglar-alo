import { baseApi } from "@/redux/baseApi";

export const customerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getAllCustomer: builder.query({
            query: (payload) => ({
                url: '/services/customers',
                method: 'GET',
                params: {
                    page: payload.page,
                    limit: payload.limit,
                },
            }),
        }),

         
    })
})

export const {useGetAllCustomerQuery} = customerApi