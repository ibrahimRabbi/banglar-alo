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
    Popconfirm,
    Tooltip,
    message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    MdSchool,
    MdKeyboardArrowRight,
    MdKeyboardArrowLeft,
} from 'react-icons/md';
import { LuBookOpen, LuSearch } from 'react-icons/lu';
import { Pencil, Trash2 } from 'lucide-react';
import { useDeleteCourseMutation, useGetAllCoursesQuery } from '@/redux/features/course/courseApi';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;

type Course = {
    id: string;
    title: string;
    batch: string;
    slug: string;
    category: string;
    description: string;
    thumbnail: string;
    status: string; // UPCOMING, IN_PROGRESS, COMPLETED ...
    classType: string; // ONLINE, OFFLINE ...
    enrollmentStartDate: string;
    enrollmentEndDate: string;
    classStartDate: string;
    classDuration: string;
    venue: string;
    capacity: number;
    price: number;
    enrolledCount: number;
    seatsLeft: number;
    createdAt: string;
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

// status pill colors (unknown status falls back to gray)
const statusStyles: Record<string, { bg: string; dot: string }> = {
    UPCOMING: { bg: '!bg-blue-50 !text-blue-600', dot: 'bg-blue-500' },
    IN_PROGRESS: { bg: '!bg-emerald-50 !text-emerald-600', dot: 'bg-emerald-500' },
    LIVE: { bg: '!bg-emerald-50 !text-emerald-600', dot: 'bg-emerald-500' },
    COMPLETED: { bg: '!bg-gray-100 !text-gray-500', dot: 'bg-gray-400' },
    CANCELLED: { bg: '!bg-red-50 !text-red-500', dot: 'bg-red-400' },
};

// UPCOMING -> Upcoming, IN_PROGRESS -> In Progress
const formatLabel = (s: string) =>
    (s || '')
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

const CourseTable = () => {
    const [deletedIds, setDeletedIds] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();
    const { data: allCourses, isLoading, refetch } = useGetAllCoursesQuery({});
    const [deleteCourse] = useDeleteCourseMutation();

    const courses: Course[] = useMemo(
        () =>
            (allCourses?.data ?? []).filter(
                (c: Course) => !deletedIds.includes(c.id),
            ),
        [allCourses, deletedIds],
    );

    const categories = useMemo(
        () => [...new Set(courses.map((c) => c.category).filter(Boolean))].sort(),
        [courses],
    );

    const statuses = useMemo(
        () => [...new Set(courses.map((c) => c.status).filter(Boolean))],
        [courses],
    );

    const filteredCourses = useMemo(() => {
        const query = search.trim().toLowerCase();

        return courses.filter((course) => {
            const matchesSearch =
                !query ||
                [course.title, course.batch, course.category, course.slug]
                    .filter(Boolean)
                    .some((v) => v.toLowerCase().includes(query));

            const matchesStatus =
                statusFilter === 'all' || course.status === statusFilter;

            const matchesCategory =
                categoryFilter === 'all' || course.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [courses, search, statusFilter, categoryFilter]);

    const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE);
    const safePage = Math.min(currentPage, Math.max(totalPages, 1));

    const paginatedCourses = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filteredCourses.slice(start, start + PAGE_SIZE);
    }, [filteredCourses, safePage]);

    const handleEdit = (course: Course) => {
        router.push('/courses/update-course?courseId=' + course.id);
    };


    const handleDelete = async (course: Course) => {
        const result = await Swal.fire({
            title: 'Delete this course?',
            html: `<b>${course.title}</b> (${course.batch}) will be deleted. This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            reverseButtons: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
            // confirm click korle dialog er bhitorei loader dekhay, API sesh hole bondho hoy
            preConfirm: async () => {
                try {
                    return await deleteCourse(course.id).unwrap();
                } catch (error: any) {
                    Swal.showValidationMessage(
                        error?.data?.message || 'Failed to delete course'
                    );
                }
            },
        });

        if (result.isConfirmed) {
            refetch(); 
            await Swal.fire({
                title: 'Deleted!',
                text: `${course.title} has been deleted.`,
                icon: 'success',
                timer: 1600,
                showConfirmButton: false,
            });
        }
    };


    const columns: ColumnsType<Course> = [
        {
            title: 'Course',
            dataIndex: 'title',
            key: 'title',
            width: 280,
            render: (_, course) => (
                <Space size={12}>
                    {course.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-9 h-9 rounded-xl object-cover shrink-0 border border-gray-100"
                        />
                    ) : (
                        <span className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                            <MdSchool size={16} />
                        </span>
                    )}

                    <div className="min-w-0">
                        <Tooltip title={course.title}>
                            <p className="text-[13px] font-bold text-gray-900 max-w-[210px] truncate">
                                {course.title}
                            </p>
                        </Tooltip>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5 whitespace-nowrap">
                            {course.batch}
                        </p>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 190,
            render: (category: string) => (
                <Text className="!text-[12px] !text-gray-600">{category}</Text>
            ),
        },
        {
            title: 'Class Type',
            dataIndex: 'classType',
            key: 'classType',
            width: 120,
            render: (type: string) => (
                <span className="inline-block text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {formatLabel(type)}
                </span>
            ),
        },
        {
            title: 'Class Start',
            key: 'classStartDate',
            width: 140,
            render: (_, course) => (
                <div>
                    <p className="text-[12px] font-semibold text-gray-700 whitespace-nowrap">
                        {course.classStartDate || 'N/A'}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5 whitespace-nowrap">
                        {course.classDuration}
                    </p>
                </div>
            ),
        },
        {
            title: 'Seats',
            key: 'seats',
            width: 110,
            render: (_, course) => (
                <div>
                    <p className="text-[12px] font-bold text-gray-800 whitespace-nowrap">
                        {course.enrolledCount} / {course.capacity}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5 whitespace-nowrap">
                        {course.seatsLeft} left
                    </p>
                </div>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 110,
            render: (price: number) => (
                <Text strong className="!text-[13px] !text-gray-800 whitespace-nowrap">
                    ৳{(price ?? 0).toLocaleString('en-BD')}
                </Text>
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
                        className={`!rounded-full !px-2.5 !py-1 !text-[11px] !font-bold !mr-0 ${style.bg}`}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {formatLabel(status)}
                        </span>
                    </Tag>
                );
            },
        },
        {
            title: 'Action',
            key: 'action',
            width: 110,
            align: 'center',
            render: (_, course) => (
                <Space size={6}>
                    <Tooltip title="Edit course">
                        <Button
                            type="text"
                            aria-label={`Edit ${course.title}`}
                            icon={<Pencil size={16} />}
                            onClick={() => handleEdit(course)}
                            className="!w-9 !h-9 !flex !items-center !justify-center !rounded-lg !text-gray-500 hover:!text-blue-600 hover:!bg-blue-50"
                        />
                    </Tooltip>
                    <Tooltip title="Delete course">
                        <Button
                            type="text"
                            danger
                            onClick={() => handleDelete(course)}
                            aria-label={`Delete ${course.title}`}
                            icon={<Trash2 size={16} />}
                            className="!w-9 !h-9 !flex !items-center !justify-center !rounded-lg hover:!bg-red-50"/>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <ConfigProvider theme={antdTheme}>
            {contextHolder}

            <div className="w-[95%] space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-10">
                    <div>
                        <Title
                            level={1}
                            className="!text-[22px] !font-extrabold !text-gray-900 !tracking-tight !mb-1"
                        >
                            All Courses
                        </Title>

                        <Text className="!text-[13px] !text-gray-400 !font-medium">
                            Manage courses, pricing, and current status
                        </Text>
                    </div>

                    <span className="self-start sm:self-auto text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                        {filteredCourses.length} course
                        {filteredCourses.length !== 1 ? 's' : ''} found
                    </span>
                </div>

                {/* Search and Filters */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <Input
                            prefix={<LuSearch className="text-gray-400" size={16} />}
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by course title, batch or category..."
                            allowClear
                            className="!flex-1"
                        />

                        <Select
                            value={categoryFilter}
                            onChange={(value) => {
                                setCategoryFilter(value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:!w-[200px]"
                            options={[
                                { value: 'all', label: 'All Categories' },
                                ...categories.map((category) => ({
                                    value: category,
                                    label: category,
                                })),
                            ]}
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
                                ...statuses.map((s) => ({
                                    value: s,
                                    label: formatLabel(s),
                                })),
                            ]}
                        />
                    </div>
                </div>

                {/* Course Table */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <Table<Course>
                        rowKey="id"
                        columns={columns}
                        dataSource={paginatedCourses}
                        loading={isLoading}
                        pagination={false}
                        size="middle"
                        scroll={{ x: 'max-content' }}
                        locale={{
                            emptyText: (
                                <div className="py-8">
                                    <LuBookOpen
                                        size={24}
                                        className="mx-auto mb-2 text-gray-300"
                                    />
                                    <p className="text-[13px] text-gray-500 font-semibold">
                                        No courses found
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
                                {filteredCourses.length === 0
                                    ? 0
                                    : (safePage - 1) * PAGE_SIZE + 1}
                                –{Math.min(safePage * PAGE_SIZE, filteredCourses.length)}
                            </span>{' '}
                            of{' '}
                            <span className="text-gray-700 font-bold">
                                {filteredCourses.length}
                            </span>{' '}
                            courses
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Button
                                aria-label="Previous page"
                                icon={<MdKeyboardArrowLeft size={18} />}
                                disabled={safePage <= 1}
                                onClick={() => setCurrentPage((page) => page - 1)}
                                className="!w-8 !h-8 !flex !items-center !justify-center !rounded-lg"
                            />

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (page) => (
                                    <Button
                                        key={page}
                                        type={safePage === page ? 'primary' : 'default'}
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
                                disabled={totalPages === 0 || safePage >= totalPages}
                                onClick={() => setCurrentPage((page) => page + 1)}
                                className="!w-8 !h-8 !flex !items-center !justify-center !rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default CourseTable;