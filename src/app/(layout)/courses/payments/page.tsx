'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Button,
    Card,
    ConfigProvider,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    Tooltip,
    Empty,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
    MdVisibility,
    MdSearch,
    MdRefresh,
    MdPayments,
} from 'react-icons/md';
import { useGetPaymentReviewsQuery } from '@/redux/features/course/courseApi';

const { Title, Text } = Typography;

type PaymentStatus = 'PENDING' | 'VERIFYING' | 'SUCCESS' | 'FAILED';

interface PaymentCourse {
    id: string;
    title: string;
    batch: string;
    price: number;
}

interface PaymentStudent {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    studentId: string | null;
}

interface VerifiedBy {
    id: string;
    fullName: string;
    email: string;
}

interface Payment {
    id: string;
    tranId: string;
    courseId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    gatewayUrl: string;
    paidAt: string | null;
    failReason: string;
    manualTransactionId: string;
    walletNumber: string;
    paymentMethod: string;
    screenshotUrl: string;
    submittedAt: string | null;
    verifiedAt: string | null;
    createdAt: string;
    course: PaymentCourse;
    student: PaymentStudent;
    verifiedBy: VerifiedBy | null;
}

interface PaymentApiResponse {
    success: boolean;
    data: Payment[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPage?: number;
    };
}

const formatDate = (date: string | null | undefined) => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return '—';

    return parsedDate.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatAmount = (amount: number, currency: string) => {
    try {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: currency || 'BDT',
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currency || 'BDT'} ${amount.toLocaleString()}`;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'SUCCESS':
            return 'success';
        case 'PENDING':
            return 'warning';
        case 'VERIFYING':
            return 'processing';
        case 'FAILED':
            return 'error';
        default:
            return 'default';
    }
};

export default function PaymentReviewsPage() {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>();

    const {
        data: response,
        isLoading,
        isFetching,
        refetch,
    } = useGetPaymentReviewsQuery({
        page,
        limit,
    });

    const apiResponse = response as PaymentApiResponse | undefined;
    const payments: Payment[] = apiResponse?.data ?? [];
    const meta = apiResponse?.meta;

    const filteredPayments = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return payments.filter((payment) => {
            const matchesSearch =
                !keyword ||
                payment.tranId?.toLowerCase().includes(keyword) ||
                payment.student?.fullName?.toLowerCase().includes(keyword) ||
                payment.student?.email?.toLowerCase().includes(keyword) ||
                payment.course?.title?.toLowerCase().includes(keyword) ||
                payment.course?.batch?.toLowerCase().includes(keyword) ||
                payment.manualTransactionId?.toLowerCase().includes(keyword) ||
                payment.walletNumber?.toLowerCase().includes(keyword);

            const matchesStatus =
                !statusFilter || payment.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [payments, search, statusFilter]);

    const columns: ColumnsType<Payment> = [
        {
            title: 'STUDENT',
            key: 'student',
            width:180,
            render: (_, payment) => (
                <div className="min-w-0">
                    <Tooltip title={payment.student?.fullName}>
                        <p className="truncate text-[13px] font-semibold text-gray-800">
                            {payment.student?.fullName || 'Unknown Student'}
                        </p>
                    </Tooltip>
                    <p className="truncate text-xs text-gray-500">
                        {payment.student?.email || 'No email'}
                    </p>
                    {payment.student?.studentId && (
                        <p className="truncate text-xs text-gray-400">
                            ID: {payment.student.studentId}
                        </p>
                    )}
                </div>
            ),
        },
        {
            title: 'COURSE',
            key: 'course',
            width : 160,
            render: (_, payment) => (
                <div className="min-w-0">
                    <Tooltip title={payment.course?.title}>
                        <p className="truncate text-[13px] font-semibold text-gray-700">
                            {payment.course?.title || 'Unknown Course'}
                        </p>
                    </Tooltip>
                    <p className="truncate text-xs text-gray-500">
                        {payment.course?.batch || 'No batch'}
                    </p>
                </div>
            ),
        },
        {
            title: 'TRANSACTION ID',
            dataIndex: 'tranId',
            key: 'tranId',
            width: 160,
            render: (tranId: string) => (
                <Tooltip title={tranId}>
                    <p className="truncate text-xs font-medium text-gray-700">
                        {tranId || '—'}
                    </p>
                </Tooltip>
            ),
        },
        {
            title: 'AMOUNT',
            key: 'amount',
            width: 120,
            render: (_, payment) => (
                <Text strong className="!whitespace-nowrap !text-gray-800">
                    {formatAmount(payment.amount, payment.currency)}
                </Text>
            ),
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            width: 110,
            render: (status: string) => (
                <Tag color={getStatusColor(status)} className="!mr-0">
                    {status || 'UNKNOWN'}
                </Tag>
            ),
        },
        {
            title: 'ACTION',
            key: 'action',
            width: 70,
            align: 'center',
            render: (_, payment) => (
                <Tooltip title="View details">
                    <Button
                        type="default"
                        aria-label="View payment details"
                        icon={<MdVisibility size={17} />}
                        onClick={() =>
                            router.push(`/courses/payments/details?id=${payment.tranId}`)
                        }
                        className="!flex !h-8 !w-8 !items-center !justify-center !rounded-lg !border-gray-200 !p-0 hover:!border-black hover:!text-black"
                    />
                </Tooltip>
            ),
        },
    ];

    const handleTableChange = (pagination: TablePaginationConfig) => {
        const nextPage = pagination.current ?? 1;
        const nextLimit = pagination.pageSize ?? 10;

        if (nextLimit !== limit) {
            setLimit(nextLimit);
            setPage(1);
            return;
        }

        setPage(nextPage);
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter(undefined);
        setPage(1);
        refetch();
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#111827',
                    borderRadius: 10,
                    colorBgContainer: '#ffffff',
                    fontFamily: 'inherit',
                },
                components: {
                    Table: {
                        headerBg: '#f9fafb',
                        headerColor: '#6b7280',
                        borderColor: '#f0f0f0',
                        rowHoverBg: '#fafafa',
                        cellPaddingBlock: 16,
                        headerSplitColor: 'transparent',
                    },
                },
            }}
        >
            <div className="min-h-screen w-[96%]">
                {/* Header */}
                <div className="flex flex-col justify-between my-8 gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
                                <MdPayments size={22} />
                            </div>
                            <Title level={3} className="!mb-0 !text-gray-900">
                                Payment Reviews
                            </Title>
                        </div>

                        <Text className="text-sm text-gray-500">
                            Manage and review student course payments.
                        </Text>
                    </div>

                    <Button
                        icon={<MdRefresh size={18} />}
                        onClick={() => refetch()}
                        loading={isFetching}
                        className="!h-10 !rounded-lg !border-gray-200 !bg-white"
                    >
                        Refresh
                    </Button>
                </div>



                {/* Table */}

                <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">


                    <Space wrap size={10}>
                        <Input
                            allowClear
                            prefix={
                                <MdSearch
                                    size={19}
                                    className="text-gray-400"
                                />
                            }
                            placeholder="Search payments..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="!h-10 !w-full sm:!w-64"
                        />

                        <Select
                            allowClear
                            placeholder="All statuses"
                            value={statusFilter}
                            onChange={(value) => {
                                setStatusFilter(value);
                                setPage(1);
                            }}
                            className="!h-10 !w-full sm:!w-40"
                            options={[
                                { label: 'Pending', value: 'PENDING' },
                                { label: 'Verifying', value: 'VERIFYING' },
                                { label: 'Success', value: 'SUCCESS' },
                                { label: 'Failed', value: 'FAILED' },
                            ]}
                        />


                    </Space>
                </div>

                <Table<Payment>
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredPayments}
                    loading={isLoading || isFetching}
                    onChange={handleTableChange}
                    tableLayout="fixed"
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No payment records found"
                            />
                        ),
                    }}
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total: meta?.total ?? payments.length,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showTotal: (total, range) =>
                            `${range[0]}–${range[1]} of ${total} payments`,
                    }}
                />

            </div>
        </ConfigProvider>
    );
}