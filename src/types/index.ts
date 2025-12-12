export interface Employee {
    id: string;
    name: string;
    role: string;
    avatarUrl: string;
    department: string;
}

export type LeaveType = 'vacation' | 'sick' | 'remote' | 'unpaid' | 'personal';
export type LeaveStatus = 'approved' | 'rejected' | 'pending';

export interface LeaveRecord {
    id: string;
    employeeId: string;
    startDate: string; // ISO Date string
    endDate: string;   // ISO Date string
    type: LeaveType;
    status: LeaveStatus;
}

export interface FilterState {
    search: string;
    departments: string[];
    leaveTypes: LeaveType[];
    statuses: LeaveStatus[];
    showMyAbsences: boolean;
}

export const LEAVE_TYPE_COLORS: Record<LeaveType, { bg: string; border: string }> = {
    vacation: { bg: '#4db6ac', border: '#26a69a' },
    sick: { bg: '#f5a623', border: '#e09915' },
    remote: { bg: '#64b5f6', border: '#42a5f5' },
    unpaid: { bg: '#90a4ae', border: '#78909c' },
    personal: { bg: '#ba68c8', border: '#ab47bc' },
};

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
    vacation: 'Vacation',
    sick: 'Sick Leave',
    remote: 'Remote Work',
    unpaid: 'Unpaid Leave',
    personal: 'Personal Day',
};
