'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, InputNumber, Row, Col, ConfigProvider, Select, DatePicker } from 'antd';
import {
    LuUserRound, LuMail, LuPhone, LuFolderKanban, LuGlobe, LuFileText,
} from 'react-icons/lu';
import dayjs, { Dayjs } from 'dayjs';

import {
    getQuotations, createProject, STATUS_FLOW, STATUS_LABEL, WEBSITE_TYPES,
    type ProjectStatus,
} from '@/utils/projectData';
import SectionCard from '../../training-centers/_components/SectionCard'; // <- adjust path

/* =============================================================
   TYPES & CONFIG
============================================================= */

type FormValues = {
    quotation_id?: string;
    title: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    website_type: string;
    budget: number;
    paid?: number;
    deadline: Dayjs;
    status: ProjectStatus;
    note?: string;
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
        Form: { labelFontSize: 12, labelColor: '#6b7280', verticalLabelPadding: '0 0 4px' },
    },
};

const BD_PHONE = /^01[3-9]\d{8}$/;

const websiteTypeOptions = WEBSITE_TYPES.map((t) => ({ value: t, label: t }));
const statusOptions = STATUS_FLOW.map((s) => ({ value: s, label: STATUS_LABEL[s] }));

/* =============================================================
   PAGE
============================================================= */

export default function CreateProjectPage() {
    const router = useRouter();
    const [form] = Form.useForm<FormValues>();

    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [errorList, setErrorList] = useState<string[]>([]);

    // only pending quotations can be converted into a project
    const pendingQuotations = getQuotations().filter((q) => q.status === 'pending');

    const quotationOptions = pendingQuotations.map((q) => ({
        value: q.id,
        label: `${q.name} - ${q.website_type}`,
        searchText: [q.name, q.email, q.phone, q.company, q.website_type]
            .filter(Boolean)
            .join(' ')
            .toLowerCase(),
    }));

    /* ---------- fill the form from a quotation ---------- */

    const handleQuotationSelect = (id?: string) => {
        const q = pendingQuotations.find((x) => x.id === id);
        if (!q) return; // cleared: keep what the admin typed

        form.setFieldsValue({
            title: `${q.company || q.name} ${q.website_type}`,
            client_name: q.name,
            client_email: q.email,
            client_phone: q.phone,
            website_type: q.website_type,
            budget: q.budget,
            deadline: q.deadline ? dayjs(q.deadline) : undefined,
        });
    };

    /* ---------- submit ---------- */

    const onFinish = async (values: FormValues) => {
        setErrorList([]);
        setErrorMsg('');
        setStatus('saving');

        try {
            const project = createProject({
                title: values.title.trim(),
                client_name: values.client_name.trim(),
                client_email: values.client_email.trim().toLowerCase(),
                client_phone: values.client_phone.trim(),
                website_type: values.website_type,
                budget: values.budget,
                paid: values.paid || 0,
                deadline: values.deadline.toDate().toISOString(),
                status: values.status,
                note: values.note?.trim() || undefined,
                quotation_id: values.quotation_id,
            });

            setStatus('success');
            form.resetFields();

            setTimeout(() => {
                setStatus('idle');
                router.push(`/projects/project-details?projectId=${project.id}`);
            }, 1200);
        } catch (err: any) {
            setErrorMsg(err?.message || 'Something went wrong. Please try again.');
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3500);
        }
    };

    const onFinishFailed = ({ errorFields }: { errorFields: { errors: string[] }[] }) => {
        setErrorList(errorFields.map((f) => f.errors[0]).filter(Boolean));
    };

    const saving = status === 'saving';

    /* ---------- render ---------- */

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="w-full lg:w-[90%] px-4 sm:px-6 py-10">
                {/* HEADER */}
                <div>
                    <p className="text-[22px] font-medium text-gray-900 mb-1">Create Project</p>
                    <div className="text-gray-400 text-[13px] mb-6">
                        Start a new website project. Pick a quotation to auto-fill, or enter the details manually.
                    </div>
                </div>

                <Form<FormValues>
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    initialValues={{ status: 'planning', paid: 0 }}
                    onValuesChange={() => {
                        if (errorList.length) setErrorList([]);
                        if (status === 'error') setStatus('idle');
                    }}
                >
                    <div className="flex flex-col gap-6">
                        {/* ================= SOURCE ================= */}
                        <SectionCard
                            title="Quotation (optional)"
                            subtitle="Select a pending quotation to fill the client and project details automatically"
                        >
                            <Form.Item name="quotation_id" className="!mb-0">
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder="Search pending quotation by name, email or phone"
                                    options={quotationOptions}
                                    filterOption={(input, option: any) =>
                                        (option?.searchText || '').includes(input.toLowerCase())
                                    }
                                    onChange={handleQuotationSelect}
                                    suffixIcon={<LuFileText className="text-gray-400" />}
                                    notFoundContent="No pending quotations"
                                />
                            </Form.Item>
                        </SectionCard>

                        {/* ================= PROJECT ================= */}
                        <SectionCard title="Project details" subtitle="What are we building">
                            <Row gutter={16}>
                                <Col xs={24} md={14}>
                                    <Form.Item
                                        label="Project title"
                                        name="title"
                                        rules={[
                                            { required: true, message: 'Project title is required' },
                                            { min: 3, message: 'Title must be at least 3 characters' },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Rafiq Traders E-commerce"
                                            prefix={<LuFolderKanban className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={10}>
                                    <Form.Item
                                        label="Website type"
                                        name="website_type"
                                        rules={[{ required: true, message: 'Please select a website type' }]}
                                    >
                                        <Select
                                            placeholder="Select type"
                                            options={websiteTypeOptions}
                                            suffixIcon={<LuGlobe className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Starting stage"
                                        name="status"
                                        className="!mb-0"
                                        rules={[{ required: true, message: 'Please select a stage' }]}
                                    >
                                        <Select options={statusOptions} />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Deadline"
                                        name="deadline"
                                        className="!mb-0"
                                        rules={[{ required: true, message: 'Deadline is required' }]}
                                    >
                                        <DatePicker
                                            className="!w-full"
                                            format="DD MMM YYYY"
                                            placeholder="Select date"
                                            disabledDate={(d) => d && d.isBefore(dayjs(), 'day')}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item label="First note (optional)" name="note" className="!mb-0">
                                        <Input placeholder="e.g. Requirement meeting done" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </SectionCard>

                        {/* ================= CLIENT ================= */}
                        <SectionCard title="Client" subtitle="Who is this project for">
                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Client name"
                                        name="client_name"
                                        className="!mb-0"
                                        rules={[
                                            { required: true, message: 'Client name is required' },
                                            { min: 2, message: 'Name must be at least 2 characters' },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Rafiq Ahmed"
                                            prefix={<LuUserRound className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Email"
                                        name="client_email"
                                        className="!mb-0"
                                        rules={[
                                            { required: true, message: 'Email is required' },
                                            { type: 'email', message: 'Enter a valid email' },
                                        ]}
                                    >
                                        <Input
                                            placeholder="rafiq@example.com"
                                            prefix={<LuMail className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Phone"
                                        name="client_phone"
                                        className="!mb-0"
                                        rules={[
                                            { required: true, message: 'Phone is required' },
                                            { pattern: BD_PHONE, message: 'Enter a valid BD phone number' },
                                        ]}
                                    >
                                        <Input
                                            placeholder="01711000001"
                                            maxLength={11}
                                            prefix={<LuPhone className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </SectionCard>

                        {/* ================= PAYMENT ================= */}
                        <SectionCard title="Payment" subtitle="Agreed budget and advance received">
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Final budget (৳)"
                                        name="budget"
                                        className="!mb-0"
                                        rules={[
                                            { required: true, message: 'Budget is required' },
                                            { type: 'number', min: 1, message: 'Budget must be more than 0' },
                                        ]}
                                    >
                                        <InputNumber className="!w-full" min={0} placeholder="80000" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Advance paid (৳)"
                                        name="paid"
                                        className="!mb-0"
                                        dependencies={['budget']}
                                        rules={[
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    const budget = getFieldValue('budget');
                                                    if (value && budget && value > budget) {
                                                        return Promise.reject(
                                                            new Error('Advance cannot be more than the budget')
                                                        );
                                                    }
                                                    return Promise.resolve();
                                                },
                                            }),
                                        ]}
                                    >
                                        <InputNumber className="!w-full" min={0} placeholder="0" />
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
                                        Project created successfully
                                    </span>
                                )}
                                {status === 'error' && <span className="text-red-400 font-medium">{errorMsg}</span>}
                                {status === 'idle' && <span className="text-gray-300">All changes are unsaved</span>}
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
                                    {saving ? 'Creating…' : 'Create project'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </ConfigProvider>
    );
}