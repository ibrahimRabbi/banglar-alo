 
import MentorCard from './MentorCard';
import type { Mentor, TCenter } from '@/types/mentor';

interface MentorGridProps {
    list: Mentor[];
    findCenter: (centerId: string | null) => TCenter | undefined;
}

export default function MentorGrid({
    list,
    findCenter,
}: MentorGridProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((mentor) => (
                <MentorCard
                    key={mentor.id}
                    mentor={mentor} 
                />
            ))}
        </div>
    );
}
 