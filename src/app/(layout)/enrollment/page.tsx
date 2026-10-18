'use client';

import { useEffect, useMemo, useState } from 'react';
import {Table,Input,Tag,Button,Typography,ConfigProvider,Space,Tooltip,} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {MdKeyboardArrowRight,MdKeyboardArrowLeft,MdPerson,MdSchool,MdCalendarMonth} from 'react-icons/md';
import { LuBookOpen, LuSearch, LuLayers } from 'react-icons/lu';

import { useGetAllEnrollmentQuery } from '@/redux/features/enrollment/enrollApi';  
const { Title, Text } = Typography;

 

type Enrollment = {
    enrollmentId: string;
    enrolledAt: string;
    student: {
        id: string;
        fullName: string;
        email: string;
        phone: string;
        profileImage: string;
    };
    course: {
        id: string;
        title: string;
        batch: string;
        slug: string;
        status: string; // UPCOMING, IN_PROGRESS, COMPLETED ...
        classType: string; // ONLINE, OFFLINE
    };
};

const PAGE_SIZE = 10;

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
            cellPaddingInline: 20,
        },
        Input: { activeShadow: '0 0 0 2px rgb(17 24 39 / 5%)' },
        Pagination: { itemActiveBg: '#111827' },
    },
};

// course status pill colors (unknown status falls back to gray)
const statusStyles: Record<string, { className: string; dotClassName: string }> = {
    UPCOMING: { className: '!bg-blue-50 !text-blue-600', dotClassName: 'bg-blue-500' },
    IN_PROGRESS: { className: '!bg-emerald-50 !text-emerald-600', dotClassName: 'bg-emerald-500' },
    LIVE: { className: '!bg-emerald-50 !text-emerald-600', dotClassName: 'bg-emerald-500' },
    COMPLETED: { className: '!bg-gray-100 !text-gray-500', dotClassName: 'bg-gray-400' },
    CANCELLED: { className: '!bg-red-50 !text-red-600', dotClassName: 'bg-red-500' },
};

const formatLabel = (value?: string) =>
    (value || 'N/A')
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

// waits a bit after typing before the value is sent to the API
function useDebounce<T>(value: T, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

/* =============================================================
   PAGE
============================================================= */

const EnrollmentTable = () => {
    const [titleInput, setTitleInput] = useState('');
    const [batchInput, setBatchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const title = useDebounce(titleInput.trim());
    const batch = useDebounce(batchInput.trim());

    // empty filters are sent as undefined, so they are left out of the URL
    const { data, isFetching, isError } = useGetAllEnrollmentQuery({
        page: currentPage,
        limit: PAGE_SIZE,
        title: title || undefined,
        batch: batch || undefined,
    });

    const enrollments: Enrollment[] = useMemo(() => data?.data ?? [], [data]);
    const total: number = data?.meta?.total ?? 0;
    const totalPages: number = data?.meta?.totalPage ?? 0;
    const safePage = Math.min(currentPage, Math.max(totalPages, 1));

    // `stats` is empty in the API, so these counts are for the current page only
    const pageStats = useMemo(
        () => ({
            upcoming: enrollments.filter((e) => e.course?.status === 'UPCOMING').length,
            inProgress: enrollments.filter((e) =>
                ['IN_PROGRESS', 'LIVE'].includes(e.course?.status),
            ).length,
            online: enrollments.filter((e) => e.course?.classType === 'ONLINE').length,
        }),
        [enrollments],
    );

    const hasFilter = !!(title || batch);

    const clearFilters = () => {
        setTitleInput('');
        setBatchInput('');
        setCurrentPage(1);
    };

    /* ---------- columns ---------- */

    const columns: ColumnsType<Enrollment> = [
        {
            title: 'Student',
            key: 'student',
            width: '30%',
            render: (_, { student }) => (
                <Space size={12}>
                    {student?.profileImage?.trim() ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={student.profileImage}
                            alt={student.fullName || 'Student'}
                            className="h-9 w-9 shrink-0 rounded-xl border border-gray-100 object-cover"
                        />
                    ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                            <MdPerson size={21} />
                        </span>
                    )}

                    <div className="min-w-0">
                        <Tooltip title={student?.fullName}>
                            <p className="max-w-[170px] truncate text-[13px] font-bold text-gray-900">
                                {student?.fullName || 'Unnamed Student'}
                            </p>
                        </Tooltip>
                        <p className="mt-0.5 max-w-[170px] truncate text-[11px] font-medium text-gray-400">
                            {student?.email || 'No email'}
                        </p>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Course',
            key: 'course',
            width: '24%',
            render: (_, { course }) => (
                <div className="min-w-0">
                    <Tooltip title={course?.title}>
                        <p className="max-w-[190px] truncate text-[12px] font-bold text-gray-800">
                            {course?.title || 'N/A'}
                        </p>
                    </Tooltip>
                    <p className="mt-0.5 text-[11px] font-medium text-gray-400">
                        {formatLabel(course?.classType)}
                    </p>
                </div>
            ),
        },
        {
            title: 'Batch',
            key: 'batch',
            width: '14%',
            render: (_, { course }) => (
                <span className="inline-block whitespace-nowrap rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-[11px] font-bold text-gray-500">
                    {course?.batch || 'N/A'}
                </span>
            ),
        },
        {
            title: 'Enrolled On',
            dataIndex: 'enrolledAt',
            key: 'enrolledAt',
            width: '16%',
            render: (date: string) => (
                <Space size={6}>
                    <MdCalendarMonth className="text-gray-400" size={15} />
                    <Text className="!text-[12px] !text-gray-500 whitespace-nowrap">
                        {date
                            ? new Date(date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })
                            : 'N/A'}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Course Status',
            key: 'status',
            width: '16%',
            render: (_, { course }) => {
                const style = statusStyles[course?.status] ?? {
                    className: '!bg-gray-100 !text-gray-500',
                    dotClassName: 'bg-gray-400',
                };

                return (
                    <Tag
                        bordered={false}
                        className={`!mr-0 !rounded-full !px-2.5 !py-1 !text-[11px] !font-bold ${style.className}`}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${style.dotClassName}`} />
                            {formatLabel(course?.status)}
                        </span>
                    </Tag>
                );
            },
        },
    ];

    /* ---------- summary cards ---------- */

    const cards = [
        {
            label: 'Total Enrollments',
            value: total,
            icon: <MdSchool size={20} />,
            color: 'bg-gray-900 text-white',
        },
        {
            label: 'Upcoming (this page)',
            value: pageStats.upcoming,
            icon: <MdCalendarMonth size={20} />,
            color: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'In progress (this page)',
            value: pageStats.inProgress,
            icon: <LuBookOpen size={20} />,
            color: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Online (this page)',
            value: pageStats.online,
            icon: <MdPerson size={20} />,
            color: 'bg-amber-50 text-amber-600',
        },
    ];

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="w-[90%] space-y-5">
                {/* Header */}
                <div className="my-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Title
                            level={1}
                            className="!mb-1 !text-[22px] !font-extrabold !tracking-tight !text-gray-900"
                        >
                            All Enrollments
                        </Title>
                        <Text className="!text-[13px] !font-medium !text-gray-400">
                            Manage student course enrollments
                        </Text>
                    </div>

                    <span className="self-start rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-[11px] font-bold text-gray-500 sm:self-auto">
                        {total} enrollment{total !== 1 ? 's' : ''} found
                    </span>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <div
                            key={card.label}
                            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4"
                        >
                            <span
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.color}`}
                            >
                                {card.icon}
                            </span>
                            <div>
                                <Text className="block !text-[11px] !text-gray-400">{card.label}</Text>
                                <Title
                                    level={4}
                                    className="!mb-0 !mt-1 !text-xl !font-extrabold !text-gray-900"
                                >
                                    {card.value}
                                </Title>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <Input
                            prefix={<LuSearch className="text-gray-400" size={16} />}
                            value={titleInput}
                            onChange={(e) => {
                                setTitleInput(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Filter by course title..."
                            allowClear
                            className="!flex-1"
                        />

                        <Input
                            prefix={<LuLayers className="text-gray-400" size={16} />}
                            value={batchInput}
                            onChange={(e) => {
                                setBatchInput(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Filter by batch (e.g. Batch 1)"
                            allowClear
                            className="w-full md:!w-[240px]"
                        />

                        {hasFilter && (
                            <Button
                                onClick={clearFilters}
                                className="!rounded-xl !text-[12px] !font-bold !text-gray-500"
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                </div>

                {isError && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-[12px] font-medium text-red-500">
                        Failed to load enrollments. Please try again.
                    </div>
                )}

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <Table<Enrollment>
                        rowKey="enrollmentId"
                        columns={columns}
                        dataSource={enrollments}
                        loading={isFetching}
                        pagination={false}
                        size="middle"
                        tableLayout="fixed"
                        locale={{
                            emptyText: (
                                <div className="py-8">
                                    <LuBookOpen size={24} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-[13px] font-semibold text-gray-500">
                                        No enrollments found
                                    </p>
                                    <p className="mt-1 text-[12px] text-gray-400">
                                        {hasFilter
                                            ? 'Try changing your title or batch filter.'
                                            : 'Enrollments will appear here.'}
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
                                {total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
                                –{Math.min(safePage * PAGE_SIZE, total)}
                            </span>{' '}
                            of <span className="font-bold text-gray-700">{total}</span> enrollments
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Button
                                aria-label="Previous page"
                                icon={<MdKeyboardArrowLeft size={18} />}
                                disabled={safePage <= 1 || isFetching}
                                onClick={() => setCurrentPage((p) => p - 1)}
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
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="!flex !h-8 !w-8 !items-center !justify-center !rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default EnrollmentTable;