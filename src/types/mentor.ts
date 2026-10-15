 
export interface Mentor {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    profileImage?: string;
    role: string;
    status: 'ACTIVE' | 'INACTIVE' | string;
    location: string;
    gender: string;
    center_id?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TCenter {
    _id: string;
    center_id: string;
    center_name: string;
    division: string;
    district: string;
    sub_area: string;
}

// A mentor's center_id can match either the MongoDB _id
// or the generated center_id.
export const mentorBelongsTo = (
    mentor: Mentor,
    center: TCenter
): boolean =>
    !!mentor.center_id &&
    (mentor.center_id === center._id ||
        mentor.center_id === center.center_id);
 