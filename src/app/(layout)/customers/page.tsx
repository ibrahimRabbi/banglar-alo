'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Table, Input, Button, Typography, ConfigProvider, Empty, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { LuSearch, LuUsers, LuUserRound, LuEye } from 'react-icons/lu';

import { useGetAllCustomerQuery } from '@/redux/features/customers/customerApi';

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

type CustomerProject = {
    id: string;
    projectName: string;
    deliveryStatus: string;
    totalBudget: number;
    timeline: string;
    serviceTitle: string;
    createdAt: string;
};

type Customer = {
    clientId: string | null;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    orderCount: number;
    bookingCount: number;
    projects: CustomerProject[];
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

// clientId can be null (guest customers), so the email is the fallback key
const getCustomerKey = (c: Customer) => c.clientId ?? c.clientEmail;

const taka = (n: number) => `৳${(n || 0).toLocaleString('en-BD')}`;

const formatLabel = (v?: string) =>
    (v || 'N/A')
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getStatusStyle = (status?: string) => {
    switch ((status || '').toUpperCase()) {
        case 'IN_PROGRESS':
            return { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
        case 'DELIVERED':
            return { pill: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' };
        case 'COMPLETED':
            return { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };
        case 'CANCELLED':
            return { pill: 'bg-red-50 text-red-600', dot: 'bg-red-500' };
        default:
            return { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
    }
};

/* =============================================================
   PROJECTS (shown inside the expanded row)
============================================================= */

const projectColumns: ColumnsType<CustomerProject> = [
    {
        title: 'Project',
        key: 'project',
        render: (_, p) => (
            <div className="min-w-0">
                <p className="text-[12.5px] font-bold text-gray-900 truncate">{p.projectName}</p>
                <p className="text-[11px] text-gray-400 truncate">{p.serviceTitle || 'No service'}</p>
            </div>
        ),
    },
    {
        title: 'Status',
        dataIndex: 'deliveryStatus',
        key: 'status',
        width: 150,
        render: (status: string) => {
            const s = getStatusStyle(status);
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.pill}`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {formatLabel(status)}
                </span>
            );
        },
    },
    {
        title: 'Budget',
        dataIndex: 'totalBudget',
        key: 'budget',
        width: 120,
        render: (v: number) => (
            <span className="text-[12px] font-bold text-gray-800 whitespace-nowrap">{taka(v)}</span>
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
        title: 'Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 120,
        render: (v: string) => (
            <span className="text-[11px] text-gray-500 whitespace-nowrap">{formatDate(v)}</span>
        ),
    },
    {
        title: '',
        key: 'action',
        width: 110,
        align: 'center',
        render: (_, p) => (
            <Link
                href={`/projects/orders/view-details?id=${p.id}`}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
            >
                <LuEye size={13} />
                Order
            </Link>
        ),
    },
];

/* =============================================================
   PAGE
============================================================= */

const CustomerTable = () => {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isFetching, isError, refetch } = useGetAllCustomerQuery({
        page: currentPage,
        limit: PAGE_SIZE,
    });

    const customers: Customer[] = useMemo(() => data?.data ?? [], [data]);
    const total: number = data?.meta?.total ?? 0;
    const totalPages: number = data?.meta?.totalPage ?? Math.ceil(total / PAGE_SIZE);
    const safePage = Math.min(currentPage, Math.max(totalPages, 1));

    // search works on the current page only
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return customers;
        return customers.filter((c) =>
            [c.clientName, c.clientEmail, c.clientPhone]
                .filter(Boolean)
                .some((v) => v.toLowerCase().includes(q)),
        );
    }, [customers, search]);

    const columns: ColumnsType<Customer> = [
        {
            title: 'Customer',
            key: 'customer',
            width: 260,
            render: (_, c) => (
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                        <LuUserRound size={18} />
                    </div>
                    <div className="min-w-0">
                        <Tooltip title={c.clientName}>
                            <p className="text-[13px] font-bold text-gray-900 truncate">
                                {c.clientName || 'Unknown'}
                            </p>
                        </Tooltip>
                        <p className="text-[11px] text-gray-400 truncate">{c.clientEmail || 'No email'}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Phone',
            dataIndex: 'clientPhone',
            key: 'clientPhone',
            width: 140,
            render: (v: string) => <span className="text-[12px] text-gray-600">{v || '—'}</span>,
        },
        {
            title: 'Account',
            key: 'account',
            width: 120,
            render: (_, c) => (
                <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${c.clientId ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                >
                    {c.clientId ? 'Registered' : 'Guest'}
                </span>
            ),
        },
        {
            title: 'Projects',
            key: 'orderCount',
            width: 100,
            render: (_, c) => (
                <span className="inline-block whitespace-nowrap rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-[11px] font-bold text-gray-500">
                    {c.orderCount}
                </span>
            ),
        },
        {
            title: 'Bookings',
            dataIndex: 'bookingCount',
            key: 'bookingCount',
            width: 100,
            render: (v: number) => <span className="text-[12px] font-bold text-gray-700">{v}</span>,
        },
        {
            title: 'Total value',
            key: 'value',
            width: 130,
            render: (_, c) => (
                <span className="text-[12.5px] font-bold text-gray-800 whitespace-nowrap">
                    {taka((c.projects ?? []).reduce((s, p) => s + (p.totalBudget || 0), 0))}
                </span>
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
                            Customers
                        </Title>
                        <Text className="!text-[13px] !font-medium !text-gray-400">
                            Click the arrow on a row to see that customer&apos;s projects
                        </Text>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                            <LuUsers size={18} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-medium">Total Customers</p>
                            <p className="text-lg font-extrabold text-gray-900">{total}</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <Input
                        prefix={<LuSearch className="text-gray-400" size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email or phone..."
                        allowClear
                    />
                    <p className="mt-3 border-t border-gray-50 pt-3 text-[11px] text-gray-400">
                        {filtered.length} customer{filtered.length !== 1 ? 's' : ''} on this page
                    </p>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <Table<Customer>
                        rowKey={(c) => getCustomerKey(c)}
                        columns={columns}
                        dataSource={filtered}
                        loading={isLoading || isFetching}
                        pagination={false}
                        size="middle"
                        scroll={{ x: 900 }}
                        expandable={{
                            // customers without projects have nothing to expand
                            rowExpandable: (c) => (c.projects?.length ?? 0) > 0,
                            expandedRowRender: (c) => (
                                <div className="rounded-xl border border-gray-100 bg-white">
                                    <Table<CustomerProject>
                                        rowKey="id"
                                        columns={projectColumns}
                                        dataSource={c.projects}
                                        pagination={false}
                                        size="small"
                                    />
                                </div>
                            ),
                        }}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <span className="text-[12px] text-gray-400">
                                            {isError
                                                ? 'Unable to load customers'
                                                : search
                                                    ? 'No matching customers found'
                                                    : 'No customers yet'}
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
                            of <span className="font-bold text-gray-700">{total}</span> customers
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

export default CustomerTable;