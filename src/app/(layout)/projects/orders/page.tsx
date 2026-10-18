'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Table,
    Input,
    Select,
    Tag,
    Button,
    Typography,
    ConfigProvider,
    Empty,
    Tooltip,
    Progress,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import {
    LuSearch,
    LuPackage,
    LuEye,
    LuCalendarDays,
    LuUserRound,
} from 'react-icons/lu';

import { useGetAllOrdersQuery } from '@/redux/features/services/serviceApi';

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

type Milestone = {
    id: string;
    title: string;
    budget: number;
    status: string;
};

type Order = {
    id: string;
    projectName: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    totalBudget: number;
    timeline: string;
    deliveryStatus: string;
    createdAt: string;
    service: { id: string; title: string } | null;
    milestones: Milestone[];
    acceptedBudget: number;
    budgetLeft: number;
};

const antdTheme = {
    token: {
        colorPrimary: '#111827',
        colorBorder: '#e5e7eb',
        borderRadius: 12,
        controlHeight: 40,
        fontSize: 13,
        fontFamily: 'inherit',
    },
    components: {
        Table: {
            headerBg: '#f9fafb',
            headerColor: '#9ca3af',
            headerSplitColor: 'transparent',
            borderColor: '#f3f4f6',
            rowHoverBg: '#f9fafb',
            cellPaddingBlock: 14,
            cellPaddingInline: 16,
        },
        Pagination: { itemActiveBg: '#111827' },
    },
};

const formatLabel = (v?: string) =>
    (v || 'N/A')
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

const getDeliveryStyle = (status: string) => {
    switch ((status || '').toUpperCase()) {
        case 'NOT_STARTED':
            return { className: '!bg-gray-100 !text-gray-600', dot: 'bg-gray-400' };
        case 'IN_PROGRESS':
            return { className: '!bg-amber-50 !text-amber-700', dot: 'bg-amber-500' };
        case 'DELIVERED':
            return { className: '!bg-blue-50 !text-blue-700', dot: 'bg-blue-500' };
        case 'COMPLETED':
            return { className: '!bg-emerald-50 !text-emerald-700', dot: 'bg-emerald-500' };
        case 'CANCELLED':
            return { className: '!bg-red-50 !text-red-600', dot: 'bg-red-500' };
        default:
            return { className: '!bg-gray-100 !text-gray-600', dot: 'bg-gray-400' };
    }
};

const taka = (n?: number | null) =>
    n === null || n === undefined ? 'N/A' : `৳${n.toLocaleString('en-BD')}`;

const formatDate = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const OrderTable = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isFetching, isError, refetch } = useGetAllOrdersQuery({
        page: currentPage,
        limit: PAGE_SIZE,
    });

    const orders: Order[] = useMemo(() => data?.data ?? [], [data]);
    const total: number = data?.meta?.total ?? 0;
    const totalPages: number = data?.meta?.totalPage ?? Math.ceil(total / PAGE_SIZE);
    const safePage = Math.min(currentPage, Math.max(totalPages, 1));

    const statuses = useMemo(
        () => [...new Set(orders.map((o) => o.deliveryStatus).filter(Boolean))],
        [orders],
    );

    const filteredOrders = useMemo(() => {
        const q = search.trim().toLowerCase();
        return orders.filter((o) => {
            const matchesSearch =
                !q ||
                [o.projectName, o.clientName, o.clientEmail, o.clientPhone, o.service?.title, o.id]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(q));
            const matchesStatus = statusFilter === 'all' || o.deliveryStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, search, statusFilter]);

    const columns: ColumnsType<Order> = [
        {
            title: 'Project',
            key: 'project',
            width: 240,
            render: (_, o) => (
                <div className="min-w-0">
                    <Tooltip title={o.projectName}>
                        <p className="text-[13px] font-bold text-gray-900 truncate">{o.projectName}</p>
                    </Tooltip>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {o.service?.title || 'No service'}
                    </p>
                </div>
            ),
        },
        {
            title: 'Client',
            key: 'client',
            width: 220,
            render: (_, o) => (
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                        <LuUserRound size={16} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-gray-800 truncate">{o.clientName}</p>
                        <p className="text-[11px] text-gray-400 truncate">{o.clientPhone || o.clientEmail}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Budget',
            key: 'budget',
            width: 170,
            render: (_, o) => {
                const percent = o.totalBudget
                    ? Math.round(((o.acceptedBudget || 0) / o.totalBudget) * 100)
                    : 0;
                return (
                    <div>
                        <p className="text-[12.5px] font-bold text-gray-800 whitespace-nowrap">
                            {taka(o.totalBudget)}
                        </p>
                        <Progress percent={percent} size="small" showInfo={false} strokeColor="#111827" />
                        <p className="text-[10px] text-gray-400 whitespace-nowrap">
                            {taka(o.acceptedBudget)} accepted
                        </p>
                    </div>
                );
            },
        },
        {
            title: 'Milestones',
            key: 'milestones',
            width: 110,
            render: (_, o) => (
                <span className="inline-block whitespace-nowrap rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-[11px] font-bold text-gray-500">
                    {o.milestones?.length ?? 0} total
                </span>
            ),
        },
        {
            title: 'Timeline',
            dataIndex: 'timeline',
            key: 'timeline',
            width: 110,
            render: (v: string) => <span className="text-[12px] text-gray-600">{v || '—'}</span>,
        },
        {
            title: 'Delivery',
            dataIndex: 'deliveryStatus',
            key: 'deliveryStatus',
            width: 140,
            render: (status: string) => {
                const s = getDeliveryStyle(status);
                return (
                    <Tag
                        bordered={false}
                        className={`!mr-0 !rounded-full !px-2.5 !py-1 !text-[11px] !font-bold ${s.className}`}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                            {formatLabel(status)}
                        </span>
                    </Tag>
                );
            },
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 125,
            render: (v: string) => (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 whitespace-nowrap">
                    <LuCalendarDays size={13} />
                    {formatDate(v)}
                </span>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 150,
            align: 'center',
            render: (_, o) => (
                <Link
                    href={`/projects/orders/view-details?id=${encodeURIComponent(o.id)}`}
                    className="inline-flex h-8 items-center gap-2 rounded-lg border border-gray-200 px-3 text-[11px] font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
                >
                    <LuEye size={15} />
                    View Details
                </Link>
            ),
        },
    ];

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="w-[95%] space-y-5">
                {/* Header */}
                <div className="my-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Title
                            level={1}
                            className="!mb-1 !text-[22px] !font-extrabold !tracking-tight !text-gray-900"
                        >
                            Orders
                        </Title>
                        <Text className="!text-[13px] !font-medium !text-gray-400">
                            Track projects, milestones and delivery status
                        </Text>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                            <LuPackage size={18} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-medium">Total Orders</p>
                            <p className="text-lg font-extrabold text-gray-900">{total}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <Input
                            prefix={<LuSearch className="text-gray-400" size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search project, client, phone or service..."
                            allowClear
                            className="!flex-1"
                        />
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="w-full md:!w-[200px]"
                            options={[
                                { value: 'all', label: 'All Statuses' },
                                ...statuses.map((s) => ({ value: s, label: formatLabel(s) })),
                            ]}
                        />
                    </div>
                    <p className="mt-3 border-t border-gray-50 pt-3 text-[11px] text-gray-400">
                        {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} on this page
                    </p>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <Table<Order>
                        rowKey="id"
                        columns={columns}
                        dataSource={filteredOrders}
                        loading={isLoading || isFetching}
                        pagination={false}
                        size="middle"
                        tableLayout="fixed"
                        scroll={{ x: 1250 }}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <span className="text-[12px] text-gray-400">
                                            {isError
                                                ? 'Unable to load orders'
                                                : search || statusFilter !== 'all'
                                                    ? 'No matching orders found'
                                                    : 'No orders yet'}
                                        </span>
                                    }
                                >
                                    {isError && (
                                        <Button size="small" onClick={() => refetch()}>
                                            Try Again
                                        </Button>
                                    )}
                                </Empty>
                            ),
                        }}
                    />

                    {/* Pagination */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-3.5 sm:flex-row">
                        <p className="text-[11.5px] font-medium text-gray-400">
                            Showing{' '}
                            <span className="font-bold text-gray-700">
                                {total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
                                {Math.min(safePage * PAGE_SIZE, total)}
                            </span>{' '}
                            of <span className="font-bold text-gray-700">{total}</span> orders
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Button
                                aria-label="Previous page"
                                icon={<MdKeyboardArrowLeft size={18} />}
                                disabled={safePage <= 1 || isFetching}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="!flex !h-8 !w-8 !items-center !justify-center !rounded-lg"
                            />
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    type={safePage === page ? 'primary' : 'default'}
                                    disabled={isFetching}
                                    onClick={() => setCurrentPage(page)}
                                    className={`!h-8 !w-8 !rounded-lg !text-[12px] !font-bold ${safePage === page
                                            ? '!border-gray-900 !bg-gray-900'
                                            : '!border-gray-200 !text-gray-500'
                                        }`}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                aria-label="Next page"
                                icon={<MdKeyboardArrowRight size={18} />}
                                disabled={totalPages === 0 || safePage >= totalPages || isFetching}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="!flex !h-8 !w-8 !items-center !justify-center !rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default OrderTable;