import Link from 'next/link';
import { MdLocationOn, MdSchool, MdWorkOutline } from 'react-icons/md';
import { FaRegEnvelope, FaPhoneAlt } from 'react-icons/fa';
import type { Mentor, TCenter } from '@/types/mentor';
import Image from 'next/image';

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-2">
            <span className="shrink-0 text-gray-400 mt-[2px]">{icon}</span>
            <span className="truncate leading-relaxed">{children}</span>
        </div>
    );
}

export default function MentorCard({ mentor, center }: { mentor: Mentor; center?: TCenter }) {
    return (
        <Link
            href={`/mentors/mentor-details?mentorId=${mentor._id}`} // <- change to your details route
            className="group relative block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
        >
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.06] bg-gray-900" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image
                    src={mentor.mentor_image || `https://i.pravatar.cc/150?u=${mentor.mentor_id}`}
                    alt={mentor.mentor_name}
                    width={48}
                    height={48}
                    quality={100}
                    priority
                    className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-sm border border-gray-100"
                />
                <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-gray-900 leading-tight truncate">
                        {mentor.mentor_name}
                    </p>
                    <p className="text-[11.5px] text-gray-400 font-medium mt-0.5 truncate">
                        {mentor.designation}
                    </p>
                </div>
            </div>

            {/* Training center */}
            <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 mb-3">
                <MdSchool size={16} className="text-gray-400 shrink-0 mt-[1px]" />
                <div className="min-w-0">
                    <p className="text-[12px] font-bold text-gray-800 truncate">
                        {center ? center.center_name : 'Unassigned center'}
                    </p>
                    {center && (
                        <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5 capitalize">
                            <MdLocationOn size={12} className="shrink-0" />
                            {center.sub_area}, {center.district} · {center.division} Division
                        </p>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="space-y-2.5 text-[11.5px] text-gray-400 font-medium">
                <InfoRow icon={<FaRegEnvelope size={11} />}>{mentor.mentor_email || 'N/A'}</InfoRow>
                <InfoRow icon={<FaPhoneAlt size={10} />}>{mentor.mentor_phone || 'N/A'}</InfoRow>
                <InfoRow icon={<MdWorkOutline size={14} />}>
                    {mentor.experience_years ? `${mentor.experience_years} Years` : 'N/A'}
                </InfoRow>
                <InfoRow icon={<MdSchool size={14} />}>{mentor.qualification || 'N/A'}</InfoRow>
            </div>

            {/* Specialization */}
            {mentor.specialization?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
                    {mentor.specialization.map((item) => (
                        <span
                            key={item}
                            className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}