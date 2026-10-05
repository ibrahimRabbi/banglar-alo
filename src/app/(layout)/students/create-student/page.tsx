'use client';

import React, { useState } from 'react';
import { Form, Input, Row, Col, ConfigProvider, Select, DatePicker } from 'antd';
import {
    LuUserRound,
    LuMail,
    LuPhone,
    LuMapPin,
    LuBuilding2,
    LuBookOpen,
    LuUsers,
} from 'react-icons/lu';
import dayjs, { Dayjs } from 'dayjs';

import { useCreateStudentMutation } from '@/redux/features/student/studentApi';
import { useGetAllcenterQuery } from '@/redux/features/center/centerApi';
import { useGetAllCoursesQuery } from '@/redux/features/course/courseApi';

import SectionCard from '../../training-centers/_components/SectionCard'; // <- adjust path
import MentorImageUploader from '../../mentors/_components/MentorImageUploader'; // <- adjust path



type FormValues = {
    course_id: string;
    batch_id: string;
    center_id: string;
    student_image: string;
    name: string;
    image: string;
    father_name: string;
    mother_name: string;
    dateOfBirth: Dayjs;
    gender: 'Male' | 'Female' | 'Other';
    email: string;
    phone: string;
    alternate_phone?: string;
    present_address: string;
    permanent_address: string;
};

type Status = 'idle' | 'saving' | 'success' | 'error';

const antdTheme = {
    token: {
        colorPrimary: '#111827',
        colorBorder: '#e5e7eb',
        borderRadius: 12,
        controlHeight: 40,
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

const BD_PHONE = /^01[3-9]\d{8}$/;

// DB te district ar sub_area lowercase, tai dekhanor jonno capitalize
const capitalize = (s?: string) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase());

// TODO: replace with real batch API data (useGetAllBatchesQuery) when ready
const DUMMY_BATCHES = [
    { value: '68d223456789abcdef123456', label: 'Batch 01' },
    { value: '68d223456789abcdef123457', label: 'Batch 02' },
    { value: '68d223456789abcdef123458', label: 'Batch 03' },
];

const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
];

/* =============================================================
   PAGE
============================================================= */

export default function CreateStudentPage() {
    const [form] = Form.useForm<FormValues>();

    const [createStudent] = useCreateStudentMutation();
    const { data: centerData } = useGetAllcenterQuery({});
    const { data: courseData } = useGetAllCoursesQuery({});

    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [errorList, setErrorList] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    /* ---------- options ---------- */

    const centerOptions =
        centerData?.data?.map((center: any) => ({
            value: center._id,
            label: `${capitalize(center.district)}, ${capitalize(center.sub_area)} (${center.center_id})`,
            searchText: [center.center_id, center.district, center.sub_area, center.division]
                .filter(Boolean)
                .join(' ')
                .toLowerCase(),
        })) || [];

    const courseOptions =
        courseData?.data?.map((course: any) => ({
            value: course._id,
            label: `${course.course_name}${course.course_code ? ` (${course.course_code})` : ''}`,
            searchText: [course.course_name, course.course_code]
                .filter(Boolean)
                .join(' ')
                .toLowerCase(),
        })) || [];

    /* ---------- submit ---------- */

    const onFinish = async (values: FormValues) => {
        setErrorList([]);
        setErrorMsg('');
        setStatus('saving');

        try {
            const payload = {
                course_id: values.course_id,
                batch_id: values.batch_id,
                center_id: values.center_id,
                student_image: values.student_image.trim(),
                name: values.name.trim(),
                image: values.image.trim(),
                father_name: values.father_name.trim(),
                mother_name: values.mother_name.trim(),
                dateOfBirth: values.dateOfBirth.toDate().toISOString(),
                gender: values.gender,
                email: values.email.trim().toLowerCase(),
                phone: values.phone.trim(),
                alternate_phone: values.alternate_phone?.trim() || undefined,
                present_address: values.present_address.trim(),
                permanent_address: values.permanent_address.trim(),
            };

            const creating = await createStudent(payload).unwrap();

            if (creating?.data) {
                setStatus('success');
                form.resetFields();
                setTimeout(() => setStatus('idle'), 2500);
            }
        } catch (err: any) {
            setErrorMsg(err?.data?.message || err?.error || 'Something went wrong. Please try again.');
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3500);
        }
    };

    const onFinishFailed = ({ errorFields }: { errorFields: { errors: string[] }[] }) => {
        setErrorList(errorFields.map((f) => f.errors[0]).filter(Boolean));
    };

    const saving = status === 'saving';

    const searchFilter = (input: string, option: any) =>
        (option?.searchText || '').includes(input.toLowerCase());

    /* ---------- render ---------- */

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="w-full lg:w-[90%] px-4 sm:px-6 py-10">
                {/* HEADER */}
                <div>
                    <p className="text-[22px] font-medium text-gray-900 mb-1">Create Student</p>
                    <div className="text-gray-400 text-[13px] mb-6">
                        Fill in the details below to enroll a new student.
                    </div>
                </div>

                <Form<FormValues>
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    onValuesChange={() => {
                        if (errorList.length) setErrorList([]);
                        if (status === 'error') setStatus('idle');
                    }}
                >
                    <div className="flex flex-col gap-6">
                        {/* ================= ENROLLMENT ================= */}
                        <SectionCard
                            title="Enrollment"
                            subtitle="Course, batch and training center of the student"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Course"
                                        name="course_id"
                                        className="!mb-0"
                                        rules={[{ required: true, message: 'Please select a course' }]}
                                    >
                                        <Select
                                            showSearch
                                            allowClear
                                            placeholder="Select course"
                                            options={courseOptions}
                                            filterOption={searchFilter}
                                            suffixIcon={<LuBookOpen className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Batch"
                                        name="batch_id"
                                        className="!mb-0"
                                        rules={[{ required: true, message: 'Please select a batch' }]}
                                    >
                                        <Select
                                            showSearch
                                            allowClear
                                            placeholder="Select batch"
                                            options={DUMMY_BATCHES}
                                            optionFilterProp="label"
                                            suffixIcon={<LuUsers className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Training center"
                                        name="center_id"
                                        className="!mb-0"
                                        rules={[{ required: true, message: 'Please select a training center' }]}
                                    >
                                        <Select
                                            showSearch
                                            allowClear
                                            placeholder="Search by district, sub area or ID"
                                            options={centerOptions}
                                            filterOption={searchFilter}
                                            suffixIcon={<LuBuilding2 className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </SectionCard>

                        {/* ================= PERSONAL ================= */}
                        <SectionCard
                            title="Personal information"
                            subtitle="Basic details about the student"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Student name"
                                        name="name"
                                        rules={[
                                            { required: true, message: 'Student name is required' },
                                            { min: 2, message: 'Name must be at least 2 characters' },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Mohammad Rahim"
                                            prefix={<LuUserRound className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="Date of birth"
                                        name="dateOfBirth"
                                        rules={[{ required: true, message: 'Date of birth is required' }]}
                                    >
                                        <DatePicker
                                            className="!w-full"
                                            placeholder="Select date"
                                            format="DD MMM YYYY"
                                            disabledDate={(d) => d && d.isAfter(dayjs())}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="Gender"
                                        name="gender"
                                        rules={[{ required: true, message: 'Please select gender' }]}
                                    >
                                        <Select placeholder="Select gender" options={genderOptions} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Father's name"
                                        name="father_name"
                                        rules={[{ required: true, message: "Father's name is required" }]}
                                    >
                                        <Input
                                            placeholder="Abdul Karim"
                                            prefix={<LuUserRound className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Mother's name"
                                        name="mother_name"
                                        rules={[{ required: true, message: "Mother's name is required" }]}
                                    >
                                        <Input
                                            placeholder="Rahima Begum"
                                            prefix={<LuUserRound className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Profile image */}
                            <Form.Item
                                label="Profile image"
                                name="image"
                                className="!mb-0"
                                rules={[{ required: true, message: 'Profile image is required' }]}
                            >
                                <MentorImageUploader onUploadingChange={setIsUploading} />
                            </Form.Item>
                        </SectionCard>

                        {/* ================= CONTACT ================= */}
                        <SectionCard title="Contact" subtitle="How people can reach this student">
                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        className="!mb-0"
                                        rules={[
                                            { required: true, message: 'Email is required' },
                                            { type: 'email', message: 'Enter a valid email' },
                                        ]}
                                    >
                                        <Input
                                            placeholder="rahim@example.com"
                                            prefix={<LuMail className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Phone"
                                        name="phone"
                                        className="!mb-0"
                                        rules={[
                                            { required: true, message: 'Phone is required' },
                                            { pattern: BD_PHONE, message: 'Enter a valid BD phone number' },
                                        ]}
                                    >
                                        <Input
                                            placeholder="01712345678"
                                            maxLength={11}
                                            prefix={<LuPhone className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Alternate phone (optional)"
                                        name="alternate_phone"
                                        className="!mb-0"
                                        rules={[
                                            { pattern: BD_PHONE, message: 'Enter a valid alternate phone number' },
                                        ]}
                                    >
                                        <Input
                                            placeholder="01812345678"
                                            maxLength={11}
                                            prefix={<LuPhone className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </SectionCard>

                        {/* ================= ADDRESS ================= */}
                        <SectionCard title="Address" subtitle="Present and permanent address">
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Present address"
                                        name="present_address"
                                        className="!mb-0"
                                        rules={[{ required: true, message: 'Present address is required' }]}
                                    >
                                        <Input.TextArea rows={3} placeholder="Mirpur, Dhaka, Bangladesh" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Permanent address"
                                        name="permanent_address"
                                        className="!mb-0"
                                        rules={[{ required: true, message: 'Permanent address is required' }]}
                                    >
                                        <Input.TextArea rows={3} placeholder="Sadar, Cumilla, Bangladesh" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div className="flex items-center gap-1.5 mt-3">
                                <LuMapPin size={11} className="text-gray-300" />
                                <p className="text-[10px] text-gray-400">Include area, district and country.</p>
                            </div>
                        </SectionCard>

                        {/* ================= ERROR SUMMARY ================= */}
                        {errorList.length > 0 && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg
                                        width="10"
                                        height="10"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="#f87171"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[12px] font-medium text-red-500 mb-1.5">
                                        Please fix the following before creating:
                                    </p>
                                    <ul className="space-y-1">
                                        {errorList.map((msg, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-1.5 text-[11px] text-red-400"
                                            >
                                                <span className="w-1 h-1 rounded-full bg-red-300 shrink-0" />
                                                {msg}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* ================= FOOTER ================= */}
                        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
                            <span className="text-[13px]">
                                {status === 'success' && (
                                    <span className="text-green-500 font-medium flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center shrink-0">
                                            <svg
                                                width="8"
                                                height="8"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="white"
                                                strokeWidth={3}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4.5 12.75l6 6 9-13.5"
                                                />
                                            </svg>
                                        </span>
                                        Student created successfully
                                    </span>
                                )}

                                {status === 'error' && (
                                    <span className="text-red-400 font-medium">{errorMsg}</span>
                                )}

                                {status === 'idle' && !isUploading && (
                                    <span className="text-gray-300">All changes are unsaved</span>
                                )}

                                {isUploading && (
                                    <span className="text-gray-400 flex items-center gap-1.5">
                                        <svg
                                            className="animate-spin"
                                            width="12"
                                            height="12"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8z"
                                            />
                                        </svg>
                                        Image uploading…
                                    </span>
                                )}

                                {saving && !isUploading && (
                                    <span className="text-gray-400 flex items-center gap-1.5">
                                        <svg
                                            className="animate-spin"
                                            width="12"
                                            height="12"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8z"
                                            />
                                        </svg>
                                        Creating…
                                    </span>
                                )}
                            </span>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={saving || isUploading}
                                    onClick={() => {
                                        form.resetFields();
                                        setErrorList([]);
                                        setErrorMsg('');
                                        setStatus('idle');
                                    }}
                                    className="px-4 py-2 text-[13px] font-medium border border-gray-200 rounded-xl text-gray-500 bg-white hover:border-gray-300 hover:text-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Reset
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving || isUploading}
                                    className="px-4 py-2 text-[13px] font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Creating…' : 'Create student'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </ConfigProvider>
    );
}