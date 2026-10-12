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

const { Title, Text } = Typography;

type Course = {
    id: string;
    course_code: number;
    course_name: string;
    category: string;
    price: number;
    status: 'active' | 'inactive';
};

const initialCourses: Course[] = [
    {
        id: '1',
        course_code: 100001,
        course_name: 'Web Development',
        category: 'Programming',
        price: 15000,
        status: 'active',
    },
    {
        id: '2',
        course_code: 100002,
        course_name: 'Graphic Design',
        category: 'Design',
        price: 12000,
        status: 'active',
    },
    {
        id: '3',
        course_code: 100003,
        course_name: 'Digital Marketing',
        category: 'Marketing',
        price: 10000,
        status: 'active',
    },
    {
        id: '4',
        course_code: 100004,
        course_name: 'Motion Graphics',
        category: 'Design',
        price: 14000,
        status: 'inactive',
    },
    {
        id: '5',
        course_code: 100005,
        course_name: 'Data Analysis',
        category: 'Data & Analytics',
        price: 16000,
        status: 'active',
    },
    {
        id: '6',
        course_code: 100006,
        course_name: 'UI/UX Design',
        category: 'Design',
        price: 11000,
        status: 'active',
    },
    {
        id: '7',
        course_code: 100007,
        course_name: 'Python Programming',
        category: 'Programming',
        price: 9000,
        status: 'inactive',
    },
    {
        id: '8',
        course_code: 100008,
        course_name: 'Computer Office Application',
        category: 'Office Applications',
        price: 6000,
        status: 'active',
    },
    {
        id: '9',
        course_code: 100009,
        course_name: 'Cyber Security',
        category: 'IT & Networking',
        price: 18000,
        status: 'active',
    },
    {
        id: '10',
        course_code: 100010,
        course_name: 'Database Management',
        category: 'Programming',
        price: 13000,
        status: 'inactive',
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

const CourseTable = () => {
    const [courses, setCourses] = useState<Course[]>(initialCourses);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [messageApi, contextHolder] = message.useMessage();

    const categories = useMemo(
        () =>
            [...new Set(courses.map((course) => course.category))].sort(),
        [courses],
    );

    const filteredCourses = useMemo(() => {
        const query = search.trim().toLowerCase();

        return courses.filter((course) => {
            const matchesSearch =
                course.course_name.toLowerCase().includes(query) ||
                String(course.course_code).includes(query) ||
                course.category.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === 'all' || course.status === statusFilter;

            const matchesCategory =
                categoryFilter === 'all' ||
                course.category === categoryFilter;

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
        // Connect your edit modal or edit page here.
        messageApi.info(`Edit course: ${ course.course_name } `);
    };

    const handleDelete = (course: Course) => {
        setCourses((previousCourses) =>
            previousCourses.filter((item) => item.id !== course.id),
        );

        messageApi.success(`${ course.course_name } deleted successfully`);

        setCurrentPage((page) => {
            const remaining = filteredCourses.length - 1;
            return Math.max(1, Math.min(page, Math.ceil(remaining / PAGE_SIZE) || 1));
        });
    };

    const columns: ColumnsType<Course> = [
        {
            title: 'Course',
            dataIndex: 'course_name',
            key: 'course_name',
            width: 240,
            render: (_, course) => (
                <Space size={12}>
                    <span className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                        <MdSchool size={16} />
                    </span>

                    <Text
                        strong
                        className="!text-[13px] !text-gray-900 whitespace-nowrap"
                    >
                        {course.course_name}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Course Code',
            dataIndex: 'course_code',
            key: 'course_code',
            width: 130,
            render: (code: number) => (
                <span className="inline-block text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {code}
                </span>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 160,
            render: (category: string) => (
                <Text className="!text-[12px] !text-gray-600 whitespace-nowrap">
                    {category}
                </Text>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price: number) => (
                <Text strong className="!text-[13px] !text-gray-800 whitespace-nowrap">
                    ৳{price.toLocaleString('en-BD')}
                </Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: Course['status']) => (
                <Tag
                    bordered={false}
                    className={`!rounded - full!px - 2.5!py - 1!text - [11px]!font - bold!mr - 0 ${
    status === 'active'
        ? '!bg-emerald-50 !text-emerald-600'
        : '!bg-gray-100 !text-gray-500'
} `}
                >
                    <span className="inline-flex items-center gap-1.5">
                        <span
                            className={`w - 1.5 h - 1.5 rounded - full ${
    status === 'active'
        ? 'bg-emerald-500'
        : 'bg-gray-400'
} `}
                        />
                        {status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                </Tag>
            ),
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
                            aria-label={`Edit ${ course.course_name } `}
                            icon={<Pencil size={16} />}
                            onClick={() => handleEdit(course)}
                            className="!w-9 !h-9 !flex !items-center !justify-center !rounded-lg !text-gray-500 hover:!text-blue-600 hover:!bg-blue-50"
                        />
                    </Tooltip>

                    <Tooltip title="Delete course">
                        <Popconfirm
                            title="Delete this course?"
                            description={`Are you sure you want to delete ${ course.course_name }?`}
                            onConfirm={() => handleDelete(course)}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                type="text"
                                danger
                                aria-label={`Delete ${ course.course_name } `}
                                icon={<Trash2 size={16} />}
                                className="!w-9 !h-9 !flex !items-center !justify-center !rounded-lg hover:!bg-red-50"
                            />
                        </Popconfirm>
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
                            prefix={
                                <LuSearch className="text-gray-400" size={16} />
                            }
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by course name, code or category..."
                            allowClear
                            className="!flex-1"
                        />

                        <Select
                            value={categoryFilter}
                            onChange={(value) => {
                                setCategoryFilter(value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:!w-[180px]"
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
                            className="w-full md:!w-[150px]"
                            options={[
                                { value: 'all', label: 'All Statuses' },
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
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
                                –
                                {Math.min(
                                    safePage * PAGE_SIZE,
                                    filteredCourses.length,
                                )}
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
                                icon={<MdKeyboardArrowRight size={18} />}
                                disabled={
                                    totalPages === 0 || safePage >= totalPages
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

export default CourseTable;