'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    MdArrowBack,
    MdSchool,
    MdWorkOutline,
    MdVerified,
    MdLocationOn,
} from 'react-icons/md';
import {
    FaRegEnvelope,
    FaPhoneAlt,
    FaGraduationCap,
} from 'react-icons/fa';
import {
    Mail,
    Phone,
    BriefcaseBusiness,
    Code2,
    CalendarDays,
    UserRound,
    AlertCircle,
    Loader2,
} from 'lucide-react';

import { useGetMentorByIdQuery } from '@/redux/features/mentor/mentorApi';

/* =============================================================
   TYPES
============================================================= */

interface MentorCenter {
    _id: string;
    center_id: string;
    center_name: string;
    division: string;
    district: string;
    sub_area: string;
}

/* =============================================================
   PAGE CONTENT
============================================================= */

const MentorDetails = () => {
    const searchParams = useSearchParams();

    const mentorId = searchParams.get('mentorId');

    const {
        data,
        error,
        isLoading,
        isFetching,
    } = useGetMentorByIdQuery(mentorId!, {
        skip: !mentorId,
    });

    const mentor = data?.data;

    // populated object hole-i center info dekhabe
    const center: MentorCenter | null =
        mentor?.center_id && typeof mentor.center_id === 'object'
            ? mentor.center_id
            : null;


    if (!mentorId) {
        return (
            <main className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">

                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <AlertCircle
                            size={24}
                            className="text-gray-400"
                        />
                    </div>

                    <h2 className="text-lg font-extrabold text-gray-900 mt-4">
                        Invalid mentor link
                    </h2>

                    <p className="text-xs text-gray-400 leading-relaxed mt-2">
                        The mentor id is missing from the link.
                    </p>

                    <Link
                        href="/mentors"
                        className="inline-flex items-center gap-2 mt-6 bg-gray-900 text-white rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-gray-800 transition-colors"
                    >
                        <MdArrowBack size={16} />
                        Back to mentors
                    </Link>

                </div>
            </main>
        );
    }



    if (isLoading || isFetching) {
        return (
            <main className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                        <Loader2
                            size={20}
                            className="text-gray-500 animate-spin"
                        />
                    </div>

                    <p className="text-xs font-medium text-gray-400">
                        Loading mentor profile...
                    </p>
                </div>
            </main>
        );
    }



    if (error || !mentor) {
        return (
            <main className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">

                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <AlertCircle
                            size={24}
                            className="text-gray-400"
                        />
                    </div>

                    <h2 className="text-lg font-extrabold text-gray-900 mt-4">
                        Mentor not found
                    </h2>

                    <p className="text-xs text-gray-400 leading-relaxed mt-2">
                        We couldn't find the mentor you're looking for.
                        Please check the profile link and try again.
                    </p>

                    <Link
                        href="/mentors"
                        className="inline-flex items-center gap-2 mt-6 bg-gray-900 text-white rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-gray-800 transition-colors"
                    >
                        <MdArrowBack size={16} />
                        Back to mentors
                    </Link>

                </div>
            </main>
        );
    }



    const imageUrl = mentor.mentor_image || `https://i.pravatar.cc/500?u=${mentor.mentor_id}`;

   
    return (
        <main className="min-h-screen">

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

                {/* BACK BUTTON */}

                <Link
                    href="/mentors"
                    className="inline-flex items-center gap-2 mb-6 text-[12px] font-bold text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <MdArrowBack size={17} />
                    Back to mentors
                </Link>


                {/* HERO SECTION */}

                <section className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl shadow-sm">

                    {/* Decorative circles */}

                    <div className="absolute -top-28 -right-28 w-72 h-72 rounded-full bg-gray-900/[0.025]" />

                    <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-gray-900/[0.018]" />


                    <div className="relative p-6 sm:p-8 lg:p-10">

                        <div className="flex flex-col md:flex-row md:items-center gap-7">


                            {/* PROFILE IMAGE */}

                            <div className="relative shrink-0">

                                <Image
                                    src={imageUrl}
                                    alt={mentor.mentor_name}
                                    width={160}
                                    height={160}
                                    priority
                                    quality={100}
                                    className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-[2rem] object-cover border border-gray-100 shadow-md"
                                />


                                {/* Mentor badge */}

                                <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 bg-white border border-gray-100 shadow-sm rounded-xl px-2.5 py-1.5">

                                    <MdVerified
                                        size={15}
                                        className="text-gray-700"
                                    />

                                    <span className="text-[9px] font-bold text-gray-700">
                                        Mentor
                                    </span>

                                </div>

                            </div>


                            {/* BASIC INFORMATION */}
                            <div className="flex-1 min-w-0">

                                <div className="flex flex-wrap items-center gap-2 mb-2">

                                    <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-400">
                                        Mentor Profile
                                    </span>

                                    {mentor.isDeleted && (
                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-400 text-[9px] font-bold">
                                            Inactive
                                        </span>
                                    )}

                                </div>


                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900">
                                    {mentor.mentor_name}
                                </h1>


                                <p className="text-sm sm:text-base text-gray-400 font-medium mt-2">
                                    {mentor.designation || 'Professional Mentor'}
                                </p>


                                {/* Mentor ID */}

                                <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">

                                    <UserRound
                                        size={13}
                                        className="text-gray-400"
                                    />

                                    <span className="text-[10px] font-bold text-gray-500">
                                        {mentor.mentor_id}
                                    </span>

                                </div>


                                {/* Specialization pills */}

                                {mentor.specialization?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">

                                        {mentor.specialization.map(
                                            (item: string) => (
                                                <span
                                                    key={item}
                                                    className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-semibold text-gray-500"
                                                >
                                                    {item}
                                                </span>
                                            )
                                        )}

                                    </div>
                                )}

                            </div>


                            {/* CONTACT BOX */}

                            <div className="w-full md:w-52 shrink-0">

                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">

                                    <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-gray-400 mb-3">
                                        Contact
                                    </p>


                                    <div className="space-y-3">

                                        {/* Email */}

                                        <Link
                                            href={`mailto:${mentor.mentor_email}`}
                                            className="flex items-center gap-2.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                        >

                                            <FaRegEnvelope
                                                size={11}
                                                className="shrink-0"
                                            />

                                            <span className="truncate">
                                                {mentor.mentor_email || 'N/A'}
                                            </span>

                                        </Link>


                                        {/* Phone */}

                                        <Link
                                            href={`tel:${mentor.mentor_phone}`}
                                            className="flex items-center gap-2.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                        >

                                            <FaPhoneAlt
                                                size={10}
                                                className="shrink-0"
                                            />

                                            <span>
                                                {mentor.mentor_phone || 'N/A'}
                                            </span>

                                        </Link>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* STATS */}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">

                    <StatCard
                        icon={<MdWorkOutline size={19} />}
                        label="Experience"
                        value={
                            mentor.experience_years
                                ? `${mentor.experience_years} Years`
                                : 'N/A'
                        }
                    />


                    <StatCard
                        icon={<FaGraduationCap size={17} />}
                        label="Qualification"
                        value={mentor.qualification || 'N/A'}
                    />


                    <StatCard
                        icon={<Code2 size={18} />}
                        label="Expertise"
                        value={`${mentor.specialization?.length || 0} Areas`}
                    />


                    <StatCard
                        icon={<CalendarDays size={18} />}
                        label="Profile Status"
                        value={
                            mentor.isDeleted
                                ? 'Inactive'
                                : 'Active'
                        }
                    />

                </div>


                {/* MAIN CONTENT */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">


                    {/* LEFT COLUMN */}

                    <div className="lg:col-span-2 space-y-4">


                        {/* PROFESSIONAL OVERVIEW */}

                        <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm">

                            <SectionHeader
                                icon={<BriefcaseBusiness size={17} />}
                                title="Professional Overview"
                            />


                            <div className="mt-5">

                                <p className="text-sm text-gray-500 leading-7">

                                    {mentor.mentor_name} is a{' '}

                                    <span className="font-semibold text-gray-700">
                                        {mentor.designation || 'professional mentor'}
                                    </span>

                                    {mentor.experience_years
                                        ? ` with ${mentor.experience_years} years of professional experience.`
                                        : '.'}

                                </p>


                                {mentor.specialization?.length > 0 && (
                                    <p className="text-sm text-gray-500 leading-7 mt-3">

                                        Their areas of expertise include{' '}

                                        <span className="font-semibold text-gray-700">
                                            {mentor.specialization.join(', ')}
                                        </span>
                                        .

                                    </p>
                                )}

                            </div>

                        </section>


                        {/* AREAS OF EXPERTISE */}

                        <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm">

                            <SectionHeader
                                icon={<Code2 size={18} />}
                                title="Areas of Expertise"
                            />


                            {mentor.specialization?.length > 0 ? (

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

                                    {mentor.specialization.map(
                                        (item: string, index: number) => (
                                            <div
                                                key={item}
                                                className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-3.5 hover:bg-gray-100 transition-colors"
                                            >

                                                <div className="w-9 h-9 shrink-0 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold shadow-sm">

                                                    {String(index + 1).padStart(
                                                        2,
                                                        '0'
                                                    )}

                                                </div>


                                                <span className="text-xs font-bold text-gray-600">
                                                    {item}
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : (

                                <p className="text-xs text-gray-400 mt-5">
                                    No specialization information available.
                                </p>

                            )}

                        </section>


                        {/* EDUCATION */}

                        <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm">

                            <SectionHeader
                                icon={<MdSchool size={19} />}
                                title="Education & Qualification"
                            />


                            <div className="mt-5 flex items-center gap-4">

                                <div className="w-11 h-11 shrink-0 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">

                                    <FaGraduationCap
                                        size={18}
                                        className="text-gray-400"
                                    />

                                </div>


                                <div className="min-w-0">

                                    <p className="text-sm font-bold text-gray-800">
                                        {mentor.qualification || 'Not specified'}
                                    </p>

                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Academic qualification
                                    </p>

                                </div>

                            </div>

                        </section>

                    </div>


                    {/* RIGHT COLUMN */}

                    <div className="space-y-4">


                        {/* CONTACT INFORMATION */}

                        <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">

                            <SectionHeader
                                icon={<Phone size={17} />}
                                title="Contact Information"
                            />


                            <div className="mt-5 space-y-3">

                                <ContactItem
                                    icon={<Mail size={15} />}
                                    label="Email"
                                    value={mentor.mentor_email}
                                    href={`mailto:${mentor.mentor_email}`}
                                />


                                <ContactItem
                                    icon={<Phone size={15} />}
                                    label="Phone"
                                    value={mentor.mentor_phone}
                                    href={`tel:${mentor.mentor_phone}`}
                                />

                            </div>

                        </section>


                        {/* TRAINING CENTER */}

                        <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">

                            <SectionHeader
                                icon={<MdLocationOn size={19} />}
                                title="Training Center"
                            />


                            <div className="mt-5">

                                {center ? (

                                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">

                                        <div className="flex items-start gap-3">

                                            <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">

                                                <MdSchool
                                                    size={19}
                                                    className="text-gray-400"
                                                />

                                            </div>


                                            <div className="min-w-0">

                                                <p className="text-xs font-bold text-gray-700">
                                                    {center.center_name}
                                                </p>

                                                <p className="text-[10px] text-gray-400 mt-1 break-all">
                                                    Center ID: {center.center_id}
                                                </p>

                                                <p className="text-[10px] text-gray-400 mt-1 capitalize">
                                                    {center.sub_area}, {center.district}, {center.division}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">

                                        <div className="flex items-center gap-3">

                                            <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-gray-100 flex items-center justify-center">

                                                <MdLocationOn
                                                    size={19}
                                                    className="text-gray-300"
                                                />

                                            </div>


                                            <div>

                                                <p className="text-xs font-bold text-gray-600">
                                                    No center assigned
                                                </p>

                                                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                                                    Training center information
                                                    is not available.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </section>


                        {/* MENTOR ID CARD */}

                        <section className="bg-gray-900 rounded-3xl p-6 text-white shadow-sm">

                            <div className="flex items-center justify-between gap-3">

                                <div>

                                    <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-500">
                                        Mentor ID
                                    </p>

                                    <h3 className="text-lg font-extrabold mt-2 break-all">
                                        {mentor.mentor_id}
                                    </h3>

                                </div>


                                <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">

                                    <UserRound
                                        size={17}
                                        className="text-gray-400"
                                    />

                                </div>

                            </div>


                            <div className="mt-5 pt-4 border-t border-white/10">

                                <div className="flex items-center justify-between">

                                    <span className="text-[10px] text-gray-500">
                                        Profile status
                                    </span>

                                    <span className="text-[10px] font-bold text-white">
                                        {mentor.isDeleted
                                            ? 'Inactive'
                                            : 'Active'}
                                    </span>

                                </div>

                            </div>

                        </section>

                    </div>

                </div>

            </div>

        </main>
    );
};




function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">

            <div className="flex items-center gap-2">

                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                    {icon}
                </div>

                <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
                    {label}</span>

            </div>


            <p className="text-sm font-extrabold text-gray-800 mt-3 truncate">
                {value}
            </p>

        </div>
    );
}




function SectionHeader({
    icon,
    title,
}: {
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                {icon}
            </div>

            <h2 className="text-sm font-extrabold text-gray-900">
                {title}
            </h2>

        </div>
    );
}




function ContactItem({
    icon,
    label,
    value,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
        >

            <div className="w-9 h-9 shrink-0 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                {icon}
            </div>


            <div className="min-w-0">

                <p className="text-[9px] uppercase tracking-wider font-bold text-gray-300">
                    {label}
                </p>

                <p className="text-[11px] font-semibold text-gray-600 truncate mt-0.5">
                    {value || 'N/A'}
                </p>

            </div>

        </Link>
    );
}

 

const MentorDetailsPage = () => (
    <Suspense
        fallback={
            <main className="min-h-screen flex items-center justify-center">
                <div className="w-11 h-11 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
                    <Loader2 size={20} className="text-gray-500 animate-spin" />
                </div>
            </main>
        }
    >
        <MentorDetails />
    </Suspense>
);

export default MentorDetailsPage;