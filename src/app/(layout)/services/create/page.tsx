'use client';

import React, { useState } from 'react';
import { Form, Input, Select, Row, Col, ConfigProvider } from 'antd';
import { LuBriefcaseBusiness, LuFileText } from 'react-icons/lu';

import { useCreateServiceMutation } from '@/redux/features/services/serviceApi';
import SectionCard from '../../training-centers/_components/SectionCard'; // <- adjust path

const { TextArea } = Input;

/* =============================================================
   TYPES & CONFIG
============================================================= */

type FormValues = {
    title: string;
    summary: string;
    whatWeDo: string;
    whyWeAreBest: string;
    howWeSolve: string;
    status: string;
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

// adjust to the values your backend accepts
const statusOptions = [
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'DRAFT', label: 'Draft' },
];

/* =============================================================
   PAGE
============================================================= */

export default function CreateServicePage() {
    const [form] = Form.useForm<FormValues>();
    const [createService] = useCreateServiceMutation();

    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [errorList, setErrorList] = useState<string[]>([]);

    /* ---------- submit ---------- */

    const onFinish = async (values: FormValues) => {
        setErrorList([]);
        setErrorMsg('');
        setStatus('saving');

        try {
            const payload = {
                title: values.title.trim(),
                summary: values.summary.trim(),
                whatWeDo: values.whatWeDo.trim(),
                whyWeAreBest: values.whyWeAreBest.trim(),
                howWeSolve: values.howWeSolve.trim(),
                status: values.status,
            };

            const creating = await createService(payload).unwrap();

            if (creating?.success !== false) {
                setStatus('success');
                form.resetFields();
                setTimeout(() => setStatus('idle'), 2500);
            }
        } catch (err: any) {
            setErrorMsg(
                err?.data?.message ||
                err?.error ||
                'Something went wrong. Please try again.'
            );
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3500);
        }
    };

    const onFinishFailed = ({
        errorFields,
    }: {
        errorFields: { errors: string[] }[];
    }) => {
        setErrorList(errorFields.map((f) => f.errors[0]).filter(Boolean));
    };

    const saving = status === 'saving';

    /* ---------- render ---------- */

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="w-full lg:w-[90%] px-4 sm:px-6 py-10">
                {/* HEADER */}
                <div>
                    <p className="text-[22px] font-medium text-gray-900 mb-1">
                        Create Service
                    </p>
                    <div className="text-gray-400 text-[13px] mb-6">
                        Fill in the details below to publish a new service.
                    </div>
                </div>

                <Form<FormValues>
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    initialValues={{ status: 'PUBLISHED' }}
                    onValuesChange={() => {
                        if (errorList.length) setErrorList([]);
                        if (status === 'error') setStatus('idle');
                    }}
                >
                    <div className="flex flex-col gap-6">
                        {/* ================= BASIC INFORMATION ================= */}
                        <SectionCard
                            title="Basic information"
                            subtitle="Service name, short summary and visibility"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={16}>
                                    <Form.Item
                                        label="Service title"
                                        name="title"
                                        rules={[
                                            { required: true, message: 'Service title is required' },
                                            { whitespace: true, message: 'Service title cannot be empty' },
                                            { min: 3, message: 'Title must be at least 3 characters' },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Custom Development"
                                            prefix={<LuBriefcaseBusiness className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Status"
                                        name="status"
                                        rules={[{ required: true, message: 'Service status is required' }]}
                                    >
                                        <Select options={statusOptions} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Summary"
                                name="summary"
                                className="!mb-0"
                                rules={[
                                    { required: true, message: 'Summary is required' },
                                    { whitespace: true, message: 'Summary cannot be empty' },
                                    { max: 300, message: 'Summary cannot exceed 300 characters' },
                                ]}
                            >
                                <Input
                                    placeholder="Web and mobile products built for your business"
                                    prefix={<LuFileText className="text-gray-400" />}
                                    maxLength={300}
                                    showCount
                                />
                            </Form.Item>
                        </SectionCard>

                        {/* ================= SERVICE DETAILS ================= */}
                        <SectionCard
                            title="Service details"
                            subtitle="Explain what you do, why you are the best and how you solve problems"
                        >
                            <Form.Item
                                label="What we do"
                                name="whatWeDo"
                                rules={[
                                    { required: true, message: 'This field is required' },
                                    { whitespace: true, message: 'This field cannot be empty' },
                                    { max: 1000, message: 'Cannot exceed 1000 characters' },
                                ]}
                            >
                                <TextArea
                                    rows={3}
                                    maxLength={1000}
                                    showCount
                                    placeholder="We design, build, and launch custom software."
                                    className="!resize-none"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Why we are the best"
                                name="whyWeAreBest"
                                rules={[
                                    { required: true, message: 'This field is required' },
                                    { whitespace: true, message: 'This field cannot be empty' },
                                    { max: 1000, message: 'Cannot exceed 1000 characters' },
                                ]}
                            >
                                <TextArea
                                    rows={3}
                                    maxLength={1000}
                                    showCount
                                    placeholder="A dedicated team, clear milestones, and delivery you can accept or revise."
                                    className="!resize-none"
                                />
                            </Form.Item>

                            <Form.Item
                                label="How we solve"
                                name="howWeSolve"
                                className="!mb-0"
                                rules={[
                                    { required: true, message: 'This field is required' },
                                    { whitespace: true, message: 'This field cannot be empty' },
                                    { max: 1000, message: 'Cannot exceed 1000 characters' },
                                ]}
                            >
                                <TextArea
                                    rows={3}
                                    maxLength={1000}
                                    showCount
                                    placeholder="We start from the booking call, then turn the scope into an order with budget and milestones."
                                    className="!resize-none"
                                />
                            </Form.Item>
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
                                        Please fix the following before creating:
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
                                        Service created successfully
                                    </span>
                                )}

                                {status === 'error' && (
                                    <span className="text-red-400 font-medium">{errorMsg}</span>
                                )}

                                {status === 'idle' && (
                                    <span className="text-gray-300">All changes are unsaved</span>
                                )}

                                {saving && (
                                    <span className="text-gray-400 flex items-center gap-1.5">
                                        <svg className="animate-spin" width="12" height="12" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Creating…
                                    </span>
                                )}
                            </span>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={saving}
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
                                    disabled={saving}
                                    className="px-4 py-2 text-[13px] font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Creating…' : 'Create service'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </ConfigProvider>
    );
}