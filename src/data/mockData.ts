import { Employee, LeaveRecord, LeaveType, LeaveStatus } from '../types';

// Generate avatar URLs using UI Avatars service
const getAvatarUrl = (name: string): string => {
    const encodedName = encodeURIComponent(name);
    const colors = ['0066b3', '4db6ac', 'f5a623', '64b5f6', 'ba68c8', 'e91e63', '9c27b0', '673ab7'];
    const colorIndex = name.length % colors.length;
    return `https://ui-avatars.com/api/?name=${encodedName}&background=${colors[colorIndex]}&color=fff&size=40&bold=true`;
};

export const employees: Employee[] = [
    { id: '1', name: 'Elysey Fomin', role: 'Java Developer', department: 'Engineering', avatarUrl: getAvatarUrl('Elysey Fomin') },
    { id: '2', name: 'Lev Levko', role: 'System Administrator', department: 'IT', avatarUrl: getAvatarUrl('Lev Levko') },
    { id: '3', name: 'Antonina Lysenko', role: 'HR', department: 'HR', avatarUrl: getAvatarUrl('Antonina Lysenko') },
    { id: '4', name: 'Mykola Mykolenko', role: 'Communications Engineer', department: 'Engineering', avatarUrl: getAvatarUrl('Mykola Mykolenko') },
    { id: '5', name: 'Vladyslav Piddubetskiy', role: 'Junior UI Designer', department: 'Design', avatarUrl: getAvatarUrl('Vladyslav Piddubetskiy') },
    { id: '6', name: 'Oksana Pylypak', role: 'SMM Manager', department: 'Marketing', avatarUrl: getAvatarUrl('Oksana Pylypak') },
    { id: '7', name: 'Iryna Bilyk', role: 'Recruiter', department: 'HR', avatarUrl: getAvatarUrl('Iryna Bilyk') },
    { id: '8', name: 'Regina Zharska', role: 'HR', department: 'HR', avatarUrl: getAvatarUrl('Regina Zharska') },
    { id: '9', name: 'Svitlana Dobrovolska', role: 'HR', department: 'HR', avatarUrl: getAvatarUrl('Svitlana Dobrovolska') },
    { id: '10', name: 'Fedir Dudko', role: 'CFO', department: 'Finance', avatarUrl: getAvatarUrl('Fedir Dudko') },
    { id: '11', name: 'Margaryta Voloshyna', role: 'Accountant', department: 'Finance', avatarUrl: getAvatarUrl('Margaryta Voloshyna') },
    { id: '12', name: 'Oleh Herasymets', role: 'Accountant', department: 'Finance', avatarUrl: getAvatarUrl('Oleh Herasymets') },
    { id: '13', name: 'Ira Hill', role: 'Accountant', department: 'Finance', avatarUrl: getAvatarUrl('Ira Hill') },
    { id: '14', name: 'Iryna Ivanchenko', role: 'HR', department: 'HR', avatarUrl: getAvatarUrl('Iryna Ivanchenko') },
    { id: '15', name: 'Oleh Herasymets Jr', role: 'Intern', department: 'Finance', avatarUrl: getAvatarUrl('Oleh Herasymets Jr') },
];

// Helper to generate random leaves
const generateLeaves = (): LeaveRecord[] => {
    const leaves: LeaveRecord[] = [];
    const types: LeaveType[] = ['vacation', 'sick', 'remote', 'unpaid', 'personal'];
    const statuses: LeaveStatus[] = ['approved', 'approved', 'approved', 'pending', 'rejected']; // weighted towards approved

    // Specific leaves matching the design mockup
    const specificLeaves: Omit<LeaveRecord, 'id'>[] = [
        // January
        { employeeId: '5', startDate: '2024-01-08', endDate: '2024-01-12', type: 'vacation', status: 'approved' },

        // February
        { employeeId: '4', startDate: '2024-02-05', endDate: '2024-02-09', type: 'sick', status: 'approved' },
        { employeeId: '10', startDate: '2024-02-12', endDate: '2024-02-16', type: 'sick', status: 'approved' },

        // March
        { employeeId: '9', startDate: '2024-03-11', endDate: '2024-03-15', type: 'vacation', status: 'approved' },
        { employeeId: '6', startDate: '2024-03-18', endDate: '2024-04-05', type: 'vacation', status: 'approved' },
        { employeeId: '12', startDate: '2024-03-04', endDate: '2024-03-08', type: 'sick', status: 'approved' },

        // April
        { employeeId: '13', startDate: '2024-04-15', endDate: '2024-04-19', type: 'vacation', status: 'approved' },

        // May
        { employeeId: '8', startDate: '2024-05-06', endDate: '2024-05-17', type: 'vacation', status: 'approved' },
        { employeeId: '11', startDate: '2024-04-29', endDate: '2024-05-10', type: 'vacation', status: 'approved' },

        // June
        { employeeId: '14', startDate: '2024-06-03', endDate: '2024-06-07', type: 'remote', status: 'pending' },
    ];

    specificLeaves.forEach((leave, index) => {
        leaves.push({
            ...leave,
            id: `leave-${index + 1}`,
        });
    });

    // Add some random additional leaves
    employees.forEach((emp) => {
        const numLeaves = Math.floor(Math.random() * 2); // 0-1 additional leaves per employee
        for (let i = 0; i < numLeaves; i++) {
            const month = Math.floor(Math.random() * 6) + 1; // Jan-June
            const startDay = Math.floor(Math.random() * 20) + 1;
            const duration = Math.floor(Math.random() * 7) + 1; // 1-7 days

            const startDate = `2024-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
            const endDay = Math.min(startDay + duration, 28);
            const endDate = `2024-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

            leaves.push({
                id: `leave-random-${emp.id}-${i}`,
                employeeId: emp.id,
                startDate,
                endDate,
                type: types[Math.floor(Math.random() * types.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
            });
        }
    });

    return leaves;
};

export const leaveRecords: LeaveRecord[] = generateLeaves();

export const departments = [...new Set(employees.map(e => e.department))];
