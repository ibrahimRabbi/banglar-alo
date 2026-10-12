
'use client';

import React, { useState } from 'react';
import {
    Form,
    Input,
    Select,
    Row,
    Col,
    ConfigProvider,
    InputNumber,
} from 'antd';
import {
    LuBookOpen,
    LuHash,
    LuLayers,
    LuFileText,
} from 'react-icons/lu';
import SectionCard from '../../training-centers/_components/SectionCard';
import MentorImageUploader from '../../mentors/_components/MentorImageUploader';


const { TextArea } = Input;

type FormValues = {
    course_name: string;
    course_code: number;
    category: string;
    description?: string;
    status: 'active' | 'inactive';
};

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

export default function CreateCoursePage() {
    const [form] = Form.useForm<FormValues>();
       const [isUploading, setIsUploading] = useState(false)

    // Integrate your course creation API here.
    const onFinish = async (_values: FormValues) => { };

    const onFinishFailed = ({
        errorFields,
    }: {
        errorFields: { errors: string[] }[];
    }) => {
        // Validation error handling can be added here.
    };

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="w-full lg:w-[90%] px-4 sm:px-6 py-10 md:py-10">
                {/* Header */}
                <div>
                    <p className="text-[22px] font-medium text-gray-900 mb-1">
                        Create Course
                    </p>

                    <div className="text-gray-400 text-[13px] mb-6">
                        Fill in the details below to create a new course.
                    </div>
                </div>

                <Form<FormValues>
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    initialValues={{
                        status: 'active',
                    }}
                >
                    <div className="flex flex-col gap-6">
                        {/* Basic Information */}
                        <SectionCard
                            title="Basic information"
                            subtitle="Enter the course name and identification details"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Course name"
                                        name="course_name"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Course name is required',
                                            },
                                            {
                                                whitespace: true,
                                                message: 'Course name cannot be empty',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Enter course name"
                                            prefix={
                                                <LuBookOpen className="text-gray-400" />
                                            }
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Course code"
                                        name="course_code"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Course code is required',
                                            },
                                            {
                                                validator: async (_, value) => {
                                                    if (
                                                        value === undefined ||
                                                        value === null ||
                                                        value === ''
                                                    ) {
                                                        return;
                                                    }

                                                    if (
                                                        !Number.isInteger(Number(value)) ||
                                                        Number(value) < 100000 ||
                                                        Number(value) > 999999
                                                    ) {
                                                        throw new Error(
                                                            'Course code must be a 6-digit number',
                                                        );
                                                    }
                                                },
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            className="!w-full"
                                            placeholder="Enter 6-digit course code"
                                            controls={false}
                                            maxLength={6}
                                            prefix={
                                                <LuHash className="text-gray-400" />
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </SectionCard>

                        {/* Course Details */}
                        <SectionCard
                            title="Course details"
                            subtitle="Organize and describe your course">
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Category"
                                        name="category"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Course category is required',
                                            },
                                        ]}>
                                        <Input
                                            placeholder="Enter course category"
                                            prefix={
                                                <LuLayers className="text-gray-400" />
                                            }
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Status"
                                        name="status"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Course status is required',
                                            },
                                        ]}
                                    >
                                        <Select
                                            placeholder="Select course status"
                                            options={[
                                                {
                                                    value: 'active',
                                                    label: 'Active',
                                                },
                                                {
                                                    value: 'inactive',
                                                    label: 'Inactive',
                                                },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Description"
                                name="description"
                                className="!mb-0"
                                rules={[
                                    {
                                        max: 1000,
                                        message:
                                            'Description cannot exceed 1000 characters',
                                    },
                                ]}
                            >
                                <TextArea
                                    rows={4}
                                    maxLength={1000}
                                    showCount
                                    placeholder="Write a short description about this course..."
                                    className="!resize-none"
                                />
                            </Form.Item>
                        </SectionCard>

                        {/* Media */}
                        <SectionCard title='Media' subtitle='Upload photos of the center'>
                            <Form.Item
                                name='center_images'
                                className='!mb-0'
                                rules={[
                                    {
                                        validator: (_, value: string[]) =>
                                            value?.length ? Promise.resolve() : Promise.reject('Please upload at least one image'),
                                    },
                                ]}
                            >
                                <MentorImageUploader onUploadingChange={setIsUploading} />
                            </Form.Item>
                        </SectionCard>

                        {/* Error summary */}
                        {/* {errorList.length > 0 && (
                            <div className='bg-red-50 border border-red-100 rounded-2xl px-6 py-4 flex items-start gap-3'>
                                <div className='w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5'>
                                    <svg width='10' height='10' fill='none' viewBox='0 0 24 24' stroke='#f87171' strokeWidth={2.5}>
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' />
                                    </svg>
                                </div>
                                <div>
                                    <p className='text-[12px] font-medium text-red-500 mb-1.5'>Please fix the following before creating:</p>
                                    <ul className='space-y-1'>
                                        {errorList.map((msg, i) => (
                                            <li key={i} className='flex items-center gap-1.5 text-[11px] text-red-400'>
                                                <span className='w-1 h-1 rounded-full bg-red-300 shrink-0' />
                                                {msg}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )} */}
                        {/* Footer */}
                        <div className="bg-white border border-gray-100 rounded-2xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                            <span className="text-[13px] text-gray-300">
                                All changes are unsaved
                            </span>

                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => form.resetFields()}
                                    className="px-4 py-2 text-[13px] font-medium border border-gray-200 rounded-xl text-gray-500 bg-white hover:border-gray-300 hover:text-gray-800 transition-all"
                                >
                                    Reset
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 text-[13px] font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all"
                                >
                                    Create course
                                </button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </ConfigProvider>
    );
}