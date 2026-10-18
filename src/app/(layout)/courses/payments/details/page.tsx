'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { MdArrowBack } from 'react-icons/md';
import {
    LuUserRound,
    LuMail,
    LuPhone,
    LuWallet,
    LuCreditCard,
    LuBookOpen,
    LuHash,
    LuCalendarDays,
    LuImage,
    LuCircleCheck,
    LuLoaderCircle,
    LuCircleAlert,
    LuExternalLink,
} from 'react-icons/lu';

import {
    useGetSinglePaymentReviewsQuery,
    useUpdatePaymentStatusMutation,
} from '@/redux/features/course/courseApi';

/* =============================================================
   TYPES & HELPERS
============================================================= */

type Payment = {
    id: string;
    tranId: string;
    courseId: string;
    amount: number;
    currency: string;
    status: string;
    gatewayUrl: string;
    paidAt: string | null;
    failReason: string;
    manualTransactionId: string;
    walletNumber: string;
    paymentMethod: string;
    screenshotUrl: string;
    submittedAt: string | null;
    verifiedAt: string | null;
    createdAt: string;
    course: { id: string; title: string; batch: string; price: number } | null;
    student: {
        id: string;
        fullName: string;
        email: string;
        phone: string;
        studentId: string | null;
    } | null;
    verifiedBy: { id?: string; fullName?: string; email?: string } | null;
};

// statuses that mean the payment is already done
const DONE_STATUSES = ['APPROVED', 'PAID', 'SUCCESS', 'VERIFIED'];

const formatLabel = (v?: string | null) =>
    (v || 'N/A')
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

const formatMoney = (amount?: number | null, currency = 'BDT') =>
    amount === null || amount === undefined
        ? 'N/A'
        : `${currency === 'BDT' ? '৳' : `${currency} `}${amount.toLocaleString('en-BD')}`;

const formatDateTime = (value?: string | null) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getStatusStyle = (status?: string | null) => {
    switch ((status || '').toUpperCase()) {
        case 'PENDING':
            return { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
        case 'SUBMITTED':
            return { pill: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' };
        case 'APPROVED':
        case 'PAID':
        case 'SUCCESS':
        case 'VERIFIED':
            return { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };
        case 'REJECTED':
        case 'FAILED':
        case 'CANCELLED':
            return { pill: 'bg-red-50 text-red-600', dot: 'bg-red-500' };
        default:
            return { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
    }
};

function StatusPill({ status }: { status?: string | null }) {
    const s = getStatusStyle(status);
    return (
        <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.pill}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {formatLabel(status)}
        </span>
    );
}

/* =============================================================
   PAGE CONTENT
============================================================= */

function PaymentDetails() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('id');

    const { data, isLoading, isFetching, isError, refetch } = useGetSinglePaymentReviewsQuery(
        paymentId!,
        { skip: !paymentId },
    );
    const [updatePaymentStatus, { isLoading: isUpdating }] = useUpdatePaymentStatusMutation();

    const payment: Payment | undefined = data?.data;

    if (!paymentId) {
        return <Message title="Invalid payment link" text="The payment id is missing from the link." />;
    }

    if (isLoading || (isFetching && !payment)) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <LuLoaderCircle size={26} className="animate-spin text-gray-500" />
                    <p className="text-xs font-medium text-gray-400">Loading payment...</p>
                </div>
            </main>
        );
    }

    if (isError || !payment) {
        return (
            <Message
                title="Payment not found"
                text="We couldn't load this payment. Please check the link and try again."
                onRetry={() => refetch()}
            />
        );
    }

    const isDone = DONE_STATUSES.includes((payment.status || '').toUpperCase());

    /* ---------- approve (only the id from the query parameter is sent) ---------- */

    const handleApprove = async () => {
        const result = await Swal.fire({
            title: 'Approve this payment?',
            html: `<b>${formatMoney(payment.amount, payment.currency)}</b> from <b>${payment.student?.fullName || 'the student'
                }</b> will be approved.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, approve',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#111827',
            cancelButtonColor: '#6b7280',
            reverseButtons: true,
            focusCancel: true,
        });

        if (!result.isConfirmed) return;

        try {
            const res = await updatePaymentStatus(paymentId).unwrap();
            toast.success(res?.message || 'Payment approved');
            await refetch();
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to approve payment');
        }
    };

    return (
        <main className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                <Link
                    href="/courses/payments"
                    className="inline-flex items-center gap-2 mb-6 text-[12px] font-bold text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <MdArrowBack size={17} /> Back to payments
                </Link>

                {/* HERO */}
                <section className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sm:p-8">
                    <div className="absolute -top-28 -right-28 w-72 h-72 rounded-full bg-gray-900/[0.025]" />

                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-400">
                                    Payment review
                                </span>
                                <StatusPill status={payment.status} />
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                                {formatMoney(payment.amount, payment.currency)}
                            </h1>

                            <p className="text-sm text-gray-400 font-medium mt-2 break-all">
                                Transaction: {payment.tranId || 'N/A'}
                            </p>
                        </div>

                        <div className="w-full md:w-72 shrink-0 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                            <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-gray-400 mb-3">
                                Review
                            </p>

                            <button
                                type="button"
                                onClick={handleApprove}
                                disabled={isDone || isUpdating}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <LuLoaderCircle size={14} className="animate-spin" />
                                ) : (
                                    <LuCircleCheck size={14} />
                                )}
                                {isUpdating ? 'Approving...' : isDone ? 'Already approved' : 'Approve payment'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
                    <StatCard
                        icon={<LuWallet size={18} />}
                        label="Amount"
                        value={formatMoney(payment.amount, payment.currency)}
                    />
                    <StatCard
                        icon={<LuCreditCard size={18} />}
                        label="Method"
                        value={payment.paymentMethod ? formatLabel(payment.paymentMethod) : 'Not provided'}
                    />
                    <StatCard
                        icon={<LuCalendarDays size={18} />}
                        label="Created"
                        value={formatDateTime(payment.createdAt)}
                    />
                    <StatCard
                        icon={<LuCalendarDays size={18} />}
                        label="Submitted"
                        value={formatDateTime(payment.submittedAt)}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                    {/* LEFT */}
                    <div className="lg:col-span-2 space-y-4">
                        <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm">
                            <SectionHeader icon={<LuCreditCard size={17} />} title="Payment information" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                                <InfoBox label="Transaction ID" value={payment.tranId} />
                                <InfoBox label="Manual transaction ID" value={payment.manualTransactionId} />
                                <InfoBox label="Wallet number" value={payment.walletNumber} />
                                <InfoBox
                                    label="Payment method"
                                    value={payment.paymentMethod ? formatLabel(payment.paymentMethod) : ''}
                                />
                                <InfoBox label="Paid at" value={formatDateTime(payment.paidAt)} />
                                <InfoBox label="Verified at" value={formatDateTime(payment.verifiedAt)} />
                            </div>

                            {payment.failReason && (
                                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                                    <p className="text-[9px] uppercase tracking-wider font-bold text-red-400">
                                        Fail reason
                                    </p>
                                    <p className="text-[12px] text-red-500 mt-1 break-words">
                                        {payment.failReason}
                                    </p>
                                </div>
                            )}
                        </section>

                        <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-7 shadow-sm">
                            <SectionHeader icon={<LuImage size={17} />} title="Payment screenshot" />

                            {payment.screenshotUrl ? (
                                <div className="mt-5">
                                    <a href={payment.screenshotUrl} target="_blank" rel="noreferrer">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={payment.screenshotUrl}
                                            alt="Payment screenshot"
                                            className="max-h-96 w-auto max-w-full rounded-2xl border border-gray-100 object-contain"
                                        />
                                    </a>
                                    <a
                                        href={payment.screenshotUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 mt-3 text-[11.5px] font-bold text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <LuExternalLink size={13} /> Open full size
                                    </a>
                                </div>
                            ) : (
                                <p className="mt-5 text-xs text-gray-400">
                                    The student has not uploaded a screenshot yet.
                                </p>
                            )}
                        </section>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                        <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                            <SectionHeader icon={<LuUserRound size={17} />} title="Student" />

                            <p className="mt-5 text-[14px] font-extrabold text-gray-900">
                                {payment.student?.fullName || 'Unknown student'}
                            </p>

                            <div className="mt-3 space-y-2">
                                <a
                                    href={payment.student?.email ? `mailto:${payment.student.email}` : undefined}
                                    className="flex items-center gap-2.5 text-[11.5px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    <LuMail size={13} className="shrink-0" />
                                    <span className="truncate">{payment.student?.email || 'N/A'}</span>
                                </a>

                                {payment.student?.phone ? (
                                    <a
                                        href={`tel:${payment.student.phone}`}
                                        className="flex items-center gap-2.5 text-[11.5px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <LuPhone size={13} className="shrink-0" />
                                        {payment.student.phone}
                                    </a>
                                ) : (
                                    <p className="flex items-center gap-2.5 text-[11.5px] font-semibold text-gray-300">
                                        <LuPhone size={13} className="shrink-0" />
                                        N/A
                                    </p>
                                )}

                                <p className="flex items-center gap-2.5 text-[11.5px] font-semibold text-gray-500">
                                    <LuHash size={13} className="shrink-0" />
                                    {payment.student?.studentId || 'No student ID yet'}
                                </p>
                            </div>
                        </section>

                        <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                            <SectionHeader icon={<LuBookOpen size={17} />} title="Course" />

                            {payment.course ? (
                                <div className="mt-5 space-y-3">
                                    <p className="text-[14px] font-extrabold text-gray-900 break-words">
                                        {payment.course.title}
                                    </p>
                                    <Row label="Batch" value={payment.course.batch} />
                                    <Row
                                        label="Course price"
                                        value={formatMoney(payment.course.price, payment.currency)}
                                    />
                                    <Row
                                        label="Amount paid"
                                        value={formatMoney(payment.amount, payment.currency)}
                                    />
                                </div>
                            ) : (
                                <p className="mt-5 text-xs text-gray-400">Course information is not available.</p>
                            )}
                        </section>

                        <section className="bg-gray-900 rounded-3xl p-6 text-white shadow-sm">
                            <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-gray-500">
                                Payment ID
                            </p>
                            <h3 className="text-sm font-extrabold mt-2 break-all">{payment.id}</h3>

                            <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-[10px] text-gray-500">Verified by</span>
                                    <span className="text-[10px] font-bold">
                                        {payment.verifiedBy?.fullName || 'Not verified'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-[10px] text-gray-500">Verified at</span>
                                    <span className="text-[10px] font-bold">
                                        {formatDateTime(payment.verifiedAt)}
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}

 

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

function InfoBox({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3.5">
            <p className="text-[9px] uppercase tracking-wider font-bold text-gray-300">{label}</p>
            <p className="text-xs font-bold text-gray-600 mt-1 break-all">{value || 'N/A'}</p>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-right text-xs font-medium text-gray-700">{value}</span>
        </div>
    );
}

function Message({ title, text, onRetry }: { title: string; text: string; onRetry?: () => void }) {
    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <LuCircleAlert size={24} className="text-gray-400" />
                </div>
                <h2 className="text-lg font-extrabold text-gray-900 mt-4">{title}</h2>
                <p className="text-xs text-gray-400 leading-relaxed mt-2">{text}</p>

                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 mt-5 border border-gray-200 text-gray-700 rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-gray-50 transition-colors"
                    >
                        Try again
                    </button>
                )}

                <div>
                    <Link
                        href="/payments"
                        className="inline-flex items-center gap-2 mt-5 bg-gray-900 text-white rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-gray-800 transition-colors"
                    >
                        <MdArrowBack size={16} />
                        Back to payments
                    </Link>
                </div>
            </div>
        </main>
    );
}

/* =============================================================
   PAGE (useSearchParams needs Suspense)
============================================================= */

export default function PaymentDetailsPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen flex items-center justify-center">
                    <LuLoaderCircle size={22} className="animate-spin text-gray-500" />
                </main>
            }
        >
            <PaymentDetails />
        </Suspense>
    );
}