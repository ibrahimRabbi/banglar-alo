'use client'
import React, { useMemo, useState } from 'react'
import { Form, Input, Select, Row, Col, ConfigProvider } from 'antd'
import { LuBuilding2, LuMapPin, LuMail, LuPhone } from 'react-icons/lu'
import { useCreateCenterMutation } from '@/redux/features/center/centerApi'
import { bangladeshLocations } from '@/utils/bangladeshLocations'
import SectionCard from '../_components/SectionCard'
import ImageUploader from '../_components/ImageUploader'


type FormValues = {
    center_name: string
    division: string
    district: string
    sub_area: string
    center_address: string
    center_email: string
    center_phone: string
    center_images: string[]
}

type Status = 'idle' | 'saving' | 'success' | 'error'

const toOptions = (list: string[]) => [...new Set(list)].map((v) => ({ value: v, label: v }))

const antdTheme = {
    token: {
        colorPrimary: '#111827',
        colorBorder: '#e5e7eb',
        borderRadius: 12,
        controlHeight: 40,
        fontSize: 13,
    },
    components: {
        Form: { labelFontSize: 12, labelColor: '#6b7280', verticalLabelPadding: '0 0 4px' },
    },
}

export default function CreateCenterPage() {
    const [form] = Form.useForm<FormValues>()
    const [createCenter] = useCreateCenterMutation()

    const [status, setStatus] = useState<Status>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [errorList, setErrorList] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)

    const division = Form.useWatch('division', form)
    const district = Form.useWatch('district', form)

    const divisionOptions = useMemo(() => toOptions(bangladeshLocations.map((d) => d.name)), [])
    const districtOptions = useMemo(() => {
        const div = bangladeshLocations.find((d) => d.name === division)
        return toOptions(div?.districts.map((d) => d.name) ?? [])
    }, [division])
    const subAreaOptions = useMemo(() => {
        const div = bangladeshLocations.find((d) => d.name === division)
        const dist = div?.districts.find((d) => d.name === district)
        return toOptions(dist?.subAreas ?? [])
    }, [division, district])

    const onFinish = async (values: FormValues) => {
        setErrorList([])
        setStatus('saving')
        try {
            const creating = await createCenter(values).unwrap()
            if (creating?.data) {
                setStatus('success')
                form.resetFields()
                setTimeout(() => setStatus('idle'), 2500)
                
            }

        } catch (err: any) {
            setErrorMsg(err?.data?.message || 'Something went wrong. Please try again.')
            setStatus('error')
            setTimeout(() => setStatus('idle'), 3500)
        }
    }

    const onFinishFailed = ({ errorFields }: { errorFields: { errors: string[] }[] }) =>
        setErrorList(errorFields.map((f) => f.errors[0]))

    const saving = status === 'saving'

    return (
        <ConfigProvider theme={antdTheme}>
            <div className='w-full lg:w-[90%]  px-4 sm:px-6 py-10 md:py-10'>

                <div>
                    <p className='text-[22px] font-medium text-gray-900 mb-1'>
                        Create Training Center
                    </p>
                    <div className='text-gray-400 text-[13px] mb-6'>
                        Fill in the details below to create a new training center.
                    </div>
                </div>
                <Form<FormValues>
                    form={form}
                    layout='vertical'
                    requiredMark={false}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    onValuesChange={() => errorList.length && setErrorList([])}
                    initialValues={{
                        center_name: 'Banglar Alo IT Institute',
                        center_images: []
                    }}

                >
                    <div className='flex flex-col gap-6'>
                        {/* Basic info */}
                        <SectionCard title='Basic information' subtitle='Name of the training center'>
                            <Form.Item
                                label='Center name'
                                name='center_name'
                                className='!mb-0'
                                rules={[{ required: true, message: 'Center name is required' }]}
                            >
                            <Input readOnly prefix={<LuBuilding2 className='text-gray-400' />} />
                            </Form.Item>
                        </SectionCard>

                        {/* Location */}
                        <SectionCard title='Location' subtitle='Where the center is located'>
                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item label='Division' name='division' rules={[{ required: true, message: 'Division is required' }]}>
                                        <Select
                                            showSearch
                                            placeholder='Select division'
                                            options={divisionOptions}
                                            onChange={() => form.setFieldsValue({ district: undefined, sub_area: undefined })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item label='District' name='district' rules={[{ required: true, message: 'District is required' }]}>
                                        <Select
                                            showSearch
                                            placeholder='Select district'
                                            disabled={!division}
                                            options={districtOptions}
                                            onChange={() => form.setFieldsValue({ sub_area: undefined })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item label='Sub area' name='sub_area' rules={[{ required: true, message: 'Sub area is required' }]}>
                                        <Select showSearch placeholder='Select sub area' disabled={!district} options={subAreaOptions} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item
                                label='Center address'
                                name='center_address'
                                className='!mb-0'
                                rules={[{ required: true, message: 'Address is required' }]}
                            >
                                <Input placeholder='House 12, Road 5, Mirpur-10, Dhaka' prefix={<LuMapPin className='text-gray-400' />} />
                            </Form.Item>
                        </SectionCard>

                        {/* Contact */}
                        <SectionCard title='Contact' subtitle='How people can reach this center'>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label='Email'
                                        name='center_email'
                                        className='!mb-0'
                                        rules={[
                                            { required: true, message: 'Email is required' },
                                            { type: 'email', message: 'Enter a valid email' },
                                        ]}
                                    >
                                        <Input placeholder='dhaka@trainingcenter.com' prefix={<LuMail className='text-gray-400' />} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label='Phone'
                                        name='center_phone'
                                        className='!mb-0'
                                        rules={[
                                            { required: true, message: 'Phone is required' },
                                            { pattern: /^01[3-9]\d{8}$/, message: 'Enter a valid BD phone number' },
                                        ]}
                                    >
                                        <Input placeholder='01711000001' maxLength={11} prefix={<LuPhone className='text-gray-400' />} />
                                    </Form.Item>
                                </Col>
                            </Row>
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
                                <ImageUploader onUploadingChange={setIsUploading} />
                            </Form.Item>
                        </SectionCard>

                        {/* Error summary */}
                        {errorList.length > 0 && (
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
                        )}

                        {/* Footer */}
                        <div className='bg-white border border-gray-100 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm'>
                            <span className='text-[13px]'>
                                {status === 'success' && (
                                    <span className='text-green-500 font-medium flex items-center gap-1.5'>
                                        <span className='w-4 h-4 rounded-full bg-green-400 flex items-center justify-center shrink-0'>
                                            <svg width='8' height='8' fill='none' viewBox='0 0 24 24' stroke='white' strokeWidth={3}>
                                                <path strokeLinecap='round' strokeLinejoin='round' d='M4.5 12.75l6 6 9-13.5' />
                                            </svg>
                                        </span>
                                        Center created successfully
                                    </span>
                                )}
                                {status === 'error' && <span className='text-red-400 font-medium'>{errorMsg}</span>}
                                {status === 'idle' && (
                                    <span className='text-gray-300'>{isUploading ? 'Image uploading…' : 'All changes are unsaved'}</span>
                                )}
                                {saving && (
                                    <span className='text-gray-400 flex items-center gap-1.5'>
                                        <svg className='animate-spin' width='12' height='12' fill='none' viewBox='0 0 24 24'>
                                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' />
                                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                                        </svg>
                                        Saving…
                                    </span>
                                )}
                            </span>

                            <div className='flex gap-2'>
                                <button
                                    type='button'
                                    disabled={saving}
                                    onClick={() => form.resetFields()}
                                    className='px-4 py-2 text-[13px] font-medium border border-gray-200 rounded-xl text-gray-500 bg-white hover:border-gray-300 hover:text-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed'
                                >
                                    Reset
                                </button>
                                <button
                                    type='submit'
                                    disabled={saving || isUploading}
                                    className='px-4 py-2 text-[13px] font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed'
                                >
                                    {saving ? 'Creating…' : 'Create center'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>

        </ConfigProvider>
    )
}