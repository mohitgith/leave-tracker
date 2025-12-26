import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import { FiUserX, FiClock, FiCalendar, FiUsers } from 'react-icons/fi';
import { PageHeader } from '../common';
import './DashboardPage.css';

const API_BASE = 'http://localhost:3001/api';

interface DashboardStats {
    absentToday: number;
    pendingRequests: number;
    totalEmployees: number;
    upcomingHoliday: {
        name: string;
        date: string;
    };
}

interface LeaveItem {
    leave: {
        id: string;
        employeeId: string;
        startDate: string;
        endDate: string;
        type: string;
        status: string;
    };
    employeeName: string;
    employeeRole: string;
    avatarUrl: string;
    department?: string;
}

interface UpcomingLeaves {
    tomorrow: LeaveItem[];
    nextWeek: LeaveItem[];
}

const DashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [absentToday, setAbsentToday] = useState<LeaveItem[]>([]);
    const [upcomingLeaves, setUpcomingLeaves] = useState<UpcomingLeaves>({ tomorrow: [], nextWeek: [] });
    const [pendingRequests, setPendingRequests] = useState<LeaveItem[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all dashboard data in parallel
            const [statsRes, absentRes, upcomingRes, pendingRes] = await Promise.all([
                fetch(`${API_BASE}/dashboard/stats`),
                fetch(`${API_BASE}/dashboard/absent-today`),
                fetch(`${API_BASE}/dashboard/upcoming-leaves`),
                fetch(`${API_BASE}/dashboard/pending-requests`)
            ]);

            if (statsRes.ok) {
                setStats(await statsRes.json());
            }
            if (absentRes.ok) {
                setAbsentToday(await absentRes.json());
            }
            if (upcomingRes.ok) {
                setUpcomingLeaves(await upcomingRes.json());
            }
            if (pendingRes.ok) {
                setPendingRequests(await pendingRes.json());
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            message.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getLeaveTypeClass = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'sick':
                return 'sick';
            case 'vacation':
                return 'vacation';
            default:
                return 'personal';
        }
    };

    const getLeaveTypeLabel = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'sick':
                return 'Sick Leave';
            case 'vacation':
                return 'Vacation';
            default:
                return 'Personal';
        }
    };

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });

    if (loading) {
        return (
            <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* Header */}
            <PageHeader title="Leave Dashboard" subtitle={`Overview for ${today}`} />

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">Absent Today</span>
                        <div className="stat-icon absent">
                            <FiUserX size={18} />
                        </div>
                    </div>
                    <div className="stat-value">{stats?.absentToday || 0}</div>
                    <span className="stat-change">
                        {absentToday.length > 0 ? `${absentToday.length} employees on leave` : 'No absences today'}
                    </span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">Pending Requests</span>
                        <div className="stat-icon pending">
                            <FiClock size={18} />
                        </div>
                    </div>
                    <div className="stat-value">{stats?.pendingRequests || 0}</div>
                    <span className="stat-change">
                        {(stats?.pendingRequests || 0) > 0 ? 'Needs review' : 'All requests processed'}
                    </span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">Upcoming Holiday</span>
                        <div className="stat-icon holiday">
                            <FiCalendar size={18} />
                        </div>
                    </div>
                    <div className="stat-value">{stats?.upcomingHoliday?.name || 'None'}</div>
                    <span className="stat-change">{stats?.upcomingHoliday?.date || ''}</span>
                </div>
            </div>

            {/* Leave Sections */}
            <div className="leave-sections">
                {/* On Leave Today */}
                <div className="leave-section">
                    <div className="leave-section-header today">
                        <h2 className="leave-section-title">On Leave Today</h2>
                        <span className="leave-count-badge today">{absentToday.length} People</span>
                    </div>
                    <div className="leave-list">
                        {absentToday.length > 0 ? (
                            absentToday.map((item, index) => (
                                <div key={item.leave.id || index} className="leave-item">
                                    <div className="leave-avatar-wrapper">
                                        <img
                                            src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.employeeName || 'User')}&background=random`}
                                            alt={item.employeeName}
                                            className="leave-avatar"
                                        />
                                        <div className={`leave-status-dot ${getLeaveTypeClass(item.leave.type)}`}></div>
                                    </div>
                                    <div className="leave-info">
                                        <p className="leave-name">{item.employeeName}</p>
                                        <p className="leave-role">{item.employeeRole}</p>
                                    </div>
                                    <span className={`leave-type-badge ${getLeaveTypeClass(item.leave.type)}`}>
                                        {getLeaveTypeLabel(item.leave.type)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <FiUsers className="empty-icon" size={48} />
                                <p className="empty-text">No one is on leave today</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tomorrow */}
                <div className="leave-section">
                    <div className="leave-section-header">
                        <h2 className="leave-section-title">Tomorrow</h2>
                        <span className="leave-count-badge">{upcomingLeaves.tomorrow.length} People</span>
                    </div>
                    <div className="leave-list">
                        {upcomingLeaves.tomorrow.length > 0 ? (
                            upcomingLeaves.tomorrow.map((item, index) => (
                                <div key={item.leave.id || index} className="leave-item">
                                    <div className="leave-avatar-wrapper">
                                        <img
                                            src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.employeeName || 'User')}&background=random`}
                                            alt={item.employeeName}
                                            className="leave-avatar"
                                        />
                                    </div>
                                    <div className="leave-info">
                                        <p className="leave-name">{item.employeeName}</p>
                                        <p className="leave-role">{item.employeeRole}</p>
                                    </div>
                                    <span className="leave-dates">Whole Day</span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <FiCalendar className="empty-icon" size={48} />
                                <p className="empty-text">No leaves scheduled for tomorrow</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Next Week */}
                <div className="leave-section">
                    <div className="leave-section-header">
                        <h2 className="leave-section-title">Next Week</h2>
                        <span className="leave-count-badge">{upcomingLeaves.nextWeek.length} Upcoming</span>
                    </div>
                    <div className="leave-list">
                        {upcomingLeaves.nextWeek.length > 0 ? (
                            upcomingLeaves.nextWeek.map((item, index) => (
                                <div key={item.leave.id || index} className="leave-item">
                                    <div className="leave-avatar-wrapper">
                                        <img
                                            src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.employeeName || 'User')}&background=random`}
                                            alt={item.employeeName}
                                            className="leave-avatar"
                                        />
                                    </div>
                                    <div className="leave-info">
                                        <p className="leave-name">{item.employeeName}</p>
                                        <p className="leave-role">{item.employeeRole}</p>
                                    </div>
                                    <span className="leave-dates">
                                        {formatDate(item.leave.startDate)} - {formatDate(item.leave.endDate)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <FiCalendar className="empty-icon" size={48} />
                                <p className="empty-text">No leaves scheduled for next week</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
                <div className="leave-sections" style={{ marginTop: '0' }}>
                    <div className="leave-section" style={{ gridColumn: 'span 2' }}>
                        <div className="leave-section-header">
                            <h2 className="leave-section-title">Pending Leave Requests</h2>
                            <span className="leave-count-badge">{pendingRequests.length} Pending</span>
                        </div>
                        <div className="leave-list">
                            {pendingRequests.map((item, index) => (
                                <div key={item.leave.id || index} className="leave-item">
                                    <div className="leave-avatar-wrapper">
                                        <img
                                            src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.employeeName || 'User')}&background=random`}
                                            alt={item.employeeName}
                                            className="leave-avatar"
                                        />
                                    </div>
                                    <div className="leave-info">
                                        <p className="leave-name">{item.employeeName}</p>
                                        <p className="leave-role">{item.employeeRole}</p>
                                    </div>
                                    <span className={`leave-type-badge ${getLeaveTypeClass(item.leave.type)}`}>
                                        {getLeaveTypeLabel(item.leave.type)}
                                    </span>
                                    <span className="leave-dates">
                                        {formatDate(item.leave.startDate)} - {formatDate(item.leave.endDate)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
