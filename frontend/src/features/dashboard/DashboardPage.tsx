import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import dayjs from 'dayjs';
import { FiClock, FiCalendar, FiUsers } from 'react-icons/fi';
import { LEAVE_TYPE_COLORS, LEAVE_TYPE_LABELS, LeaveType } from '../../types';
import { fetchOrgChart, type OrgEmployeeAPI, createLeave, updateLeave, deleteLeave as deleteLeaveAPI, LeaveRecordAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PendingRequestsModal from './PendingRequestsModal';
import VerticalScheduler from '../scheduler/VerticalScheduler';

import { CreateLeaveModal } from '../../components';

import './DashboardPage.css';

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

import {
    fetchAbsentToday,
    fetchUpcomingLeaves,
    fetchPendingRequests,
    fetchLeaves
} from '../../services/api';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [absentToday, setAbsentToday] = useState<LeaveItem[]>([]);
    const [upcomingLeaves, setUpcomingLeaves] = useState<UpcomingLeaves>({ tomorrow: [], nextWeek: [] });
    const [pendingRequests, setPendingRequests] = useState<LeaveItem[]>([]);
    const [orgData, setOrgData] = useState<OrgEmployeeAPI | null>(null);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [schedulerLeaves, setSchedulerLeaves] = useState<any[]>([]);
    const [showCreateLeaveModal, setShowCreateLeaveModal] = useState(false);
    const [editingLeave, setEditingLeave] = useState<LeaveRecordAPI | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Flatten org tree to list
    const flattenOrgData = (node: OrgEmployeeAPI | null): OrgEmployeeAPI[] => {
        if (!node) return [];
        const result: OrgEmployeeAPI[] = [node];
        if (node.children) {
            node.children.forEach(child => {
                result.push(...flattenOrgData(child));
            });
        }
        return result;
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all dashboard data in parallel
            const [absentData, upcomingData, pendingData, orgChartData, leavesData] = await Promise.all([
                fetchAbsentToday(),
                fetchUpcomingLeaves(),
                fetchPendingRequests(),
                fetchOrgChart(),
                fetchLeaves()
            ]);

            setAbsentToday(absentData);
            setUpcomingLeaves(upcomingData);
            setPendingRequests(pendingData);
            setOrgData(orgChartData);
            setSchedulerLeaves(leavesData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            message.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
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



    const handleLeaveSubmit = async (values: { startDate: string; endDate: string; type: any; description: string; employeeId?: string }) => {
        try {
            if (editingLeave) {
                // Update existing leave
                await updateLeave(editingLeave.id, {
                    id: editingLeave.id,
                    employeeId: editingLeave.employeeId,
                    startDate: values.startDate,
                    endDate: values.endDate,
                    type: values.type,
                    status: 'Applied'
                });
                message.success('Leave updated successfully');
            } else {
                // Create new leave
                await createLeave({
                    id: `leave-${Date.now()}`,
                    employeeId: values.employeeId || user?.id || '',
                    startDate: values.startDate,
                    endDate: values.endDate,
                    type: values.type,
                    status: 'Applied'
                });
                message.success('Leave request created successfully');
            }
            await loadDashboardData();
            setShowCreateLeaveModal(false);
            setEditingLeave(null);
        } catch (error) {
            console.error('Failed to save leave:', error);
            message.error(editingLeave ? 'Failed to update leave' : 'Failed to create leave request');
        }
    };

    const handleEditLeave = (leave: any) => {
        // Only allow editing own leaves
        if (leave.employeeId !== user?.id) {
            message.warning('You can only edit your own leaves');
            return;
        }
        setEditingLeave(leave);
        setShowCreateLeaveModal(true);
    };

    const handleDeleteLeave = async (leaveId: string) => {
        const leave = schedulerLeaves.find(l => l.id === leaveId);
        if (leave && leave.employeeId !== user?.id) {
            message.warning('You can only delete your own leaves');
            return;
        }
        try {
            await deleteLeaveAPI(leaveId);
            message.success('Leave deleted successfully');
            await loadDashboardData();
        } catch (error) {
            console.error('Failed to delete leave:', error);
            message.error('Failed to delete leave');
        }
    };

    // Get all employees for scheduler
    const filterSchedulerEmployees = () => {
        return flattenOrgData(orgData);
    };

    // Get all leaves for scheduler
    const filterSchedulerLeaves = () => {
        return schedulerLeaves;
    };

    if (loading) {
        return (
            <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-layout">
                {/* Left Column - Tiles (1/3 width) */}
                <div className="dashboard-tiles">
                    {/* On Leave Today Tile */}
                    <div className="dashboard-tile">
                        <div className="tile-header today">
                            <h3 className="tile-title">On Leave Today</h3>
                            <span className="tile-count-badge today">{absentToday.length} People</span>
                        </div>
                        <div className="tile-content">
                            {absentToday.length > 0 ? (
                                absentToday.map((item, index) => (
                                    <div key={item.leave.id || index} className="tile-leave-item">
                                        <div className="tile-avatar-wrapper">
                                            <img
                                                src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.employeeName || 'User')}&background=random`}
                                                alt={item.employeeName}
                                                className="tile-avatar"
                                            />
                                            <div className={`tile-status-dot ${getLeaveTypeClass(item.leave.type)}`}></div>
                                        </div>
                                        <div className="tile-info">
                                            <p className="tile-name">{item.employeeName}</p>
                                            <p className="tile-role">{item.employeeRole}</p>
                                        </div>
                                        <span className={`tile-type-badge ${getLeaveTypeClass(item.leave.type)}`}>
                                            {getLeaveTypeLabel(item.leave.type)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="tile-empty-state">
                                    <FiUsers className="empty-icon" size={32} />
                                    <p className="empty-text">No one is on leave today</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tomorrow Tile */}
                    <div className="dashboard-tile">
                        <div className="tile-header">
                            <h3 className="tile-title">Tomorrow</h3>
                            <span className="tile-count-badge">{upcomingLeaves.tomorrow.length} People</span>
                        </div>
                        <div className="tile-content">
                            {upcomingLeaves.tomorrow.length > 0 ? (
                                upcomingLeaves.tomorrow.map((item, index) => (
                                    <div key={item.leave.id || index} className="tile-leave-item">
                                        <div className="tile-avatar-wrapper">
                                            <img
                                                src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.employeeName || 'User')}&background=random`}
                                                alt={item.employeeName}
                                                className="tile-avatar"
                                            />
                                        </div>
                                        <div className="tile-info">
                                            <p className="tile-name">{item.employeeName}</p>
                                            <p className="tile-role">{item.employeeRole}</p>
                                        </div>
                                        <span className="tile-dates">Whole Day</span>
                                    </div>
                                ))
                            ) : (
                                <div className="tile-empty-state">
                                    <FiCalendar className="empty-icon" size={32} />
                                    <p className="empty-text">No leaves scheduled</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Leave Requests Tile (Clickable) */}
                    <div className="dashboard-tile clickable" onClick={() => setShowPendingModal(true)}>
                        <div className="tile-header requests">
                            <h3 className="tile-title">Leave Requests</h3>
                            <span className="tile-count-badge requests">{pendingRequests.length} Requests</span>
                        </div>
                        <div className="tile-content">
                            {pendingRequests.length > 0 ? (
                                <div className="tile-requests-summary">
                                    <FiClock className="requests-icon" size={32} />
                                    <p className="requests-text">Click to view leave requests</p>
                                </div>
                            ) : (
                                <div className="tile-empty-state">
                                    <FiClock className="empty-icon" size={32} />
                                    <p className="empty-text">No pending requests</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Leave Tracker Scheduler (3/4 width) */}
                <div className="dashboard-scheduler-section">
                    {filterSchedulerEmployees().length === 0 ? (
                        <div className="scheduler-empty-wrapper">
                            <p className="scheduler-empty-text">Nothing found</p>
                        </div>
                    ) : (
                        <VerticalScheduler
                            employees={filterSchedulerEmployees() as any}
                            leaves={filterSchedulerLeaves()}
                            startDate={dayjs().subtract(12, 'month').startOf('month')}
                            endDate={dayjs().add(11, 'month').endOf('month')}
                            currentMonth={dayjs()}
                            onEditLeave={handleEditLeave}
                            onDeleteLeave={handleDeleteLeave}
                            currentUserId={user?.id}
                        />
                    )}

                    {/* Leave Types Legend */}
                    <div className="scheduler-legend">
                        {(Object.keys(LEAVE_TYPE_COLORS) as LeaveType[]).map((type) => (
                            <div key={type} className="legend-item">
                                <span
                                    className="legend-color"
                                    style={{
                                        backgroundColor: LEAVE_TYPE_COLORS[type].bg,
                                        borderColor: LEAVE_TYPE_COLORS[type].border
                                    }}
                                />
                                <span className="legend-label">{LEAVE_TYPE_LABELS[type]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pending Requests Modal */}
            <PendingRequestsModal
                visible={showPendingModal}
                onClose={() => setShowPendingModal(false)}
                requests={pendingRequests}
            />

            {/* Create Leave Modal */}
            <CreateLeaveModal
                open={showCreateLeaveModal}
                onClose={() => {
                    setShowCreateLeaveModal(false);
                    setEditingLeave(null);
                }}
                onSubmit={handleLeaveSubmit}
                initialValues={editingLeave as any}
            />

            {/* Dashboard Footer */}
            <footer className="dashboard-footer">
                <p>© {new Date().getFullYear()} Leave Tracker. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default DashboardPage;

