'use client';

import React, { useState } from 'react';
import {
    Form,
    Input,
    InputNumber,
    Select,
    Row,
    Col,
    ConfigProvider,
    DatePicker,
} from 'antd';
import {
    LuBookOpen,
    LuLayers,
    LuTag,
    LuClock,
    LuUsers,
    LuWallet,
    LuMapPin,
    LuUserRound,
} from 'react-icons/lu';
import type { Dayjs } from 'dayjs';

import SectionCard from '../../training-centers/_components/SectionCard';
import MentorImageUploader from '../../mentors/_components/MentorImageUploader';
import { useCreateCourseMutation } from '@/redux/features/course/courseApi';
import { useGetAllMentorsQuery } from '@/redux/features/mentor/mentorApi';

const { TextArea } = Input;

/* =============================================================
   TYPES & CONFIG
============================================================= */

type Teacher = {
    id: string;
    fullName: string;
    email: string;
    status: string;
};

type FormValues = {
    title: string;
    batch: string;
    category: string;
    teacherIds?: string[];
    description?: string;
    thumbnail?: string;
    classType: 'ONLINE' | 'LIVE';
    venue?: string;
    status: string;
    enrollmentStartDate: Dayjs;
    enrollmentEndDate: Dayjs;
    classStartDate: Dayjs;
    classDuration: string;
    capacity: number;
    price: number;
};

type Status = 'idle' | 'saving' | 'success' | 'error';

// Backend date format, e.g. "15-10-26"
const API_DATE = 'DD-MM-YY';

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

const statusOptions = [
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const classTypeOptions = [
    { value: 'ONLINE', label: 'Online' },
    { value: 'LIVE', label: 'Live' },
];

/* =============================================================
   PAGE
============================================================= */

export default function CreateCoursePage() {
    const [form] = Form.useForm<FormValues>();
    const [createCourse] = useCreateCourseMutation();

    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [errorList, setErrorList] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const classType = Form.useWatch('classType', form);

    const {
        data: mentorsData,
        isLoading: mentorsLoading,
    } = useGetAllMentorsQuery({});

    // Map teachers returned by mentorsData.data
    const teacherOptions = (mentorsData?.data ?? []).map(
        (teacher: Teacher) => ({
            value: teacher.id,
            label: `${ teacher.fullName } (${ teacher.email })`,
            disabled: teacher.status !== 'ACTIVE',
        })
    );

    /* ---------- SUBMIT ---------- */

    const onFinish = async (values: FormValues) => {
        setErrorList([]);
        setErrorMsg('');
        setStatus('saving');

        try {
            const payload = {
                title: values.title.trim(),
                batch: values.batch.trim(),
                category: values.category.trim(),

                // Optional array of selected teacher IDs
                ...(values.teacherIds?.length
                    ? { teacherIds: values.teacherIds }
                    : {}),

                description: values.description?.trim() || undefined,
                thumbnail: values.thumbnail?.trim() || undefined,
                classType: values.classType,
                venue: values.venue?.trim() || undefined,
                status: values.status,

                enrollmentStartDate:
                    values.enrollmentStartDate.format(API_DATE),

                enrollmentEndDate:
                    values.enrollmentEndDate.format(API_DATE),

                classStartDate:
                    values.classStartDate.format(API_DATE),

                classDuration: values.classDuration.trim(),
                capacity: values.capacity,
                price: values.price,
            };

            const creating = await createCourse(payload).unwrap();

            if (creating?.success !== false) {
                setStatus('success');
                form.resetFields();

                setTimeout(() => {
                    setStatus('idle');
                }, 2500);
            }
        } catch (err: any) {
            setErrorMsg(
                err?.data?.message ||
                    err?.error ||
                    'Something went wrong. Please try again.'
            );

            setStatus('error');

            setTimeout(() => {
                setStatus('idle');
            }, 3500);
        }
    };

    const onFinishFailed = ({
        errorFields,
    }: {
        errorFields: { errors: string[] }[];
    }) => {
        setErrorList(
            errorFields.map((field) => field.errors[0]).filter(Boolean)
        );
    };

    const saving = status === 'saving';

    /* ---------- RENDER ---------- */

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="w-full lg:w-[90%] px-4 sm:px-6 py-10">
                {/* HEADER */}

                <div>
                    <p className="text-[22px] font-medium text-gray-900 mb-1">
                        Create Course
                    </p>

                    <div className="text-gray-400 text-[13px] mb-6">
                        Fill in the details below to create a new course batch.
                    </div>
                </div>

                <Form<FormValues>
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    initialValues={{
                        status: 'UPCOMING',
                        classType: 'ONLINE',
                    }}
                    onValuesChange={() => {
                        if (errorList.length) {
                            setErrorList([]);
                        }

                        if (status === 'error') {
                            setStatus('idle');
                        }
                    }}
                >
                    <div className="flex flex-col gap-6">
                        {/* ================= BASIC INFORMATION ================= */}

                        <SectionCard
                            title="Basic information"
                            subtitle="Title, batch and category of the course"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Course title"
                                        name="title"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Course title is required',
                                            },
                                            {
                                                whitespace: true,
                                                message:
                                                    'Course title cannot be empty',
                                            },
                                            {
                                                min: 3,
                                                message:
                                                    'Title must be at least 3 characters',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Web Development"
                                            prefix={
                                                <LuBookOpen className="text-gray-400" />
                                            }
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="Batch"
                                        name="batch"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Batch is required',
                                            },
                                            {
                                                whitespace: true,
                                                message:
                                                    'Batch cannot be empty',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Batch 1"
                                            prefix={
                                                <LuLayers className="text-gray-400" />
                                            }
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="Category"
                                        name="category"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Course category is required',
                                            },
                                            {
                                                whitespace: true,
                                                message:
                                                    'Category cannot be empty',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Web Development"
                                            prefix={
                                                <LuTag className="text-gray-400" />
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* OPTIONAL MULTIPLE TEACHER SELECT */}

                            <Form.Item
                                label="Teachers (optional)"
                                name="teacherIds"
                                className="!mb-4"
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder="Select one or more teachers"
                                    options={teacherOptions}
                                    loading={mentorsLoading}
                                    notFoundContent={
                                        mentorsLoading
                                            ? 'Loading teachers...'
                                            : 'No teachers found'
                                    }
                                    suffixIcon={
                                        <LuUserRound className="text-gray-400" />
                                    }
                                />
                            </Form.Item>

                            <Form.Item
                                label="Description"
                                name="description"
                                className="!mb-0"
                                rules={[
                                    {
                                        max: 1000,
                                        message:
                                            'Description cannot exceed 1000 characters',
                                    },
                                ]}
                            >
                                <TextArea
                                    rows={4}
                                    maxLength={1000}
                                    showCount
                                    placeholder="Describe the course content..."
                                    className="!resize-none"
                                />
                            </Form.Item>
                        </SectionCard>

                        {/* ================= THUMBNAIL ================= */}

                        <SectionCard
                            title="Thumbnail"
                            subtitle="Cover image of the course (optional)"
                        >
                            <Form.Item name="thumbnail" className="!mb-0">
                                <MentorImageUploader
                                    onUploadingChange={setIsUploading}
                                />
                            </Form.Item>
                        </SectionCard>

                        {/* ================= SCHEDULE ================= */}

                        <SectionCard
                            title="Schedule"
                            subtitle="Enrollment window, class start and duration"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Enrollment start"
                                        name="enrollmentStartDate"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Enrollment start date is required',
                                            },
                                        ]}
                                    >
                                        <DatePicker
                                            className="!w-full"
                                            format="DD MMM YYYY"
                                            placeholder="Select date"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Enrollment end"
                                        name="enrollmentEndDate"
                                        dependencies={['enrollmentStartDate']}
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Enrollment end date is required',
                                            },
                                            ({ getFieldValue }) => ({
                                                validator(_, value: Dayjs) {
                                                    const start: Dayjs =
                                                        getFieldValue(
                                                            'enrollmentStartDate'
                                                        );

                                                    if (
                                                        value &&
                                                        start &&
                                                        value.isBefore(
                                                            start,
                                                            'day'
                                                        )
                                                    ) {
                                                        return Promise.reject(
                                                            new Error(
                                                                'Enrollment end cannot be before the start'
                                                            )
                                                        );
                                                    }

                                                    return Promise.resolve();
                                                },
                                            }),
                                        ]}
                                    >
                                        <DatePicker
                                            className="!w-full"
                                            format="DD MMM YYYY"
                                            placeholder="Select date"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Class start"
                                        name="classStartDate"
                                        dependencies={['enrollmentStartDate']}
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Class start date is required',
                                            },
                                            ({ getFieldValue }) => ({
                                                validator(_, value: Dayjs) {
                                                    const start: Dayjs =
                                                        getFieldValue(
                                                            'enrollmentStartDate'
                                                        );

                                                    if (
                                                        value &&
                                                        start &&
                                                        value.isBefore(
                                                            start,
                                                            'day'
                                                        )
                                                    ) {
                                                        return Promise.reject(
                                                            new Error(
                                                                'Class start cannot be before enrollment start'
                                                            )
                                                        );
                                                    }

                                                    return Promise.resolve();
                                                },
                                            }),
                                        ]}
                                    >
                                        <DatePicker
                                            className="!w-full"
                                            format="DD MMM YYYY"
                                            placeholder="Select date"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Class duration"
                                        name="classDuration"
                                        className="!mb-0"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Class duration is required',
                                            },
                                            {
                                                whitespace: true,
                                                message:
                                                    'Class duration cannot be empty',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="3 months"
                                            prefix={
                                                <LuClock className="text-gray-400" />
                                            }
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Class type"
                                        name="classType"
                                        className="!mb-0"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Please select a class type',
                                            },
                                        ]}
                                    >
                                        <Select options={classTypeOptions} />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label={
                                            classType === 'LIVE'
                                                ? 'Venue'
                                                : 'Venue (optional)'
                                        }
                                        name="venue"
                                        className="!mb-0"
                                        rules={[
                                            {
                                                required: classType === 'LIVE',
                                                message:
                                                    'Venue is required for live classes',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Mirpur-10, Dhaka"
                                            disabled={classType !== 'LIVE'}
                                            prefix={
                                                <LuMapPin className="text-gray-400" />
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </SectionCard>

                        {/* ================= PRICING AND SEATS ================= */}

                        <SectionCard
                            title="Pricing and seats"
                            subtitle="Course fee, capacity and status"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Price (৳)"
                                        name="price"
                                        className="!mb-0"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Price is required',
                                            },
                                            {
                                                type: 'number',
                                                min: 0,
                                                message:
                                                    'Price cannot be negative',
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            className="!w-full"
                                            min={0}
                                            placeholder="5000"
                                            prefix={
                                                <LuWallet className="text-gray-400" />
                                            }
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Capacity (seats)"
                                        name="capacity"
                                        className="!mb-0"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Capacity is required',
                                            },
                                            {
                                                type: 'number',
                                                min: 1,
                                                message:
                                                    'Capacity must be at least 1',
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            className="!w-full"
                                            min={1}
                                            placeholder="30"
                                            prefix={
                                                <LuUsers className="text-gray-400" />
                                            }
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Status"
                                        name="status"
                                        className="!mb-0"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Course status is required',
                                            },
                                        ]}
                                    >
                                        <Select options={statusOptions} />
                                    </Form.Item>
                                </Col>
                            </Row>
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
                                        Please fix the following before
                                        creating:
                                    </p>

                                    <ul className="space-y-1">
                                        {errorList.map((msg, index) => (
                                            <li
                                                key={index}
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
                                        Course created successfully
                                    </span>
                                )}

                                {status === 'error' && (
                                    <span className="text-red-400 font-medium">
                                        {errorMsg}
                                    </span>
                                )}

                                {status === 'idle' && !isUploading && (
                                    <span className="text-gray-300">
                                        All changes are unsaved
                                    </span>
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
                                    {saving ? 'Creating…' : 'Create course'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </ConfigProvider>
    );
}
