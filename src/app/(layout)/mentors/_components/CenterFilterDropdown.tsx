'use client';
import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MdKeyboardArrowDown } from 'react-icons/md';
import type { TCenter } from '@/types/mentor';

export default function CenterFilterDropdown({
    value,
    centers,
}: {
    value: string;
    centers: TCenter[];
}) {
    const router = useRouter();
    const pathname = usePathname();

    const basePath = useMemo(() => {
        const segments = pathname.split('/').filter(Boolean);
        segments.pop();
        return '/' + segments.join('/');
    }, [pathname]);

    return (
        <div className="relative shrink-0">
            <select
                value={value}
                onChange={(e) => router.push(`${basePath}/${e.target.value}`)}
                className="appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-9 py-2.5 text-[12.5px] font-bold text-gray-700 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all max-w-[260px]"
            >
                <option value="all">All Training Centers</option>
                {centers.map((c) => (
                    <option key={c._id} value={c._id}>
                        {c.center_name}
                    </option>
                ))}
            </select>
            <MdKeyboardArrowDown
                size={16}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
        </div>
    );
}