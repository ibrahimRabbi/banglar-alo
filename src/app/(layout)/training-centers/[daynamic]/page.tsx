'use client';

import React, { useMemo, useState } from 'react';
import { trainingCenters, type TrainingCenter } from '@/utils/trainingCenter';
import { bangladeshLocations } from '@/utils/bangladeshLocations';
import { mentors } from '@/utils/mentors';
import { students } from '@/utils/students';

import {
    MdSchool,
    MdKeyboardArrowDown,
    MdLocationOn,
} from 'react-icons/md';

import {
    FaChalkboardTeacher,
    FaUserGraduate,
} from 'react-icons/fa';


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

function FilterSelect({
    value,
    onChange,
    disabled = false,
    placeholder,
    options,
}: FilterSelectProps) {
    return (
        <div className="relative shrink-0">
            <select
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className={`
                    appearance-none
                    bg-white
                    border
                    border-gray-200
                    rounded-xl
                    pl-3.5
                    pr-9
                    py-2.5
                    text-[12.5px]
                    font-bold
                    transition-all
                    min-w-[145px]
                    ${disabled
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10'
                    }
                `}
            >
                <option value="">
                    {placeholder}
                </option>

                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>

            <MdKeyboardArrowDown
                size={16}
                className={`
                    pointer-events-none
                    absolute
                    right-2.5
                    top-1/2
                    -translate-y-1/2
                    ${disabled
                        ? 'text-gray-200'
                        : 'text-gray-400'
                    }
                `}
            />
        </div>
    );
}


// ─────────────────────────────────────────────
// Filter Header
// ─────────────────────────────────────────────

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
            {/* Division */}
            <FilterSelect
                value={selectedDivision}
                onChange={onDivisionChange}
                placeholder="All Divisions"
                options={divisions}
            />

            {/* District */}
            <FilterSelect
                value={selectedDistrict}
                onChange={onDistrictChange}
                disabled={!selectedDivision}
                placeholder={
                    selectedDivision
                        ? 'All Districts'
                        : 'Select Division First'
                }
                options={districts}
            />

            {/* Sub Area */}
            <FilterSelect
                value={selectedSubArea}
                onChange={onSubAreaChange}
                disabled={!selectedDistrict}
                placeholder={
                    selectedDistrict
                        ? 'All Sub Areas'
                        : 'Select District First'
                }
                options={subAreas}
            />
        </div>
    );
}


// ─────────────────────────────────────────────
// Page Header
// ─────────────────────────────────────────────

interface PageHeaderProps {
    title: string;
    subtitle: React.ReactNode;

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

function PageHeader({
    title,
    subtitle,

    selectedDivision,
    selectedDistrict,
    selectedSubArea,

    divisions,
    districts,
    subAreas,

    onDivisionChange,
    onDistrictChange,
    onSubAreaChange,
}: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center flex-wrap">

            {/* Left side: Title */}
            <div className="shrink-0">
                <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">
                    {title}
                </h1>

                <p className="text-[13px] text-gray-400 font-medium mt-1 flex items-center gap-1.5">
                    {subtitle}
                </p>
            </div>


            {/* Left side: Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
                <LocationFilters
                    selectedDivision={selectedDivision}
                    selectedDistrict={selectedDistrict}
                    selectedSubArea={selectedSubArea}

                    divisions={divisions}
                    districts={districts}
                    subAreas={subAreas}

                    onDivisionChange={onDivisionChange}
                    onDistrictChange={onDistrictChange}
                    onSubAreaChange={onSubAreaChange}
                />
            </div>

        </div>
    );
}


// ─────────────────────────────────────────────
// Training Centers Table
// ─────────────────────────────────────────────

function CentersTable({
    list,
    showDivisionColumn = false,
}: {
    list: TrainingCenter[];
    showDivisionColumn?: boolean;
}) {
    if (list.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center text-[13px] text-gray-400 font-medium">
                No training centers found.
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl w-full overflow-hidden">

            <div className="overflow-x-auto">

                <table className="w-full text-left">

                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">

                            <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">
                                Training Center
                            </th>

                            {showDivisionColumn && (
                                <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">
                                    Division
                                </th>
                            )}


                            <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">
                                District
                            </th>

                           

                            <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">
                               Sub Area
                            </th>

                            
                            <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">
                                Students
                            </th>

                            <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">
                                Action
                            </th>

                        </tr>
                    </thead>

                    <tbody>

                        {list.map((center) => {

                            const mentorCount = mentors.filter(
                                (mentor) =>
                                    mentor.trainingCenterId === center.id
                            ).length;

                            const studentCount = students.filter(
                                (student) =>
                                    student.trainingCenterId === center.id
                            ).length;

                            return (
                                <tr
                                    key={center.id}
                                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                                >

                                    {/* Training Center */}
                                    <td className="px-5 py-3.5">

                                        <div className="flex items-center gap-3">

                                            <span className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                                                <MdSchool size={16} />
                                            </span>

                                            <span className="text-[13px] font-bold text-gray-900 whitespace-nowrap">
                                                {center.name}
                                            </span>

                                        </div>

                                    </td>

                                    {/* Division */}
                                    {showDivisionColumn && (
                                        <td className="px-5 py-3.5">

                                            <span className="text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                                                {center.division}
                                            </span>

                                        </td>
                                    )}

                                    {/* district */}
                                    <td className="px-5 py-3.5">


                                        <p className="text-[12.5px] text-gray-700 font-medium whitespace-nowrap">
                                            {center.district}
                                        </p>

                                    </td>


                                   


                                    {/* Address */}
                                    <td className="px-5 py-3.5">
                                        <p className="text-[12.5px] text-gray-700 font-medium whitespace-nowrap">
                                            {center.subArea}
                                        </p>
                                         

                                    </td>


                                    


                                    {/* Students */}
                                    <td className="px-5 py-3.5">

                                        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">

                                            <FaUserGraduate size={11} />

                                            {studentCount}

                                        </span>

                                    </td>

                                    {/*action button*/}
                                    <td className="px-5 py-3.5">

                                         

                                             <button className='bg-blue-500 text-sm py-1 px-6 rounded-2xl text-white'>Details</button>
                                         

                                    </td>
                                </tr>
                            );
                        })}

                    </tbody>

                </table>

            </div>

        </div>
    );
}


// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const Page = () => {

    // ─────────────────────────────────────────
    // Selected filters
    // ─────────────────────────────────────────

    const [selectedDivision, setSelectedDivision] =
        useState('');

    const [selectedDistrict, setSelectedDistrict] =
        useState('');

    const [selectedSubArea, setSelectedSubArea] =
        useState('');


    // ─────────────────────────────────────────
    // Divisions
    // ─────────────────────────────────────────

    const divisions = useMemo(
        () =>
            bangladeshLocations.map(
                (division) => division.name
            ),
        []
    );


    // ─────────────────────────────────────────
    // Districts based on selected division
    // ─────────────────────────────────────────

    const districts = useMemo(() => {

        if (!selectedDivision) {
            return [];
        }

        const division = bangladeshLocations.find(
            (item) =>
                item.name === selectedDivision
        );

        return (
            division?.districts.map(
                (district) => district.name
            ) ?? []
        );

    }, [selectedDivision]);


    // ─────────────────────────────────────────
    // Sub areas based on selected district
    // ─────────────────────────────────────────

    const subAreas = useMemo(() => {

        if (!selectedDivision || !selectedDistrict) {
            return [];
        }

        const division = bangladeshLocations.find(
            (item) =>
                item.name === selectedDivision
        );

        const district = division?.districts.find(
            (item) =>
                item.name === selectedDistrict
        );

        return district?.subAreas ?? [];

    }, [
        selectedDivision,
        selectedDistrict,
    ]);


    // ─────────────────────────────────────────
    // Filter training centers
    // ─────────────────────────────────────────

    const filteredTrainingCenters = useMemo(() => {

        return trainingCenters.filter((center) => {

            const divisionMatch =
                !selectedDivision ||
                center.division === selectedDivision;

            const districtMatch =
                !selectedDistrict ||
                center.district === selectedDistrict;

            const subAreaMatch =
                !selectedSubArea ||
                center.subArea === selectedSubArea;

            return (
                divisionMatch &&
                districtMatch &&
                subAreaMatch
            );

        });

    }, [
        selectedDivision,
        selectedDistrict,
        selectedSubArea,
    ]);


    // ─────────────────────────────────────────
    // Division change
    // ─────────────────────────────────────────

    const handleDivisionChange = (
        value: string
    ) => {

        setSelectedDivision(value);

        // Reset dependent filters
        setSelectedDistrict('');
        setSelectedSubArea('');
    };


    // ─────────────────────────────────────────
    // District change
    // ─────────────────────────────────────────

    const handleDistrictChange = (
        value: string
    ) => {

        setSelectedDistrict(value);

        // Reset dependent filter
        setSelectedSubArea('');
    };


    // ─────────────────────────────────────────
    // Sub Area change
    // ─────────────────────────────────────────

    const handleSubAreaChange = (
        value: string
    ) => {

        setSelectedSubArea(value);
    };


    // ─────────────────────────────────────────
    // Header text
    // ─────────────────────────────────────────

    const locationText = [
        selectedSubArea,
        selectedDistrict,
        selectedDivision,
    ]
        .filter(Boolean)
        .join(', ');


    return (
        <div className="min-h-screen w-[95%] space-y-6 py-6">

            <PageHeader
                title="Training Centers"
                subtitle={
                    <>
                        <MdLocationOn size={15} />

                        {locationText ||
                            'Training centers across Bangladesh'}

                        <span className="ml-1">
                            · {filteredTrainingCenters.length} center
                            {filteredTrainingCenters.length !== 1
                                ? 's'
                                : ''}
                        </span>
                    </>
                }

                selectedDivision={selectedDivision}
                selectedDistrict={selectedDistrict}
                selectedSubArea={selectedSubArea}
                divisions={divisions}
                districts={districts}
                subAreas={subAreas}

                onDivisionChange={
                    handleDivisionChange
                }

                onDistrictChange={
                    handleDistrictChange
                }

                onSubAreaChange={
                    handleSubAreaChange
                }
            />


            <CentersTable
                list={filteredTrainingCenters}
                showDivisionColumn
            />

        </div>
    );
};

export default Page;