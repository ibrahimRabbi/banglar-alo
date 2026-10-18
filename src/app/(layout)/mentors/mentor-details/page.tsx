'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    Form,
    Input,
    Select,
    Row,
    Col,
    ConfigProvider,
} from 'antd';
import {
    MdArrowBack,
    MdPerson,
    MdOutlineEmail,
    MdOutlinePhone,
    MdLocationOn,
    MdVerified,
} from 'react-icons/md';
import {
    LuUserRound,
    LuMail,
    LuMapPin,
    LuShieldCheck,
    LuSave,
    LuLoaderCircle,
} from 'react-icons/lu';
import { AlertCircle } from 'lucide-react';
import { useGetMentorByIdQuery,useUpdateMentorMutation} from '@/redux/features/mentor/mentorApi';
import MentorImageUploader from '../_components/MentorImageUploader';

const antdTheme = {
    token: {
        colorPrimary: '#111827',
        colorBorder: '#e5e7eb',
        borderRadius: 12,
        controlHeight: 42,
        fontSize: 13,
    },
    components: {
        Form: {
            labelFontSize: 12,
            labelColor: '#6b7280',
            verticalLabelPadding: '0 0 4px',
        },
    },
};

type MentorFormValues = {
    fullName: string;
    email: string;
    phone: string;
    profileImage: string;
    role: string;
    status: string;
    location: string;
    gender: string;
};

// API mentor -> form values
const toFormValues = (m: any): MentorFormValues => ({
    fullName: m?.fullName ?? '',
    email: m?.email ?? '',
    phone: m?.phone ?? '',
    profileImage: m?.profileImage ?? '',
    role: m?.role ?? 'Teacher',
    status: m?.status ?? 'ACTIVE',
    location: m?.location ?? '',
    gender: m?.gender ?? '',
});

function UpdateMentorContent() {
    const searchParams = useSearchParams();
    const mentorId = searchParams.get('mentorId');

    const [form] = Form.useForm<MentorFormValues>();
    const [isUploading, setIsUploading] = useState(false);

    const { data, isLoading, isError } = useGetMentorByIdQuery(mentorId!, {
        skip: !mentorId,
    });

    const [updateMentor, { isLoading: isUpdating }] = useUpdateMentorMutation();

    const mentor = data?.data;

    useEffect(() => {
        if (mentor) form.setFieldsValue(toFormValues(mentor));
    }, [mentor, form]);

    const handleUpdate = async (values: MentorFormValues) => {
        if (!mentor) return;

        const original = toFormValues(mentor);
        const formData = new FormData();
        let changed = 0;

        // only the fields that were changed go into FormData
        (Object.keys(values) as (keyof MentorFormValues)[]).forEach((key) => {
            const next = String(values[key] ?? '').trim();
            if (next !== original[key]) {
                formData.append(key, next);
                changed++;
            }
        });

        if (changed === 0) {
            toast('No changes to save');
            return;
        }

        try {
            const res = await updateMentor({ id: mentor.id, body: formData }).unwrap();
            toast.success(res?.message || 'Mentor updated successfully');
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to update mentor');
        }
    };

    if (!mentorId) {
        return (
            <PageMessage
                title="Invalid mentor link"
                message="The mentor ID is missing from the URL."
            />
        );
    }

    // isFetching is not checked here, so the form is not unmounted after saving
    if (isLoading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <LuLoaderCircle className="animate-spin text-gray-500" size={28} />
                    <p className="text-xs font-medium text-gray-400">
                        Loading mentor information...
                    </p>
                </div>
            </main>
        );
    }

    if (isError || !mentor) {
        return (
            <PageMessage
                title="Mentor not found"
                message="We couldn't find this mentor. Please check the profile link and try again."
            />
        );
    }

    const imageUrl =
        mentor.profileImage ||
        `https://i.pravatar.cc/500?u=${mentor.id}`;

    return (
        <ConfigProvider theme={antdTheme}>
            <main className="min-h-screen bg-[#fafafa]">
                <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

                    {/* Back navigation */}
                    <Link
                        href={`/mentors/mentor-details?mentorId=${mentor.id}`}
                        className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-gray-400 transition-colors hover:text-gray-900"
                    >
                        <MdArrowBack size={17} />
                        Back to mentor details
                    </Link>

                    {/* Profile summary */}
                    <section className="relative mb-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gray-900/[0.025]" />

                        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">
                                {mentor.profileImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={imageUrl}
                                        alt={mentor.fullName || 'Teacher'}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <MdPerson size={34} className="text-gray-300" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
                                        Mentor Profile
                                    </span>

                                    <MdVerified className="text-gray-500" size={15} />
                                </div>

                                <h2 className="truncate text-xl font-extrabold text-gray-900 sm:text-2xl">
                                    {mentor.fullName || 'Unnamed Teacher'}
                                </h2>

                                <p className="mt-1 text-sm text-gray-400">
                                    {mentor.role || 'Teacher'}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 self-start rounded-full border border-gray-100 bg-gray-50 px-3 py-2 sm:self-center">
                                <span
                                    className={`h-2 w-2 rounded-full ${mentor.status === 'ACTIVE'
                                            ? 'bg-green-500'
                                            : 'bg-gray-400'
                                        }`}
                                />
                                <span className="text-[10px] font-bold text-gray-600">
                                    {mentor.status || 'UNKNOWN'}
                                </span>
                            </div>
                        </div>
                    </section>

                    <Form<MentorFormValues>
                        form={form}
                        layout="vertical"
                        requiredMark={false}
                        onFinish={handleUpdate}
                    >
                        <div className="flex flex-col gap-6">

                            {/* Basic information */}
                            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                                <SectionHeading
                                    icon={<LuUserRound size={18} />}
                                    title="Basic Information"
                                    description="Update the mentor's name and personal details."
                                />

                                <div className="mt-6">
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Full Name"
                                                name="fullName"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Full name is required',
                                                    },
                                                ]}
                                            >
                                                <Input
                                                    placeholder="Enter full name"
                                                    prefix={<MdPerson className="text-gray-400" />}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Role"
                                                name="role"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Role is required',
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    options={[
                                                        { value: 'Teacher', label: 'Teacher' },
                                                        { value: 'Admin', label: 'Admin' },
                                                        { value: 'Student', label: 'Student' },
                                                    ]}
                                                    placeholder="Select role"
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Gender"
                                                name="gender"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Please select gender',
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    placeholder="Select gender"
                                                    options={[
                                                        { value: 'Male', label: 'Male' },
                                                        { value: 'Female', label: 'Female' },
                                                        { value: 'Other', label: 'Other' },
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Account Status"
                                                name="status"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Please select status',
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    options={[
                                                        { value: 'ACTIVE', label: 'Active' },
                                                        { value: 'INACTIVE', label: 'Inactive' },
                                                    ]}
                                                    placeholder="Select status"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            </section>

                            {/* Contact information */}
                            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                                <SectionHeading
                                    icon={<LuMail size={18} />}
                                    title="Contact Information"
                                    description="Keep the mentor's contact information up to date."
                                />

                                <div className="mt-6">
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Email Address"
                                                name="email"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Email is required',
                                                    },
                                                    {
                                                        type: 'email',
                                                        message: 'Enter a valid email address',
                                                    },
                                                ]}
                                            >
                                                <Input
                                                    placeholder="teacher@example.com"
                                                    prefix={<MdOutlineEmail className="text-gray-400" />}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <Form.Item label="Phone Number" name="phone">
                                                <Input
                                                    placeholder="Enter phone number"
                                                    prefix={<MdOutlinePhone className="text-gray-400" />}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24}>
                                            <Form.Item
                                                label="Location"
                                                name="location"
                                                className="!mb-0"
                                            >
                                                <Input
                                                    placeholder="Enter location"
                                                    prefix={<MdLocationOn className="text-gray-400" />}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            </section>

                            {/* Profile image */}
                            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                                <SectionHeading
                                    icon={<LuMapPin size={18} />}
                                    title="Profile Image"
                                    description="Update the mentor's profile image."
                                />

                                <div className="mt-6">
                                    <Form.Item name="profileImage" className="!mb-0">
                                        <MentorImageUploader
                                            onUploadingChange={setIsUploading}
                                        />
                                    </Form.Item>
                                </div>
                            </section>

                            {/* Footer */}
                            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <LuShieldCheck size={17} />
                                    <span className="text-xs">
                                        Review the information before saving.
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/mentors/mentor-details?mentorId=${mentor.id}`}
                                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900"
                                    >
                                        Cancel
                                    </Link>

                                    <button
                                        type="submit"
                                        disabled={isUploading || isUpdating}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isUpdating ? (
                                            <LuLoaderCircle size={15} className="animate-spin" />
                                        ) : (
                                            <LuSave size={15} />
                                        )}
                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Form>
                </div>
            </main>
        </ConfigProvider>
    );
}

function SectionHeading({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-500">
                {icon}
            </div>

            <div>
                <h2 className="text-sm font-extrabold text-gray-900">{title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    {description}
                </p>
            </div>
        </div>
    );
}

function PageMessage({
    title,
    message,
}: {
    title: string;
    message: string;
}) {
    return (
        <main className="flex min-h-[60vh] items-center justify-center bg-[#fafafa] px-4">
            <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50">
                    <AlertCircle size={24} className="text-gray-400" />
                </div>

                <h2 className="mt-4 text-lg font-extrabold text-gray-900">{title}</h2>

                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                    {message}
                </p>

                <Link
                    href="/mentors"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-gray-800"
                >
                    <MdArrowBack size={16} />
                    Back to mentors
                </Link>
            </div>
        </main>
    );
}

export default function UpdateMentorPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center">
                    <LuLoaderCircle size={24} className="animate-spin text-gray-500" />
                </main>
            }
        >
            <UpdateMentorContent />
        </Suspense>
    );
}