'use client';

import React, { useState } from 'react';
import {
    Form,
    Input,
    InputNumber,
    Row,
    Col,
    ConfigProvider,
    Select,
} from 'antd';

import {
    LuUserRound,
    LuMail,
    LuPhone,
    LuBriefcaseBusiness,
    LuGraduationCap,
    LuCode,
    LuBuilding2,
} from 'react-icons/lu';

import { useCreateMentorMutation } from '@/redux/features/mentor/mentorApi';
import { useGetAllcenterQuery } from '@/redux/features/center/centerApi';

import SectionCard from '../../training-centers/_components/SectionCard';
import MentorImageUploader from '../_components/MentorImageUploader';
 

type FormValues = {
    mentor_name: string;
    mentor_email: string;
    mentor_phone: string;
    mentor_image: string;
    designation: string;
    specialization: string[];
    experience_years: number;
    qualification: string;
    center_id: string;
};

type Status = 'idle' | 'saving' | 'success' | 'error';

const antdTheme = {
    token: {
        colorPrimary: '#111827',
        colorBorder: '#e5e7eb',
        borderRadius: 12,
        controlHeight: 40,
        fontSize: 13,
    },

    components: {
        Form: {
            labelFontSize: 12,
            labelColor: '#6b7280',
            verticalLabelPadding: '0 0 4px',
        },
    },
};

export default function CreateMentorPage() {
    const [form] = Form.useForm<FormValues>();

    const [createMentor] = useCreateMentorMutation();

    const { data: trainingCenters } = useGetAllcenterQuery({});

    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [errorList, setErrorList] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    /* =====================================================
       SUBMIT
    ===================================================== */

    const onFinish = async (values: FormValues) => {
        setErrorList([]);
        setErrorMsg('');
        setStatus('saving');

        try {
            const payload = {
                mentor_name: values.mentor_name.trim(),
                mentor_email: values.mentor_email.trim(),
                mentor_phone: values.mentor_phone.trim(),

                // Uploaded Cloudinary URL
                mentor_image: values.mentor_image.trim(),

                designation: values.designation.trim(),
                specialization: values.specialization,
                experience_years: values.experience_years,
                qualification: values.qualification.trim(),

                // IMPORTANT:
                // This is MongoDB center document _id
                center_id: values.center_id,
            };

            console.log('Mentor payload:', payload);

            const creating = await createMentor(payload).unwrap();

            console.log('creating:', creating);

            if (creating?.data) {
                setStatus('success');

                form.resetFields();

                setTimeout(() => {
                    setStatus('idle');
                }, 2500);
            }
        } catch (err: any) {
            console.error('Create mentor error:', err);

            setErrorMsg(
                err?.data?.message ||
                err?.error ||
                'Something went wrong. Please try again.'
            );

            setStatus('error');

            setTimeout(() => {
                setStatus('idle');
            }, 3500);
        }
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const onFinishFailed = ({
        errorFields,
    }: {
        errorFields: { errors: string[] }[];
    }) => {
        setErrorList(
            errorFields
                .map((field) => field.errors[0])
                .filter(Boolean)
        );
    };

    const saving = status === 'saving';

    /* =====================================================
       CENTER OPTIONS
    ===================================================== */

    const centerOptions =
        trainingCenters?.data?.map((center: any) => ({
            value: center._id,

            // What user sees
            label: `${center.district}, ${center.center_id}`,

            // Used for searching
            searchText: [
                center.center_name,
                center.center_id,
                center.district,
                center.sub_area,
                center.division,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase(),
        })) || [];

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <ConfigProvider theme={antdTheme}>

            <div className="w-full lg:w-[90%] px-4 sm:px-6 py-10">

                {/* PAGE HEADER */}

                <div>
                    <p className="text-[22px] font-medium text-gray-900 mb-1">
                        Create Mentor
                    </p>

                    <div className="text-gray-400 text-[13px] mb-6">
                        Fill in the details below to create a new mentor profile.
                    </div>
                </div>


                {/* FORM */}

                <Form<FormValues>
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    onValuesChange={() => {

                        if (errorList.length) {
                            setErrorList([]);
                        }

                        if (status === 'error') {
                            setStatus('idle');
                        }
                    }}
                    initialValues={{
                        specialization: [],
                    }}
                >

                    <div className="flex flex-col gap-6">


                        {/* =================================================
                            BASIC INFORMATION
                        ================================================= */}

                        <SectionCard
                            title="Basic information"
                            subtitle="Basic information about the mentor"
                        >

                            <Row gutter={16}>

                                {/* Mentor Name */}

                                <Col xs={24} md={12}>

                                    <Form.Item
                                        label="Mentor name"
                                        name="mentor_name"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Mentor name is required',
                                            },
                                            {
                                                min: 2,
                                                message:
                                                    'Mentor name must be at least 2 characters',
                                            },
                                        ]}
                                    >

                                        <Input
                                            placeholder="Abdul Karim"
                                            prefix={
                                                <LuUserRound className="text-gray-400" />
                                            }
                                        />

                                    </Form.Item>

                                </Col>


                                {/* Designation */}

                                <Col xs={24} md={12}>

                                    <Form.Item
                                        label="Designation"
                                        name="designation"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Designation is required',
                                            },
                                        ]}
                                    >

                                        <Input
                                            placeholder="Senior Web Development Mentor"
                                            prefix={
                                                <LuBriefcaseBusiness className="text-gray-400" />
                                            }
                                        />

                                    </Form.Item>

                                </Col>

                            </Row>


                            {/* =================================================
                                PROFILE IMAGE
                            ================================================= */}

                            <Form.Item
                                label="Profile image"
                                name="mentor_image"
                                className="!mb-0"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Profile image is required',
                                    },
                                ]}
                            >

                                <MentorImageUploader
                                    onUploadingChange={setIsUploading}
                                />

                            </Form.Item>

                        </SectionCard>


                        {/* =================================================
                            CONTACT
                        ================================================= */}

                        <SectionCard
                            title="Contact"
                            subtitle="How people can reach this mentor"
                        >

                            <Row gutter={16}>

                                {/* Email */}

                                <Col xs={24} md={12}>

                                    <Form.Item
                                        label="Email"
                                        name="mentor_email"
                                        className="!mb-0"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Email is required',
                                            },
                                            {
                                                type: 'email',
                                                message:
                                                    'Enter a valid email',
                                            },
                                        ]}
                                    >

                                        <Input
                                            placeholder="abdul.karim@example.com"
                                            prefix={
                                                <LuMail className="text-gray-400" />
                                            }
                                        />

                                    </Form.Item>

                                </Col>


                                {/* Phone */}

                                <Col xs={24} md={12}>

                                    <Form.Item
                                        label="Phone"
                                        name="mentor_phone"
                                        className="!mb-0"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Phone is required',
                                            },
                                            {
                                                pattern:
                                                    /^01[3-9]\d{8}$/,
                                                message:
                                                    'Enter a valid BD phone number',
                                            },
                                        ]}
                                    >

                                        <Input
                                            placeholder="01712000001"
                                            maxLength={11}
                                            prefix={
                                                <LuPhone className="text-gray-400" />
                                            }
                                        />

                                    </Form.Item>

                                </Col>

                            </Row>

                        </SectionCard>


                        {/* =================================================
                            PROFESSIONAL INFORMATION
                        ================================================= */}

                        <SectionCard
                            title="Professional information"
                            subtitle="Experience and professional expertise"
                        >

                            <Row gutter={16}>

                                {/* Experience */}

                                <Col xs={24} md={8}>

                                    <Form.Item
                                        label="Experience (years)"
                                        name="experience_years"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Experience is required',
                                            },
                                            {
                                                type: 'number',
                                                min: 0,
                                                max: 60,
                                                message:
                                                    'Enter experience between 0 and 60 years',
                                            },
                                        ]}
                                    >

                                        <InputNumber
                                            className="!w-full"
                                            placeholder="8"
                                            min={0}
                                            max={60}
                                        />

                                    </Form.Item>

                                </Col>


                                {/* Qualification */}

                                <Col xs={24} md={16}>

                                    <Form.Item
                                        label="Qualification"
                                        name="qualification"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Qualification is required',
                                            },
                                        ]}
                                    >

                                        <Input
                                            placeholder="BSc in Computer Science and Engineering"
                                            prefix={
                                                <LuGraduationCap className="text-gray-400" />
                                            }
                                        />

                                    </Form.Item>

                                </Col>

                            </Row>


                            {/* Specialization */}

                            <Form.Item
                                label="Specialization"
                                name="specialization"
                                className="!mb-0"
                                rules={[
                                    {
                                        validator: async (_, value) => {

                                            if (
                                                !value ||
                                                value.length === 0
                                            ) {
                                                throw new Error(
                                                    'Add at least one specialization'
                                                );
                                            }

                                        },
                                    },
                                ]}
                            >

                                <SelectSpecialization />

                            </Form.Item>

                        </SectionCard>


                        {/* =================================================
                            TRAINING CENTER
                        ================================================= */}

                        <SectionCard
                            title="Training center"
                            subtitle="Assign the mentor to a training center"
                        >

                            <Form.Item
                                label="Training Center"
                                name="center_id"
                                className="!mb-0"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please select a training center',
                                    },
                                ]}
                            >

                                <Select
                                    showSearch
                                    allowClear
                                    placeholder="Search and select training center"

                                    options={centerOptions}

                                    filterOption={(input, option) => {

                                        const searchText =
                                            option?.searchText || '';

                                        return searchText.includes(
                                            input.toLowerCase()
                                        );
                                    }}

                                    optionRender={(option) => (

                                        <div className="py-1">

                                            <p className="text-[12px] font-semibold text-gray-800">
                                                {option.label}
                                            </p>

                                            <p className="text-[10px] text-gray-400 mt-0.5">

                                                {
                                                    trainingCenters?.data?.find(
                                                        (center: any) =>
                                                            center._id ===
                                                            option.value
                                                    )?.center_name
                                                }

                                            </p>

                                        </div>

                                    )}

                                />

                            </Form.Item>


                            <div className="flex items-center gap-1.5 mt-2">

                                <LuBuilding2
                                    size={11}
                                    className="text-gray-300"
                                />

                                <p className="text-[10px] text-gray-400">
                                    Select a center by district and center ID.
                                </p>

                            </div>

                        </SectionCard>


                        {/* =================================================
                            ERROR SUMMARY
                        ================================================= */}

                        {errorList.length > 0 && (

                            <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 flex items-start gap-3">

                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">

                                    <svg
                                        width="10"
                                        height="10"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="#f87171"
                                        strokeWidth={2.5}
                                    >

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                        />

                                    </svg>

                                </div>


                                <div>

                                    <p className="text-[12px] font-medium text-red-500 mb-1.5">
                                        Please fix the following before creating:
                                    </p>

                                    <ul className="space-y-1">

                                        {errorList.map((msg, i) => (

                                            <li
                                                key={i}
                                                className="flex items-center gap-1.5 text-[11px] text-red-400"
                                            >

                                                <span className="w-1 h-1 rounded-full bg-red-300 shrink-0" />

                                                {msg}

                                            </li>

                                        ))}

                                    </ul>

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">

                            <span className="text-[13px]">

                                {status === 'success' && (

                                    <span className="text-green-500 font-medium flex items-center gap-1.5">

                                        <span className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center shrink-0">

                                            <svg
                                                width="8"
                                                height="8"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="white"
                                                strokeWidth={3}
                                            >

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4.5 12.75l6 6 9-13.5"
                                                />

                                            </svg>

                                        </span>

                                        Mentor created successfully

                                    </span>

                                )}


                                {status === 'error' && (

                                    <span className="text-red-400 font-medium">
                                        {errorMsg}
                                    </span>

                                )}


                                {status === 'idle' && !isUploading && (

                                    <span className="text-gray-300">
                                        All changes are unsaved
                                    </span>

                                )}


                                {isUploading && (

                                    <span className="text-gray-400 flex items-center gap-1.5">

                                        <svg
                                            className="animate-spin"
                                            width="12"
                                            height="12"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >

                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />

                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8z"
                                            />

                                        </svg>

                                        Image uploading…

                                    </span>

                                )}


                                {saving && !isUploading && (

                                    <span className="text-gray-400 flex items-center gap-1.5">

                                        <svg
                                            className="animate-spin"
                                            width="12"
                                            height="12"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >

                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />

                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8z"
                                            />

                                        </svg>

                                        Creating…

                                    </span>

                                )}

                            </span>


                            <div className="flex gap-2">

                                <button
                                    type="button"
                                    disabled={saving || isUploading}
                                    onClick={() => {

                                        form.resetFields();

                                        setErrorList([]);
                                        setErrorMsg('');
                                        setStatus('idle');

                                    }}
                                    className="px-4 py-2 text-[13px] font-medium border border-gray-200 rounded-xl text-gray-500 bg-white hover:border-gray-300 hover:text-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Reset
                                </button>


                                <button
                                    type="submit"
                                    disabled={saving || isUploading}
                                    className="px-4 py-2 text-[13px] font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >

                                    {saving
                                        ? 'Creating…'
                                        : 'Create mentor'}

                                </button>

                            </div>

                        </div>

                    </div>

                </Form>

            </div>

        </ConfigProvider>
    );
}


/* =========================================================
   SPECIALIZATION INPUT
========================================================= */

function SelectSpecialization({
    value = [],
    onChange,
}: {
    value?: string[];
    onChange?: (value: string[]) => void;
}) {

    const [inputValue, setInputValue] = useState('');

    const addSpecialization = () => {

        const trimmed = inputValue.trim();

        if (!trimmed) return;

        if (
            value.some(
                (item) =>
                    item.toLowerCase() ===
                    trimmed.toLowerCase()
            )
        ) {
            setInputValue('');
            return;
        }

        onChange?.([...value, trimmed]);

        setInputValue('');
    };


    const removeSpecialization = (item: string) => {

        onChange?.(
            value.filter(
                (specialization) =>
                    specialization !== item
            )
        );
    };


    return (
        <div>

            <div className="flex gap-2">

                <Input
                    value={inputValue}
                    onChange={(e) =>
                        setInputValue(e.target.value)
                    }
                    onPressEnter={(e) => {
                        e.preventDefault();
                        addSpecialization();
                    }}
                    placeholder="JavaScript"
                    prefix={
                        <LuCode className="text-gray-400" />
                    }
                />

                <button
                    type="button"
                    onClick={addSpecialization}
                    className="shrink-0 px-4 rounded-xl bg-gray-900 text-white text-[12px] font-medium hover:bg-gray-700 transition-colors"
                >
                    Add
                </button>

            </div>


            {value.length > 0 && (

                <div className="flex flex-wrap gap-2 mt-3">

                    {value.map((item) => (

                        <span
                            key={item}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-[11px] font-semibold text-gray-600"
                        >

                            {item}

                            <button
                                type="button"
                                onClick={() =>
                                    removeSpecialization(item)
                                }
                                className="text-gray-300 hover:text-gray-700 text-sm leading-none"
                            >
                                ×
                            </button>

                        </span>

                    ))}

                </div>

            )}

        </div>
    );
}