import { Employee, LeaveRecord } from '../types';

// Generate avatar URLs using UI Avatars service
const getAvatarUrl = (name: string): string => {
    const encodedName = encodeURIComponent(name);
    const colors = ['0066b3', '4db6ac', 'f5a623', '64b5f6', 'ba68c8', 'e91e63', '9c27b0', '673ab7'];
    const colorIndex = name.length % colors.length;
    return `https://ui-avatars.com/api/?name=${encodedName}&background=${colors[colorIndex]}&color=fff&size=40&bold=true`;
};

export const employees: Employee[] = [
    { id: '1', name: 'Aditya Pathak', role: 'Java Developer', department: 'Engineering', avatarUrl: getAvatarUrl('Aditya Pathak') },
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

// Specific leaves for current quarter (Dec 2025 - Feb 2026)
// Specific leaves for current quarter (Dec 2025 - Feb 2026)
export const leaveRecords: LeaveRecord[] = [
    // December 2025
    { id: 'leave-1', employeeId: '1', startDate: '2025-12-16', endDate: '2025-12-20', type: 'vacation', status: 'Applied' },
    { id: 'leave-2', employeeId: '3', startDate: '2025-12-23', endDate: '2025-12-31', type: 'vacation', status: 'Applied' },
    { id: 'leave-3', employeeId: '5', startDate: '2025-12-09', endDate: '2025-12-13', type: 'sick', status: 'Applied' },
    { id: 'leave-4', employeeId: '7', startDate: '2025-12-02', endDate: '2025-12-06', type: 'vacation', status: 'Applied' },

    // January 2026
    { id: 'leave-5', employeeId: '2', startDate: '2026-01-06', endDate: '2026-01-10', type: 'vacation', status: 'Applied' },
    { id: 'leave-6', employeeId: '4', startDate: '2026-01-13', endDate: '2026-01-17', type: 'sick', status: 'Applied' },
    { id: 'leave-7', employeeId: '6', startDate: '2026-01-20', endDate: '2026-01-31', type: 'vacation', status: 'Applied' },
    { id: 'leave-8', employeeId: '8', startDate: '2026-01-27', endDate: '2026-01-31', type: 'vacation', status: 'Applied' },

    // February 2026
    { id: 'leave-9', employeeId: '9', startDate: '2026-02-02', endDate: '2026-02-06', type: 'vacation', status: 'Applied' },
    { id: 'leave-10', employeeId: '10', startDate: '2026-02-09', endDate: '2026-02-13', type: 'sick', status: 'Applied' },
    { id: 'leave-11', employeeId: '11', startDate: '2026-02-16', endDate: '2026-02-20', type: 'vacation', status: 'Applied' },
    { id: 'leave-12', employeeId: '12', startDate: '2026-02-23', endDate: '2026-02-27', type: 'vacation', status: 'Applied' },

    // Some pending/rejected for variety - converted to Applied/vacation/sick matching new types
    { id: 'leave-13', employeeId: '13', startDate: '2025-12-18', endDate: '2025-12-19', type: 'vacation', status: 'Applied' },
    { id: 'leave-14', employeeId: '14', startDate: '2026-01-08', endDate: '2026-01-10', type: 'vacation', status: 'Applied' },
    { id: 'leave-15', employeeId: '15', startDate: '2026-02-10', endDate: '2026-02-14', type: 'sick', status: 'Applied' },
];

export const departments = [...new Set(employees.map(e => e.department))];
