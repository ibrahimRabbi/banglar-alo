export type QuotationStatus = 'pending' | 'confirmed' | 'rejected';
export type ProjectStatus =
    | 'planning'
    | 'design'
    | 'development'
    | 'testing'
    | 'delivered'
    | 'on_hold';

export interface Quotation {
    id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    website_type: string;
    budget: number;
    deadline?: string;
    message: string;
    status: QuotationStatus;
    project_id?: string;
    createdAt: string;
}

export interface ProjectLog {
    status: ProjectStatus;
    note?: string;
    date: string;
}

export interface Project {
    id: string;
    project_code: string;
    quotation_id: string;
    title: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    website_type: string;
    budget: number;
    paid: number;
    deadline: string;
    status: ProjectStatus;
    progress: number;
    logs: ProjectLog[];
    createdAt: string;
}

/* ---------- status config ---------- */

export const STATUS_FLOW: ProjectStatus[] = ['planning', 'design', 'development', 'testing', 'delivered'];

export const STATUS_LABEL: Record<ProjectStatus, string> = {
    planning: 'Planning',
    design: 'Design',
    development: 'Development',
    testing: 'Testing',
    delivered: 'Delivered',
    on_hold: 'On hold',
};

export const STATUS_PROGRESS: Record<ProjectStatus, number> = {
    planning: 10,
    design: 30,
    development: 60,
    testing: 85,
    delivered: 100,
    on_hold: 0,
};

export const WEBSITE_TYPES = ['Business website', 'E-commerce', 'Portfolio', 'Landing page', 'Web application', 'School / Institute'];

/* ---------- fake data ---------- */

let quotations: Quotation[] = [
    {
        id: 'q1', name: 'Rafiq Ahmed', email: 'rafiq@example.com', phone: '01711000001',
        company: 'Rafiq Traders', website_type: 'E-commerce', budget: 80000, deadline: '2026-12-15',
        message: 'We need an online shop with bKash payment and admin dashboard.',
        status: 'pending', createdAt: '2026-10-10T08:20:00.000Z',
    },
    {
        id: 'q2', name: 'Nusrat Jahan', email: 'nusrat@example.com', phone: '01812000002',
        company: 'Sunrise School', website_type: 'School / Institute', budget: 45000, deadline: '2026-11-30',
        message: 'School website with notice board, admission form and result page.',
        status: 'pending', createdAt: '2026-10-11T10:05:00.000Z',
    },
    {
        id: 'q3', name: 'Tanvir Hasan', email: 'tanvir@example.com', phone: '01913000003',
        website_type: 'Portfolio', budget: 15000, deadline: '2026-11-05',
        message: 'Personal portfolio for a photographer, gallery heavy.',
        status: 'confirmed', project_id: 'p1', createdAt: '2026-10-02T12:40:00.000Z',
    },
    {
        id: 'q4', name: 'Mehedi Hasan', email: 'mehedi@example.com', phone: '01614000004',
        company: 'Mehedi Foods', website_type: 'Landing page', budget: 8000,
        message: 'One page landing page for our new product.',
        status: 'rejected', createdAt: '2026-10-04T09:10:00.000Z',
    },
    {
        id: 'q5', name: 'Sabrina Akter', email: 'sabrina@example.com', phone: '01515000005',
        company: 'Fashion Hub', website_type: 'E-commerce', budget: 120000, deadline: '2027-01-20',
        message: 'Fashion store with size/color variants, coupon and order tracking.',
        status: 'confirmed', project_id: 'p2', createdAt: '2026-09-20T07:30:00.000Z',
    },
];

let projects: Project[] = [
    {
        id: 'p1', project_code: 'PRJ-0001', quotation_id: 'q3', title: 'Tanvir Photography Portfolio',
        client_name: 'Tanvir Hasan', client_email: 'tanvir@example.com', client_phone: '01913000003',
        website_type: 'Portfolio', budget: 15000, paid: 7500, deadline: '2026-11-05',
        status: 'design', progress: 30, createdAt: '2026-10-03T09:00:00.000Z',
        logs: [
            { status: 'planning', note: 'Requirement meeting done.', date: '2026-10-03T09:00:00.000Z' },
            { status: 'design', note: 'Homepage wireframe sent to client.', date: '2026-10-08T14:00:00.000Z' },
        ],
    },
    {
        id: 'p2', project_code: 'PRJ-0002', quotation_id: 'q5', title: 'Fashion Hub Online Store',
        client_name: 'Sabrina Akter', client_email: 'sabrina@example.com', client_phone: '01515000005',
        website_type: 'E-commerce', budget: 120000, paid: 60000, deadline: '2027-01-20',
        status: 'development', progress: 60, createdAt: '2026-09-22T09:00:00.000Z',
        logs: [
            { status: 'planning', note: 'Scope and sitemap finalized.', date: '2026-09-22T09:00:00.000Z' },
            { status: 'design', note: 'UI approved by client.', date: '2026-09-30T11:00:00.000Z' },
            { status: 'development', note: 'Product and cart module in progress.', date: '2026-10-09T16:00:00.000Z' },
        ],
    },
];

/* ---------- store functions (replace with API later) ---------- */

export const getQuotations = () => [...quotations];
export const getProjects = () => projects.map((p) => ({ ...p }));
export const getProjectById = (id: string) => {
    const p = projects.find((x) => x.id === id);
    return p ? { ...p, logs: [...p.logs] } : undefined;
};
export const getQuotationById = (id?: string) => quotations.find((q) => q.id === id);
 

export function confirmQuotation(
    id: string,
    data: { title: string; budget: number; deadline: string; paid: number }
) {
    const q = quotations.find((x) => x.id === id);
    if (!q) return null;

    const now = new Date().toISOString();
    const project: Project = {
        id: `p${Date.now()}`,
        project_code: `PRJ-${String(projects.length + 1).padStart(4, '0')}`,
        quotation_id: q.id,
        title: data.title,
        client_name: q.name,
        client_email: q.email,
        client_phone: q.phone,
        website_type: q.website_type,
        budget: data.budget,
        paid: data.paid,
        deadline: data.deadline,
        status: 'planning',
        progress: STATUS_PROGRESS.planning,
        createdAt: now,
        logs: [{ status: 'planning', note: 'Project created from quotation.', date: now }],
    };

    projects = [project, ...projects];
    q.status = 'confirmed';
    q.project_id = project.id;
    return project;
}

export function createProject(data: {
    title: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    website_type: string;
    budget: number;
    paid: number;
    deadline: string;
    status: ProjectStatus;
    note?: string;
    quotation_id?: string;
}) {
    const now = new Date().toISOString();
    const project: Project = {
        id: `p${Date.now()}`,
        project_code: `PRJ-${String(projects.length + 1).padStart(4, '0')}`,
        quotation_id: data.quotation_id ?? '',
        title: data.title,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        website_type: data.website_type,
        budget: data.budget,
        paid: data.paid,
        deadline: data.deadline,
        status: data.status,
        progress: STATUS_PROGRESS[data.status],
        createdAt: now,
        logs: [
            {
                status: data.status,
                note: data.note || (data.quotation_id ? 'Project created from quotation.' : 'Project created by admin.'),
                date: now,
            },
        ],
    };

    projects = [project, ...projects];

    // quotation theke hole oitao confirm kore dao
    if (data.quotation_id) {
        const q = quotations.find((x) => x.id === data.quotation_id);
        if (q) {
            q.status = 'confirmed';
            q.project_id = project.id;
        }
    }
    return project;
}

export function deleteProject(id: string) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;

    // quotation theke toiri hole oitake abar pending kore dao
    const q = quotations.find((x) => x.project_id === id);
    if (q) {
        q.status = 'pending';
        q.project_id = undefined;
    }
    projects = projects.filter((x) => x.id !== id);
}

export function rejectQuotation(id: string) {
    const q = quotations.find((x) => x.id === id);
    if (q) q.status = 'rejected';
}

export function updateProjectStatus(id: string, status: ProjectStatus, note?: string) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    p.status = status;
    // on hold keeps the old progress
    if (status !== 'on_hold') p.progress = STATUS_PROGRESS[status];
    p.logs = [{ status, note, date: new Date().toISOString() }, ...p.logs];
}

export function addPayment(id: string, amount: number) {
    const p = projects.find((x) => x.id === id);
    if (p) p.paid = Math.min(p.budget, p.paid + amount);
}

export const money = (n: number) => `৳ ${n.toLocaleString('en-BD')}`;

export const fmtDate = (d?: string) =>
    d
        ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'N/A';