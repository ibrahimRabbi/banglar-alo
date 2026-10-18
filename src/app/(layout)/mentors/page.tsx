'use client';

import { useMemo, useState } from 'react';
import {
    Table,
    Input,
    Select,
    Tag,
    Button,
    Typography,
    ConfigProvider,
    Space,
    Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    MdKeyboardArrowRight,
    MdKeyboardArrowLeft,
    MdPerson,
} from 'react-icons/md';
import { LuSearch, LuUsers } from 'react-icons/lu';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useGetAllMentorsQuery } from '@/redux/features/mentor/mentorApi';

const { Title, Text } = Typography;

type Mentor = {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    profileImage: string;
    role: string;
    status: string;
    location: string;
    gender: string;
    createdAt: string;
    updatedAt: string;
};

const PAGE_SIZE = 6;

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
        Input: {
            activeShadow: '0 0 0 2px rgb(17 24 39 / 5%)',
        },
        Select: {
            activeOutlineColor: 'rgb(17 24 39 / 5%)',
        },
        Pagination: {
            itemActiveBg: '#111827',
        },
    },
};

const statusStyles: Record<string, { bg: string; dot: string }> = {
    ACTIVE: { bg: '!bg-green-50 !text-green-600', dot: 'bg-green-500' },
    INACTIVE: { bg: '!bg-gray-100 !text-gray-500', dot: 'bg-gray-400' },
    SUSPENDED: { bg: '!bg-red-50 !text-red-500', dot: 'bg-red-400' },
};

const formatLabel = (value: string) =>
    (value || 'N/A')
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

export default function MentorsPage() {
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const { data: mentorResponse, isLoading, isError } = useGetAllMentorsQuery({});

    const mentors: Mentor[] = useMemo(
        () => mentorResponse?.data ?? [],
        [mentorResponse],
    );

    const statuses = useMemo(
        () => [...new Set(mentors.map((m) => m.status).filter(Boolean))],
        [mentors],
    );

    const filteredMentors = useMemo(() => {
        const query = search.trim().toLowerCase();

        return mentors.filter((mentor) => {
            const matchesSearch =
                !query ||
                [mentor.fullName, mentor.email, mentor.phone, mentor.id, mentor.gender]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(query));

            const matchesStatus =
                statusFilter === 'all' || mentor.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [mentors, search, statusFilter]);

    const totalPages = Math.ceil(filteredMentors.length / PAGE_SIZE);
    const safePage = Math.min(currentPage, Math.max(totalPages, 1));

    const paginatedMentors = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filteredMentors.slice(start, start + PAGE_SIZE);
    }, [filteredMentors, safePage]);

    const handleView = (mentor: Mentor) => {
        router.push(`/mentors/mentor-details?mentorId=${mentor.id}`);
    };

    const columns: ColumnsType<Mentor> = [
        {
            title: 'Mentor',
            key: 'mentor',
            render: (_, mentor) => (
                <Space size={12}>
                    {mentor.profileImage?.trim() ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={mentor.profileImage}
                            alt={mentor.fullName || 'Mentor'}
                            className="h-9 w-9 shrink-0 rounded-xl border border-gray-100 object-cover"
                        />
                    ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                            <MdPerson size={21} />
                        </span>
                    )}

                    <div className="min-w-0">
                        <Tooltip title={mentor.fullName}>
                            <p className="max-w-[170px] truncate text-[13px] font-bold text-gray-900">
                                {mentor.fullName || 'Unnamed Mentor'}
                            </p>
                        </Tooltip>

                        <p className="mt-0.5 max-w-[170px] truncate text-[11px] font-medium text-gray-400">
                            {mentor.id}
                        </p>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_, mentor) => (
                <div className="min-w-0">
                    <p className="max-w-[200px] truncate text-[12px] font-medium text-gray-700">
                        {mentor.email || 'No email'}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-gray-400">
                        {mentor.phone || 'No phone'}
                    </p>
                </div>
            ),
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            width: 100,
            render: (gender: string) => (
                <Text className="!text-[12px] !text-gray-600">{gender || 'N/A'}</Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            render: (status: string) => {
                const style = statusStyles[status] ?? {
                    bg: '!bg-gray-100 !text-gray-500',
                    dot: 'bg-gray-400',
                };

                return (
                    <Tag
                        bordered={false}
                        className={`!mr-0 !rounded-full !px-2.5 !py-1 !text-[11px] !font-bold ${style.bg}`}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                            {formatLabel(status)}
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
            render: (_, mentor) => (
                <Button
                    type="primary"
                    aria-label={`View details of ${mentor.fullName}`}
                    icon={<Eye size={14} />}
                    onClick={() => handleView(mentor)}
                    className="!inline-flex !h-8 !items-center !gap-1.5 !rounded-xl !px-3 !text-[12px] !font-bold"
                >
                    View details
                </Button>
            ),
        },
    ];

    if (isError) {
        return (
            <div className="w-[95%] rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
                <p className="font-semibold text-red-600">Failed to load mentors.</p>
                <p className="mt-1 text-sm text-gray-500">Please try again later.</p>
            </div>
        );
    }

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
                            All Mentors
                        </Title>

                        <Text className="!text-[13px] !font-medium !text-gray-400">
                            Meet our teachers and explore their profiles
                        </Text>
                    </div>

                    <span className="self-start rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-[11px] font-bold text-gray-500 sm:self-auto">
                        {filteredMentors.length} mentor
                        {filteredMentors.length !== 1 ? 's' : ''} found
                    </span>
                </div>

                {/* Search and Filters */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <Input
                            prefix={<LuSearch className="text-gray-400" size={16} />}
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search name, email, phone or ID..."
                            allowClear
                            className="!flex-1"
                        />

                        <Select
                            value={statusFilter}
                            onChange={(value) => {
                                setStatusFilter(value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:!w-[180px]"
                            options={[
                                { value: 'all', label: 'All Statuses' },
                                ...statuses.map((status) => ({
                                    value: status,
                                    label: formatLabel(status),
                                })),
                            ]}
                        />
                    </div>
                </div>

                {/* Mentor Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <Table<Mentor>
                        rowKey="id"
                        columns={columns}
                        dataSource={paginatedMentors}
                        loading={isLoading}
                        pagination={false}
                        size="middle"
                        tableLayout="fixed"
                        locale={{
                            emptyText: (
                                <div className="py-8">
                                    <LuUsers
                                        size={24}
                                        className="mx-auto mb-2 text-gray-300"
                                    />
                                    <p className="text-[13px] font-semibold text-gray-500">
                                        No mentors found
                                    </p>
                                    <p className="mt-1 text-[12px] text-gray-400">
                                        Try changing your search or status filter.
                                    </p>
                                </div>
                            ),
                        }}
                    />

                    {/* Footer and Pagination */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-3.5 sm:flex-row">
                        <p className="text-[11.5px] font-medium text-gray-400">
                            Showing{' '}
                            <span className="font-bold text-gray-700">
                                {filteredMentors.length === 0
                                    ? 0
                                    : (safePage - 1) * PAGE_SIZE + 1}
                                –{Math.min(safePage * PAGE_SIZE, filteredMentors.length)}
                            </span>{' '}
                            of{' '}
                            <span className="font-bold text-gray-700">
                                {filteredMentors.length}
                            </span>{' '}
                            mentors
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Button
                                aria-label="Previous page"
                                icon={<MdKeyboardArrowLeft size={18} />}
                                disabled={safePage <= 1}
                                onClick={() => setCurrentPage((page) => page - 1)}
                                className="!flex !h-8 !w-8 !items-center !justify-center !rounded-lg"
                            />

                            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                                (page) => (
                                    <Button
                                        key={page}
                                        type={safePage === page ? 'primary' : 'default'}
                                        onClick={() => setCurrentPage(page)}
                                        className={`!h-8 !w-8 !rounded-lg !text-[12px] !font-bold ${safePage === page
                                                ? '!border-gray-900 !bg-gray-900'
                                                : '!border-gray-200 !text-gray-500'
                                            }`}
                                    >
                                        {page}
                                    </Button>
                                ),
                            )}

                            <Button
                                aria-label="Next page"
                                icon={<MdKeyboardArrowRight size={18} />}
                                disabled={totalPages === 0 || safePage >= totalPages}
                                onClick={() => setCurrentPage((page) => page + 1)}
                                className="!flex !h-8 !w-8 !items-center !justify-center !rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
}