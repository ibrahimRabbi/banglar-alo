import { trainingCenters } from  "./trainingCenter";

export interface Mentor {
    id: string;
    name: string;
    email: string;
    phone: string;
    expertise: string;
    trainingCenterId: string;
    joinDate: string; // ISO date
    status: 'Active' | 'On leave';
    studentsAssigned: number;
    avatar: string; // initials
}

export const mentors: Mentor[] = [
    {
        id: 'mnt-01',
        name: 'Rafiul Islam',
        email: 'rafiul.islam@edutrack.bd',
        phone: '01711-223344',
        expertise: 'Web Development',
        trainingCenterId: 'tc-01',
        joinDate: '2023-02-14',
        status: 'Active',
        studentsAssigned: 18,
        avatar: 'RI',
    },
    {
        id: 'mnt-02',
        name: 'Nusrat Jahan',
        email: 'nusrat.jahan@edutrack.bd',
        phone: '01812-334455',
        expertise: 'Graphic Design',
        trainingCenterId: 'tc-01',
        joinDate: '2023-05-02',
        status: 'Active',
        studentsAssigned: 14,
        avatar: 'NJ',
    },
    {
        id: 'mnt-03',
        name: 'Shakil Ahmed',
        email: 'shakil.ahmed@edutrack.bd',
        phone: '01913-445566',
        expertise: 'Electrical Wiring',
        trainingCenterId: 'tc-02',
        joinDate: '2022-11-20',
        status: 'Active',
        studentsAssigned: 12,
        avatar: 'SA',
    },
    {
        id: 'mnt-04',
        name: 'Farhana Akter',
        email: 'farhana.akter@edutrack.bd',
        phone: '01614-556677',
        expertise: 'Tailoring & Garments',
        trainingCenterId: 'tc-03',
        joinDate: '2024-01-08',
        status: 'On leave',
        studentsAssigned: 9,
        avatar: 'FA',
    },
    {
        id: 'mnt-05',
        name: 'Tanvir Hasan',
        email: 'tanvir.hasan@edutrack.bd',
        phone: '01515-667788',
        expertise: 'Mobile App Development',
        trainingCenterId: 'tc-04',
        joinDate: '2022-08-30',
        status: 'Active',
        studentsAssigned: 21,
        avatar: 'TH',
    },
    {
        id: 'mnt-06',
        name: 'Sumaiya Binte Kamal',
        email: 'sumaiya.kamal@edutrack.bd',
        phone: '01716-778899',
        expertise: 'Digital Marketing',
        trainingCenterId: 'tc-04',
        joinDate: '2023-09-12',
        status: 'Active',
        studentsAssigned: 16,
        avatar: 'SK',
    },
    {
        id: 'mnt-07',
        name: 'Imran Kabir',
        email: 'imran.kabir@edutrack.bd',
        phone: '01817-889900',
        expertise: 'Hospitality & Tourism',
        trainingCenterId: 'tc-05',
        joinDate: '2023-03-25',
        status: 'Active',
        studentsAssigned: 11,
        avatar: 'IK',
    },
    {
        id: 'mnt-08',
        name: 'Mehedi Hasan',
        email: 'mehedi.hasan@edutrack.bd',
        phone: '01918-990011',
        expertise: 'CNC Machine Operation',
        trainingCenterId: 'tc-06',
        joinDate: '2022-06-18',
        status: 'Active',
        studentsAssigned: 15,
        avatar: 'MH',
    },
    {
        id: 'mnt-09',
        name: 'Rumana Sultana',
        email: 'rumana.sultana@edutrack.bd',
        phone: '01619-001122',
        expertise: 'Agro Processing',
        trainingCenterId: 'tc-07',
        joinDate: '2024-02-19',
        status: 'Active',
        studentsAssigned: 8,
        avatar: 'RS',
    },
    {
        id: 'mnt-10',
        name: 'Zahidul Islam',
        email: 'zahidul.islam@edutrack.bd',
        phone: '01520-112233',
        expertise: 'Refrigeration & AC',
        trainingCenterId: 'tc-08',
        joinDate: '2023-07-07',
        status: 'On leave',
        studentsAssigned: 10,
        avatar: 'ZI',
    },
    {
        id: 'mnt-11',
        name: 'Afsana Mimi',
        email: 'afsana.mimi@edutrack.bd',
        phone: '01721-223345',
        expertise: 'Beautification',
        trainingCenterId: 'tc-10',
        joinDate: '2023-10-30',
        status: 'Active',
        studentsAssigned: 13,
        avatar: 'AM',
    },
    {
        id: 'mnt-12',
        name: 'Kamrul Hasan',
        email: 'kamrul.hasan@edutrack.bd',
        phone: '01822-334456',
        expertise: 'Plumbing & Pipe Fitting',
        trainingCenterId: 'tc-12',
        joinDate: '2022-12-05',
        status: 'Active',
        studentsAssigned: 7,
        avatar: 'KH',
    },
];

/* ── helpers ── */
export function getMentorById(id: string) {
    return mentors.find((m) => m.id === id);
}

export function getMentorsByTrainingCenter(trainingCenterId: string) {
    return mentors.filter((m) => m.trainingCenterId === trainingCenterId);
}

export function getMentorsByDistrict(district: string) {
    const centerIds = trainingCenters
        .filter((tc:any) => tc.district.toLowerCase() === district.toLowerCase())
        .map((tc:any) => tc.id);
    return mentors.filter((m) => centerIds.includes(m.trainingCenterId));
}

export function getMentorsByDivision(division: string) {
    const centerIds = trainingCenters
        .filter((tc:any) => tc.division.toLowerCase() === division.toLowerCase())
        .map((tc:any) => tc.id);
    return mentors.filter((m) => centerIds.includes(m.trainingCenterId));
}