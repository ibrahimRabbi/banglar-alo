'use client';

import React, { useMemo, useState } from 'react';
import { Table, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdSchool, MdSearch } from 'react-icons/md';
import { useGetAllStudentsQuery } from '@/redux/features/student/studentApi'; // <- adjust path
import { useGetAllcenterQuery } from '@/redux/features/center/centerApi';
import Image from 'next/image';

/* =============================================================
   TYPES
============================================================= */

interface StudentCenter {
    _id: string;
    center_id: string;
    center_name?: string;
    division: string;
    district: string;
    sub_area: string;
}

interface Student {
    _id: string;
    student_id: string;
    course_id: { _id: string; course_name: string; course_code: number } | string | null;
    batch_id: any;  
    center_id: StudentCenter | string | null;
    enrollment_date: string;
    name: string;
    image?: string;
    email: string;
    phone: string;
    status: string;
}

interface TCenter {
    _id: string;
    center_id: string;
    center_name: string;
    division: string;
    district: string;
    sub_area: string;
}

const PAGE_SIZE = 20;
const avatarUrl = (seed: string) => `https://i.pravatar.cc/150?u=${seed}`;
const getStudentImage = (s: Student) => s.image || avatarUrl(s._id);
const getCenterKey = (s: Student) =>
    s.center_id && typeof s.center_id === 'object' ? s.center_id._id : (s.center_id as string | null);
const DUMMY_BATCH = 'Batch 01';
const getBatchLabel = (s: Student) =>
    s.batch_id && typeof s.batch_id === 'object' && s.batch_id.batch_name
        ? s.batch_id.batch_name
        : DUMMY_BATCH;

const getCourseName = (s: Student) =>
    s.course_id && typeof s.course_id === 'object' ? s.course_id.course_name : 'N/A';



const statusStyles: Record<string, string> = {
    active: 'bg-blue-50 text-blue-600',
    enrolled: 'bg-blue-50 text-blue-600',
    completed: 'bg-green-50 text-green-600',
    dropped: 'bg-red-50 text-red-500',
    inactive: 'bg-gray-100 text-gray-500',
};

function StatusPill({ status }: { status: string }) {
    const key = (status || '').toLowerCase();
    return (
        <span
            className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${statusStyles[key] ?? 'bg-gray-100 text-gray-500'
                }`}
        >
            {status || 'N/A'}
        </span>
    );
}

 

function SearchBar({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="relative shrink-0 w-full sm:w-72">
            <MdSearch
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search name, ID, email, phone, center..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-[12.5px] font-bold text-gray-700 placeholder:font-medium placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
            />
        </div>
    );
}



function PageHeader({
    title,
    subtitle,
    search,
    onSearchChange,
}: {
    title: string;
    subtitle: React.ReactNode;
    search: string;
    onSearchChange: (value: string) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
                <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">{title}</h1>
                <p className="text-[13px] text-gray-400 font-medium mt-1 flex items-center gap-1.5">
                    {subtitle}
                </p>
            </div>
            <SearchBar value={search} onChange={onSearchChange} />
        </div>
    );
}



const Page = () => {
    const [search, setSearch] = useState('');
    const [current, setCurrent] = useState(1);

    const { data: studentData, isLoading: studentsLoading } = useGetAllStudentsQuery({});
    const { data: centerData, isLoading: centersLoading } = useGetAllcenterQuery({});

    const students: Student[] = useMemo(() => studentData?.data ?? [], [studentData]);
    const centers: TCenter[] = useMemo(() => centerData?.data ?? [], [centerData]);

    const centerById = useMemo(() => {
        const map = new Map<string, TCenter>();
        centers.forEach((c) => map.set(c._id, c));
        return map;
    }, [centers]);

    // center name + center_id for a student
    const getCenterInfo = (s: Student) => {
        const key = getCenterKey(s);
        const full = key ? centerById.get(key) : undefined;
        const populated = s.center_id && typeof s.center_id === 'object' ? s.center_id : undefined;
        const info = full ?? populated;
        if (!info) return null;
        return {
            name: full?.center_name ?? populated?.center_name ?? 'Training Center',
            eiin: info.center_id,
            sub_area: info.sub_area,
            district: info.district,
        };
    };

    // search by name, student id, email, phone, course, center name / id
    const filteredStudents = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return students;

        return students.filter((s) => {
            const center = getCenterInfo(s);
            return [
                s.name,
                s.student_id,
                s.email,
                s.phone,
                getCourseName(s),
                center?.name,
                center?.eiin,
            ]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [students, search, centerById]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrent(1); // go back to the first page when searching
    };

    const columns: ColumnsType<Student> = [
        {
            title: 'Student',
            key: 'student',
            render: (_, s) => (
                <div className="flex items-center gap-3">
                     
                    <Image
                        width={36}
                        height={36}
                        preload
                        src={getStudentImage(s)}
                        alt={s.name}
                        className="w-9 h-9 rounded-xl object-cover shrink-0 border border-gray-100"
                    />
                    <div>
                        <p className="text-[13px] font-bold text-gray-900 whitespace-nowrap">{s.name}</p>
                        <p className="text-[11px] text-gray-400 font-medium whitespace-nowrap mt-0.5">
                            {s.student_id}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_, s) => (
                <div>
                    <p className="text-[12px] text-gray-600 font-medium whitespace-nowrap">{s.email}</p>
                    <p className="text-[11.5px] text-gray-400 font-medium whitespace-nowrap">{s.phone}</p>
                </div>
            ),
        },
        {
            title: 'Course',
            key: 'course',
            render: (_, s) => (
                <span className="text-[12.5px] text-gray-700 font-medium whitespace-nowrap">
                    {getCourseName(s)}
                </span>
            ),
        },
        {
            title: 'Batch',
            key: 'batch',
            render: (_, s) => (
                <span className="text-[12.5px] text-gray-500 font-medium whitespace-nowrap">
                    {getBatchLabel(s)}
                </span>
            ),
        },
        {
            title: 'Training Center',
            key: 'center',
            render: (_, s) => {
                const info = getCenterInfo(s);
                if (!info) return <span className="text-[12px] text-gray-400">Unassigned</span>;

                return (
                    <div className="flex items-center gap-1.5">
                        <MdSchool size={13} className="text-gray-400 shrink-0" />
                        <div>
                            <p className="text-[12px] font-bold text-gray-800 whitespace-nowrap">
                                BAIT - ({info.eiin})
                            </p>
                            <p className="text-[11px] text-gray-400 font-medium whitespace-nowrap capitalize">
                                {info.sub_area}, {info.district}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        
        {
            title: 'Status',
            key: 'status',
            render: (_, s) => <StatusPill status={s.status} />,
        },
    ];

    return (
        <div className="min-h-screen w-[95%] py-10">
            <PageHeader
                title="Students"
                subtitle={`${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''}${search ? ' found' : ''
                    }`}
                search={search}
                onSearchChange={handleSearch}
            />

            <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                <Table<Student>
                    rowKey="_id"
                    columns={columns}
                    dataSource={filteredStudents}
                    loading={studentsLoading || centersLoading}
                    scroll={{ x: 'max-content' }}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={search ? 'No students match your search' : 'No students found'}
                            />
                        ),
                    }}
                    pagination={
                        filteredStudents.length > PAGE_SIZE
                            ? {
                                current,
                                pageSize: PAGE_SIZE,
                                showSizeChanger: false,
                                position: ['bottomCenter'],
                                onChange: (page) => setCurrent(page),
                            }
                            : false
                    }
                />
            </div>
        </div>
    );
};

export default Page;