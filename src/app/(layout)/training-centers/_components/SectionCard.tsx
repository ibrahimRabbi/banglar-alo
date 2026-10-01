import React from 'react'

type Props = { title: string; subtitle?: string; children: React.ReactNode }

const SectionCard = ({ title, subtitle, children }: Props) => (
    <div className='bg-white border border-gray-100 rounded-lg p-5'>
        <div className='mb-5'>
            <h2 className='text-[15px] font-medium text-gray-900'>{title}</h2>
            {subtitle && <p className='text-[12px] text-gray-400 mt-0.5'>{subtitle}</p>}
        </div>
        {children}
    </div>
)

export default SectionCard