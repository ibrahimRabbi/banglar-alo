
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Button,
    ConfigProvider,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LuSearch, LuPackage, LuBriefcaseBusiness } from 'react-icons/lu';
import { MdDesignServices } from 'react-icons/md';
import { Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

import {
    useGetAllservicesQuery,
    useDeleteServiceMutation,
} from '@/redux/features/services/serviceApi';

const { Title, Text } = Typography;

type Service = {
    id: string;
    title: string;
    slug: string;
    summary: string;
    thumbnail?: string;
    status: string;
    createdById?: string;
    createdAt: string;
    updatedAt?: string;
    createdBy?: {
        id: string;
        fullName: string;
        email: string;
    };
    portfolios?: unknown[];
    packages?: unknown[];
    _count?: {
        portfolios: number;
        packages: number;
        bookings: number;
        orders: number;
    };
};

const PAGE_SIZE = 6;

const statusStyles: Record<string, string> = {
    PUBLISHED: 'green',
    DRAFT: 'gold',
    ARCHIVED: 'default',
    INACTIVE: 'red',
};

const formatLabel = (value?: string) => {
    if (!value) return 'N/A';

    return value
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (date?: string) => {
    if (!date) return 'N/A';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return 'N/A';

    return parsedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const antdTheme = {
    token: {
        colorPrimary: '#111827',
        colorBorder: '#e5e7eb',
        borderRadius: 10,
        controlHeight: 40,
        fontSize: 13,
    },
    components: {
        Table: {
            headerBg: '#f9fafb',
            headerColor: '#6b7280',
            headerBorderRadius: 8,
            rowHoverBg: '#f9fafb',
            cellPaddingBlock: 16,
            cellPaddingInline: 16,
        },
        Select: {
            optionSelectedBg: '#f3f4f6',
        },
    },
};

export default function ServicesTable() {
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const {
        data: allServices,
        isLoading,
        isFetching,
        refetch,
    } = useGetAllservicesQuery({
        page: 1,
        limit: 100,
    });

    const [deleteService, { isLoading: isDeleting }] =
        useDeleteServiceMutation();

    const services: Service[] = useMemo(
        () => allServices?.data ?? [],
        [allServices],
    );

    const statuses = useMemo(
        () => [...new Set(services.map((service) => service.status))].sort(),
        [services],
    );

    const filteredServices = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return services.filter((service) => {
            const matchesSearch =
                !keyword ||
                [
                    service.title,
                    service.slug,
                    service.summary,
                    service.status,
                    service.createdBy?.fullName,
                    service.createdBy?.email,
                ].some((value) =>
                    value?.toLowerCase().includes(keyword),
                );

            const matchesStatus =
                statusFilter === 'ALL' ||
                service.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [services, search, statusFilter]);

    const handleDelete = async (service: Service) => {
        const result = await Swal.fire({
            title: 'Delete this service?',
            html: `<p>You are about to delete <strong>${service.title}</strong>.</p><p>This action cannot be undone.</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            reverseButtons: true,
            focusCancel: true,
        });

        if (!result.isConfirmed) return;

        try {
            await deleteService(service.id).unwrap();

            message.success('Service deleted successfully');

            const nextTotal = filteredServices.length - 1;
            const nextPage = Math.max(
                1,
                Math.ceil(nextTotal / PAGE_SIZE),
            );

            setCurrentPage((previous) =>
                Math.min(previous, nextPage),
            );

            await refetch();
        } catch (error: unknown) {
            const apiError = error as {
                data?: { message?: string };
            };

            message.error(
                apiError?.data?.message ||
                'Failed to delete service',
            );
        }
    };

    const columns: ColumnsType<Service> = [
        {
            title: 'SERVICE',
            key: 'service',
            width: 260,
            render: (_, service) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                        <MdDesignServices size={21} />
                    </div>

                    <div className="min-w-0">
                        <Text strong className="block max-w-[190px] truncate text-gray-800">
                            {service.title}
                        </Text>
                        <Text type="secondary" className="block max-w-[190px] truncate text-xs">
                            /{service.slug}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'PACKAGES',
            key: 'packages',
            align: 'center',
            render: (_, service) => (
                <Space size={6}>
                    <LuPackage className="text-gray-400" size={15} />
                    <Text>
                        {service._count?.packages ?? service.packages?.length ?? 0}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'PORTFOLIOS',
            key: 'portfolios',
            align: 'center',
            render: (_, service) => (
                <Space size={6}>
                    <LuBriefcaseBusiness className="text-gray-400" size={15} />
                    <Text>
                        {service._count?.portfolios ?? service.portfolios?.length ?? 0}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'BOOKINGS',
            key: 'bookings',
            align: 'center',
            render: (_, service) => (
                <Text>{service._count?.bookings ?? 0}</Text>
            ),
        },
        {
            title: 'CREATED BY',
            key: 'createdBy',
            render: (_, service) => (
                <div>
                    <Text className="block font-medium text-gray-700">
                        {service.createdBy?.fullName || 'Unknown'}
                    </Text>
                    <Text type="secondary" className="block text-xs">
                        {service.createdBy?.email || 'N/A'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'CREATED AT',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => (
                <Text className="text-gray-500">{formatDate(date)}</Text>
            ),
        },
        {
            title: 'ACTION',
            key: 'action',
            width: 100,
            align: 'center',
            render: (_, service) => (
                <Space size={4}>
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<Pencil size={16} />}
                            onClick={() => router.push(`/services/view-details?id=${service?.id}`)}
                            className="!flex !h-9 !w-9 !items-center !justify-center !rounded-lg hover:!bg-blue-50 hover:!text-blue-600"
                        />
                    </Tooltip>

                    <Tooltip title="Delete Service">
                        <Button
                            type="text"
                            danger
                            icon={<Trash2 size={16} />}
                            loading={isDeleting}
                            onClick={() => handleDelete(service)}
                            className="!flex !h-9 !w-9 !items-center !justify-center !rounded-lg hover:!bg-red-50"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="space-y-6 w-[96%] mt-10">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Title
                            level={3}
                            className="!mb-1 !text-gray-900"
                        >
                            Services
                        </Title>
                        <Text type="secondary">
                            Manage and monitor all your services.
                        </Text>
                    </div>

                    <Tag className="!m-0 w-fit rounded-full !border-gray-200 !bg-gray-50 !px-3 !py-1.5 !text-gray-600">
                        {services.length} Total Services
                    </Tag>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center">
                    <Input
                        allowClear
                        prefix={
                            <LuSearch
                                size={17}
                                className="text-gray-400"
                            />
                        }
                        placeholder="Search services..."
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setCurrentPage(1);
                        }}
                        className="!h-10 sm:max-w-sm"
                    />

                    <Select
                        value={statusFilter}
                        onChange={(value) => {
                            setStatusFilter(value);
                            setCurrentPage(1);
                        }}
                        className="w-full sm:!w-48"
                        options={[
                            { label: 'All Statuses', value: 'ALL' },
                            ...statuses.map((status) => ({
                                label: formatLabel(status),
                                value: status,
                            })),
                        ]}
                    />
                </div>

                {/* Table */}
                <div className="rounded-lg border border-gray-200 bg-white">
                    <Table<Service>
                        rowKey="id"
                        columns={columns}
                        dataSource={filteredServices}
                        loading={isLoading || isFetching}
                        pagination={{
                            current: currentPage,
                            pageSize: PAGE_SIZE,
                            total: filteredServices.length,
                            showSizeChanger: false,
                            showTotal: (total, range) =>
                                `${range[0]}–${range[1]} of ${total} services`,
                            onChange: (page) => setCurrentPage(page),
                        }}
                    />
                </div>
            </div>
        </ConfigProvider>
    );
}
