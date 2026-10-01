'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Table, Avatar, Tooltip, Tag, Empty, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdSchool, MdKeyboardArrowDown, MdLocationOn } from 'react-icons/md';
import { LuTrash2 } from 'react-icons/lu';
import { bangladeshLocations } from '@/utils/bangladeshLocations';
import {
    useGetAllcenterQuery,
    useDeleteCenterMutation,
} from '@/redux/features/center/centerApi';


type TCenter = {
    _id: string;
    center_id: string;
    center_name: string;
    division: string;
    district: string;
    sub_area: string;
    center_address: string;
    center_email: string;
    center_phone: string;
    center_images: string[];
};

const PAGE_SIZE = 20;

// Always 6 digit EIIN
const toEiin = (id: string) =>
    (id || '').replace(/\D/g, '').slice(-6).padStart(6, '0');

// ─────────────────────────────────────────────
// Reusable Select
// ─────────────────────────────────────────────

interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder: string;
    options: string[];
}

function FilterSelect({ value, onChange, disabled = false, placeholder, options }: FilterSelectProps) {
    return (
        <div className="relative shrink-0">
            <select
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className={`
                    appearance-none bg-white border border-gray-200 rounded-xl
                    pl-3.5 pr-9 py-2.5 text-[12.5px] font-bold transition-all min-w-[145px]
                    ${disabled
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10'
                    }
                `}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>

            <MdKeyboardArrowDown
                size={16}
                className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${disabled ? 'text-gray-200' : 'text-gray-400'
                    }`}
            />
        </div>
    );
}



interface FilterHeaderProps {
    selectedDivision: string;
    selectedDistrict: string;
    selectedSubArea: string;
    divisions: string[];
    districts: string[];
    subAreas: string[];
    onDivisionChange: (value: string) => void;
    onDistrictChange: (value: string) => void;
    onSubAreaChange: (value: string) => void;
}

function LocationFilters({
    selectedDivision,
    selectedDistrict,
    selectedSubArea,
    divisions,
    districts,
    subAreas,
    onDivisionChange,
    onDistrictChange,
    onSubAreaChange,
}: FilterHeaderProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
                value={selectedDivision}
                onChange={onDivisionChange}
                placeholder="All Divisions"
                options={divisions}
            />
            <FilterSelect
                value={selectedDistrict}
                onChange={onDistrictChange}
                disabled={!selectedDivision}
                placeholder={selectedDivision ? 'All Districts' : 'Select Division First'}
                options={districts}
            />
            <FilterSelect
                value={selectedSubArea}
                onChange={onSubAreaChange}
                disabled={!selectedDistrict}
                placeholder={selectedDistrict ? 'All Sub Areas' : 'Select District First'}
                options={subAreas}
            />
        </div>
    );
}



interface PageHeaderProps extends FilterHeaderProps {
    title: string;
    subtitle: React.ReactNode;
}

function PageHeader({ title, subtitle, ...filterProps }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="shrink-0">
                <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">{title}</h1>
                <p className="text-[13px] text-gray-400 font-medium mt-1 flex items-center gap-1.5">
                    {subtitle}
                </p>
            </div>

            <LocationFilters {...filterProps} />
        </div>
    );
}

// ─────────────────────────────────────────────
// Training Centers Table (Ant Design)
// ─────────────────────────────────────────────

function CentersTable({
    list,
    loading,
    showDivisionColumn = false,
    hasFilter = false,
    onDelete,
    deletingId,
}: {
    list: TCenter[];
    loading?: boolean;
    showDivisionColumn?: boolean;
    hasFilter?: boolean;
    onDelete: (id: string) => void;
    deletingId?: string | null;
}) {
    const columns: ColumnsType<TCenter> = [
        {
            title: 'Training Center',
            dataIndex: 'center_name',
            key: 'center_name',
            width: 280,
            render: (name: string, record) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        shape="square"
                        size={36}
                        src={record.center_images?.[0]}
                        icon={<MdSchool size={16} />}
                        className="!rounded-xl !bg-gray-900 shrink-0"
                    />
                    <Tooltip title={name}>
                        <span className="text-[13px] font-bold text-gray-900 max-w-[200px] truncate block">
                            {name}
                        </span>
                    </Tooltip>
                </div>
            ),
        },
        {
            title: 'EIIN',
            dataIndex: 'center_id',
            key: 'eiin',
            width: 110,
            render: (id: string) => (
                <span className="text-[12.5px] font-bold text-gray-700 tracking-wider">
                    {toEiin(id)}
                </span>
            ),
        },
        ...(showDivisionColumn
            ? [
                {
                    title: 'Division',
                    dataIndex: 'division',
                    key: 'division',
                    render: (v: string) => (
                        <Tag className="!rounded-full !text-[12px] !font-bold capitalize">{v}</Tag>
                    ),
                } as ColumnsType<TCenter>[number],
            ]
            : []),
        {
            title: 'District',
            dataIndex: 'district',
            key: 'district',
            render: (v: string) => (
                <span className="text-[12.5px] text-gray-700 font-medium capitalize">{v}</span>
            ),
        },
        {
            title: 'Sub Area',
            dataIndex: 'sub_area',
            key: 'sub_area',
            render: (v: string) => (
                <span className="text-[12.5px] text-gray-700 font-medium capitalize">{v}</span>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 170,
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/centers/${record._id}`} // <- tomar details route onujayi change koro
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-sm py-1 px-6 rounded-2xl !text-white transition-colors"
                    >
                        Details
                    </Link>

                    <Popconfirm
                        title="Delete this center?"
                        description="This action cannot be undone."
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true, loading: deletingId === record._id }}
                        onConfirm={() => onDelete(record._id)}
                    >
                        <button
                            type="button"
                            disabled={deletingId === record._id}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Delete center"
                        >
                            <LuTrash2 size={15} />
                        </button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white border border-gray-100 rounded-2xl w-full overflow-hidden">
            <Table<TCenter>
                rowKey="_id"
                columns={columns}
                dataSource={list}
                loading={loading}
                scroll={{ x: 'max-content' }}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                hasFilter
                                    ? 'No centers found for this location'
                                    : 'No training centers found'
                            }
                        />
                    ),
                }}
                pagination={
                    list.length > PAGE_SIZE
                        ? { pageSize: PAGE_SIZE, showSizeChanger: false, position: ['bottomCenter'] }
                        : false
                }
            />
        </div>
    );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const Page = () => {
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSubArea, setSelectedSubArea] = useState('');

    const { data: centersData, isLoading, refetch } = useGetAllcenterQuery({});
    const [deleteCenter] = useDeleteCenterMutation();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const centers: TCenter[] = centersData?.data ?? [];

    // Divisions
    const divisions = useMemo(() => bangladeshLocations.map((d) => d.name), []);

    // Districts (selected division er upor depend kore)
    const districts = useMemo(() => {
        if (!selectedDivision) return [];
        const division = bangladeshLocations.find((d) => d.name === selectedDivision);
        return division?.districts.map((d) => d.name) ?? [];
    }, [selectedDivision]);

    // Sub areas (selected district er upor depend kore)
    const subAreas = useMemo(() => {
        if (!selectedDivision || !selectedDistrict) return [];
        const division = bangladeshLocations.find((d) => d.name === selectedDivision);
        const district = division?.districts.find((d) => d.name === selectedDistrict);
        return [...new Set(district?.subAreas ?? [])];
    }, [selectedDivision, selectedDistrict]);

    // DB te lowercase, tai lowercase kore compare
    const filteredTrainingCenters = useMemo(() => {
        return centers.filter((c) => {
            const divisionMatch = !selectedDivision || c.division === selectedDivision.toLowerCase();
            const districtMatch = !selectedDistrict || c.district === selectedDistrict.toLowerCase();
            const subAreaMatch = !selectedSubArea || c.sub_area === selectedSubArea.toLowerCase();
            return divisionMatch && districtMatch && subAreaMatch;
        });
    }, [centers, selectedDivision, selectedDistrict, selectedSubArea]);

    const handleDivisionChange = (value: string) => {
        setSelectedDivision(value);
        setSelectedDistrict('');
        setSelectedSubArea('');
    };

    const handleDistrictChange = (value: string) => {
        setSelectedDistrict(value);
        setSelectedSubArea('');
    };

    const handleSubAreaChange = (value: string) => setSelectedSubArea(value);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteCenter(id).unwrap();
            toast.success('Center deleted successfully');
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to delete center');
        } finally {
            setDeletingId(null);
        }
    };

    const hasFilter = !!(selectedDivision || selectedDistrict || selectedSubArea);

    const locationText = [selectedSubArea, selectedDistrict, selectedDivision]
        .filter(Boolean)
        .join(', ');

    return (
        <div className="min-h-screen w-[95%] space-y-6 py-6">
            <PageHeader
                title="Training Centers"
                subtitle={
                    <>
                        <MdLocationOn size={15} />
                        {locationText || 'Training centers across Bangladesh'}
                        <span className="ml-1">
                            · {filteredTrainingCenters.length} center
                            {filteredTrainingCenters.length !== 1 ? 's' : ''}
                        </span>
                    </>
                }
                selectedDivision={selectedDivision}
                selectedDistrict={selectedDistrict}
                selectedSubArea={selectedSubArea}
                divisions={divisions}
                districts={districts}
                subAreas={subAreas}
                onDivisionChange={handleDivisionChange}
                onDistrictChange={handleDistrictChange}
                onSubAreaChange={handleSubAreaChange}
            />

            <CentersTable
                list={filteredTrainingCenters}
                loading={isLoading}
                showDivisionColumn
                hasFilter={hasFilter}
                onDelete={handleDelete}
                deletingId={deletingId}
            />
        </div>
    );
};

export default Page;