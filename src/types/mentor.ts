export interface Mentor {
    _id: string;
    mentor_id: string;
    mentor_name: string;
    mentor_email: string;
    mentor_phone: string;
    mentor_image?: string;
    designation: string;
    specialization: string[];
    experience_years: number;
    qualification: string;
    center_id: string | null;
    isDeleted: boolean;
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

// A mentor's center_id can match either the Mongo _id or the generated center_id
export const mentorBelongsTo = (mentor: Mentor, center: TCenter) =>
    !!mentor.center_id &&
    (mentor.center_id === center._id || mentor.center_id === center.center_id);