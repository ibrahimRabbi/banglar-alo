'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { ColumnsType } from 'antd/es/table';
import { MdSearch, MdKeyboardArrowDown } from 'react-icons/md';
import { ProjectStatusPill } from './_components/ProjectStatusPill';
import { Table, Empty, Progress, Popconfirm, Tooltip, Dropdown } from 'antd';
import { LuTrash2, LuEye } from 'react-icons/lu';
import {
    getProjects, deleteProject, updateProjectStatus, STATUS_FLOW, STATUS_LABEL, money, fmtDate,
    type Project, type ProjectStatus,
} from '@/utils/projectData';
 

const PAGE_SIZE = 20;
const ALL_STATUSES: ProjectStatus[] = [...STATUS_FLOW, 'on_hold'];

const isOverdue = (p: Project) =>
    p.status !== 'delivered' && new Date(p.deadline).getTime() < Date.now();

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>(getProjects());
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [current, setCurrent] = useState(1);

    /* ---------- stats ---------- */

    const stats = useMemo(
        () => [
            { label: 'Total projects', value: projects.length },
            {
                label: 'In progress',
                value: projects.filter((p) => !['delivered', 'on_hold'].includes(p.status)).length,
            },
            { label: 'Delivered', value: projects.filter((p) => p.status === 'delivered').length },
            {
                label: 'Due payment',
                value: money(projects.reduce((sum, p) => sum + (p.budget - p.paid), 0)),
            },
        ],
        [projects]
    );

    /* ---------- filter ---------- */

    const filtered = useMemo(() => {
        const s = search.trim().toLowerCase();
        return projects.filter((p) => {
            const statusOk = !status || p.status === status;
            const searchOk =
                !s ||
                [p.title, p.project_code, p.client_name, p.client_email, p.client_phone, p.website_type]
                    .some((v) => v.toLowerCase().includes(s));
            return statusOk && searchOk;
        });
    }, [projects, search, status]);

    const handleDelete = (id: string) => {
        deleteProject(id);
        setProjects(getProjects());
        toast.success('Project deleted');
    };


    const handleStatusChange = (id: string, next: ProjectStatus) => {
        updateProjectStatus(id, next);
        setProjects(getProjects());
        toast.success(`Status updated to ${STATUS_LABEL[next]}`);
    };

    /* ---------- columns ---------- */

    const columns: ColumnsType<Project> = [
        {
            title: 'Project',
            key: 'project',
            width: 260,
            sorter: (a, b) => a.title.localeCompare(b.title),
            render: (_, p) => (
                <div>
                    <Tooltip title={p.title}>
                        <p className="text-[13px] font-bold text-gray-900 max-w-[220px] truncate">{p.title}</p>
                    </Tooltip>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5 whitespace-nowrap">
                        {p.project_code} · {p.website_type}
                    </p>
                </div>
            ),
        },
        {
            title: 'Client',
            key: 'client',
            sorter: (a, b) => a.client_name.localeCompare(b.client_name),
            render: (_, p) => (
                <div>
                    <p className="text-[12.5px] font-bold text-gray-800 whitespace-nowrap">{p.client_name}</p>
                    <p className="text-[11.5px] text-gray-400 font-medium whitespace-nowrap">{p.client_phone}</p>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (v: ProjectStatus, p) => (
                <Dropdown
                    trigger={['click']}
                    menu={{
                        items: ALL_STATUSES.map((s) => ({
                            key: s,
                            label: STATUS_LABEL[s],
                            disabled: s === v,
                        })),
                        onClick: ({ key }) => handleStatusChange(p.id, key as ProjectStatus),
                    }}>
                    <button type="button" className="inline-flex items-center gap-1 cursor-pointer">
                        <ProjectStatusPill status={v} />
                        <MdKeyboardArrowDown size={14} className="text-gray-400" />
                    </button>
                     
                </Dropdown>
            ),
        },
        {
            title: 'Progress',
            dataIndex: 'progress',
            key: 'progress',
            width: 170,
            sorter: (a, b) => a.progress - b.progress,
            render: (v: number, p) => (
                <Progress
                    percent={v}
                    size="small"
                    strokeColor={p.status === 'delivered' ? '#22c55e' : '#111827'}
                />
            ),
        },
        {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
            sorter: (a, b) => a.budget - b.budget,
            render: (v: number) => (
                <span className="text-[12.5px] font-bold text-gray-800 whitespace-nowrap">{money(v)}</span>
            ),
        },
        {
            title: 'Paid / Due',
            key: 'payment',
            sorter: (a, b) => a.budget - a.paid - (b.budget - b.paid),
            render: (_, p) => {
                const due = p.budget - p.paid;
                return (
                    <div>
                        <p className="text-[12px] font-bold text-green-600 whitespace-nowrap">{money(p.paid)}</p>
                        <p
                            className={`text-[11px] font-medium whitespace-nowrap ${due > 0 ? 'text-red-400' : 'text-gray-400'
                                }`}
                        >
                            {due > 0 ? `Due ${money(due)}` : 'Fully paid'}
                        </p>
                    </div>
                );
            },
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            defaultSortOrder: 'ascend',
            sorter: (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
            render: (v: string, p) => (
                <div>
                    <p
                        className={`text-[12px] font-medium whitespace-nowrap ${isOverdue(p) ? 'text-red-500' : 'text-gray-500'
                            }`}
                    >
                        {fmtDate(v)}
                    </p>
                    {isOverdue(p) && <p className="text-[10px] font-bold text-red-400">Overdue</p>}
                </div>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            render: (v: string) => (
                <span className="text-[12px] text-gray-500 font-medium whitespace-nowrap">{fmtDate(v)}</span>
            ),
        }, 
        {
            title: 'Action',
            key: 'action',
            width: 50,
            fixed: 'right',
            render: (_, p) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/projects/project-details?projectId=${p.id}`}
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-sm py-1 px-6 rounded-2xl !text-white transition-colors"
                    >
                        Details
                    </Link>

                    <Popconfirm
                        title="Delete this project?"
                        description="This action cannot be undone."
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(p.id)}
                    >
                        <button
                            type="button"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                            aria-label="Delete project"
                        >
                            <LuTrash2 size={15} />
                        </button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    

    return (
        <div className="min-h-screen w-[96%] py-10 space-y-6">
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Projects</h1>
                    <p className="text-[13px] text-gray-400 font-medium mt-1">
                        {filtered.length} project{filtered.length !== 1 ? 's' : ''}
                        {(search || status) && ' found'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Status filter */}
                    <div className="relative shrink-0">
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setCurrent(1);
                            }}
                            className="appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-9 py-2.5 text-[12.5px] font-bold text-gray-700 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all min-w-[145px]"
                        >
                            <option value="">All statuses</option>
                            {ALL_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {STATUS_LABEL[s]}
                                </option>
                            ))}
                        </select>
                        <MdKeyboardArrowDown
                            size={16}
                            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                    </div>

                    {/* Search */}
                    <div className="relative shrink-0 w-full sm:w-72">
                        <MdSearch
                            size={17}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrent(1);
                            }}
                            placeholder="Search title, code, client..."
                            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-[12.5px] font-bold text-gray-700 placeholder:font-medium placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                        />
                    </div>

                    {/* New project */}
                    <Link
                        href="/projects/create"
                        className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-[12.5px] font-medium px-4 py-2.5 rounded-xl transition-colors"
                    >
                        + New project
                    </Link>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
                        <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">{s.label}</p>
                        <p className="text-lg font-extrabold text-gray-800 mt-2 truncate">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* TABLE */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <Table<Project>
                    rowKey="id"
                    columns={columns}
                    dataSource={filtered}
                    scroll={{ x: 'max-content' }}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    search || status ? 'No projects match your filter' : 'No projects yet'
                                }
                            />
                        ),
                    }}
                    pagination={
                        filtered.length > PAGE_SIZE
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
}