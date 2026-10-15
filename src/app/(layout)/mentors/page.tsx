'use client';

import { useMemo } from 'react';
import { MdPeople } from 'react-icons/md';

 
import { useGetAllMentorsQuery } from '@/redux/features/mentor/mentorApi';
import type { Mentor } from '@/types/mentor';
import MentorGrid from './_components/MentorGrid';

export default function MentorsPage() {
    const {
        data: mentorResponse,
        isLoading,
        isError,
    } = useGetAllMentorsQuery({});

    const mentors: Mentor[] = useMemo(
        () => mentorResponse?.data ?? [],
        [mentorResponse]
    );

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                    <p className="mt-4 text-sm font-medium text-gray-500">
                        Loading mentors...
                    </p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
                <p className="font-semibold text-red-600">
                    Failed to load mentors.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    Please try again later.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <MdPeople className="text-2xl text-blue-600" />

                    <h1 className="text-2xl font-bold text-gray-900">
                        Our Mentors
                    </h1>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                    Meet our teachers and explore their profiles.
                </p>

                <p className="mt-3 text-sm font-semibold text-gray-700">
                    Total mentors: {mentors.length}
                </p>
            </div>

            {mentors.length > 0 ? (
                <MentorGrid
                    list={mentors}
                    findCenter={() => undefined}
                />
            ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
                    <MdPeople className="mx-auto text-4xl text-gray-300" />

                    <p className="mt-3 text-sm font-medium text-gray-500">
                        No mentors found.
                    </p>
                </div>
            )}
        </div>
    );
}
