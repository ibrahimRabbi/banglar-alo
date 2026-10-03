'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MdLocationOn, MdSchool } from 'react-icons/md';
import { useGetAllMentorsQuery } from '@/redux/features/mentor/mentorApi';
import { useGetAllcenterQuery } from '@/redux/features/center/centerApi';
import { mentorBelongsTo, type Mentor, type TCenter } from '@/types/mentor';
import MentorGrid from './_components/MentorGrid';
import PageHeader from './_components/PageHeader';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen w-[90%] mx-auto space-y-6 py-6">{children}</div>
);

const Page = () => {
    const { daynamic } = useParams<{ daynamic?: string | string[] }>();
    const param = Array.isArray(daynamic) ? daynamic[0] : daynamic;

    const { data: mentorResponse, isLoading: mentorsLoading } = useGetAllMentorsQuery({});
    const { data: centerResponse, isLoading: centersLoading } = useGetAllcenterQuery({});

    const mentors: Mentor[] = useMemo(() => mentorResponse?.data ?? [], [mentorResponse]);
    const centers: TCenter[] = useMemo(() => centerResponse?.data ?? [], [centerResponse]);

    // Look up a mentor's center by either _id or center_id
    const centerMap = useMemo(() => {
        const map = new Map<string, TCenter>();
        centers.forEach((c) => {
            map.set(c._id, c);
            map.set(c.center_id, c);
        });
        return map;
    }, [centers]);

    const findCenter = useCallback(
        (id: string | null) => (id ? centerMap.get(id) : undefined),
        [centerMap]
    );

    // Shuffled once per data load
    const shuffledMentors = useMemo(() => {
        const copy = [...mentors];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }, [mentors]);

    if (mentorsLoading || centersLoading) {
        return (
            <div className="min-h-screen w-[90%] mx-auto flex items-center justify-center">
                <p className="text-[13px] text-gray-400 font-medium">Loading mentors...</p>
            </div>
        );
    }

    /* ── Mentors grouped by training center ── */
    if (param === 'training-center') {
        const groups = centers
            .map((center) => ({
                center,
                centerMentors: mentors.filter((m) => mentorBelongsTo(m, center)),
            }))
            .filter((g) => g.centerMentors.length > 0);

        return (
            <div className="min-h-screen w-[90%] mx-auto space-y-8 py-6">
                <PageHeader
                    title="Mentors by Training Center"
                    subtitle={`${mentors.length} mentors across ${groups.length} training centers`}
                    dropdownValue="all"
                    centers={centers}
                />

                {groups.map(({ center, centerMentors }) => (
                    <section key={center._id}>
                        {/* Only the header is a link, cards have their own links */}
                        <Link href={`/mentors/${center._id}`} className="flex items-center gap-2 mb-3">
                            <span className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0">
                                <MdSchool size={14} />
                            </span>
                            <div>
                                <p className="text-[13.5px] font-extrabold text-gray-900 leading-none">
                                    {center.center_name}
                                </p>
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5 capitalize">
                                    {center.sub_area}, {center.district} · {center.division} Division
                                </p>
                            </div>
                            <span className="ml-auto text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                                {centerMentors.length} mentor{centerMentors.length > 1 ? 's' : ''}
                            </span>
                        </Link>

                        <MentorGrid list={centerMentors} findCenter={findCenter} />
                    </section>
                ))}
            </div>
        );
    }

    /* ── Single training center ── */
    const matchedCenter =
        param && param !== 'all'
            ? centers.find((c) => c._id === param || c.center_id === param)
            : undefined;

    if (matchedCenter) {
        const centerMentors = mentors.filter((m) => mentorBelongsTo(m, matchedCenter));

        return (
            <Wrapper>
                <PageHeader
                    title={matchedCenter.center_name}
                    subtitle={
                        <span className="flex items-center gap-1.5 capitalize">
                            <MdLocationOn size={14} />
                            {matchedCenter.sub_area}, {matchedCenter.district} · {matchedCenter.division} Division
                        </span>
                    }
                    dropdownValue={matchedCenter._id}
                    centers={centers}
                />

                {centerMentors.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center text-[13px] text-gray-400 font-medium">
                        No mentors assigned to this training center yet.
                    </div>
                ) : (
                    <MentorGrid list={centerMentors} findCenter={findCenter} />
                )}
            </Wrapper>
        );
    }

    /* ── All mentors (also the default) ── */
    return (
        <Wrapper>
            <PageHeader
                title={param === 'all' ? 'All Mentors' : 'Mentors'}
                subtitle={`${mentors.length} mentors, mixed from every training center`}
                dropdownValue="all"
                centers={centers}
            />
            <MentorGrid list={shuffledMentors} findCenter={findCenter} />
        </Wrapper>
    );
};

export default Page;