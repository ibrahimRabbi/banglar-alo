
'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Form,
    Input,
    Select,
    Row,
    Col,
    ConfigProvider,
    Button,
    Alert,
    Skeleton,
    Tag,
    message,
} from 'antd';
import {
    LuBriefcaseBusiness,
    LuFileText,
    LuLightbulb,
    LuShieldCheck,
    LuSparkles,
} from 'react-icons/lu';
import { MdArrowBack } from 'react-icons/md';

import {
    useGetSingleServicesQuery,
    useUpdateServiceMutation,
} from '@/redux/features/services/serviceApi';

import SectionCard from '../../training-centers/_components/SectionCard';

const { TextArea } = Input;

type Service = {
    id: string;
    _id?: string;
    title: string;
    summary: string;
    whatWeDo: string;
    whyWeAreBest: string;
    howWeSolve: string;
    status: 'PUBLISHED' | 'DRAFT' | string;
    portfolios?: unknown[];
    packages?: unknown[];
    _count?: {
        portfolios: number;
        packages: number;
        bookings: number;
        orders: number;
    };
};

type FormValues = {
    title: string;
    summary: string;
    whatWeDo: string;
    whyWeAreBest: string;
    howWeSolve: string;
    status: string;
};

type UpdateStatus = 'idle' | 'saving' | 'success' | 'error';

const statusOptions = [
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'DRAFT', label: 'Draft' },
];

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

const editableFields: (keyof FormValues)[] = [
    'title',
    'summary',
    'whatWeDo',
    'whyWeAreBest',
    'howWeSolve',
    'status',
];

const toFormValues = (service: Service): FormValues => ({
    title: service.title ?? '',
    summary: service.summary ?? '',
    whatWeDo: service.whatWeDo ?? '',
    whyWeAreBest: service.whyWeAreBest ?? '',
    howWeSolve: service.howWeSolve ?? '',
    status: service.status ?? 'PUBLISHED',
});

const getChanges = (
    values: Partial<FormValues>,
    service: Service,
): Partial<FormValues> => {
    const changes: Partial<FormValues> = {};

    editableFields.forEach((field) => {
        const value = values[field];

        if (value === undefined || value === null) return;

        const nextValue =
            typeof value === 'string' && field !== 'status'
                ? value.trim()
                : value;

        const originalValue =
            (service[field as keyof Service] as string | undefined) ?? '';

        if (nextValue !== originalValue) {
            changes[field] = nextValue;
        }
    });

    return changes;
};

/* =============================================================
   UPDATE SERVICE FORM
============================================================= */

function UpdateServiceForm({ service }: { service: Service }) {
    const router = useRouter();
    const [form] = Form.useForm<FormValues>();
    const [updateService] = useUpdateServiceMutation();

    const [originalService, setOriginalService] = useState(service);
    const [status, setStatus] = useState<UpdateStatus>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [errorList, setErrorList] = useState<string[]>([]);

    const watchedValues = Form.useWatch([], form);

    const changes = useMemo(
        () =>
            watchedValues
                ? getChanges(watchedValues, originalService)
                : {},
        [watchedValues, originalService],
    );

    const changedCount = Object.keys(changes).length;
    const saving = status === 'saving';

    const onFinish = async (values: FormValues) => {
        const payload = getChanges(values, originalService);

        if (Object.keys(payload).length === 0) {
            message.info('No changes to update.');
            return;
        }

        setStatus('saving');
        setErrorMsg('');
        setErrorList([]);

        try {
            await updateService({
                id: service.id || service._id,
                data: payload,
            }).unwrap();

            const updatedService = {
                ...originalService,
                ...payload,
            };

            setOriginalService(updatedService);
            form.setFieldsValue(toFormValues(updatedService));

            setStatus('success');
            message.success('Service updated successfully.');
        } catch (error: unknown) {
            const apiError = error as {
                data?: { message?: string };
                error?: string;
            };

            const errorMessage =
                apiError?.data?.message ||
                apiError?.error ||
                'Something went wrong. Please try again.';

            setErrorMsg(errorMessage);
            setStatus('error');
            message.error(errorMessage);
        }
    };

    const onFinishFailed = ({
        errorFields,
    }: {
        errorFields: { errors: string[] }[];
    }) => {
        setErrorList(
            errorFields.map((field) => field.errors[0]).filter(Boolean),
        );
    };

    const resetChanges = () => {
        form.setFieldsValue(toFormValues(originalService));
        form.setFields(
            editableFields.map((name) => ({
                name,
                errors: [],
            })),
        );

        setErrorList([]);
        setErrorMsg('');
        setStatus('idle');
    };

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="w-full px-4 py-10 sm:px-6 lg:w-[90%]">
                {/* Header */}
                <Link
                    href="/services"
                    className="mb-4 inline-flex items-center gap-2 text-[12px] font-bold text-gray-400 transition-colors hover:text-gray-900"
                >
                    <MdArrowBack size={17} />
                    Back to services
                </Link>

                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                        <p className="mb-1 text-[22px] font-medium text-gray-900">
                            Service Details
                        </p>
                        <p className="text-[13px] text-gray-400">
                            Update your service information and save your changes.
                        </p>
                    </div>

                    <Tag
                        color={originalService.status === 'PUBLISHED' ? 'green' : 'gold'}
                        className="!m-0 w-fit rounded-full !px-3 !py-1"
                    >
                        {originalService.status === 'PUBLISHED'
                            ? 'Published'
                            : originalService.status === 'DRAFT'
                                ? 'Draft'
                                : originalService.status}
                    </Tag>
                </div>

                <Form<FormValues>
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    initialValues={toFormValues(originalService)}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    onValuesChange={() => {
                        setErrorList([]);
                        setErrorMsg('');

                        if (status === 'error' || status === 'success') {
                            setStatus('idle');
                        }
                    }}
                >
                    <div className="flex flex-col gap-6">
                        {/* Basic information */}
                        <SectionCard
                            title="Basic information"
                            subtitle="Service name, summary and visibility"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={16}>
                                    <Form.Item
                                        label="Service title"
                                        name="title"
                                        rules={[
                                            {
                                                required: true,
                                                whitespace: true,
                                                message: 'Service title is required.',
                                            },
                                            {
                                                min: 3,
                                                message: 'Title must be at least 3 characters.',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Custom Development"
                                            prefix={
                                                <LuBriefcaseBusiness className="text-gray-400" />
                                            }
                                            maxLength={150}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Status"
                                        name="status"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Service status is required.',
                                            },
                                        ]}
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
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: 'Summary is required.',
                                    },
                                    {
                                        max: 300,
                                        message: 'Summary cannot exceed 300 characters.',
                                    },
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

                        {/* Service details */}
                        <SectionCard
                            title="Service details"
                            subtitle="Describe your service, strengths and approach"
                        >
                            <Form.Item
                                label="What we do"
                                name="whatWeDo"
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: 'Please describe what you do.',
                                    },
                                    {
                                        max: 1000,
                                        message: 'Cannot exceed 1000 characters.',
                                    },
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
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: 'Please explain why you are the best.',
                                    },
                                    {
                                        max: 1000,
                                        message: 'Cannot exceed 1000 characters.',
                                    },
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
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: 'Please explain how you solve problems.',
                                    },
                                    {
                                        max: 1000,
                                        message: 'Cannot exceed 1000 characters.',
                                    },
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

                        {/* Error summary */}
                        {errorList.length > 0 && (
                            <Alert
                                type="error"
                                showIcon
                                message="Please fix the following errors"
                                description={
                                    <ul className="list-inside list-disc">
                                        {errorList.map((error, index) => (
                                            <li key={`${error}-${index}`}>
                                                {error}
                                            </li>
                                        ))}
                                    </ul>
                                }
                            />
                        )}

                        {status === 'success' && (
                            <Alert
                                type="success"
                                showIcon
                                message="Service updated successfully"
                                description="Your changes have been saved."
                                closable
                                onClose={() => setStatus('idle')}
                            />
                        )}

                        {status === 'error' && errorMsg && (
                            <Alert
                                type="error"
                                showIcon
                                message="Update failed"
                                description={errorMsg}
                                closable
                                onClose={() => {
                                    setErrorMsg('');
                                    setStatus('idle');
                                }}
                            />
                        )}

                        {/* Footer */}
                        <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="text-[13px]">
                                {saving ? (
                                    <span className="text-gray-400">
                                        Saving changes...
                                    </span>
                                ) : changedCount > 0 ? (
                                    <span className="text-gray-500">
                                        {changedCount} field
                                        {changedCount > 1 ? 's' : ''} changed
                                    </span>
                                ) : (
                                    <span className="text-gray-300">
                                        No changes yet
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    disabled={saving}
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    disabled={saving || changedCount === 0}
                                    onClick={resetChanges}
                                >
                                    Reset changes
                                </Button>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={saving}
                                    disabled={changedCount === 0 || saving}
                                >
                                    {saving ? 'Updating...' : 'Update service'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </ConfigProvider>
    );
}

/* =============================================================
   PAGE
============================================================= */

function ServiceDetailsContent() {
    const params = useSearchParams();
    const id = params.get('id');

    const { data, isLoading, isError, refetch } =
        useGetSingleServicesQuery(id as string, {
            skip: !id,
        });

    const response = data?.data;

    const service: Service | undefined =
        response?.service ?? response;

    if (!id) {
        return (
            <div className="px-6 py-10 text-sm text-red-500">
                Service ID is missing from the URL.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6 px-4 py-10 sm:px-6">
                <Skeleton active paragraph={{ rows: 2 }} />
                <Skeleton active paragraph={{ rows: 6 }} />
            </div>
        );
    }

    if (isError || !service) {
        return (
            <div className="px-4 py-10 sm:px-6">
                <Alert
                    type="error"
                    showIcon
                    message="Service not found"
                    description="Unable to load this service. Please try again."
                    action={
                        <Button size="small" onClick={() => refetch()}>
                            Retry
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <UpdateServiceForm
            key={service.id || service._id}
            service={service}
        />
    );
}

export default function ServiceDetailsPage() {
    return (
        <Suspense
            fallback={
                <div className="px-4 py-10 sm:px-6">
                    <Skeleton active paragraph={{ rows: 6 }} />
                </div>
            }
        >
            <ServiceDetailsContent />
        </Suspense>
    );
}
