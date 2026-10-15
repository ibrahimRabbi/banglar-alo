

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
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

import { useGetAllStudentsQuery } from '@/redux/features/student/studentApi';

const { Title, Text } = Typography;

type Student = {
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
    ACTIVE: {
        bg: '!bg-green-50 !text-green-600',
        dot: 'bg-green-500',
    },
    INACTIVE: {
        bg: '!bg-gray-100 !text-gray-500',
        dot: 'bg-gray-400',
    },
    SUSPENDED: {
        bg: '!bg-red-50 !text-red-500',
        dot: 'bg-red-400',
    },
};

const formatLabel = (value: string) =>
    (value || 'N/A')
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

export default function StudentTable() {
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [deletedIds, setDeletedIds] = useState<string[]>([]);

    const {
        data: studentResponse,
        isLoading,
        refetch,
    } = useGetAllStudentsQuery({});

    const students: Student[] = useMemo(
        () =>
            (studentResponse?.data ?? []).filter(
                (student: Student) => !deletedIds.includes(student.id),
            ),
        [studentResponse, deletedIds],
    );

    const statuses = useMemo(
        () => [
            ...new Set(
                students
                    .map((student) => student.status)
                    .filter(Boolean),
            ),
        ],
        [students],
    );

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();

        return students.filter((student) => {
            const matchesSearch =
                !query ||
                [
                    student.fullName,
                    student.email,
                    student.phone,
                    student.role,
                    student.id,
                    student.location,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value).toLowerCase().includes(query),
                    );

            const matchesStatus =
                statusFilter === 'all' ||
                student.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [students, search, statusFilter]);

    const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
    const safePage = Math.min(currentPage, Math.max(totalPages, 1));

    const paginatedStudents = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;

        return filteredStudents.slice(start, start + PAGE_SIZE);
    }, [filteredStudents, safePage]);

    const handleEdit = (student: Student) => {
        router.push(
            `/ students / update - student ? studentId = ${ student.id } `,
        );
    };

    // UI-only delete for now. Connect your delete API here later.
    const handleDelete = async (student: Student) => {
        const result = await Swal.fire({
            title: 'Remove this student?',
            html: `< b > ${ student.fullName }</ > will be removed from this table.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            reverseButtons: true,
            focusCancel: true,
        });

        if (result.isConfirmed) {
            setDeletedIds((previous) => [...previous, student.id]);

            await Swal.fire({
                title: 'Removed!',
                text: `${ student.fullName } was removed from this view.`,
                icon: 'success',
                timer: 1400,
                showConfirmButton: false,
            });
        }
    };

    const columns: ColumnsType<Student> = [
        {
            title: 'Student',
            key: 'student',
            width: 260,
            render: (_, student) => (
                <Space size={12}>
                    {student.profileImage?.trim() ? (
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
                        <Tooltip title={student.fullName}>
                            <p className="max-w-[200px] truncate text-[13px] font-bold text-gray-900">
                                {student.fullName || 'Unnamed Student'}
                            </p>
                        </Tooltip>

                        <p className="mt-0.5 max-w-[200px] truncate text-[11px] font-medium text-gray-400">
                            {student.id}
                        </p>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Contact',
            key: 'contact',
            width: 230,
            render: (_, student) => (
                <div>
                    <p className="whitespace-nowrap text-[12px] font-medium text-gray-700">
                        {student.email || 'No email'}
                    </p>
                    <p className="mt-0.5 whitespace-nowrap text-[11px] font-medium text-gray-400">
                        {student.phone || 'No phone'}
                    </p>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: 110,
            render: (role: string) => (
                <span className="inline-block whitespace-nowrap rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-[12px] font-bold text-gray-500">
                    {formatLabel(role)}
                </span>
            ),
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            width: 100,
            render: (gender: string) => (
                <Text className="!text-[12px] !text-gray-600">
                    {gender || 'N/A'}
                </Text>
            ),
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            width: 160,
            render: (location: string) => (
                <span className="text-[12px] font-medium text-gray-500">
                    {location || 'Not provided'}
                </span>
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
                        className={`!mr - 0!rounded - full!px - 2.5!py - 1!text - [11px]!font - bold ${ style.bg } `}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <span
                                className={`h - 1.5 w - 1.5 rounded - full ${ style.dot } `}
                            />
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
            render: (_, student) => (
                <Space size={6}>
                    <Tooltip title="Edit student">
                        <Button
                            type="text"
                            aria-label={`Edit ${ student.fullName } `}
                            icon={<Pencil size={16} />}
                            onClick={() => handleEdit(student)}
                            className="!flex !h-9 !w-9 !items-center !justify-center !rounded-lg !text-gray-500 hover:!bg-blue-50 hover:!text-blue-600"
                        />
                    </Tooltip>

                    <Tooltip title="Remove student from view">
                        <Button
                            type="text"
                            danger
                            aria-label={`Remove ${ student.fullName } `}
                            icon={<Trash2 size={16} />}
                            onClick={() => handleDelete(student)}
                            className="!flex !h-9 !w-9 !items-center !justify-center !rounded-lg hover:!bg-red-50"
                        />
                    </Tooltip>
                </Space>
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
                            All Students
                        </Title>

                        <Text className="!text-[13px] !font-medium !text-gray-400">
                            Manage student profiles and account status
                        </Text>
                    </div>

                    <span className="self-start rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-[11px] font-bold text-gray-500 sm:self-auto">
                        {filteredStudents.length} student
                        {filteredStudents.length !== 1 ? 's' : ''} found
                    </span>
                </div>

                {/* Search and Filters */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="flex flex-col gap-3 md:flex-row">
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

                {/* Student Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <Table<Student>
                        rowKey="id"
                        columns={columns}
                        dataSource={paginatedStudents}
                        loading={isLoading}
                        pagination={false}
                        size="middle"
                        scroll={{ x: 'max-content' }}
                        locale={{
                            emptyText: (
                                <div className="py-8">
                                    <LuUsers
                                        size={24}
                                        className="mx-auto mb-2 text-gray-300"
                                    />
                                    <p className="text-[13px] font-semibold text-gray-500">
                                        No students found
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
                                {filteredStudents.length === 0
                                    ? 0
                                    : (safePage - 1) * PAGE_SIZE + 1}
                                –
                                {Math.min(
                                    safePage * PAGE_SIZE,
                                    filteredStudents.length,
                                )}
                            </span>{' '}
                            of{' '}
                            <span className="font-bold text-gray-700">
                                {filteredStudents.length}
                            </span>{' '}
                            students
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Button
                                aria-label="Previous page"
                                icon={<MdKeyboardArrowLeft size={18} />}
                                disabled={safePage <= 1}
                                onClick={() =>
                                    setCurrentPage((page) => page - 1)
                                }
                                className="!flex !h-8 !w-8 !items-center !justify-center !rounded-lg"
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
                                    className={`!h - 8!w - 8!rounded - lg!text - [12px]!font - bold ${
    safePage === page
        ? '!border-gray-900 !bg-gray-900'
        : '!border-gray-200 !text-gray-500'
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
                                className="!flex !h-8 !w-8 !items-center !justify-center !rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
}
