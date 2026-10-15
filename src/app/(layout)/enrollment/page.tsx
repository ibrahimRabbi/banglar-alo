'use client';

import { useMemo, useState } from 'react';
import {Table,Input,Select,Tag,Button,Typography,ConfigProvider,Space} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {MdKeyboardArrowRight,MdKeyboardArrowLeft,MdPerson,MdSchool,MdCalendarMonth,} from 'react-icons/md';
import { LuBookOpen, LuSearch } from 'react-icons/lu';

const { Title, Text } = Typography;

type Enrollment = {
    id: string;
    student_id: string;
    student_name: string;
    course_name: string;
    course_code: number;
    batch_id: string;
    enrollment_date: string;
    status: 'active' | 'completed' | 'dropped' | 'suspended';
};

const fakeEnrollments: Enrollment[] = [
    {
        id: '1',
        student_id: 'STU-10001',
        student_name: 'Rahim Ahmed',
        course_name: 'Web Development',
        course_code: 100001,
        batch_id: 'WD-2026-01',
        enrollment_date: '2026-01-12',
        status: 'active',
    },
    {
        id: '2',
        student_id: 'STU-10002',
        student_name: 'Nusrat Jahan',
        course_name: 'Graphic Design',
        course_code: 100002,

        batch_id: 'GD-2026-01',
        enrollment_date: '2026-01-15',
        status: 'active',
    },
    {
        id: '3',
        student_id: 'STU-10003',
        student_name: 'Tanvir Hasan',
        course_name: 'Digital Marketing',
        course_code: 100003,

        batch_id: 'DM-2025-02',
        enrollment_date: '2025-06-10',
        status: 'completed',
    },
    {
        id: '4',
        student_id: 'STU-10004',
        student_name: 'Sadia Islam',
        course_name: 'Data Analysis',
        course_code: 100005,

        batch_id: 'DA-2026-01',
        enrollment_date: '2026-02-05',
        status: 'active',
    },
    {
        id: '5',
        student_id: 'STU-10005',
        student_name: 'Fahim Chowdhury',
        course_name: 'Python Programming',
        course_code: 100007,

        batch_id: 'PY-2025-01',
        enrollment_date: '2025-03-20',
        status: 'dropped',
    },

];

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
            cellPaddingInline: 20,
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

const statusStyles: Record<
    Enrollment['status'],
    { label: string; className: string; dotClassName: string }
> = {
    active: {
        label: 'Active',
        className: '!bg-emerald-50 !text-emerald-600',
        dotClassName: 'bg-emerald-500',
    },
    completed: {
        label: 'Completed',
        className: '!bg-blue-50 !text-blue-600',
        dotClassName: 'bg-blue-500',
    },
    dropped: {
        label: 'Dropped',
        className: '!bg-red-50 !text-red-600',
        dotClassName: 'bg-red-500',
    },
    suspended: {
        label: 'Suspended',
        className: '!bg-amber-50 !text-amber-600',
        dotClassName: 'bg-amber-500',
    },
};

const EnrollmentTable = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const courses = useMemo(() =>
        [...new Set(fakeEnrollments.map((item) => item.course_name))].sort(),
        [],);

    const filteredEnrollments = useMemo(() => {
        const query = search.trim().toLowerCase();

        return fakeEnrollments.filter((item) => {
            const matchesSearch = [
                item.student_id,
                item.student_name,
                item.course_name,
                String(item.course_code),

                item.batch_id,
            ].some((value) => value.toLowerCase().includes(query));

            const matchesStatus =
                statusFilter === 'all' || item.status === statusFilter;

            const matchesCourse =
                courseFilter === 'all' || item.course_name === courseFilter;

            return matchesSearch && matchesStatus && matchesCourse;
        });
    }, [search, statusFilter, courseFilter]);

    const totalPages = Math.ceil(filteredEnrollments.length / PAGE_SIZE);

    // Keep pagination valid when filtering reduces the result count.
    const safePage = Math.min(currentPage, Math.max(totalPages, 1));

    const paginatedEnrollments = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filteredEnrollments.slice(start, start + PAGE_SIZE);
    }, [filteredEnrollments, safePage]);

    const columns: ColumnsType<Enrollment> = [
        {
            title: 'Student',
            dataIndex: 'student_name',
            key: 'student_name',
            width: '35%',
            render: (_, enrollment) => (
                <Space size={12}>
                    <span className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                        <MdPerson size={18} />
                    </span>
                    <div className="min-w-0">
                        <Text
                            strong
                            className="!text-[13px] !text-gray-900 block whitespace-nowrap"
                        >
                            {enrollment.student_name}
                        </Text>
                        <Text className="!text-[11px] !text-gray-400">
                            {enrollment.student_id}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Course',
            dataIndex: 'course_name',
            key: 'course_name',
            width: '25%',
            render: (_, enrollment) => (
                <div>
                    <Text className="!text-[12px] !text-gray-800 block whitespace-nowrap">
                        {enrollment.course_name}
                    </Text>
                    <Text className="!text-[11px] !text-gray-400">
                        Code: {enrollment.course_code}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Batch',
            dataIndex: 'batch_id',
            key: 'batch_id',
            width: '20%',
            render: (batch: string) => (
                <span className="inline-block text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {batch}
                </span>
            ),
        },
        {
            title: 'Enrollment Date',
            dataIndex: 'enrollment_date',
            key: 'enrollment_date',
            width: '20%',
            render: (date: string) => (
                <Space size={6}>
                    <MdCalendarMonth className="text-gray-400" size={15} />
                    <Text className="!text-[12px] !text-gray-500 whitespace-nowrap">
                        {new Date(`${date} T00:00:00`).toLocaleDateString(
                            'en-GB',
                            {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            },
                        )}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '18%',
            render: (status: Enrollment['status']) => {
                const style = statusStyles[status];

                return (
                    <Tag
                        bordered={false}
                        className={`!rounded - full!px - 2.5!py - 1!text - [11px]!font - bold!mr - 0 ${style.className} `}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <span
                                className={`w - 1.5 h - 1.5 rounded - full ${style.dotClassName} `}
                            />
                            {style.label}
                        </span>
                    </Tag>
                );
            },
        },
    ];

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="w-[90%] space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-10">
                    <div>
                        <Title
                            level={1}
                            className="!text-[22px] !font-extrabold !text-gray-900 !tracking-tight !mb-1">
                            All Enrollments
                        </Title>

                        <Text className="!text-[13px] !text-gray-400 !font-medium">
                            Manage student course enrollments and their current status
                        </Text>
                    </div>

                    <span className="self-start sm:self-auto text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                        {filteredEnrollments.length} enrollment
                        {filteredEnrollments.length !== 1 ? 's' : ''} found
                    </span>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(
                        [
                            {
                                label: 'Total Enrollments',
                                value: fakeEnrollments.length,
                                icon: <MdSchool size={20} />,
                                color: 'bg-gray-900 text-white',
                            },
                            {
                                label: 'Active',
                                value: fakeEnrollments.filter(
                                    (item) => item.status === 'active',
                                ).length,
                                icon: <MdPerson size={20} />,
                                color: 'bg-emerald-50 text-emerald-600',
                            },
                            {
                                label: 'Completed',
                                value: fakeEnrollments.filter(
                                    (item) => item.status === 'completed',
                                ).length,
                                icon: <LuBookOpen size={20} />,
                                color: 'bg-blue-50 text-blue-600',
                            },
                            {
                                label: 'Dropped / Suspended',
                                value: fakeEnrollments.filter(
                                    (item) =>
                                        item.status === 'dropped' ||
                                        item.status === 'suspended',
                                ).length,
                                icon: <MdCalendarMonth size={20} />,
                                color: 'bg-amber-50 text-amber-600',
                            },
                        ] as const
                    ).map((card) => (
                        <div
                            key={card.label}
                            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3"
                        >
                            <span
                                className={`w - 11 h - 11 rounded - xl flex items - center justify - center shrink - 0 ${card.color} `}
                            >
                                {card.icon}
                            </span>
                            <div>
                                <Text className="!text-[11px] !text-gray-400 block">
                                    {card.label}
                                </Text>
                                <Title
                                    level={4}
                                    className="!text-xl !font-extrabold !text-gray-900 !mb-0 !mt-1"
                                >
                                    {card.value}
                                </Title>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search and Filters */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <Input
                            prefix={
                                <LuSearch className="text-gray-400" size={16} />
                            }
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search student, ID, course, batch..."
                            allowClear
                            className="!flex-1"
                        />

                        <Select
                            value={courseFilter}
                            onChange={(value) => {
                                setCourseFilter(value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:!w-[210px]"
                            options={[
                                { value: 'all', label: 'All Courses' },
                                ...courses.map((course) => ({
                                    value: course,
                                    label: course,
                                })),
                            ]}
                            showSearch
                            optionFilterProp="label"
                        />

                        <Select
                            value={statusFilter}
                            onChange={(value) => {
                                setStatusFilter(value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:!w-[160px]"
                            options={[
                                { value: 'all', label: 'All Statuses' },
                                { value: 'active', label: 'Active' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'dropped', label: 'Dropped' },
                                { value: 'suspended', label: 'Suspended' },
                            ]}
                        />
                    </div>
                </div>

                {/* Enrollment Table */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <Table<Enrollment>
                        rowKey="id"
                        columns={columns}
                        dataSource={paginatedEnrollments}
                        pagination={false}
                        size="middle"
                        tableLayout="fixed"
                        locale={{
                            emptyText: (
                                <div className="py-8">
                                    <LuBookOpen
                                        size={24}
                                        className="mx-auto mb-2 text-gray-300"
                                    />
                                    <p className="text-[13px] text-gray-500 font-semibold">
                                        No enrollments found
                                    </p>
                                    <p className="text-[12px] text-gray-400 mt-1">
                                        Try changing your search or filters.
                                    </p>
                                </div>
                            ),
                        }}
                    />

                    {/* Footer and Pagination */}
                    <div className="border-t border-gray-100 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-[11.5px] text-gray-400 font-medium">
                            Showing{' '}
                            <span className="text-gray-700 font-bold">
                                {filteredEnrollments.length === 0
                                    ? 0
                                    : (safePage - 1) * PAGE_SIZE + 1}
                                –
                                {Math.min(
                                    safePage * PAGE_SIZE,
                                    filteredEnrollments.length,
                                )}
                            </span>{' '}
                            of{' '}
                            <span className="text-gray-700 font-bold">
                                {filteredEnrollments.length}
                            </span>{' '}
                            enrollments
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Button
                                aria-label="Previous page"
                                icon={<MdKeyboardArrowLeft size={18} />}
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
                                    onClick={() => setCurrentPage(page)}
                                    className={`!w - 8!h - 8!rounded - lg!text - [12px]!font - bold ${safePage === page
                                        ? '!bg-gray-900 !border-gray-900'
                                        : '!text-gray-500 !border-gray-200'
                                        } `}
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                aria-label="Next page"
                                icon={<MdKeyboardArrowRight size={18} />}
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
        </ConfigProvider>
    );
};

export default EnrollmentTable;
