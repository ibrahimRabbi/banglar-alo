'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, Input, InputNumber, Row, Col, ConfigProvider, Select, DatePicker } from 'antd';
import {
    LuBookOpen, LuLayers, LuTag, LuClock, LuMapPin, LuUsers, LuWallet,
} from 'react-icons/lu';
import { MdArrowBack } from 'react-icons/md';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import {
    useGetCourseByIdQuery,
    useUpdateCourseMutation,
} from '@/redux/features/course/courseApi';

import SectionCard from '../../training-centers/_components/SectionCard'; // <- adjust path
import MentorImageUploader from '../../mentors/_components/MentorImageUploader'; // <- adjust path

dayjs.extend(customParseFormat);

/* =============================================================
   TYPES & CONFIG
============================================================= */

type Course = {
    id: string;
    title: string;
    batch: string;
    category: string;
    description: string;
    thumbnail: string;
    status: string;
    classType: string;
    enrollmentStartDate: string; // "01-10-26"
    enrollmentEndDate: string;
    classStartDate: string;
    classDuration: string;
    venue: string;
    capacity: number;
    price: number;
    enrolledCount: number;
};

type FormValues = {
    title: string;
    batch: string;
    category: string;
    description: string;
    thumbnail: string;
    status: string;
    classType: string;
    enrollmentStartDate: Dayjs;
    enrollmentEndDate: Dayjs;
    classStartDate: Dayjs;
    classDuration: string;
    venue: string;
    capacity: number;
    price: number;
};

type Status = 'idle' | 'saving' | 'success' | 'error';

// API date format, e.g. "25-10-26"
const API_DATE = 'DD-MM-YY';
const DATE_KEYS = ['enrollmentStartDate', 'enrollmentEndDate', 'classStartDate'] as const;

const antdTheme = {
    token: {
        colorPrimary: '#111827',
        colorBorder: '#e5e7eb',
        borderRadius: 12,
        controlHeight: 40,
        fontSize: 13,
    },
    components: {
        Form: { labelFontSize: 12, labelColor: '#6b7280', verticalLabelPadding: '0 0 4px' },
    },
};

// adjust these to the values your backend accepts
const statusOptions = [
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const classTypeOptions = [
    { value: 'ONLINE', label: 'Online' },
    { value: 'OFFLINE', label: 'Offline' },
];

/* =============================================================
   HELPERS
============================================================= */

// API course -> form values (dates become dayjs)
const toFormValues = (c: Course): FormValues => ({
    title: c.title ?? '',
    batch: c.batch ?? '',
    category: c.category ?? '',
    description: c.description ?? '',
    thumbnail: c.thumbnail ?? '',
    status: c.status,
    classType: c.classType,
    enrollmentStartDate: dayjs(c.enrollmentStartDate, API_DATE),
    enrollmentEndDate: dayjs(c.enrollmentEndDate, API_DATE),
    classStartDate: dayjs(c.classStartDate, API_DATE),
    classDuration: c.classDuration ?? '',
    venue: c.venue ?? '',
    capacity: c.capacity,
    price: c.price,
});

// current form values -> only the fields that differ from the original course
const getChanges = (values: Partial<FormValues>, course: Course) => {
    const changes: Record<string, string | number> = {};

    (Object.keys(values) as (keyof FormValues)[]).forEach((key) => {
        let next: any = values[key];
        if (next === undefined || next === null) return;

        if ((DATE_KEYS as readonly string[]).includes(key)) {
            next = (next as Dayjs).isValid() ? (next as Dayjs).format(API_DATE) : '';
        } else if (typeof next === 'string') {
            next = next.trim();
        }

        const original = (course as any)[key] ?? (typeof next === 'string' ? '' : undefined);
        if (next !== original) changes[key] = next;
    });

    return changes;
};

const labelOf = (key: string) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

/* =============================================================
   FORM
============================================================= */

function UpdateCourseForm({ course }: { course: Course }) {
    const router = useRouter();
    const [form] = Form.useForm<FormValues>();
    const [updateCourse] = useUpdateCourseMutation();

    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [errorList, setErrorList] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // live form values, used to detect what has changed
    const watched = Form.useWatch([], form);
    const classType = Form.useWatch('classType', form);

    const changes = useMemo(
        () => (watched ? getChanges(watched, course) : {}),
        [watched, course]
    );
    const changedCount = Object.keys(changes).length;

    /* ---------- submit ---------- */

    const onFinish = async (values: FormValues) => {
        const payload = getChanges(values, course);

        if (Object.keys(payload).length === 0) return;

        setErrorList([]);
        setErrorMsg('');
        setStatus('saving');

        try {
            // adjust the argument shape to match your updateCourse mutation
            await updateCourse({ id: course.id, data: payload }).unwrap();

            setStatus('success');
            setTimeout(() => setStatus('idle'), 2500);
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
    const canSubmit = changedCount > 0 && !saving && !isUploading;

    /* ---------- render ---------- */

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="w-full lg:w-[90%] px-4 sm:px-6 py-10">
                {/* HEADER */}
                <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 mb-4 text-[12px] font-bold text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <MdArrowBack size={17} /> Back to courses
                </Link>

                <div>
                    <p className="text-[22px] font-medium text-gray-900 mb-1">Update Course</p>
                    <div className="text-gray-400 text-[13px] mb-6">
                        Edit any field below. Only the fields you change will be sent.
                    </div>
                </div>

                <Form<FormValues>
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    initialValues={toFormValues(course)}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    onValuesChange={() => {
                        if (errorList.length) setErrorList([]);
                        if (status === 'error') setStatus('idle');
                    }}
                >
                    <div className="flex flex-col gap-6">
                        {/* ================= BASIC ================= */}
                        <SectionCard title="Basic information" subtitle="Title, batch and category of the course">
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Course title"
                                        name="title"
                                        rules={[
                                            { required: true, message: 'Course title is required' },
                                            { min: 3, message: 'Title must be at least 3 characters' },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Complete Web Development Course"
                                            prefix={<LuBookOpen className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="Batch"
                                        name="batch"
                                        rules={[{ required: true, message: 'Batch is required' }]}
                                    >
                                        <Input placeholder="Batch 01" prefix={<LuLayers className="text-gray-400" />} />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="Category"
                                        name="category"
                                        rules={[{ required: true, message: 'Category is required' }]}
                                    >
                                        <Input placeholder="Web Development" prefix={<LuTag className="text-gray-400" />} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="Description" name="description" className="!mb-0">
                                <Input.TextArea rows={3} placeholder="Short description of the course" />
                            </Form.Item>
                        </SectionCard>

                        {/* ================= THUMBNAIL ================= */}
                        <SectionCard title="Thumbnail" subtitle="Cover image of the course (optional)">
                            <Form.Item name="thumbnail" className="!mb-0">
                                <MentorImageUploader onUploadingChange={setIsUploading} />
                            </Form.Item>
                        </SectionCard>

                        {/* ================= SCHEDULE ================= */}
                        <SectionCard title="Schedule" subtitle="Enrollment window and class start">
                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Enrollment start"
                                        name="enrollmentStartDate"
                                        rules={[{ required: true, message: 'Enrollment start date is required' }]}
                                    >
                                        <DatePicker className="!w-full" format="DD MMM YYYY" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Enrollment end"
                                        name="enrollmentEndDate"
                                        dependencies={['enrollmentStartDate']}
                                        rules={[
                                            { required: true, message: 'Enrollment end date is required' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value: Dayjs) {
                                                    const start: Dayjs = getFieldValue('enrollmentStartDate');
                                                    if (value && start && value.isBefore(start, 'day')) {
                                                        return Promise.reject(
                                                            new Error('Enrollment end cannot be before the start')
                                                        );
                                                    }
                                                    return Promise.resolve();
                                                },
                                            }),
                                        ]}
                                    >
                                        <DatePicker className="!w-full" format="DD MMM YYYY" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Class start"
                                        name="classStartDate"
                                        rules={[{ required: true, message: 'Class start date is required' }]}
                                    >
                                        <DatePicker className="!w-full" format="DD MMM YYYY" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Class duration"
                                        name="classDuration"
                                        className="!mb-0"
                                        rules={[{ required: true, message: 'Class duration is required' }]}
                                    >
                                        <Input placeholder="3 months" prefix={<LuClock className="text-gray-400" />} />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Class type"
                                        name="classType"
                                        className="!mb-0"
                                        rules={[{ required: true, message: 'Please select a class type' }]}
                                    >
                                        <Select options={classTypeOptions} />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label={classType === 'ONLINE' ? 'Venue (optional)' : 'Venue'}
                                        name="venue"
                                        className="!mb-0"
                                        rules={[
                                            {
                                                required: classType !== 'ONLINE',
                                                message: 'Venue is required for offline classes',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Mirpur-10, Dhaka"
                                            prefix={<LuMapPin className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </SectionCard>

                        {/* ================= PRICING ================= */}
                        <SectionCard title="Pricing and seats" subtitle="Course fee, capacity and status">
                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Price (৳)"
                                        name="price"
                                        className="!mb-0"
                                        rules={[
                                            { required: true, message: 'Price is required' },
                                            { type: 'number', min: 0, message: 'Price cannot be negative' },
                                        ]}
                                    >
                                        <InputNumber
                                            className="!w-full"
                                            min={0}
                                            prefix={<LuWallet className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label={`Capacity (${course.enrolledCount} enrolled)`}
                                        name="capacity"
                                        className="!mb-0"
                                        rules={[
                                            { required: true, message: 'Capacity is required' },
                                            {
                                                type: 'number',
                                                min: course.enrolledCount || 1,
                                                message: `Capacity cannot be less than ${course.enrolledCount || 1}`,
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            className="!w-full"
                                            min={course.enrolledCount || 1}
                                            prefix={<LuUsers className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Status"
                                        name="status"
                                        className="!mb-0"
                                        rules={[{ required: true, message: 'Please select a status' }]}
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
                                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[12px] font-medium text-red-500 mb-1.5">
                                        Please fix the following before updating:
                                    </p>
                                    <ul className="space-y-1">
                                        {errorList.map((msg, i) => (
                                            <li key={i} className="flex items-center gap-1.5 text-[11px] text-red-400">
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
                                            <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        </span>
                                        Course updated successfully
                                    </span>
                                )}

                                {status === 'error' && <span className="text-red-400 font-medium">{errorMsg}</span>}

                                {status === 'idle' && !isUploading && (
                                    <span className={changedCount ? 'text-gray-500' : 'text-gray-300'}>
                                        {changedCount === 0
                                            ? 'No changes yet'
                                            : `${changedCount} field${changedCount > 1 ? 's' : ''} changed: ${Object.keys(changes)
                                                .map(labelOf)
                                                .join(', ')}`}
                                    </span>
                                )}

                                {isUploading && (
                                    <span className="text-gray-400 flex items-center gap-1.5">
                                        <svg className="animate-spin" width="12" height="12" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Image uploading…
                                    </span>
                                )}

                                {saving && !isUploading && (
                                    <span className="text-gray-400 flex items-center gap-1.5">
                                        <svg className="animate-spin" width="12" height="12" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Updating…
                                    </span>
                                )}
                            </span>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={saving || isUploading}
                                    onClick={() => router.back()}
                                    className="px-4 py-2 text-[13px] font-medium border border-gray-200 rounded-xl text-gray-500 bg-white hover:border-gray-300 hover:text-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={changedCount === 0 || saving || isUploading}
                                    onClick={() => {
                                        form.setFieldsValue(toFormValues(course));
                                        setErrorList([]);
                                        setErrorMsg('');
                                        setStatus('idle');
                                    }}
                                    className="px-4 py-2 text-[13px] font-medium border border-gray-200 rounded-xl text-gray-500 bg-white hover:border-gray-300 hover:text-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Undo changes
                                </button>

                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="px-4 py-2 text-[13px] font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Updating…' : 'Update course'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </ConfigProvider>
    );
}

/* =============================================================
   PAGE (loads the course, then renders the form)
============================================================= */

function UpdateCourse() {
    const query = useSearchParams();
    const courseId = query.get('courseId');

    const { data, isLoading, isError } = useGetCourseByIdQuery(courseId!, { skip: !courseId });

    // adjust if your response shape differs (e.g. data?.data?.course)
    const course: Course | undefined = data?.data;

    if (!courseId) {
        return <Message title="Invalid course link" text="The course id is missing from the link." />;
    }

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <span className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                    <p className="text-xs font-medium text-gray-400">Loading course...</p>
                </div>
            </main>
        );
    }

    if (isError || !course) {
        return <Message title="Course not found" text="We could not find the course you are looking for." />;
    }

    // key = id, so the form is rebuilt if you open another course
    return <UpdateCourseForm key={course.id} course={course} />;
}

function Message({ title, text }: { title: string; text: string }) {
    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
                <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
                <p className="text-xs text-gray-400 leading-relaxed mt-2">{text}</p>
                <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 mt-6 bg-gray-900 text-white rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                    <MdArrowBack size={16} /> Back to courses
                </Link>
            </div>
        </main>
    );
}

export default function UpdateCoursePage() {
    return (
        <Suspense fallback={<main className="min-h-screen" />}>
            <UpdateCourse />
        </Suspense>
    );
}