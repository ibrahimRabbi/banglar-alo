import CenterFilterDropdown from './CenterFilterDropdown';
import type { TCenter } from '@/types/mentor';

export default function PageHeader({
    title,
    subtitle,
    dropdownValue,
    centers,
}: {
    title: string;
    subtitle: React.ReactNode;
    dropdownValue: string;
    centers: TCenter[];
}) {
    return (
        <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
                <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">{title}</h1>
                <p className="text-[13px] text-gray-400 font-medium mt-1 flex items-center gap-1.5">
                    {subtitle}
                </p>
            </div>
            <CenterFilterDropdown value={dropdownValue} centers={centers} />
        </div>
    );
}