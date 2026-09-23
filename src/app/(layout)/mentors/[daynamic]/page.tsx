'use client';

import { useMemo } from 'react';
import { mentors, type Mentor } from '@/utils/mentors';
import { trainingCenters, getTrainingCenterById, type TrainingCenter } from '@/utils/trainingCenter';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { MdLocationOn, MdSchool, MdKeyboardArrowDown } from 'react-icons/md';
import { FaRegEnvelope, FaPhoneAlt } from 'react-icons/fa';

/* ── fake avatar image (deterministic per mentor) ── */
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

/* ── mentor card ── */
function MentorCard({ mentor, center }: { mentor: Mentor; center?: TrainingCenter }) {
    return (
        <div className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.06] bg-gray-900" />

            <div className="flex items-center gap-3 mb-4">
                <img
                    src={avatarUrl(mentor.id)}
                    alt={mentor.name}
                    className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-sm border border-gray-100"
                />
                <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-gray-900 leading-tight truncate">{mentor.name}</p>
                    <p className="text-[11.5px] text-gray-400 font-medium mt-0.5 truncate">{mentor.expertise}</p>
                </div>
            </div>

            {/* training center info — the key relation, always shown on the card */}
            <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 mb-3">
                <MdSchool size={16} className="text-gray-400 shrink-0 mt-[1px]" />
                <div className="min-w-0">
                    <p className="text-[12px] font-bold text-gray-800 truncate">
                        {center ? center.name : 'Unassigned center'}
                    </p>
                    {center && (
                        <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                            <MdLocationOn size={12} className="shrink-0" />
                            {center.subArea}, {center.district} &middot; {center.division} Division
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between text-[11.5px] text-gray-400 font-medium">
                <span className="flex items-center gap-1.5 truncate">
                    <FaRegEnvelope size={11} className="shrink-0" />
                    <span className="truncate">{mentor.email}</span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                    <FaPhoneAlt size={10} />
                    {mentor.phone}
                </span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-[11px] text-gray-400 font-medium">Students assigned</span>
                <span className="text-[13px] font-extrabold text-gray-900">{mentor.studentsAssigned}</span>
            </div>
        </div>
    );
}

/* ── flat grid, no per-center headings ── */
function FlatMentorGrid({ list, centerById }: { list: Mentor[]; centerById: Map<string, TrainingCenter> }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {list.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} center={centerById.get(mentor.trainingCenterId)} />
            ))}
        </div>
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
    const randomMentors = useMemo(() => shuffle(mentors), []);

    /* ── case 1: grouped by training center ── */
    if (param === 'training-center') {
        const groups = trainingCenters
            .map((center) => ({
                center,
                centerMentors: mentors.filter((m) => m.trainingCenterId === center.id),
            }))
            .filter((g) => g.centerMentors.length > 0);

        return (
            <div className="min-h-screen w-[90%] mx-auto space-y-8 py-6">
                <PageHeader
                    title="Mentors by Training Center"
                    subtitle={`${mentors.length} mentors across ${groups.length} training centers`}
                    dropdownValue="all"
                />

                {groups.map(({ center, centerMentors }) => (
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
                                {centerMentors.length} mentor{centerMentors.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        <FlatMentorGrid list={centerMentors} centerById={centerById} />
                    </div>
                ))}
            </div>
        );
    }

    /* ── case 2: "all" — every mentor mixed together, no center headings ── */
    if (param === 'all') {
        return (
            <div className="min-h-screen w-[90%] mx-auto space-y-6 py-6">
                <PageHeader
                    title="All Mentors"
                    subtitle={`${mentors.length} mentors, mixed from every training center`}
                    dropdownValue="all"
                />

                <FlatMentorGrid list={randomMentors} centerById={centerById} />
            </div>
        );
    }

    /* ── case 3: param matches a specific training center id — single-center view ── */
    const matchedCenter = param ? getTrainingCenterById(param) : undefined;

    if (matchedCenter) {
        const centerMentors = mentors.filter((m) => m.trainingCenterId === matchedCenter.id);

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

                {centerMentors.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center text-[13px] text-gray-400 font-medium">
                        No mentors assigned to this training center yet.
                    </div>
                ) : (
                    <FlatMentorGrid list={centerMentors} centerById={centerById} />
                )}
            </div>
        );
    }

    /* ── fallback: unknown param, still show everyone mixed ── */
    return (
        <div className="min-h-screen w-[90%] mx-auto space-y-6 py-6">
            <PageHeader
                title="Mentors"
                subtitle={`${mentors.length} mentors, mixed from every training center`}
                dropdownValue="all"
            />

            <FlatMentorGrid list={randomMentors} centerById={centerById} />
        </div>
    );
};

export default Page;