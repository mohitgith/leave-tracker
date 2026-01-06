// API Service for Leave Tracker Backend
const API_BASE_URL = 'http://localhost:3001/api/v1';

// Helper for authenticated requests
const authFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers as any, // Preserve existing headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Auto logout if 401
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    return response;
};

// ==================== Auth APIs ====================
export const loginUser = async (loginRequest: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginRequest),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
};

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
    employeeType?: 'permanent' | 'contractor';
    username?: string;
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
    const response = await authFetch('/employees');
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
};

export const createEmployee = async (employee: Omit<EmployeeAPI, 'avatarUrl'>): Promise<EmployeeAPI> => {
    const response = await authFetch('/employees', {
        method: 'POST',
        body: JSON.stringify({
            ...employee,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&color=fff&size=64&bold=true`
        }),
    });
    if (!response.ok) throw new Error('Failed to create employee');
    return response.json();
};

export const updateEmployee = async (id: string, employee: Partial<EmployeeAPI>): Promise<EmployeeAPI> => {
    const response = await authFetch(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(employee),
    });
    if (!response.ok) throw new Error('Failed to update employee');
    return response.json();
};

export const deleteEmployee = async (id: string): Promise<void> => {
    const response = await authFetch(`/employees/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete employee');
};

// Org Chart
export const fetchOrgChart = async (): Promise<OrgEmployeeAPI> => {
    const response = await authFetch('/org-chart');
    if (!response.ok) throw new Error('Failed to fetch org chart');
    return response.json();
};

// ==================== Leave APIs ====================

export const fetchLeaves = async (): Promise<LeaveRecordAPI[]> => {
    const response = await authFetch('/leaves');
    if (!response.ok) throw new Error('Failed to fetch leaves');
    return response.json();
};

export const createLeave = async (leave: LeaveRecordAPI): Promise<LeaveRecordAPI> => {
    const response = await authFetch('/leaves', {
        method: 'POST',
        body: JSON.stringify(leave),
    });
    if (!response.ok) throw new Error('Failed to create leave');
    return response.json();
};

export const updateLeave = async (id: string, leave: LeaveRecordAPI): Promise<LeaveRecordAPI> => {
    const response = await authFetch(`/leaves/${id}`, {
        method: 'PUT',
        body: JSON.stringify(leave),
    });
    if (!response.ok) throw new Error('Failed to update leave');
    return response.json();
};

export const deleteLeave = async (id: string): Promise<void> => {
    const response = await authFetch(`/leaves/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete leave');
};

// ==================== Notification Settings APIs ====================

export interface NotificationSettingsAPI {
    id: string;
    recipients: string[];
    scheduledTime: string; // HH:mm format
    enabled: boolean;
}

export const fetchNotificationSettings = async (): Promise<NotificationSettingsAPI> => {
    const response = await authFetch('/notification-settings');
    if (!response.ok) throw new Error('Failed to fetch notification settings');
    return response.json();
};

export const updateNotificationSettings = async (settings: NotificationSettingsAPI): Promise<NotificationSettingsAPI> => {
    const response = await authFetch('/notification-settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to update notification settings');
    return response.json();
};

// ==================== App Notifications APIs ====================

export interface AppNotificationAPI {
    id: string;
    type: string;
    title: string;
    message: string;
    forUserId: string;
    fromUserId: string;
    leaveId?: string;
    createdAt: string;
    read: boolean;
}

export const fetchNotificationsForUser = async (userId: string): Promise<AppNotificationAPI[]> => {
    const response = await authFetch(`/notifications/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
};

export const fetchUnreadNotificationCount = async (userId: string): Promise<number> => {
    const response = await authFetch(`/notifications/user/${userId}/unread-count`);
    if (!response.ok) throw new Error('Failed to fetch unread count');
    const data = await response.json();
    return data.count;
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    const response = await authFetch(`/notifications/${notificationId}/read`, {
        method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
};

export const markAllNotificationsAsRead = async (userId: string): Promise<number> => {
    const response = await authFetch(`/notifications/user/${userId}/read-all`, {
        method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to mark all as read');
    const data = await response.json();
    return data.markedAsRead;
};

// ==================== Dashboard APIs ====================

export const fetchDashboardStats = async (): Promise<any> => {
    const response = await authFetch('/dashboard/stats');
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
};

export const fetchAbsentToday = async (): Promise<any[]> => {
    const response = await authFetch('/dashboard/absent-today');
    if (!response.ok) throw new Error('Failed to fetch absent today');
    return response.json();
};

export const fetchUpcomingLeaves = async (): Promise<any> => {
    const response = await authFetch('/dashboard/upcoming-leaves');
    if (!response.ok) throw new Error('Failed to fetch upcoming leaves');
    return response.json();
};

export const fetchPendingRequests = async (): Promise<any[]> => {
    const response = await authFetch('/dashboard/pending-requests');
    if (!response.ok) throw new Error('Failed to fetch pending requests');
    return response.json();
};
