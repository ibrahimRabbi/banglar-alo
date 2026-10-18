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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    MdKeyboardArrowLeft,
    MdKeyboardArrowRight,
} from 'react-icons/md';
import {
    LuSearch,
    LuFileText,
    LuEye,
    LuCalendarDays,
    LuUserRound,
    LuBriefcaseBusiness,
} from 'react-icons/lu';

import { useGetAllBookingsQuery } from '@/redux/features/services/serviceApi';

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

type ServiceBooking = {
    id: string;
    serviceId: string;
    packageId: string | null;
    userId: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    message: string;
    offerType: string;
    budget: number | null;
    timeline: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    service: {
        id: string;
        title: string;
    } | null;
    package: {
        id: string;
        title: string;
    } | null;
};

type BookingApiResponse = {
    statusCode?: number;
    success?: boolean;
    message?: string;
    data?: ServiceBooking[];
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPage?: number;
    };
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
        Pagination: {
            itemActiveBg: '#111827',
        },
    },
};

const STATUS_LIST = [
    'NEW',
    'CONTACTED',
    'IN_PROGRESS',
    'ACCEPTED',
    'COMPLETED',
    'CANCELLED',
    'REJECTED',
];

const statusOptions = [
    { value: 'all', label: 'All Bookings' },
    ...STATUS_LIST.map((s) => ({
        value: s,
        label: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
    { value: 'OTHER', label: 'Other Statuses' },
];

const getStatusStyle = (status: string) => {
    switch ((status || '').toUpperCase()) {
        case 'NEW':
            return {
                label: 'New',
                className: '!bg-blue-50 !text-blue-700',
                dotClassName: 'bg-blue-500',
            };

        case 'CONTACTED':
            return {
                label: 'Contacted',
                className: '!bg-cyan-50 !text-cyan-700',
                dotClassName: 'bg-cyan-500',
            };

        case 'IN_PROGRESS':
            return {
                label: 'In Progress',
                className: '!bg-amber-50 !text-amber-700',
                dotClassName: 'bg-amber-500',
            };

        case 'ACCEPTED':
            return {
                label: 'Accepted',
                className: '!bg-indigo-50 !text-indigo-700',
                dotClassName: 'bg-indigo-500',
            };

        case 'COMPLETED':
            return {
                label: 'Completed',
                className: '!bg-emerald-50 !text-emerald-700',
                dotClassName: 'bg-emerald-500',
            };

        case 'CANCELLED':
        case 'REJECTED':
            return {
                label:
                    status.charAt(0).toUpperCase() +
                    status.slice(1).toLowerCase(),
                className: '!bg-red-50 !text-red-600',
                dotClassName: 'bg-red-500',
            };

        default:
            return {
                label: status ? status.replace(/[_-]/g, ' ') : 'Unknown',
                className: '!bg-gray-100 !text-gray-600',
                dotClassName: 'bg-gray-400',
            };
    }
};

const formatDate = (value?: string) => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

const formatBudget = (budget: number | null) => {
    if (budget === null || budget === undefined) return 'Not specified';

    return `৳${budget.toLocaleString('en-BD')}`;
};

const ServiceBookingTable = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const {
        data: responseData,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetAllBookingsQuery({
        page: currentPage,
        limit: PAGE_SIZE,
    });

    const response = responseData as BookingApiResponse | undefined;

    const bookings = response?.data ?? [];
    const meta = response?.meta;

    const totalBookings = meta?.total ?? 0;
    const totalPages = meta?.totalPage ?? Math.ceil(totalBookings / PAGE_SIZE);

    const safePage = Math.min(currentPage, Math.max(totalPages, 1));

    const filteredBookings = useMemo(() => {
        const query = search.trim().toLowerCase();

        return bookings.filter((booking) => {
            const serviceName = booking.service?.title ?? '';
            const packageName = booking.package?.title ?? '';

            const matchesSearch =
                !query ||
                booking.clientName.toLowerCase().includes(query) ||
                booking.clientEmail.toLowerCase().includes(query) ||
                booking.clientPhone.toLowerCase().includes(query) ||
                serviceName.toLowerCase().includes(query) ||
                packageName.toLowerCase().includes(query) ||
                booking.offerType.toLowerCase().includes(query) ||
                booking.id.toLowerCase().includes(query);

            const normalizedStatus = booking.status.toUpperCase();

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'OTHER'
                    ? !STATUS_LIST.includes(normalizedStatus)
                    : normalizedStatus === statusFilter);

            return matchesSearch && matchesStatus;
        });
    }, [bookings, search, statusFilter]);

    const columns: ColumnsType<ServiceBooking> = [
        {
            title: 'Client',
            key: 'client',
            width: 225,
            render: (_, booking) => (
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                        <LuUserRound size={18} />
                    </div>

                    <div className="min-w-0">
                        <Tooltip title={booking.clientName}>
                            <p className="text-[13px] font-bold text-gray-900 truncate">
                                {booking.clientName || 'Unknown Client'}
                            </p>
                        </Tooltip>

                        <p className="text-[11px] text-gray-400 truncate">
                            {booking.clientEmail || 'No email provided'}
                        </p>

                        {booking.clientPhone && (
                            <p className="text-[11px] text-gray-400 truncate">
                                {booking.clientPhone}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Service / Package',
            key: 'service',
            width: 210,
            render: (_, booking) => {
                const title =
                    booking.service?.title ||
                    booking.package?.title ||
                    'Not specified';

                return (
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            <LuBriefcaseBusiness size={15} className="text-gray-600" />
                        </div>

                        <div className="min-w-0">
                            <Tooltip title={title}>
                                <p className="text-[12px] font-semibold text-gray-800 truncate">
                                    {title}
                                </p>
                            </Tooltip>

                            <p className="text-[10px] text-gray-400">
                                {booking.package ? 'Package booking' : 'Service booking'}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        
        {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
            width: 125,
            render: (budget: number | null) => (
                <Text strong className="!text-[12px] !text-gray-800 whitespace-nowrap">
                    {formatBudget(budget)}
                </Text>
            ),
        },
        {
            title: 'Timeline',
            dataIndex: 'timeline',
            key: 'timeline',
            width: 125,
            render: (timeline: string) => (
                <span className="text-[12px] text-gray-600">{timeline || '—'}</span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            render: (status: string) => {
                const config = getStatusStyle(status);

                return (
                    <Tag
                        bordered={false}
                        className={`!rounded-full !px-2.5 !py-1 !text-[11px] !font-bold !mr-0 ${config.className}`}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${config.dotClassName}`} />
                            {config.label}
                        </span>
                    </Tag>
                );
            },
        },
       
        {
            title: 'Action',
            key: 'action',
            width: 150,
            align: 'center',
            render: (_, booking) => (
                <Link
                    href={`/projects/quotation/view-details?id=${encodeURIComponent(booking.id)}`}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-10">
                    <div>
                        <Title
                            level={1}
                            className="!text-[22px] !font-extrabold !text-gray-900 !tracking-tight !mb-1"
                        >
                            Service Bookings
                        </Title>

                        <Text className="!text-[13px] !text-gray-400 !font-medium">
                            Review client requests, budgets, and booking details
                        </Text>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                            <LuFileText size={18} />
                        </div>

                        <div>
                            <p className="text-[11px] text-gray-400 font-medium">Total Bookings</p>
                            <p className="text-lg font-extrabold text-gray-900">{totalBookings}</p>
                        </div>
                    </div>
                </div>

                {/* Search and status filter */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <Input
                            prefix={<LuSearch className="text-gray-400" size={16} />}
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by client, email, service, or booking ID..."
                            allowClear
                            className="!flex-1"
                        />

                        <Select
                            value={statusFilter}
                            onChange={(value) => {
                                setStatusFilter(value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:!w-[210px]"
                            options={statusOptions}
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-50">
                        <Text className="!text-[11px] !text-gray-400">
                            Status:{' '}
                            <span className="!text-gray-700 !font-bold">
                                {statusOptions.find((o) => o.value === statusFilter)?.label}
                            </span>
                        </Text>

                        <Text className="!text-[11px] !text-gray-400">
                            {filteredBookings.length} booking
                            {filteredBookings.length !== 1 ? 's' : ''} on this page
                        </Text>
                    </div>
                </div>

                {/* Bookings table */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <Table<ServiceBooking>
                        rowKey="id"
                        columns={columns}
                        dataSource={filteredBookings}
                        pagination={false}
                        loading={isLoading || isFetching}
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
                                                ? 'Unable to load bookings'
                                                : search || statusFilter !== 'all'
                                                    ? 'No matching bookings found'
                                                    : 'No service bookings available yet'}
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
                    <div className="border-t border-gray-100 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-[11.5px] text-gray-400 font-medium">
                            Showing{' '}
                            <span className="text-gray-700 font-bold">
                                {totalBookings === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
                                {'–'}
                                {Math.min(safePage * PAGE_SIZE, totalBookings)}
                            </span>{' '}
                            of <span className="text-gray-700 font-bold">{totalBookings}</span>{' '}
                            bookings
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Button
                                aria-label="Previous page"
                                icon={<MdKeyboardArrowLeft size={18} />}
                                disabled={safePage <= 1 || isFetching}
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                className="!w-8 !h-8 !flex !items-center !justify-center !rounded-lg"
                            />

                            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                                (page) => (
                                    <Button
                                        key={page}
                                        type={safePage === page ? 'primary' : 'default'}
                                        disabled={isFetching}
                                        onClick={() => setCurrentPage(page)}
                                        className={`!w-8 !h-8 !rounded-lg !text-[12px] !font-bold ${safePage === page
                                                ? '!bg-gray-900 !border-gray-900'
                                                : '!text-gray-500 !border-gray-200'
                                            }`}
                                    >
                                        {page}
                                    </Button>
                                ),
                            )}

                            <Button
                                aria-label="Next page"
                                icon={<MdKeyboardArrowRight size={18} />}
                                disabled={totalPages === 0 || safePage >= totalPages || isFetching}
                                onClick={() =>
                                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                                }
                                className="!w-8 !h-8 !flex !items-center !justify-center !rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default ServiceBookingTable;