import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import dayjs from 'dayjs';
import { FiClock, FiCalendar, FiUsers, FiSearch, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import { fetchOrgChart, type OrgEmployeeAPI, deleteEmployee } from '../../services/api';
import OrgList from '../employees/OrgList';
import PendingRequestsModal from './PendingRequestsModal';
import EmployeeDetailModal from '../employees/EmployeeDetailModal';
import AddEmployeeModal from '../employees/AddEmployeeModal';
import Scheduler from '../scheduler/Scheduler';
import FilterDropdown from './FilterDropdown';
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
    const [loading, setLoading] = useState(true);
    const [absentToday, setAbsentToday] = useState<LeaveItem[]>([]);
    const [upcomingLeaves, setUpcomingLeaves] = useState<UpcomingLeaves>({ tomorrow: [], nextWeek: [] });
    const [pendingRequests, setPendingRequests] = useState<LeaveItem[]>([]);
    const [orgData, setOrgData] = useState<OrgEmployeeAPI | null>(null);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<OrgEmployeeAPI | null>(null);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [schedulerLeaves, setSchedulerLeaves] = useState<any[]>([]);
    const [schedulerStartDate, setSchedulerStartDate] = useState(dayjs());
    const [schedulerSearch, setSchedulerSearch] = useState('');
    const [showCreateLeaveModal, setShowCreateLeaveModal] = useState(false);
    const [leaveTypeFilter, setLeaveTypeFilter] = useState<string[]>([]);

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

    const filterEmployees = (employees: OrgEmployeeAPI[], term: string): OrgEmployeeAPI[] => {
        if (!term.trim()) return employees;
        const lowerTerm = term.toLowerCase();
        return employees.filter(emp =>
            emp.name.toLowerCase().includes(lowerTerm) ||
            emp.role.toLowerCase().includes(lowerTerm) ||
            emp.email.toLowerCase().includes(lowerTerm)
        );
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

    const handleEmployeeClick = (emp: OrgEmployeeAPI) => {
        setSelectedEmployee(emp);
        setShowEmployeeModal(true);
    };

    const handleEditEmployee = (emp: OrgEmployeeAPI) => {
        setSelectedEmployee(emp);
        setShowEditModal(true);
    };

    const handleEmployeeDelete = async (emp: OrgEmployeeAPI) => {
        try {
            await deleteEmployee(emp.id);
            message.success('Employee deleted successfully');
            loadDashboardData(); // Reload data
        } catch (error) {
            message.error('Failed to delete employee');
        }
    };

    const handlePrevMonth = () => {
        setSchedulerStartDate(schedulerStartDate.subtract(1, 'month'));
    };

    const handleNextMonth = () => {
        setSchedulerStartDate(schedulerStartDate.add(1, 'month'));
    };

    const handleApplyFilter = (types: string[]) => {
        setLeaveTypeFilter(types);
    };

    const handleCreateLeave = async () => {
        await loadDashboardData(); // Reload to show new leave
        setShowCreateLeaveModal(false);
    };

    // Filter employees based on search
    const filterSchedulerEmployees = () => {
        if (!schedulerSearch.trim()) return flattenOrgData(orgData);
        const lowerSearch = schedulerSearch.toLowerCase();
        return flattenOrgData(orgData).filter(emp =>
            emp.name.toLowerCase().includes(lowerSearch) ||
            emp.role.toLowerCase().includes(lowerSearch)
        );
    };

    // Filter leaves based on search and type filter
    const filterSchedulerLeaves = () => {
        let filtered = schedulerLeaves;

        // Filter by type
        if (leaveTypeFilter.length > 0) {
            filtered = filtered.filter(leave => leaveTypeFilter.includes(leave.type));
        }

        // Filter by search (employee name)
        if (schedulerSearch.trim()) {
            const lowerSearch = schedulerSearch.toLowerCase();
            const searchedEmployeeIds = flattenOrgData(orgData)
                .filter(emp => emp.name.toLowerCase().includes(lowerSearch))
                .map(emp => emp.id);
            filtered = filtered.filter(leave => searchedEmployeeIds.includes(leave.employeeId));
        }

        return filtered;
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

                {/* Right Column - Org List (2/3 width) */}
                <div className="dashboard-org-column">
                    <div className="org-column-header">
                        <h3 className="org-column-title">Team Members</h3>
                        <div className="org-header-right">
                            <span className="org-member-count">{flattenOrgData(orgData).length} Members</span>
                            <div className="org-search-wrapper">
                                <FiSearch className="org-search-icon" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    className="org-search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="org-list-wrapper">
                        <OrgList
                            employees={filterEmployees(flattenOrgData(orgData), searchTerm)}
                            showManager={false}
                            showActions={true}
                            hideEmailLocation={true}
                            hideHeaders={true}
                            onEmployeeClick={handleEmployeeClick}
                            onEditClick={handleEditEmployee}
                            onDeleteClick={handleEmployeeDelete}
                        />
                    </div>
                </div>
            </div>

            {/* Pending Requests Modal */}
            <PendingRequestsModal
                visible={showPendingModal}
                onClose={() => setShowPendingModal(false)}
                requests={pendingRequests}
            />

            {/* Employee Detail Modal */}
            {selectedEmployee && (
                <EmployeeDetailModal
                    open={showEmployeeModal}
                    employee={selectedEmployee}
                    onClose={() => {
                        setShowEmployeeModal(false);
                        setSelectedEmployee(null);
                        loadDashboardData(); // Reload to reflect any changes
                    }}
                />
            )}

            {/* Edit Employee Modal */}
            {selectedEmployee && (
                <AddEmployeeModal
                    open={showEditModal}
                    initialValues={selectedEmployee}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedEmployee(null);
                    }}
                    onSubmit={async (values) => {
                        try {
                            await import('../../services/api').then(({ updateEmployee }) =>
                                updateEmployee(selectedEmployee.id, values)
                            );
                            setShowEditModal(false);
                            setSelectedEmployee(null);
                            await loadDashboardData();
                        } catch (error) {
                            console.error('Failed to update employee:', error);
                            message.error('Failed to update employee');
                        }
                    }}
                />
            )}

            {/* Leave Tracker / Scheduler */}
            <div className="dashboard-scheduler-section">
                <div className="scheduler-custom-header">
                    <div className="scheduler-header-top">
                        <h3 className="scheduler-title">Leave Tracker</h3>
                        <div className="scheduler-month-nav">
                            <button className="month-nav-btn" onClick={handlePrevMonth}>
                                <FiChevronLeft size={20} />
                            </button>
                            <span className="current-month">{schedulerStartDate.format('MMMM YYYY')}</span>
                            <button className="month-nav-btn" onClick={handleNextMonth}>
                                <FiChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="scheduler-header-bottom">
                        <div className="scheduler-actions">
                            <button className="scheduler-action-btn create-btn" onClick={() => setShowCreateLeaveModal(true)}>
                                <FiPlus size={16} />
                                <span>Create Leave</span>
                            </button>
                            <FilterDropdown
                                selectedTypes={leaveTypeFilter as any}
                                onApply={handleApplyFilter}
                                buttonClassName="scheduler-action-btn filter-btn"
                            />
                        </div>
                        <div className="scheduler-search-wrapper">
                            <FiSearch className="scheduler-search-icon" size={16} />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                className="scheduler-search-input"
                                value={schedulerSearch}
                                onChange={(e) => setSchedulerSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                {filterSchedulerEmployees().length === 0 ? (
                    <div className="scheduler-empty-wrapper">
                        <p className="scheduler-empty-text">Nothing found</p>
                    </div>
                ) : (
                    <Scheduler
                        employees={filterSchedulerEmployees() as any}
                        leaves={filterSchedulerLeaves()}
                        startDate={schedulerStartDate.startOf('month')}
                        endDate={schedulerStartDate.endOf('month')}
                        viewMode="1"
                    />
                )}
            </div>

            {/* Create Leave Modal */}
            <CreateLeaveModal
                open={showCreateLeaveModal}
                onClose={() => setShowCreateLeaveModal(false)}
                onSubmit={async () => {
                    await handleCreateLeave();
                }}
            />
        </div>
    );
};

export default DashboardPage;
