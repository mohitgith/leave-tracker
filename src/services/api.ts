// API Service for Leave Tracker Backend
const API_BASE_URL = 'http://localhost:3001/api';

// ==================== Employee APIs ====================

export interface EmployeeAPI {
    id: string;
    name: string;
    role: string;
    department: string;
    avatarUrl: string;
    location: string;
    email: string;
    phone: string;
    managerId: string | null;
}

export interface OrgEmployeeAPI {
    id: string;
    name: string;
    role: string;
    location: string;
    avatarUrl: string;
    email: string;
    phone: string;
    children: OrgEmployeeAPI[];
}

export interface LeaveRecordAPI {
    id: string;
    employeeId: string;
    startDate: string;
    endDate: string;
    type: string;
    status: string;
}

// Employees
export const fetchEmployees = async (): Promise<EmployeeAPI[]> => {
    const response = await fetch(`${API_BASE_URL}/employees`);
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
};

export const createEmployee = async (employee: Omit<EmployeeAPI, 'avatarUrl'>): Promise<EmployeeAPI> => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...employee,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&color=fff&size=64&bold=true`
        }),
    });
    if (!response.ok) throw new Error('Failed to create employee');
    return response.json();
};

export const updateEmployee = async (id: string, employee: Partial<EmployeeAPI>): Promise<EmployeeAPI> => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
    });
    if (!response.ok) throw new Error('Failed to update employee');
    return response.json();
};

export const deleteEmployee = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete employee');
};

// Org Chart
export const fetchOrgChart = async (): Promise<OrgEmployeeAPI> => {
    const response = await fetch(`${API_BASE_URL}/org-chart`);
    if (!response.ok) throw new Error('Failed to fetch org chart');
    return response.json();
};

// ==================== Leave APIs ====================

export const fetchLeaves = async (): Promise<LeaveRecordAPI[]> => {
    const response = await fetch(`${API_BASE_URL}/leaves`);
    if (!response.ok) throw new Error('Failed to fetch leaves');
    return response.json();
};

export const createLeave = async (leave: LeaveRecordAPI): Promise<LeaveRecordAPI> => {
    const response = await fetch(`${API_BASE_URL}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leave),
    });
    if (!response.ok) throw new Error('Failed to create leave');
    return response.json();
};

export const updateLeave = async (id: string, leave: LeaveRecordAPI): Promise<LeaveRecordAPI> => {
    const response = await fetch(`${API_BASE_URL}/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leave),
    });
    if (!response.ok) throw new Error('Failed to update leave');
    return response.json();
};

export const deleteLeave = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/leaves/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete leave');
};
