'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {MdArrowBack,MdVerified,MdPerson,MdLocationOn,MdWc} from 'react-icons/md';
import { FaRegEnvelope, FaPhoneAlt } from 'react-icons/fa';
import { Mail,Phone,UserRound,CalendarDays,ShieldCheck,AlertCircle,Loader2,Pencil
} from 'lucide-react';

import { useGetStudentByIdQuery } from '@/redux/features/student/studentApi'; 

interface Student {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    profileImage: string;
    role: string;
    status: string;
    location: string;
    gender: string;
    createdAt: string;
    updatedAt: string;
}

const formatDate = (date?: string) =>
    date
        ? new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'N/A';


const StudentDetails = () => {
    const searchParams = useSearchParams();
    const studentId = searchParams.get('studentId');
    const { data, error, isLoading } = useGetStudentByIdQuery(studentId!, {skip:!studentId,});
    const student: Student | undefined = data?.data;
    

    if (!studentId) {
        return (
            <Message
                title="Invalid student link"
                text="The student id is missing from the link."
            />
        );
    }

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
                        <Loader2 size={20} className="text-gray-500 animate-spin" />
                    </div>
                    <p className="text-xs font-medium text-gray-400">
                        Loading student profile...
                    </p>
                </div>
            </main>
        );
    }

    if (error || !student) {
        return (
            <Message
                title="Student not found"
                text="We couldn't find the student you're looking for. Please check the profile link and try again."
            />
        );
    }

    const isActive = student.status === 'ACTIVE';

    return (
        <main className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

                {/* BACK + EDIT */}
                
                    <Link
                        href="/students"
                        className="inline-flex mb-4 items-center gap-2 text-[12px] font-bold text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <MdArrowBack size={17} />
                        Back to students
                    </Link>

                  
                 

                {/* HERO */}
                <section className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl shadow-sm">
                    <div className="absolute -top-28 -right-28 w-72 h-72 rounded-full bg-gray-900/[0.025]" />
                    <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-gray-900/[0.018]" />

                    <div className="relative p-6 sm:p-8 lg:p-10">
                        <div className="flex flex-col md:flex-row md:items-center gap-7">

                            {/* IMAGE */}
                            <div className="relative shrink-0">
                                {student.profileImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={student.profileImage}
                                        alt={student.fullName}
                                        className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-[2rem] object-cover border border-gray-100 shadow-md"
                                    />
                                ) : (
                                    <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-[2rem] bg-gray-50 border border-gray-100 shadow-md flex items-center justify-center">
                                        <UserRound className="w-1/3 h-1/3 text-gray-300" />
                                    </div>
                                )}

                                <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 bg-white border border-gray-100 shadow-sm rounded-xl px-2.5 py-1.5">
                                    <MdVerified size={15} className="text-gray-700" />
                                    <span className="text-[9px] font-bold text-gray-700">
                                        Student
                                    </span>
                                </div>
                            </div>

                            {/* BASIC INFO */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-400">
                                        Student Profile
                                    </span>

                                    {!isActive && (
                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-400 text-[9px] font-bold">
                                            Inactive
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900">
                                    {student.fullName}
                                </h1>

                                <p className="text-sm sm:text-base text-gray-400 font-medium mt-2">
                                    {student.role || 'Student'}
                                </p>

                                {/* ID */}
                                <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 max-w-full">
                                    <UserRound size={13} className="text-gray-400 shrink-0" />
                                    <span className="text-[10px] font-bold text-gray-500 truncate">
                                        {student.id}
                                    </span>
                                </div>
                            </div>

                            {/* CONTACT BOX */}
                            <div className="w-full md:w-56 shrink-0">
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                                    <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-gray-400 mb-3">
                                        Contact
                                    </p>

                                    <div className="space-y-3">
                                        <a
                                            href={`mailto:${student.email}`}
                                            className="flex items-center gap-2.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                        >
                                            <FaRegEnvelope size={11} className="shrink-0" />
                                            <span className="truncate">
                                                {student.email || 'N/A'}
                                            </span>
                                        </a>

                                        {student.phone ? (
                                            <a
                                                href={`tel:${student.phone}`}
                                                className="flex items-center gap-2.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                            >
                                                <FaPhoneAlt size={10} className="shrink-0" />
                                                <span>{student.phone}</span>
                                            </a>
                                        ) : (
                                            <p className="flex items-center gap-2.5 text-[11px] font-semibold text-gray-300">
                                                <FaPhoneAlt size={10} className="shrink-0" />
                                                <span>N/A</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
                    <StatCard
                        icon={<MdWc size={19} />}
                        label="Gender"
                        value={student.gender || 'N/A'}
                    />
                    <StatCard
                        icon={<MdLocationOn size={19} />}
                        label="Location"
                        value={student.location || 'N/A'}
                    />
                    <StatCard
                        icon={<ShieldCheck size={18} />}
                        label="Status"
                        value={isActive ? 'Active' : 'Inactive'}
                    />
                    <StatCard
                        icon={<CalendarDays size={18} />}
                        label="Joined"
                        value={formatDate(student.createdAt)}
                    />
                </div>

                {/* MAIN CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">

                    {/* LEFT */}
                    <div className="lg:col-span-2 space-y-4">
                        <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm">
                            <SectionHeader
                                icon={<MdPerson size={19} />}
                                title="Personal Information"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                                <InfoBox label="Full Name" value={student.fullName} />
                                <InfoBox label="Gender" value={student.gender} />
                                <InfoBox label="Role" value={student.role} />
                                <InfoBox label="Location" value={student.location} />
                            </div>
                        </section>

                        <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm">
                            <SectionHeader
                                icon={<Phone size={17} />}
                                title="Contact Information"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                                <ContactItem
                                    icon={<Mail size={15} />}
                                    label="Email"
                                    value={student.email}
                                    href={student.email ? `mailto:${student.email}` : undefined}
                                />
                                <ContactItem
                                    icon={<Phone size={15} />}
                                    label="Phone"
                                    value={student.phone}
                                    href={student.phone ? `tel:${student.phone}` : undefined}
                                />
                            </div>
                        </section>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                        <section className="bg-gray-900 rounded-3xl p-6 text-white shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-500">
                                        Student ID
                                    </p>
                                    <h3 className="text-sm font-extrabold mt-2 break-all">
                                        {student.id}
                                    </h3>
                                </div>

                                <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <UserRound size={17} className="text-gray-400" />
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                                <span className="text-[10px] text-gray-500">
                                    Profile status
                                </span>
                                <span className="text-[10px] font-bold text-white">
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </section>

                        <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                            <h2 className="mb-4 text-sm font-extrabold text-gray-900">
                                Profile Information
                            </h2>

                            <div className="space-y-3">
                                <Row label="Created" value={formatDate(student.createdAt)} />
                                <Row label="Last Updated" value={formatDate(student.updatedAt)} />
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs text-gray-400">Profile Status</span>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                                        <span
                                            className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'
                                                }`}
                                        />
                                        {isActive ? 'Active' : 'Inactive'}
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
                    {label}
                </span>
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
            <h2 className="text-sm font-extrabold text-gray-900">{title}</h2>
        </div>
    );
}

function InfoBox({ label, value }: { label: string; value?: string }) {
    return (
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3.5">
            <p className="text-[9px] uppercase tracking-wider font-bold text-gray-300">
                {label}
            </p>
            <p className="text-xs font-bold text-gray-600 mt-1 break-words">
                {value || 'N/A'}
            </p>
        </div>
    );
}

function ContactItem({icon,label,value,href,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    href?: string;
}) {
    const content = (
        <>
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
        </>
    );

    const className =
        'flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 transition-colors';

    return href ? (
        <a href={href} className={`${className} hover:bg-gray-100`}>
            {content}
        </a>
    ) : (
        <div className={className}>{content}</div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-right text-xs font-medium text-gray-700">
                {value}
            </span>
        </div>
    );
}

function Message({ title, text }: { title: string; text: string }) {
    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                </div>

                <h2 className="text-lg font-extrabold text-gray-900 mt-4">{title}</h2>
                <p className="text-xs text-gray-400 leading-relaxed mt-2">{text}</p>

                <Link
                    href="/students"
                    className="inline-flex items-center gap-2 mt-6 bg-gray-900 text-white rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                    <MdArrowBack size={16} />
                    Back to students
                </Link>
            </div>
        </main>
    );
}


export default function StudentDetailsPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen flex items-center justify-center">
                    <Loader2 size={20} className="text-gray-500 animate-spin" />
                </main>
            }
        >
            <StudentDetails />
        </Suspense>
    );
}