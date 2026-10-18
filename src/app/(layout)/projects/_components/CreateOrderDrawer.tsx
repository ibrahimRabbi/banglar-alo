'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { Drawer, Form, Input, InputNumber, Row, Col } from 'antd';
import {
    LuFolderKanban,
    LuUserRound,
    LuMail,
    LuPhone,
    LuMapPin,
    LuPlus,
    LuTrash2,
    LuLoaderCircle,
} from 'react-icons/lu';

import { useCreateOrderMutation } from '@/redux/features/services/serviceApi';

const { TextArea } = Input;

export type OrderBooking = {
    id: string;
    serviceId: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    message: string;
    budget: number | null;
    timeline: string;
    service: { title: string } | null;
    package: { title: string } | null;
};

type Milestone = {
    title: string;
    budget: number;
    timeline: string;
};

type FormValues = {
    projectName: string;
    description: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientAddress: string;
    totalBudget: number;
    timeline: string;
    milestones: Milestone[];
};

const BD_PHONE = /^01[3-9]\d{8}$/;

const taka = (n: number) => `৳${(n || 0).toLocaleString('en-BD')}`;

function OrderForm({
    booking,
    onClose,
}: {
    booking: OrderBooking;
    onClose: () => void;
}) {
    const [form] = Form.useForm<FormValues>();
    const [createOrder, { isLoading }] = useCreateOrderMutation();

    const totalBudget: number = Form.useWatch('totalBudget', form) ?? 0;
    const milestones: Milestone[] = Form.useWatch('milestones', form) ?? [];
    const milestoneTotal = milestones.reduce((sum, m) => sum + (Number(m?.budget) || 0), 0);
    const matches = totalBudget > 0 && milestoneTotal === totalBudget;

    const onFinish = async (values: FormValues) => {
        try {
            const payload = {
                serviceId: booking.serviceId,
                bookingId: booking.id,
                projectName: values.projectName.trim(),
                description: values.description.trim(),
                clientName: values.clientName.trim(),
                clientEmail: values.clientEmail.trim().toLowerCase(),
                clientPhone: values.clientPhone.trim(),
                clientAddress: values.clientAddress.trim(),
                totalBudget: values.totalBudget,
                timeline: values.timeline.trim(),
                milestones: values.milestones.map((m, index) => ({
                    title: m.title.trim(),
                    budget: m.budget,
                    timeline: m.timeline.trim(),
                    order: index + 1,
                })),
            };

            const res = await createOrder(payload).unwrap();
            toast.success(res?.message || 'Order created successfully');
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to create order');
        }
    };

    // shows a toast when validation blocks the submit, so it is never silent
    const onFinishFailed = ({
        errorFields,
    }: {
        errorFields: { errors: string[] }[];
    }) => {
        toast.error(errorFields[0]?.errors[0] || 'Please fill in all required fields');
    };

    return (
        <Form<FormValues>
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
            initialValues={{
                projectName: booking.service?.title || booking.package?.title || '',
                description: booking.message || '',
                clientName: booking.clientName || '',
                clientEmail: booking.clientEmail || '',
                clientPhone: booking.clientPhone || '',
                clientAddress: '',
                totalBudget: booking.budget ?? undefined,
                timeline: booking.timeline || '',
                milestones: [{ title: '', budget: undefined, timeline: '' }],
            }}
        >
            {/* PROJECT */}
            <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-3">
                Project
            </p>

            <Form.Item
                label="Project name"
                name="projectName"
                rules={[
                    { required: true, message: 'Project name is required' },
                    { whitespace: true, message: 'Project name cannot be empty' },
                ]}
            >
                <Input placeholder="School SaaS" prefix={<LuFolderKanban className="text-gray-400" />} />
            </Form.Item>

            <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Description is required' }]}
            >
                <TextArea rows={3} placeholder="Custom school management platform" className="!resize-none" />
            </Form.Item>

            <Row gutter={12}>
                <Col xs={24} sm={12}>
                    <Form.Item
                        label="Total budget (৳)"
                        name="totalBudget"
                        rules={[
                            { required: true, message: 'Total budget is required' },
                            { type: 'number', min: 1, message: 'Budget must be more than 0' },
                        ]}
                    >
                        <InputNumber className="!w-full" min={0} placeholder="150000" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item
                        label="Timeline"
                        name="timeline"
                        rules={[{ required: true, message: 'Timeline is required' }]}
                    >
                        <Input placeholder="45 days" />
                    </Form.Item>
                </Col>
            </Row>

            {/* CLIENT */}
            <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mt-2 mb-3">
                Client
            </p>

            <Row gutter={12}>
                <Col xs={24} sm={12}>
                    <Form.Item
                        label="Client name"
                        name="clientName"
                        rules={[{ required: true, message: 'Client name is required' }]}
                    >
                        <Input prefix={<LuUserRound className="text-gray-400" />} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item
                        label="Phone"
                        name="clientPhone"
                        rules={[
                            { required: true, message: 'Phone is required' },
                            { pattern: BD_PHONE, message: 'Enter a valid BD phone number' },
                        ]}
                    >
                        <Input maxLength={11} prefix={<LuPhone className="text-gray-400" />} />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                label="Email"
                name="clientEmail"
                rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Enter a valid email' },
                ]}
            >
                <Input prefix={<LuMail className="text-gray-400" />} />
            </Form.Item>

            <Form.Item
                label="Address"
                name="clientAddress"
                rules={[{ required: true, message: 'Client address is required' }]}
            >
                <Input placeholder="Dhanmondi, Dhaka" prefix={<LuMapPin className="text-gray-400" />} />
            </Form.Item>

            {/* MILESTONES */}
            <div className="flex items-center justify-between mt-2 mb-3">
                <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
                    Milestones
                </p>
                <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${matches ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}
                >
                    {taka(milestoneTotal)} of {taka(totalBudget)}
                </span>
            </div>

            <Form.List
                name="milestones"
                rules={[
                    {
                        validator: async (_, list: Milestone[]) => {
                            if (!list || list.length === 0) {
                                throw new Error('Add at least one milestone');
                            }
                            const sum = list.reduce((s, m) => s + (Number(m?.budget) || 0), 0);
                            const total = form.getFieldValue('totalBudget') || 0;
                            if (sum !== total) {
                                throw new Error(
                                    `Milestone budgets (${taka(sum)}) must add up to the total budget (${taka(total)})`
                                );
                            }
                        },
                    },
                ]}
            >
                {(fields, { add, remove }, { errors }) => (
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div
                                key={field.key}
                                className="bg-gray-50 border border-gray-100 rounded-2xl p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[12px] font-extrabold text-gray-700">
                                        Milestone {index + 1}
                                    </span>
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(field.name)}
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                                            aria-label={`Remove milestone ${index + 1}`}
                                        >
                                            <LuTrash2 size={13} />
                                        </button>
                                    )}
                                </div>

                                <Form.Item
                                    name={[field.name, 'title']}
                                    label="Title"
                                    rules={[
                                        { required: true, message: 'Milestone title is required' },
                                        { whitespace: true, message: 'Title cannot be empty' },
                                    ]}
                                >
                                    <Input placeholder="Discovery and design" />
                                </Form.Item>

                                <Row gutter={12}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name={[field.name, 'budget']}
                                            label="Budget (৳)"
                                            className="!mb-0"
                                            rules={[
                                                { required: true, message: 'Milestone budget is required' },
                                                { type: 'number', min: 1, message: 'Must be more than 0' },
                                            ]}
                                        >
                                            <InputNumber className="!w-full" min={0} placeholder="50000" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name={[field.name, 'timeline']}
                                            label="Timeline"
                                            className="!mb-0"
                                            rules={[{ required: true, message: 'Milestone timeline is required' }]}
                                        >
                                            <Input placeholder="15 days" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => add({ title: '', budget: undefined, timeline: '' })}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-[12.5px] font-medium border border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors"
                        >
                            <LuPlus size={14} /> Add milestone
                        </button>

                        <Form.ErrorList errors={errors} />
                    </div>
                )}
            </Form.List>

            {/* FOOTER */}
            <div className="sticky bottom-0 -mx-6 mt-6 flex justify-end gap-2 border-t border-gray-100 bg-white px-6 py-4">
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={onClose}
                    className="px-4 py-2 text-[13px] font-medium border border-gray-200 rounded-xl text-gray-500 bg-white hover:border-gray-300 hover:text-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isLoading && <LuLoaderCircle size={13} className="animate-spin" />}
                    {isLoading ? 'Creating...' : 'Create order'}
                </button>
            </div>
        </Form>
    );
}

/* =============================================================
   DRAWER
============================================================= */

export default function CreateOrderDrawer({
    open,
    onClose,
    booking,
}: {
    open: boolean;
    onClose: () => void;
    booking: OrderBooking;
}) {
    return (
        <Drawer
            open={open}
            onClose={onClose}
            width={560}
            destroyOnClose
            maskClosable={false}
            title={
                <div>
                    <p className="text-[15px] font-medium text-gray-900">Create order</p>
                    <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                        Details are filled from the booking. Edit anything before creating.
                    </p>
                </div>
            }
        >
            <OrderForm booking={booking} onClose={onClose} />
        </Drawer>
    );
}