'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Progress, Modal, Form, Input, InputNumber, ConfigProvider } from 'antd';
import { MdArrowBack } from 'react-icons/md';
import {
    LuUserRound,
    LuMail,
    LuPhone,
    LuMapPin,
    LuBriefcaseBusiness,
    LuWallet,
    LuClock,
    LuCalendarDays,
    LuMessageSquare,
    LuFlag,
    LuLoaderCircle,
    LuCircleAlert,
    LuFileText,
    LuCircleCheck,
    LuPencil,
    LuPackageCheck,
} from 'react-icons/lu';

import {
    useGetSingleOrdersQuery,
    useUpdateOrderMutation,
    useUpdateMilstoneMutation,
} from '@/redux/features/services/serviceApi';

/* =============================================================
   TYPES
============================================================= */

type Milestone = {
    id: string;
    orderId?: string;
    title: string;
    description?: string;
    budget?: number;
    timeline?: string;
    order?: number;
    status: string;
    deliveryNote?: string;
    revisionNote?: string;
    deliveredAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

type Order = {
    id: string;
    serviceId?: string;
    bookingId: string | null;
    clientId?: string | null;
    projectName: string;
    description: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientAddress: string;
    totalBudget: number;
    timeline: string;
    deliveryStatus: string;
    createdAt: string;
    updatedAt: string;
    service: { id: string; title: string; slug: string } | null;
    booking: { id: string; status: string; message: string } | null;
    client?: Record<string, unknown> | null;
    milestones: Milestone[];
    currentMilestone: Milestone | null;
    remainingMilestoneCount: number;
    acceptedBudget: number;
    budgetLeft: number;
};

type OrderApiResponse = {
    statusCode: number;
    success: boolean;
    message: string;
    data: Order;
};

type EditValues = { timeline: string; totalBudget: number };
type DeliverValues = { deliveryNote: string };

/* =============================================================
   HELPERS
============================================================= */

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

const formatLabel = (value?: string | null) =>
    (value || 'N/A')
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

const taka = (amount?: number | null) =>
    amount === null || amount === undefined ? 'N/A' : `৳${amount.toLocaleString('en-BD')}`;

const formatDate = (value?: string | null) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// milestone statuses that count as finished
const DONE_STATUSES = ['DELIVERED', 'ACCEPTED', 'COMPLETED'];

const isMilestoneDone = (status?: string | null) =>
    DONE_STATUSES.includes((status || '').toUpperCase());

const getStatusStyle = (status?: string | null) => {
    switch ((status || '').toUpperCase()) {
        case 'NOT_STARTED':
        case 'PENDING':
            return { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
        case 'IN_PROGRESS':
            return { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
        case 'DELIVERED':
            return { pill: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' };
        case 'REVISION':
        case 'REVISION_REQUESTED':
            return { pill: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' };
        case 'ACCEPTED':
        case 'COMPLETED':
            return { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };
        case 'CANCELLED':
        case 'REJECTED':
            return { pill: 'bg-red-50 text-red-600', dot: 'bg-red-500' };
        default:
            return { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
    }
};

function StatusPill({ status }: { status?: string | null }) {
    const styles = getStatusStyle(status);
    return (
        <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${styles.pill}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            {formatLabel(status)}
        </span>
    );
}

 

function OrderDetails() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');

    const {
        data: response,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetSingleOrdersQuery(orderId ?? '', { skip: !orderId });

    const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();
    const [updateMilestone, { isLoading: isDelivering }] = useUpdateMilstoneMutation();

    const [editForm] = Form.useForm<EditValues>();
    const [deliverForm] = Form.useForm<DeliverValues>();
    const [editOpen, setEditOpen] = useState(false);
    const [deliverTarget, setDeliverTarget] = useState<Milestone | null>(null);

    const apiResponse = response as OrderApiResponse | undefined;
    const order = apiResponse?.data;

    if (!orderId) {
        return <Message title="Invalid order link" text="The order ID is missing from the link." />;
    }

    if (isLoading || (isFetching && !order)) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <LuLoaderCircle size={26} className="animate-spin text-gray-500" />
                    <p className="text-xs font-medium text-gray-400">Loading order...</p>
                </div>
            </main>
        );
    }

    if (isError || !order) {
        return (
            <Message
                title="Order not found"
                text="We couldn't load this order. Please check the link and try again."
                onRetry={() => refetch()}
                showRetry
            />
        );
    }

    /* ---------- calculations (all from milestone status) ---------- */

    const milestones = [...(order.milestones ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    const totalBudget = order.totalBudget ?? 0;
    const milestoneSum = milestones.reduce((s, m) => s + (m.budget ?? 0), 0);

    const deliveredCount = milestones.filter((m) => isMilestoneDone(m.status)).length;


    const acceptedBudget = milestones
        .filter((m) => isMilestoneDone(m.status))
        .reduce((s, m) => s + (m.budget ?? 0), 0);

    
    const budgetLeft = milestones
        .filter((m) => !isMilestoneDone(m.status))
        .reduce((s, m) => s + (m.budget ?? 0), 0);

    const remainingCount = milestones.length - deliveredCount;
    const progressPercent = milestones.length ? Math.round((deliveredCount / milestones.length) * 100) : 0;


    const activeMilestone = milestones.find((m) => !isMilestoneDone(m.status)) ?? null;
    const orderTitle = order.projectName || order.service?.title || 'Service Order';



    

    const openEdit = () => {
        editForm.setFieldsValue({ timeline: order.timeline, totalBudget: order.totalBudget });
        setEditOpen(true);
    };

    const handleEdit = async (values: EditValues) => {
        // send only the fields that changed
        const data: Partial<EditValues> = {};
        if (values.timeline.trim() !== order.timeline) data.timeline = values.timeline.trim();
        if (values.totalBudget !== order.totalBudget) data.totalBudget = values.totalBudget;

        if (Object.keys(data).length === 0) {
            toast('No changes to save');
            return;
        }

        try {
            const res = await updateOrder({ id: order.id, data }).unwrap();
            toast.success(res?.message || 'Order updated successfully');
            setEditOpen(false);
            await refetch(); // load the updated order
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to update order');
        }
    };


    const openDeliver = (milestone: Milestone) => {
        deliverForm.resetFields();
        setDeliverTarget(milestone);
    };

    const handleDeliver = async (values: DeliverValues) => {
        if (!deliverTarget) return;
        try {
            // sends { "deliveryNote": "..." }
            const res = await updateMilestone({
                id: deliverTarget.id,
                data: { deliveryNote: values.deliveryNote.trim() },
            }).unwrap();
            toast.success(res?.message || 'Milestone delivered');
            setDeliverTarget(null);
            await refetch(); // load the updated milestones
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to deliver milestone');
        }
    };
    return (
        <ConfigProvider theme={antdTheme}>
            <main className="min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                    {/* BACK LINK */}
                    <Link
                        href="/projects/orders"
                        className="inline-flex items-center gap-2 mb-6 text-[12px] font-bold text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <MdArrowBack size={17} />
                        Back to orders
                    </Link>

                    {/* HERO */}
                    <section className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sm:p-8">
                        <div className="absolute -top-28 -right-28 w-72 h-72 rounded-full bg-gray-900/[0.025]" />

                        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-400">
                                        Order
                                    </span>
                                    <StatusPill status={order.deliveryStatus} />
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 break-words">
                                    {orderTitle}
                                </h1>

                                <p className="text-sm text-gray-400 font-medium mt-2">
                                    {order.service?.title || 'No service'} · Timeline{' '}
                                    {order.timeline || 'N/A'}
                                </p>

                                <button
                                    type="button"
                                    onClick={openEdit}
                                    className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-gray-600 bg-white border border-gray-200 hover:border-gray-900 hover:text-gray-900 px-3 py-1.5 rounded-xl transition-colors"
                                >
                                    <LuPencil size={13} />
                                    Edit timeline and budget
                                </button>
                            </div>

                            <div className="w-full md:w-64 shrink-0 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                                <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-gray-400 mb-2">
                                    Project progress
                                </p>

                                <Progress
                                    percent={progressPercent}
                                    strokeColor={progressPercent === 100 ? '#22c55e' : '#111827'}
                                />

                                <p className="text-[11px] text-gray-400 mt-1">
                                    {deliveredCount} of {milestones.length} milestone
                                    {milestones.length !== 1 ? 's' : ''} delivered
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* STATS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
                        <StatCard icon={<LuWallet size={18} />} label="Total budget" value={taka(totalBudget)} />
                        <StatCard icon={<LuCircleCheck size={18} />} label="Accepted" value={taka(acceptedBudget)} />
                        <StatCard icon={<LuWallet size={18} />} label="Budget left" value={taka(budgetLeft)} />
                        <StatCard icon={<LuClock size={18} />} label="Timeline" value={order.timeline || 'N/A'} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-2 space-y-4">
                            <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm">
                                <SectionHeader icon={<LuFileText size={17} />} title="Project description" />
                                <p className="mt-5 text-sm text-gray-500 leading-7 whitespace-pre-line break-words">
                                    {order.description || 'No description provided.'}
                                </p>
                            </section>

                            {/* MILESTONES */}
                            <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <SectionHeader icon={<LuFlag size={17} />} title="Milestones" />
                                    <span className="text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                                        {milestones.length} total · {remainingCount} remaining
                                    </span>
                                </div>

                                <div className="mt-5 space-y-3">
                                    {milestones.length === 0 && (
                                        <p className="text-xs text-gray-400">No milestones added.</p>
                                    )}

                                    {milestones.map((milestone) => {
                                        const isCurrent = activeMilestone?.id === milestone.id;
                                        const done = isMilestoneDone(milestone.status);
                                        const timeline = milestone.timeline || 'N/A';

                                        return (
                                            <div
                                                key={milestone.id}
                                                className={`rounded-2xl border p-4 ${isCurrent
                                                        ? 'border-gray-900 bg-gray-50'
                                                        : 'border-gray-100 bg-gray-50/60'
                                                    }`}
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                        <div className="w-9 h-9 shrink-0 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500">
                                                            {String(milestone.order ?? 0).padStart(2, '0')}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-[13px] font-bold text-gray-900 break-words">
                                                                    {milestone.title}
                                                                </p>
                                                                {isCurrent && (
                                                                    <span className="text-[9px] uppercase tracking-wider font-bold text-white bg-gray-900 px-2 py-0.5 rounded-full">
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="text-[11px] text-gray-400 mt-1">
                                                                {taka(milestone.budget)} · {timeline}
                                                                {/^\d+$/.test(timeline) ? ' days' : ''}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <StatusPill status={milestone.status} />
                                                </div>

                                                {milestone.description && (
                                                    <p className="mt-3 text-[12px] text-gray-500 leading-6 whitespace-pre-line break-words">
                                                        {milestone.description}
                                                    </p>
                                                )}

                                                {(milestone.deliveryNote ||
                                                    milestone.revisionNote ||
                                                    milestone.deliveredAt) && (
                                                        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                                                            {milestone.deliveredAt && (
                                                                <p className="text-[11px] text-gray-400">
                                                                    Delivered on{' '}
                                                                    <span className="font-bold text-gray-600">
                                                                        {formatDate(milestone.deliveredAt)}
                                                                    </span>
                                                                </p>
                                                            )}
                                                            {milestone.deliveryNote && (
                                                                <p className="text-[12px] text-gray-500 leading-6 break-words">
                                                                    <span className="font-bold text-gray-700">
                                                                        Delivery note:{' '}
                                                                    </span>
                                                                    {milestone.deliveryNote}
                                                                </p>
                                                            )}
                                                            {milestone.revisionNote && (
                                                                <p className="text-[12px] text-gray-500 leading-6 break-words">
                                                                    <span className="font-bold text-gray-700">
                                                                        Revision note:{' '}
                                                                    </span>
                                                                    {milestone.revisionNote}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                {/* only the active milestone can be delivered */}
                                                {isCurrent && !done && (
                                                    <div className="mt-3 border-t border-gray-100 pt-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => openDeliver(milestone)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all"
                                                        >
                                                            <LuPackageCheck size={14} />
                                                            Mark as delivered
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {milestones.length > 0 && milestoneSum !== totalBudget && (
                                    <p className="mt-4 text-[11px] font-medium text-amber-600">
                                        Milestone budgets add up to {taka(milestoneSum)}, which is different
                                        from the total budget {taka(totalBudget)}.
                                    </p>
                                )}
                            </section>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-4">
                            <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <SectionHeader icon={<LuUserRound size={17} />} title="Client" />

                                <p className="mt-5 text-[14px] font-extrabold text-gray-900">
                                    {order.clientName || 'Unknown client'}
                                </p>

                                <div className="mt-3 space-y-2">
                                    <a
                                        href={order.clientEmail ? `mailto:${order.clientEmail}` : undefined}
                                        className="flex items-center gap-2.5 text-[11.5px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <LuMail size={13} className="shrink-0" />
                                        <span className="truncate">{order.clientEmail || 'N/A'}</span>
                                    </a>

                                    {order.clientPhone ? (
                                        <a
                                            href={`tel:${order.clientPhone}`}
                                            className="flex items-center gap-2.5 text-[11.5px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                        >
                                            <LuPhone size={13} className="shrink-0" />
                                            <span className="break-all">{order.clientPhone}</span>
                                        </a>
                                    ) : (
                                        <p className="flex items-center gap-2.5 text-[11.5px] font-semibold text-gray-300">
                                            <LuPhone size={13} className="shrink-0" />
                                            N/A
                                        </p>
                                    )}

                                    <p className="flex items-start gap-2.5 text-[11.5px] font-semibold text-gray-500">
                                        <LuMapPin size={13} className="shrink-0 mt-0.5" />
                                        <span className="break-words">{order.clientAddress || 'N/A'}</span>
                                    </p>
                                </div>
                            </section>

                            <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <SectionHeader icon={<LuMessageSquare size={17} />} title="Original booking" />

                                {order.booking ? (
                                    <div className="mt-5 space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-xs text-gray-400">Status</span>
                                            <StatusPill status={order.booking.status} />
                                        </div>

                                        <p className="text-[12px] text-gray-500 leading-6 break-words">
                                            {order.booking.message || 'No message.'}
                                        </p>

                                        <Link
                                            href={`/quation/view-details?id=${order.booking.id}`}
                                            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-gray-600 hover:text-gray-900 transition-colors"
                                        >
                                            <LuBriefcaseBusiness size={13} />
                                            View booking
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="mt-5 text-xs text-gray-400">
                                        This order has no linked booking.
                                    </p>
                                )}
                            </section>

                            <section className="bg-gray-900 rounded-3xl p-6 text-white shadow-sm">
                                <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-500">
                                    Order ID
                                </p>
                                <h3 className="text-sm font-extrabold mt-2 break-all">{order.id}</h3>

                                <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                            <LuCalendarDays size={11} />
                                            Created
                                        </span>
                                        <span className="text-[10px] font-bold">{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[10px] text-gray-500">Last updated</span>
                                        <span className="text-[10px] font-bold">{formatDate(order.updatedAt)}</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* EDIT TIMELINE / BUDGET MODAL */}
                <Modal
                    open={editOpen}
                    title={<span className="text-[15px] font-medium text-gray-900">Edit timeline and budget</span>}
                    okText="Save changes"
                    cancelText="Cancel"
                    confirmLoading={isUpdatingOrder}
                    onCancel={() => setEditOpen(false)}
                    onOk={() => editForm.submit()}
                    forceRender
                >
                    <Form<EditValues>
                        form={editForm}
                        layout="vertical"
                        requiredMark={false}
                        onFinish={handleEdit}
                        className="!mt-4"
                    >
                        <Form.Item
                            label="Timeline"
                            name="timeline"
                            rules={[
                                { required: true, message: 'Timeline is required' },
                                { whitespace: true, message: 'Timeline cannot be empty' },
                            ]}
                        >
                            <Input placeholder="50 days" />
                        </Form.Item>

                        <Form.Item
                            label="Total budget (৳)"
                            name="totalBudget"
                            className="!mb-0"
                            rules={[
                                { required: true, message: 'Total budget is required' },
                                { type: 'number', min: 1, message: 'Budget must be more than 0' },
                                {
                                    validator: (_, value: number) =>
                                        value !== undefined && value < acceptedBudget
                                            ? Promise.reject(
                                                new Error(
                                                    `Budget cannot be less than the accepted amount (${taka(acceptedBudget)})`
                                                )
                                            )
                                            : Promise.resolve(),
                                },
                            ]}
                        >
                            <InputNumber className="!w-full" min={0} placeholder="160000" />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* DELIVER MILESTONE MODAL */}
                <Modal
                    open={!!deliverTarget}
                    title={
                        <span className="text-[15px] font-medium text-gray-900">
                            Deliver milestone{deliverTarget ? ` ${deliverTarget.order ?? ''}` : ''}
                        </span>
                    }
                    okText="Deliver"
                    cancelText="Cancel"
                    confirmLoading={isDelivering}
                    onCancel={() => setDeliverTarget(null)}
                    onOk={() => deliverForm.submit()}
                    forceRender
                >
                    {deliverTarget && (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mt-4">
                            <p className="text-[13px] font-bold text-gray-800">{deliverTarget.title}</p>
                            <p className="text-[11.5px] text-gray-400 mt-0.5">
                                {taka(deliverTarget.budget)} will move to the accepted amount.
                            </p>
                        </div>
                    )}

                    <Form<DeliverValues>
                        form={deliverForm}
                        layout="vertical"
                        requiredMark={false}
                        onFinish={handleDeliver}
                        className="!mt-4"
                    >
                        <Form.Item
                            label="Delivery note"
                            name="deliveryNote"
                            className="!mb-0"
                            rules={[
                                { required: true, message: 'Delivery note is required' },
                                { whitespace: true, message: 'Delivery note cannot be empty' },
                            ]}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Design files and the first build are ready for review."
                                className="!resize-none"
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </main>
        </ConfigProvider>
    );
}

/* =============================================================
   SMALL COMPONENTS
============================================================= */

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
                <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">{label}</span>
            </div>
            <p className="text-sm font-extrabold text-gray-800 mt-3 truncate">{value}</p>
        </div>
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                {icon}
            </div>
            <h2 className="text-sm font-extrabold text-gray-900">{title}</h2>
        </div>
    );
}

function Message({
    title,
    text,
    onRetry,
    showRetry = false,
}: {
    title: string;
    text: string;
    onRetry?: () => void;
    showRetry?: boolean;
}) {
    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <LuCircleAlert size={24} className="text-gray-400" />
                </div>

                <h2 className="text-lg font-extrabold text-gray-900 mt-4">{title}</h2>
                <p className="text-xs text-gray-400 leading-relaxed mt-2">{text}</p>

                {showRetry && onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 mt-5 border border-gray-200 text-gray-700 rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-gray-50 transition-colors"
                    >
                        Try again
                    </button>
                )}

                <div>
                    <Link
                        href="/projects/orders"
                        className="inline-flex items-center gap-2 mt-5 bg-gray-900 text-white rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-gray-800 transition-colors"
                    >
                        <MdArrowBack size={16} />
                        Back to orders
                    </Link>
                </div>
            </div>
        </main>
    );
}

/* =============================================================
   PAGE
============================================================= */

export default function OrderDetailsPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen flex items-center justify-center">
                    <LuLoaderCircle size={22} className="animate-spin text-gray-500" />
                </main>
            }
        >
            <OrderDetails />
        </Suspense>
    );
}