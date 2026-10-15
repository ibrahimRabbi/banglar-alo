import { cookies } from "next/headers"

const admin = async (token: string) => {

    const fetching = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: 'GET',
        headers: { 'Authorization': `${token}` }
    })
    const response = await fetching.json()
    
    return response
}


export default admin 