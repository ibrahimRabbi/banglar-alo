 
import Link from 'next/link';
import Image from 'next/image';
import {
    MdLocationOn,
    MdPerson,
    MdWc,
} from 'react-icons/md';
import {
    FaRegEnvelope,
    FaPhoneAlt,
} from 'react-icons/fa';
import type { Mentor } from '@/types/mentor';

function InfoRow({
    icon,
    children,
}: {
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-2">
            <span className="mt-[2px] shrink-0 text-gray-400">
                {icon}
            </span>

            <span className="truncate leading-relaxed">
                {children}
            </span>
        </div>
    );
}

export default function MentorCard({
    mentor,
}: {
    mentor: Mentor;
}) {
    const profileImage = mentor.profileImage?.trim();

return (
    <Link
        href={`/mentors/mentor-details?mentorId=${mentor.id}`}
        className="group relative block overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
        {/* Decorative Element */}
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gray-900 opacity-[0.06]" />

        {/* Header */}
        <div className="relative mb-5 flex items-center gap-3">
            {profileImage ? (
                <Image
                    src={profileImage}
                    alt={mentor.fullName || 'Teacher'}
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-2xl border border-gray-100 object-cover"
                />
            ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-gray-100">
                    <MdPerson size={28} className="text-gray-400" />
                </div>
            )}

            <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-extrabold leading-tight text-gray-900">
                    {mentor.fullName || 'Unnamed Teacher'}
                </h3>

                <p className="mt-1 text-xs font-medium text-gray-400">
                    {mentor.role || 'Teacher'}
                </p>

                <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${mentor.status === 'ACTIVE'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                >
                    {mentor.status || 'UNKNOWN'}
                </span>
            </div>
        </div>

        {/* Teacher Information */}
        <div className="space-y-3 border-t border-gray-100 pt-4 text-[12px] font-medium text-gray-500">
            <InfoRow icon={<FaRegEnvelope size={12} />}>
                {mentor.email || 'N/A'}
            </InfoRow>

            <InfoRow icon={<FaPhoneAlt size={11} />}>
                {mentor.phone || 'N/A'}
            </InfoRow>

            <InfoRow icon={<MdLocationOn size={15} />}>
                {mentor.location || 'Location not provided'}
            </InfoRow>

            <InfoRow icon={<MdWc size={15} />}>
                {mentor.gender || 'Not specified'}
            </InfoRow>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-3">
            <span className="text-[11px] font-medium text-gray-400">
                Teacher Profile
            </span>

            <span className="text-xs font-bold text-blue-600 transition-transform group-hover:translate-x-1">
                View Details →
            </span>
        </div>
    </Link>
);
}
 