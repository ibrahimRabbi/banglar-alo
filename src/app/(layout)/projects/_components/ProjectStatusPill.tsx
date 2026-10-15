import type { ProjectStatus, QuotationStatus } from '@/utils/projectData';
import { STATUS_LABEL } from '@/utils/projectData';

const projectStyles: Record<ProjectStatus, string> = {
    planning: 'bg-gray-100 text-gray-600',
    design: 'bg-purple-50 text-purple-600',
    development: 'bg-blue-50 text-blue-600',
    testing: 'bg-amber-50 text-amber-600',
    delivered: 'bg-green-50 text-green-600',
    on_hold: 'bg-red-50 text-red-500',
};

const quotationStyles: Record<QuotationStatus, string> = {
    pending: 'bg-amber-50 text-amber-600',
    confirmed: 'bg-green-50 text-green-600',
    rejected: 'bg-red-50 text-red-500',
};

const base = 'inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full capitalize';

export function ProjectStatusPill({ status }: { status: ProjectStatus }) {
    return <span className={`${base} ${projectStyles[status]}`}>{STATUS_LABEL[status]}</span>;
}

export function QuotationStatusPill({ status }: { status: QuotationStatus }) {
    return <span className={`${base} ${quotationStyles[status]}`}>{status}</span>;
}