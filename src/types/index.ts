export interface Employee {
    id: string;
    name: string;
    role: string;
    avatarUrl: string;
    department: string;
}

export type LeaveType = 'vacation' | 'sick';
export type LeaveStatus = 'Applied';

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
};

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
    vacation: 'Annual Leave',
    sick: 'Sick Leave',
};
