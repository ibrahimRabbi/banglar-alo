 
'use client';

import { useState } from 'react';
import {
    Form,
    Input,
    ConfigProvider,
} from 'antd';

import {
    LuUserRound,
    LuMail,
    LuPhone,
    LuLockKeyhole,
} from 'react-icons/lu';

import { useCreateMentorMutation } from '@/redux/features/mentor/mentorApi';
import SectionCard from '../../training-centers/_components/SectionCard';

type FormValues = {
    fullName: string;
    email: string;
    password: string;
    phone: string;
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

export default function CreateMentorPage() {
    const [form] = Form.useForm<FormValues>();
    const [createMentor, { isLoading }] =
        useCreateMentorMutation();

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const onFinish = async (values: FormValues) => {
        setErrorMsg('');
        setSuccessMsg('');

        const payload = {
            fullName: values.fullName.trim(),
            email: values.email.trim(),
            password: values.password,
            phone: values.phone.trim(),
            role: 'Teacher' as const,
        };

        try {
            const response = await createMentor(payload).unwrap();

            console.log('Created teacher:', response);

            setSuccessMsg('Teacher created successfully!');
            form.resetFields();
        } catch (error: any) {
            console.error('Create teacher error:', error);

            setErrorMsg(
                error?.data?.message ||
                error?.error ||
                'Failed to create teacher. Please try again.'
            );
        }
    };

    return (
        <ConfigProvider theme={antdTheme}>
            <div className="w-full px-4 py-10 sm:px-6 lg:w-[90%]">

                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="mb-1 text-[22px] font-medium text-gray-900">
                        Create Teacher
                    </h1>

                    <p className="text-[13px] text-gray-400">
                        Fill in the details below to create a new teacher account.
                    </p>
                </div>

                <Form<FormValues>
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={onFinish}
                    onValuesChange={() => {
                        setErrorMsg('');
                        setSuccessMsg('');
                    }}
                >
                    <div className="flex flex-col gap-6">

                        <SectionCard
                            title="Teacher information"
                            subtitle="Enter the teacher's basic account details"
                        >
                            {/* Full Name */}
                            <Form.Item
                                label="Full name"
                                name="fullName"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Full name is required',
                                    },
                                    {
                                        min: 2,
                                        message: 'Name must be at least 2 characters',
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="Nabila Rahman"
                                    prefix={
                                        <LuUserRound className="text-gray-400" />
                                    }
                                />
                            </Form.Item>

                            {/* Email */}
                            <Form.Item
                                label="Email address"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Email is required',
                                    },
                                    {
                                        type: 'email',
                                        message: 'Enter a valid email address',
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="teacher@bait.com"
                                    prefix={
                                        <LuMail className="text-gray-400" />
                                    }
                                />
                            </Form.Item>

                            {/* Phone */}
                            <Form.Item
                                label="Phone number"
                                name="phone"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Phone number is required',
                                    },
                                    {
                                        pattern: /^01[3-9]\d{8}$/,
                                        message: 'Enter a valid BD phone number',
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="01700000000"
                                    maxLength={11}
                                    prefix={
                                        <LuPhone className="text-gray-400" />
                                    }
                                />
                            </Form.Item>

                            {/* Password */}
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Password is required',
                                    },
                                    {
                                        min: 4,
                                        message: 'Password must be at least 4 characters',
                                    },
                                ]}
                            >
                                <Input.Password
                                    placeholder="Enter password"
                                    prefix={
                                        <LuLockKeyhole className="text-gray-400" />
                                    }
                                />
                            </Form.Item>
                        </SectionCard>

                        {/* Messages */}
                        {errorMsg && (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
                                {errorMsg}
                            </div>
                        )}

                        {successMsg && (
                            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-600">
                                {successMsg}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-[12px] text-gray-400">
                                Role will automatically be set to Teacher.
                            </span>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => {
                                        form.resetFields();
                                        setErrorMsg('');
                                        setSuccessMsg('');
                                    }}
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-500 transition hover:border-gray-300 hover:text-gray-800 disabled:opacity-50"
                                >
                                    Reset
                                </button>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-xl bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoading
                                        ? 'Creating...'
                                        : 'Create Teacher'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </ConfigProvider>
    );
}
 