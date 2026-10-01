'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    MdOutlineDashboardCustomize,
    MdOutlineMailOutline,
    MdSchool,
} from 'react-icons/md';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { CiSettings } from 'react-icons/ci';
import Image from 'next/image';

/* ─── types ─── */
interface SubItem {
    label: string;
    href: string;
    badge?: number;
}

interface NavGroup {
    key: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    children: SubItem[];
}

interface NavLink {
    key: string;
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
    external?: boolean;
}

/* ─── nav config ─── */
const NAV_GROUPS: NavGroup[] = [
    {
        key: 'training-centers',
        label: 'Training Centers',
        icon: <MdSchool size={17} />,
        badge: 42,
        children: [
            { label: 'All centers', href: '/training-centers/all' },
            { label: 'Add center', href: '/training-centers/create-center' },
        ],
    },
    {
        key: 'mentors',
        label: 'Mentors',
        icon: <FaChalkboardTeacher size={16} />,
        badge: 5,
        children: [
            { label: 'All mentors', href: '/mentors/all' },
            { label: 'Add mentor', href: '/mentors/add' },
            { label: 'By training center', href: '/mentors/training-center' },
            { label: 'Pending applications', href: '/mentors/applications' },
        ],
    },
    {
        key: 'students',
        label: 'Students',
        icon: <FaUserGraduate size={16} />,
        children: [
            { label: 'All students', href: '/students/all' },
            { label: 'Add student', href: '/students/add' },
            { label: 'By training center', href: '/students/training-center' },
            { label: 'Enrollments', href: '/students/enrollments' },
            { label: 'Certificates', href: '/students/certificates' },
        ],
    },
];

const NAV_LINKS: NavLink[] = [
    {
        key: 'overview',
        label: 'Overview',
        href: '/',
        icon: <MdOutlineDashboardCustomize size={17} />,
    },
];

const FOOTER_LINKS: NavLink[] = [
    {
        key: 'messages',
        label: 'Messages',
        href: '/messages',
        icon: <MdOutlineMailOutline size={17} />,
        badge: 3,
    },
    {
        key: 'settings',
        label: 'Manage App',
        href: '/dashboard/settings',
        icon: <CiSettings size={18} />,
        external: true,
    },
];

/* ─── icon wrapper ─── */
function NavIcon({
    active,
    children,
}: {
    active: boolean;
    children: React.ReactNode;
}) {
    return (
        <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${active ? 'bg-white/15 text-white' : 'bg-gray-50 text-gray-500'
                }`}
        >
            {children}
        </span>
    );
}

/* ─── single link item ─── */
function NavItem({ item, isActive }: { item: NavLink; isActive: boolean }) {
    return (
        <Link
            href={item.href}
            className={`group flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${isActive
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <NavIcon active={isActive}>{item.icon}</NavIcon>
            <span className="flex-1">{item.label}</span>
            {item.badge != null && (
                <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-50 text-red-500'
                        }`}
                >
                    {item.badge}
                </span>
            )}
            {item.external && (
                <svg
                    width="12"
                    height="12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="text-gray-300"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
            )}
        </Link>
    );
}

/* ─── collapsible group ─── */
function NavGroupItem({
    group,
    isGroupActive,
    pathname,
}: {
    group: NavGroup;
    isGroupActive: boolean;
    pathname: string;
}) {
    const [open, setOpen] = useState(isGroupActive);

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${isGroupActive && !open
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
            >
                <NavIcon active={isGroupActive && !open}>{group.icon}</NavIcon>
                <span className="flex-1 text-left">{group.label}</span>
                {group.badge != null && !open && (
                    <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isGroupActive && !open
                            ? 'bg-white/20 text-white'
                            : 'bg-red-50 text-red-500'
                            }`}
                    >
                        {group.badge}
                    </span>
                )}
                <svg
                    width="12"
                    height="12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {open && (
                <div className="mt-1 ml-[41px] flex flex-col gap-0.5 mb-1">
                    {group.children.map((sub) => {
                        const active = pathname === sub.href;
                        return (
                            <Link
                                key={sub.href}
                                href={sub.href}
                                className={`flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[12.5px] font-medium border-l-2 transition-all ${active
                                    ? 'border-gray-900 text-gray-900 bg-gray-50'
                                    : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${active ? 'bg-gray-900' : 'bg-gray-300'
                                        }`}
                                />
                                {sub.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── main layout with sidebar + children ─── */
export default function SidebarClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex gap-10 min-h-screen bg-[#fffbfb]">
            {/* Sidebar */}
            <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-screen sticky top-0">
                {/* Logo */}
                <div className="border-b border-gray-50 py-10 flex items-center justify-center">
                    <Link href='/' className='text-base font-light tracking-[0.25em] uppercase text-zinc-800 inline-block'>
                        <Image
                            src='https://res.cloudinary.com/dymnrefpr/image/upload/v1790859268/wptp7quzw5h8vtveeoyj.png'
                            alt='Banglar Alo Logo'
                            width={400}
                            height={40}
                            className='object-contain'
                        />
                    </Link>
                </div>

               
               

                {/* Nav */}
                <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
                    <p className="text-[10px] font-bold tracking-[.1em] uppercase text-gray-400 px-2 py-2">
                        Main
                    </p>

                    {NAV_LINKS.map((item) => (
                        <NavItem key={item.key} item={item} isActive={pathname === item.href} />
                    ))}

                    {NAV_GROUPS.map((group) => (
                        <NavGroupItem
                            key={group.key}
                            group={group}
                            isGroupActive={group.children.some((c) => pathname.startsWith(c.href))}
                            pathname={pathname}
                        />
                    ))}

                    <p className="text-[10px] font-bold tracking-[.1em] uppercase text-gray-400 px-2 py-2 mt-2">
                        Communication</p>

                    {FOOTER_LINKS.map((item) => (
                        <NavItem key={item.key} item={item} isActive={pathname === item.href} />
                    ))}
                </nav>

                {/* Bottom user hint */}
                <div className="px-3 pb-4 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] text-gray-400 font-medium">
                        Log Out
                    </div>
                </div>
            </aside>

            <main className="w-[80%]">
                {children}
            </main>
        </div>
    );
}