'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Select, ConfigProvider } from 'antd';
import { MdArrowBack } from 'react-icons/md';
import {
    LuUserRound,
    LuMail,
    LuPhone,
    LuBriefcaseBusiness,
    LuWallet,
    LuClock,
    LuCalendarDays,
    LuMessageSquare,
    LuTag,
    LuRefreshCw,
    LuLoaderCircle,
    LuCircleAlert,
    LuPackagePlus,
    LuCircleCheck,
} from 'react-icons/lu';

import {
    useGetSingleBookingsQuery,
    useUpdateBookingStatusMutation,
} from '@/redux/features/services/serviceApi';
import CreateOrderDrawer from '../../_components/CreateOrderDrawer';

/* =============================================================
   TYPES & CONFIG
============================================================= */

type Booking = {
    id: string;
    serviceId: string;
    packageId: string | null;
    userId: string | null;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    message: string;
    offerType: string;
    budget: number | null;
    timeline: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    service: { id: string; title: string; slug: string; thumbnail: string } | null;
    package: { id: string; title: string } | null;
    order: { id: string } | null;
};

const antdTheme = {
    token: {
        colorPrimary: '#111827',
        colorBorder: '#e5e7eb',
        borderRadius: 12,
        controlHeight: 40,
        fontSize: 13,
    },
};

const STATUS_LIST = [
    'NEW',
    'CONTACTED',
    'IN_PROGRESS',
    'ACCEPTED',
    'COMPLETED',
    'CANCELLED',
    'REJECTED',
];

const getStatusStyle = (status: string) => {
    switch ((status || '').toUpperCase()) {
        case 'NEW':
            return { label: 'New', pill: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' };
        case 'CONTACTED':
            return { label: 'Contacted', pill: 'bg-cyan-50 text-cyan-700', dot: 'bg-cyan-500' };
        case 'IN_PROGRESS':
            return { label: 'In Progress', pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
        case 'ACCEPTED':
            return { label: 'Accepted', pill: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-500' };
        case 'COMPLETED':
            return { label: 'Completed', pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };
        case 'CANCELLED':
            return { label: 'Cancelled', pill: 'bg-red-50 text-red-600', dot: 'bg-red-500' };
        case 'REJECTED':
            return { label: 'Rejected', pill: 'bg-red-50 text-red-600', dot: 'bg-red-500' };
        default:
            return {
                label: status ? status.replace(/[_-]/g, ' ') : 'Unknown',
                pill: 'bg-gray-100 text-gray-600',
                dot: 'bg-gray-400',
            };
    }
};

const formatDate = (value?: string) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatLabel = (v?: string) =>
    (v || 'N/A')
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

const statusSelectOptions = (current: string) =>
    (STATUS_LIST.includes(current) || !current ? STATUS_LIST : [...STATUS_LIST, current]).map((s) => ({
        value: s,
        label: (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold">
                <span className={`h-1.5 w-1.5 rounded-full ${getStatusStyle(s).dot}`} />
                {getStatusStyle(s).label}
            </span>
        ),
    }));

/* =============================================================
   PAGE CONTENT
============================================================= */

function BookingDetails() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('id');

    const { data, isLoading, isError } = useGetSingleBookingsQuery(bookingId!, {
        skip: !bookingId,
    });
    const [updateBookingStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();

    const booking: Booking | undefined = data?.data;

    // the status the admin picked but has not saved yet
    const [selected, setSelected] = useState<string | undefined>();
    // create order drawer
    const [orderOpen, setOrderOpen] = useState(false);

    if (!bookingId) {
        return <Message title="Invalid booking link" text="The booking id is missing from the link." />;
    }

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <LuLoaderCircle size={26} className="animate-spin text-gray-500" />
                    <p className="text-xs font-medium text-gray-400">Loading booking...</p>
                </div>
            </main>
        );
    }

    if (isError || !booking) {
        return (
            <Message
                title="Booking not found"
                text="We couldn't find this booking. Please check the link and try again."
            />
        );
    }

    const current = (booking.status || '').toUpperCase();
    const value = selected ?? current;
    const style = getStatusStyle(current);
    const changed = value !== current;

    const handleUpdate = async () => {
        if (!changed) return;
        try {
            // sends { "status": "CONTACTED" } style body
            const res = await updateBookingStatus({
                id: booking.id,
                data: { status: value },
            }).unwrap();
            toast.success(res?.message || `Status changed to ${getStatusStyle(value).label}`);
            setSelected(undefined);
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to update status');
        }
    };

    return (
        <ConfigProvider theme={antdTheme}>
            <main className="min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                    <Link
                        href="/quation"
                        className="inline-flex items-center gap-2 mb-6 text-[12px] font-bold text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <MdArrowBack size={17} /> Back to bookings
                    </Link>

                    {/* HERO */}
                    <section className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sm:p-8">
                        <div className="absolute -top-28 -right-28 w-72 h-72 rounded-full bg-gray-900/[0.025]" />
                        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-400">
                                        Service booking
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${style.pill}`}
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                        {style.label}
                                    </span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                                    {booking.service?.title || booking.package?.title || 'Service booking'}
                                </h1>
                                <p className="text-sm text-gray-400 font-medium mt-2 break-all">
                                    Booking ID: {booking.id}
                                </p>
                            </div>

                            <div className="w-full md:w-72 shrink-0 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                                <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-gray-400 mb-2">
                                    Update status
                                </p>
                                <Select
                                    value={value}
                                    onChange={setSelected}
                                    options={statusSelectOptions(current)}
                                    disabled={isUpdating}
                                    className="w-full"
                                />
                                <button
                                    onClick={handleUpdate}
                                    disabled={!changed || isUpdating}
                                    className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {isUpdating ? (
                                        <LuLoaderCircle size={13} className="animate-spin" />
                                    ) : (
                                        <LuRefreshCw size={13} />
                                    )}
                                    {isUpdating ? 'Updating...' : 'Update status'}
                                </button>

                                {booking.order ? (
                                    <div className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium bg-emerald-50 text-emerald-600 rounded-xl">
                                        <LuCircleCheck size={14} /> Order already created
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setOrderOpen(true)}
                                        className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium border border-gray-200 rounded-xl text-gray-700 bg-white hover:border-gray-900 hover:text-gray-900 transition-all"
                                    >
                                        <LuPackagePlus size={14} /> Create order
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* STATS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
                        <StatCard
                            icon={<LuWallet size={18} />}
                            label="Budget"
                            value={
                                booking.budget !== null && booking.budget !== undefined
                                    ? `৳${booking.budget.toLocaleString('en-BD')}`
                                    : 'Not specified'
                            }
                        />
                        <StatCard icon={<LuClock size={18} />} label="Timeline" value={booking.timeline || 'N/A'} />
                        <StatCard icon={<LuTag size={18} />} label="Offer type" value={formatLabel(booking.offerType)} />
                        <StatCard
                            icon={<LuCalendarDays size={18} />}
                            label="Received"
                            value={formatDate(booking.createdAt)}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                        {/* LEFT */}
                        <div className="lg:col-span-2 space-y-4">
                            <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm">
                                <SectionHeader icon={<LuMessageSquare size={17} />} title="Client message" />
                                <p className="mt-5 text-sm text-gray-500 leading-7 whitespace-pre-line break-words">
                                    {booking.message || 'No message provided.'}
                                </p>
                            </section>

                            <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm">
                                <SectionHeader icon={<LuBriefcaseBusiness size={17} />} title="Service details" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                                    <InfoBox label="Service" value={booking.service?.title} />
                                    <InfoBox label="Package" value={booking.package?.title || 'No package (custom)'} />
                                    <InfoBox label="Offer type" value={formatLabel(booking.offerType)} />
                                    <InfoBox label="Timeline" value={booking.timeline} />
                                </div>
                            </section>
                        </div>

                        {/* RIGHT */}
                        <div className="space-y-4">
                            <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <SectionHeader icon={<LuUserRound size={17} />} title="Client" />
                                <p className="mt-5 text-[14px] font-extrabold text-gray-900">
                                    {booking.clientName || 'Unknown client'}
                                </p>
                                <div className="mt-3 space-y-2">
                                    <a
                                        href={`mailto:${booking.clientEmail}`}
                                        className="flex items-center gap-2.5 text-[11.5px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <LuMail size={13} className="shrink-0" />
                                        <span className="truncate">{booking.clientEmail || 'N/A'}</span>
                                    </a>
                                    {booking.clientPhone ? (
                                        <a
                                            href={`tel:${booking.clientPhone}`}
                                            className="flex items-center gap-2.5 text-[11.5px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                        >
                                            <LuPhone size={13} className="shrink-0" /> {booking.clientPhone}
                                        </a>
                                    ) : (
                                        <p className="flex items-center gap-2.5 text-[11.5px] font-semibold text-gray-300">
                                            <LuPhone size={13} className="shrink-0" /> N/A
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section className="bg-gray-900 rounded-3xl p-6 text-white shadow-sm">
                                <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-500">
                                    Booking ID
                                </p>
                                <h3 className="text-sm font-extrabold mt-2 break-all">{booking.id}</h3>

                                <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500">Created</span>
                                        <span className="text-[10px] font-bold">{formatDate(booking.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500">Last updated</span>
                                        <span className="text-[10px] font-bold">{formatDate(booking.updatedAt)}</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* CREATE ORDER DRAWER */}
                <CreateOrderDrawer
                    open={orderOpen}
                    onClose={() => setOrderOpen(false)}
                    booking={booking}
                />
            </main>
        </ConfigProvider>
    );
}

/* =============================================================
   SMALL COMPONENTS
============================================================= */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                    {icon}
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">{label}</span>
            </div>
            <p className="text-sm font-extrabold text-gray-800 mt-3 truncate">{value}</p>
        </div>
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                {icon}
            </div>
            <h2 className="text-sm font-extrabold text-gray-900">{title}</h2>
        </div>
    );
}

function InfoBox({ label, value }: { label: string; value?: string }) {
    return (
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3.5">
            <p className="text-[9px] uppercase tracking-wider font-bold text-gray-300">{label}</p>
            <p className="text-xs font-bold text-gray-600 mt-1 break-words">{value || 'N/A'}</p>
        </div>
    );
}

function Message({ title, text }: { title: string; text: string }) {
    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <LuCircleAlert size={24} className="text-gray-400" />
                </div>
                <h2 className="text-lg font-extrabold text-gray-900 mt-4">{title}</h2>
                <p className="text-xs text-gray-400 leading-relaxed mt-2">{text}</p>
                <Link
                    href="/quation"
                    className="inline-flex items-center gap-2 mt-6 bg-gray-900 text-white rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                    <MdArrowBack size={16} /> Back to bookings
                </Link>
            </div>
        </main>
    );
}

/* =============================================================
   PAGE (useSearchParams needs Suspense)
============================================================= */

export default function BookingDetailsPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen flex items-center justify-center">
                    <LuLoaderCircle size={22} className="animate-spin text-gray-500" />
                </main>
            }
        >
            <BookingDetails />
        </Suspense>
    );
}