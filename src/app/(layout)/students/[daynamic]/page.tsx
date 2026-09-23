'use client';

import { useMemo } from 'react';
import { students, type Student } from '@/utils/students';
import { trainingCenters, getTrainingCenterById, type TrainingCenter } from '@/utils/trainingCenter';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { MdLocationOn, MdSchool, MdKeyboardArrowDown } from 'react-icons/md';

/* ── fake avatar image (deterministic per student) ── */
function avatarUrl(seed: string) {
    return `https://i.pravatar.cc/150?u=${seed}`;
}

/* ── shuffle helper (Fisher–Yates) ── */
function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/* ── status pill ── */
function StatusPill({ status }: { status: Student['status'] }) {
    const styles: Record<Student['status'], string> = {
        Enrolled: 'bg-blue-50 text-blue-600',
        Completed: 'bg-green-50 text-green-600',
        Dropped: 'bg-red-50 text-red-500',
    };
    return (
        <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full ${styles[status]}`}>
            {status}
        </span>
    );
}

/* ── training center filter dropdown, sits to the right of the title ── */
function CenterFilterDropdown({ value }: { value: string }) {
    const router = useRouter();
    const pathname = usePathname();

    const basePath = useMemo(() => {
        const segments = pathname.split('/').filter(Boolean);
        segments.pop(); // drop the current dynamic segment
        return '/' + segments.join('/');
    }, [pathname]);

    return (
        <div className="relative shrink-0">
            <select
                value={value}
                onChange={(e) => router.push(`${basePath}/${e.target.value}`)}
                className="appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-9 py-2.5 text-[12.5px] font-bold text-gray-700 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
            >
                <option value="all">All Training Centers</option>
                {trainingCenters.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
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

/* ── shared page header: title + subtitle on the left, dropdown on the right ── */
function PageHeader({
    title,
    subtitle,
    dropdownValue,
}: {
    title: string;
    subtitle: React.ReactNode;
    dropdownValue: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">{title}</h1>
                <p className="text-[13px] text-gray-400 font-medium mt-1 flex items-center gap-1.5">{subtitle}</p>
            </div>
            <CenterFilterDropdown value={dropdownValue} />
        </div>
    );
}

/* ── students table ── */
function StudentsTable({
    list,
    centerById,
    showCenterColumn = false,
}: {
    list: Student[];
    centerById: Map<string, TrainingCenter>;
    showCenterColumn?: boolean;
}) {
    if (list.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center text-[13px] text-gray-400 font-medium">
                No students found.
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                            <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">Student</th>
                            <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">Contact</th>
                            <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">Course</th>
                            <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">Batch</th>
                            {showCenterColumn && (
                                <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">Training Center</th>
                            )}
                            <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">Enrolled</th>
                            <th className="px-5 py-3 text-[10.5px] font-bold tracking-[.06em] uppercase text-gray-400">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((student) => {
                            const center = centerById.get(student.trainingCenterId);
                            return (
                                <tr key={student.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={avatarUrl(student.id)}
                                                alt={student.name}
                                                className="w-9 h-9 rounded-xl object-cover shrink-0 border border-gray-100"
                                            />
                                            <span className="text-[13px] font-bold text-gray-900 whitespace-nowrap">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <p className="text-[12px] text-gray-600 font-medium whitespace-nowrap">{student.email}</p>
                                        <p className="text-[11.5px] text-gray-400 font-medium whitespace-nowrap">{student.phone}</p>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-[12.5px] text-gray-700 font-medium whitespace-nowrap">{student.course}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-[12.5px] text-gray-500 font-medium whitespace-nowrap">{student.batch}</span>
                                    </td>
                                    {showCenterColumn && (
                                        <td className="px-5 py-3.5">
                                            {center ? (
                                                <div className="flex items-center gap-1.5">
                                                    <MdSchool size={13} className="text-gray-400 shrink-0" />
                                                    <div>
                                                        <p className="text-[12px] font-bold text-gray-800 whitespace-nowrap">{center.name}</p>
                                                        <p className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                                                            {center.subArea}, {center.district}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[12px] text-gray-400">Unassigned</span>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-5 py-3.5">
                                        <span className="text-[12px] text-gray-500 font-medium whitespace-nowrap">
                                            {new Date(student.enrollmentDate).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <StatusPill status={student.status} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ── page ── */
const Page = () => {
    const { daynamic } = useParams<{ daynamic?: string | string[] }>();
    const param = Array.isArray(daynamic) ? daynamic[0] : daynamic;

    const centerById = useMemo(() => {
        const map = new Map<string, TrainingCenter>();
        trainingCenters.forEach((c) => map.set(c.id, c));
        return map;
    }, []);

    /* random mixed order, shuffled once per mount — used for the "all" view */
    const randomStudents = useMemo(() => shuffle(students), []);

    /* ── case 1: grouped by training center, one table per center ── */
    if (param === 'training-center') {
        const groups = trainingCenters
            .map((center) => ({
                center,
                centerStudents: students.filter((s) => s.trainingCenterId === center.id),
            }))
            .filter((g) => g.centerStudents.length > 0);

        return (
            <div className="min-h-screen w-[90%] mx-auto space-y-8 py-6">
                <PageHeader
                    title="Students by Training Center"
                    subtitle={`${students.length} students across ${groups.length} training centers`}
                    dropdownValue="all"
                />

                {groups.map(({ center, centerStudents }) => (
                    <div key={center.id}>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0">
                                <MdSchool size={14} />
                            </span>
                            <div>
                                <p className="text-[13.5px] font-extrabold text-gray-900 leading-none">{center.name}</p>
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                                    {center.subArea}, {center.district} &middot; {center.division} Division
                                </p>
                            </div>
                            <span className="ml-auto text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                                {centerStudents.length} student{centerStudents.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        <StudentsTable list={centerStudents} centerById={centerById} />
                    </div>
                ))}
            </div>
        );
    }

    /* ── case 2: "all" — every student mixed together, in one table with a Center column ── */
    if (param === 'all') {
        return (
            <div className="min-h-screen w-[90%] mx-auto space-y-6 py-6">
                <PageHeader
                    title="All Students"
                    subtitle={`${students.length} students, mixed from every training center`}
                    dropdownValue="all"
                />

                <StudentsTable list={randomStudents} centerById={centerById} showCenterColumn />
            </div>
        );
    }

    /* ── case 3: param matches a specific training center id — only students enrolled there ── */
    const matchedCenter = param ? getTrainingCenterById(param) : undefined;

    if (matchedCenter) {
        const centerStudents = students.filter((s) => s.trainingCenterId === matchedCenter.id);

        return (
            <div className="min-h-screen w-[90%] mx-auto space-y-6 py-6">
                <PageHeader
                    title={matchedCenter.name}
                    subtitle={
                        <>
                            <MdLocationOn size={14} />
                            {matchedCenter.subArea}, {matchedCenter.district} &middot; {matchedCenter.division} Division
                        </>
                    }
                    dropdownValue={matchedCenter.id}
                />

                <StudentsTable list={centerStudents} centerById={centerById} />
            </div>
        );
    }

    /* ── fallback: unknown param, still show everyone mixed ── */
    return (
        <div className="min-h-screen w-[90%] mx-auto space-y-6 py-6">
            <PageHeader
                title="Students"
                subtitle={`${students.length} students, mixed from every training center`}
                dropdownValue="all"
            />

            <StudentsTable list={randomStudents} centerById={centerById} showCenterColumn />
        </div>
    );
};

export default Page;