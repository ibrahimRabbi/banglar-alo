import { trainingCenters } from "./trainingCenter";

 

export interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    trainingCenterId: string;
    mentorId: string;
    course: string;
    batch: string;
    enrollmentDate: string; // ISO date
    status: 'Enrolled' | 'Completed' | 'Dropped';
    avatar: string; // initials
}

export const students: Student[] = [
    { id: 'std-01', name: 'Arif Hossain', email: 'arif.hossain@mail.com', phone: '01711-100001', trainingCenterId: 'tc-01', mentorId: 'mnt-01', course: 'Web Development', batch: 'Batch 14', enrollmentDate: '2024-01-10', status: 'Enrolled', avatar: 'AH' },
    { id: 'std-02', name: 'Sadia Islam', email: 'sadia.islam@mail.com', phone: '01812-100002', trainingCenterId: 'tc-01', mentorId: 'mnt-01', course: 'Web Development', batch: 'Batch 14', enrollmentDate: '2024-01-10', status: 'Enrolled', avatar: 'SI' },
    { id: 'std-03', name: 'Mahin Chowdhury', email: 'mahin.chowdhury@mail.com', phone: '01913-100003', trainingCenterId: 'tc-01', mentorId: 'mnt-02', course: 'Graphic Design', batch: 'Batch 09', enrollmentDate: '2023-11-05', status: 'Completed', avatar: 'MC' },
    { id: 'std-04', name: 'Jannatul Ferdous', email: 'jannatul.ferdous@mail.com', phone: '01614-100004', trainingCenterId: 'tc-01', mentorId: 'mnt-02', course: 'Graphic Design', batch: 'Batch 09', enrollmentDate: '2023-11-05', status: 'Completed', avatar: 'JF' },
    { id: 'std-05', name: 'Rakibul Hasan', email: 'rakibul.hasan@mail.com', phone: '01515-100005', trainingCenterId: 'tc-02', mentorId: 'mnt-03', course: 'Electrical Wiring', batch: 'Batch 06', enrollmentDate: '2024-02-01', status: 'Enrolled', avatar: 'RH' },
    { id: 'std-06', name: 'Tania Akter', email: 'tania.akter@mail.com', phone: '01716-100006', trainingCenterId: 'tc-02', mentorId: 'mnt-03', course: 'Electrical Wiring', batch: 'Batch 06', enrollmentDate: '2024-02-01', status: 'Dropped', avatar: 'TA' },
    { id: 'std-07', name: 'Shariful Islam', email: 'shariful.islam@mail.com', phone: '01817-100007', trainingCenterId: 'tc-03', mentorId: 'mnt-04', course: 'Tailoring & Garments', batch: 'Batch 03', enrollmentDate: '2023-12-15', status: 'Enrolled', avatar: 'SI' },
    { id: 'std-08', name: 'Mousumi Akter', email: 'mousumi.akter@mail.com', phone: '01918-100008', trainingCenterId: 'tc-03', mentorId: 'mnt-04', course: 'Tailoring & Garments', batch: 'Batch 03', enrollmentDate: '2023-12-15', status: 'Enrolled', avatar: 'MA' },
    { id: 'std-09', name: 'Nayeem Ahmed', email: 'nayeem.ahmed@mail.com', phone: '01619-100009', trainingCenterId: 'tc-04', mentorId: 'mnt-05', course: 'Mobile App Development', batch: 'Batch 11', enrollmentDate: '2024-03-01', status: 'Enrolled', avatar: 'NA' },
    { id: 'std-10', name: 'Ruponti Das', email: 'ruponti.das@mail.com', phone: '01520-100010', trainingCenterId: 'tc-04', mentorId: 'mnt-05', course: 'Mobile App Development', batch: 'Batch 11', enrollmentDate: '2024-03-01', status: 'Enrolled', avatar: 'RD' },
    { id: 'std-11', name: 'Habibur Rahman', email: 'habibur.rahman@mail.com', phone: '01721-100011', trainingCenterId: 'tc-04', mentorId: 'mnt-06', course: 'Digital Marketing', batch: 'Batch 08', enrollmentDate: '2023-10-20', status: 'Completed', avatar: 'HR' },
    { id: 'std-12', name: 'Israt Jahan', email: 'israt.jahan@mail.com', phone: '01822-100012', trainingCenterId: 'tc-04', mentorId: 'mnt-06', course: 'Digital Marketing', batch: 'Batch 08', enrollmentDate: '2023-10-20', status: 'Completed', avatar: 'IJ' },
    { id: 'std-13', name: 'Abdullah Al Mamun', email: 'abdullah.mamun@mail.com', phone: '01711-100013', trainingCenterId: 'tc-05', mentorId: 'mnt-07', course: 'Hospitality & Tourism', batch: 'Batch 04', enrollmentDate: '2024-01-25', status: 'Enrolled', avatar: 'AM' },
    { id: 'std-14', name: 'Lamia Khan', email: 'lamia.khan@mail.com', phone: '01812-100014', trainingCenterId: 'tc-05', mentorId: 'mnt-07', course: 'Hospitality & Tourism', batch: 'Batch 04', enrollmentDate: '2024-01-25', status: 'Enrolled', avatar: 'LK' },
    { id: 'std-15', name: 'Fahim Muntasir', email: 'fahim.muntasir@mail.com', phone: '01913-100015', trainingCenterId: 'tc-06', mentorId: 'mnt-08', course: 'CNC Machine Operation', batch: 'Batch 05', enrollmentDate: '2023-09-14', status: 'Completed', avatar: 'FM' },
    { id: 'std-16', name: 'Nabila Yasmin', email: 'nabila.yasmin@mail.com', phone: '01614-100016', trainingCenterId: 'tc-06', mentorId: 'mnt-08', course: 'CNC Machine Operation', batch: 'Batch 05', enrollmentDate: '2023-09-14', status: 'Enrolled', avatar: 'NY' },
    { id: 'std-17', name: 'Tarek Aziz', email: 'tarek.aziz@mail.com', phone: '01515-100017', trainingCenterId: 'tc-07', mentorId: 'mnt-09', course: 'Agro Processing', batch: 'Batch 02', enrollmentDate: '2024-02-18', status: 'Enrolled', avatar: 'TA' },
    { id: 'std-18', name: 'Popy Rani Das', email: 'popy.das@mail.com', phone: '01716-100018', trainingCenterId: 'tc-07', mentorId: 'mnt-09', course: 'Agro Processing', batch: 'Batch 02', enrollmentDate: '2024-02-18', status: 'Enrolled', avatar: 'PD' },
    { id: 'std-19', name: 'Sagor Biswas', email: 'sagor.biswas@mail.com', phone: '01817-100019', trainingCenterId: 'tc-08', mentorId: 'mnt-10', course: 'Refrigeration & AC', batch: 'Batch 07', enrollmentDate: '2023-08-09', status: 'Dropped', avatar: 'SB' },
    { id: 'std-20', name: 'Rima Akter', email: 'rima.akter@mail.com', phone: '01918-100020', trainingCenterId: 'tc-08', mentorId: 'mnt-10', course: 'Refrigeration & AC', batch: 'Batch 07', enrollmentDate: '2023-08-09', status: 'Enrolled', avatar: 'RA' },
    { id: 'std-21', name: 'Anika Tabassum', email: 'anika.tabassum@mail.com', phone: '01619-100021', trainingCenterId: 'tc-10', mentorId: 'mnt-11', course: 'Beautification', batch: 'Batch 10', enrollmentDate: '2024-01-30', status: 'Enrolled', avatar: 'AT' },
    { id: 'std-22', name: 'Sumon Mia', email: 'sumon.mia@mail.com', phone: '01520-100022', trainingCenterId: 'tc-10', mentorId: 'mnt-11', course: 'Beautification', batch: 'Batch 10', enrollmentDate: '2024-01-30', status: 'Enrolled', avatar: 'SM' },
    { id: 'std-23', name: 'Rezaul Karim', email: 'rezaul.karim@mail.com', phone: '01721-100023', trainingCenterId: 'tc-12', mentorId: 'mnt-12', course: 'Plumbing & Pipe Fitting', batch: 'Batch 01', enrollmentDate: '2023-07-22', status: 'Completed', avatar: 'RK' },
    { id: 'std-24', name: 'Shirin Sultana', email: 'shirin.sultana@mail.com', phone: '01822-100024', trainingCenterId: 'tc-12', mentorId: 'mnt-12', course: 'Plumbing & Pipe Fitting', batch: 'Batch 01', enrollmentDate: '2023-07-22', status: 'Enrolled', avatar: 'SS' },
];

/* ── helpers ── */
export function getStudentById(id: string) {
    return students.find((s) => s.id === id);
}

export function getStudentsByTrainingCenter(trainingCenterId: string) {
    return students.filter((s) => s.trainingCenterId === trainingCenterId);
}

export function getStudentsByMentor(mentorId: string) {
    return students.filter((s) => s.mentorId === mentorId);
}

export function getStudentsByDistrict(district: string) {
    const centerIds = trainingCenters
        .filter((tc:any) => tc.district.toLowerCase() === district.toLowerCase())
        .map((tc:any) => tc.id);
    return students.filter((s) => centerIds.includes(s.trainingCenterId));
}

export function getStudentsByStatus(status: Student['status']) {
    return students.filter((s) => s.status === status);
}