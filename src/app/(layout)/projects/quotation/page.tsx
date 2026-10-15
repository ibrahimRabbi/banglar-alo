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
    Modal,
    Descriptions,
    Empty,
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
    LuMail,
    LuPhone,
} from 'react-icons/lu';

const { Title, Text } = Typography;

type QuotationStatus =
    | 'pending'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

type Quotation = {
    id: string;
    serviceId: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: QuotationStatus;
    submittedAt: string;
};

const initialQuotations: Quotation[] = [
    {
        id: '1',
        serviceId: 'SRV-1001',
        name: 'Rahim Ahmed',
        email: 'rahim@example.com',
        phone: '+8801712345678',
        subject: 'Website Development',
        message:
            'I need a business website with a modern design, responsive layout, contact form, and admin dashboard. Please send me a quotation with the estimated cost and timeline.',
        status: 'pending',
        submittedAt: '2026-10-12',
    },
    {
        id: '2',
        serviceId: 'SRV-1002',
        name: 'Nusrat Jahan',
        email: 'nusrat@example.com',
        phone: '+8801812345678',
        subject: 'E-commerce Website',
        message:
            'I want to build an e-commerce website with product management, cart functionality, payment integration, and order tracking.',
        status: 'in_progress',
        submittedAt: '2026-10-11',
    },
    {
        id: '3',
        serviceId: 'SRV-1003',
        name: 'Sabbir Hossain',
        email: 'sabbir@example.com',
        phone: '+8801912345678',
        subject: 'Mobile App Development',
        message:
            'I am interested in developing a mobile application for my business. I would like to discuss the required features and project budget.',
        status: 'completed',
        submittedAt: '2026-10-10',
    },
    {
        id: '4',
        serviceId: 'SRV-1004',
        name: 'Mim Akter',
        email: 'mim@example.com',
        phone: '+8801612345678',
        subject: 'UI/UX Design',
        message:
            'I need UI/UX design for a dashboard and customer-facing web application. Please share your design process and estimated price.',
        status: 'pending',
        submittedAt: '2026-10-09',
    },
    {
        id: '5',
        serviceId: 'SRV-1005',
        name: 'Tanvir Hasan',
        email: 'tanvir@example.com',
        phone: '+8801512345678',
        subject: 'SEO Services',
        message:
            'I want SEO services for my company website to improve search visibility and organic traffic. Please provide your service packages.',
        status: 'cancelled',
        submittedAt: '2026-10-08',
    },
    {
        id: '6',
        serviceId: 'SRV-1006',
        name: 'Ayesha Rahman',
        email: 'ayesha@example.com',
        phone: '+8801312345678',
        subject: 'Brand Identity Design',
        message:
            'I need a complete brand identity package including logo design, color palette, typography, and social media branding.',
        status: 'completed',
        submittedAt: '2026-10-07',
    },
    {
        id: '7',
        serviceId: 'SRV-1007',
        name: 'Fahim Chowdhury',
        email: 'fahim@example.com',
        phone: '+8801412345678',
        subject: 'Custom Software',
        message:
            'I am looking for custom business management software to manage customers, employees, reports, and daily operations.',
        status: 'pending',
        submittedAt: '2026-10-06',
    },
];

const PAGE_SIZE = 6;

const statusOptions = [
    { value: 'all', label: 'All Quotations' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const statusConfig: Record<
    QuotationStatus,
    {
        label: string;
        className: string;
        dotClassName: string;
    }
> = {
    pending: {
        label: 'Pending',
        className: '!bg-amber-50 !text-amber-700',
        dotClassName: 'bg-amber-500',
    },
    in_progress: {
        label: 'In Progress',
        className: '!bg-blue-50 !text-blue-700',
        dotClassName: 'bg-blue-500',
    },
    completed: {
        label: 'Completed',
        className: '!bg-emerald-50 !text-emerald-700',
        dotClassName: 'bg-emerald-500',
    },
    cancelled: {
        label: 'Cancelled',
        className: '!bg-red-50 !text-red-600',
        dotClassName: 'bg-red-500',
    },
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

const QuotationTable = () => {
    const [quotations] = useState<Quotation[]>(initialQuotations);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedQuotation, setSelectedQuotation] =
        useState<Quotation | null>(null);

    const filteredQuotations = useMemo(() => {
        const query = search.trim().toLowerCase();

        return quotations.filter((quotation) => {
            const matchesSearch =
                quotation.serviceId.toLowerCase().includes(query) ||
                quotation.name.toLowerCase().includes(query) ||
                quotation.email.toLowerCase().includes(query) ||
                quotation.phone.toLowerCase().includes(query) ||
                quotation.subject.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === 'all' ||
                quotation.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [quotations, search, statusFilter]);

    const totalPages = Math.ceil(
        filteredQuotations.length / PAGE_SIZE,
    );

    const safePage = Math.min(
        currentPage,
        Math.max(totalPages, 1),
    );

    const paginatedQuotations = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;

        return filteredQuotations.slice(
            start,
            start + PAGE_SIZE,
        );
    }, [filteredQuotations, safePage]);

    const columns: ColumnsType<Quotation> = [
        {
            title: 'Client',
            key: 'client',
            width: 210,
            render: (_, quotation) => (
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold">
                            {quotation.name
                                .split(' ')
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                        </span>
                    </div>

                    <div className="min-w-0">
                        <p className="text-[13px] font-bold text-gray-900 truncate">
                            {quotation.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                            {quotation.email}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Service ID',
            dataIndex: 'serviceId',
            key: 'serviceId',
            width: 130,
            render: (serviceId: string) => (
                <span className="inline-block text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {serviceId}
                </span>
            ),
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            width: 155,
            render: (phone: string) => (
                <Text className="!text-[12px] !text-gray-600 whitespace-nowrap">
                    {phone}
                </Text>
            ),
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            width: 190,
            render: (subject: string) => (
                <Text
                    strong
                    className="!text-[12px] !text-gray-800"
                    ellipsis={{ tooltip: subject }}
                >
                    {subject}
                </Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 145,
            render: (status: QuotationStatus) => {
                const config = statusConfig[status];

                return (
                    <Tag
                        bordered={false}
                        className={`!rounded - full!px - 2.5!py - 1!text - [11px]!font - bold!mr - 0 ${ config.className } `}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <span
                                className={`w - 1.5 h - 1.5 rounded - full ${ config.dotClassName } `}
                            />
                            {config.label}
                        </span>
                    </Tag>
                );
            },
        },
        {
            title: 'Action',
            key: 'action',
            width: 160,
            align: 'center',
            render: (_, quotation) => (
                <Link
                    href={`quotation/view-details?id=${ encodeURIComponent(quotation.id) } `}
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
                            Service Quotations
                        </Title>

                        <Text className="!text-[13px] !text-gray-400 !font-medium">
                            Review client requests and manage quotation
                            status
                        </Text>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                            <LuFileText size={18} />
                        </div>

                        <div>
                            <p className="text-[11px] text-gray-400 font-medium">
                                Total Quotations
                            </p>
                            <p className="text-lg font-extrabold text-gray-900">
                                {quotations.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Status Filter */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <Input
                            prefix={
                                <LuSearch
                                    className="text-gray-400"
                                    size={16}
                                />
                            }
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by service ID, client, email, phone, or subject..."
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
                            optionRender={(option) => {
                                const value = String(option.value);

                                if (value === 'all') {
                                    return (
                                        <div className="flex items-center justify-between py-1">
                                            <span>All Quotations</span>
                                            <span className="text-xs text-gray-400">
                                                {quotations.length}
                                            </span>
                                        </div>
                                    );
                                }

                                const status =
                                    value as QuotationStatus;
                                const config = statusConfig[status];

                                const count = quotations.filter(
                                    (quotation) =>
                                        quotation.status === status,
                                ).length;

                                return (
                                    <div className="flex items-center justify-between gap-3 py-1">
                                        <span className="flex items-center gap-2">
                                            <span
                                                className={`w - 2 h - 2 rounded - full ${ config.dotClassName } `}
                                            />
                                            {config.label}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {count}
                                        </span>
                                    </div>
                                );
                            }}
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-50">
                        <Text className="!text-[11px] !text-gray-400">
                            Showing results for{' '}
                            <span className="!text-gray-700 !font-bold">
                                {
                                    statusOptions.find(
                                        (option) =>
                                            option.value === statusFilter,
                                    )?.label
                                }
                            </span>
                        </Text>

                        <Text className="!text-[11px] !text-gray-400">
                            {filteredQuotations.length} result
                            {filteredQuotations.length !== 1
                                ? 's'
                                : ''}
                        </Text>
                    </div>
                </div>

                {/* Quotations Table */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <Table<Quotation>
                        rowKey="id"
                        columns={columns}
                        dataSource={paginatedQuotations}
                        pagination={false}
                        size="middle"
                        tableLayout="fixed"
                        scroll={{ x: 1000 }}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <span className="text-[12px] text-gray-400">
                                            No quotations found
                                        </span>
                                    }
                                />
                            ),
                        }}
                    />

                    {/* Pagination */}
                    <div className="border-t border-gray-100 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-[11.5px] text-gray-400 font-medium">
                            Showing{' '}
                            <span className="text-gray-700 font-bold">
                                {filteredQuotations.length === 0
                                    ? 0
                                    : (safePage - 1) * PAGE_SIZE + 1}
                                –
                                {Math.min(
                                    safePage * PAGE_SIZE,
                                    filteredQuotations.length,
                                )}
                            </span>{' '}
                            of{' '}
                            <span className="text-gray-700 font-bold">
                                {filteredQuotations.length}
                            </span>{' '}
                            quotations
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Button
                                aria-label="Previous page"
                                icon={
                                    <MdKeyboardArrowLeft size={18} />
                                }
                                disabled={safePage <= 1}
                                onClick={() =>
                                    setCurrentPage((page) => page - 1)
                                }
                                className="!w-8 !h-8 !flex !items-center !justify-center !rounded-lg"
                            />

                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1,
                            ).map((page) => (
                                <Button
                                    key={page}
                                    type={
                                        safePage === page
                                            ? 'primary'
                                            : 'default'
                                    }
                                    onClick={() =>
                                        setCurrentPage(page)
                                    }
                                    className={`!w - 8!h - 8!rounded - lg!text - [12px]!font - bold ${
    safePage === page
        ? '!bg-gray-900 !border-gray-900'
        : '!text-gray-500 !border-gray-200'
} `}
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                aria-label="Next page"
                                icon={
                                    <MdKeyboardArrowRight size={18} />
                                }
                                disabled={
                                    totalPages === 0 ||
                                    safePage >= totalPages
                                }
                                onClick={() =>
                                    setCurrentPage((page) => page + 1)
                                }
                                className="!w-8 !h-8 !flex !items-center !justify-center !rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Optional quick-preview modal */}
            <Modal
                title="Quotation Preview"
                open={!!selectedQuotation}
                onCancel={() => setSelectedQuotation(null)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setSelectedQuotation(null)}
                    >
                        Close
                    </Button>,
                ]}
                width={600}
                centered
            >
                {selectedQuotation && (
                    <Descriptions
                        bordered
                        size="small"
                        column={1}
                        labelStyle={{
                            width: 130,
                            color: '#6b7280',
                            fontSize: 12,
                        }}
                        contentStyle={{
                            color: '#111827',
                            fontSize: 12,
                        }}
                    >
                        <Descriptions.Item label="Service ID">
                            {selectedQuotation.serviceId}
                        </Descriptions.Item>

                        <Descriptions.Item label="Client Name">
                            {selectedQuotation.name}
                        </Descriptions.Item>

                        <Descriptions.Item label="Email">
                            <a
                                href={`mailto:${ selectedQuotation.email } `}
                                className="inline-flex items-center gap-2 text-blue-600"
                            >
                                <LuMail size={14} />
                                {selectedQuotation.email}
                            </a>
                        </Descriptions.Item>

                        <Descriptions.Item label="Phone">
                            <a
                                href={`tel:${ selectedQuotation.phone } `}
                                className="inline-flex items-center gap-2 text-blue-600"
                            >
                                <LuPhone size={14} />
                                {selectedQuotation.phone}
                            </a>
                        </Descriptions.Item>

                        <Descriptions.Item label="Subject">
                            {selectedQuotation.subject}
                        </Descriptions.Item>

                        <Descriptions.Item label="Status">
                            <Tag
                                bordered={false}
                                className={statusConfig[
                                    selectedQuotation.status
                                ].className}
                            >
                                {
                                    statusConfig[
                                        selectedQuotation.status
                                    ].label
                                }
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Message">
                            {selectedQuotation.message}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </ConfigProvider>
    );
};

export default QuotationTable;
 