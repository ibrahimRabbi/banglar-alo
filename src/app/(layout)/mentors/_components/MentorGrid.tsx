import MentorCard from './MentorCard';
import type { Mentor, TCenter } from '@/types/mentor';

export default function MentorGrid({
    list,
    findCenter,
}: {
    list: Mentor[];
    findCenter: (centerId: string | null) => TCenter | undefined;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {list.map((mentor) => (
                <MentorCard key={mentor._id} mentor={mentor} center={findCenter(mentor.center_id)} />
            ))}
        </div>
    );
}