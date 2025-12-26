import React, { useState, useMemo, useEffect } from 'react';
import { Typography, message, Spin } from 'antd';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import dayjs from 'dayjs';
import { Scheduler } from '../scheduler';
import { FilterBar, SearchInput, CreateLeaveModal } from '../common';
import { FilterOptions } from '../common/FilterBar';
import { LeaveType, LeaveRecord, Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
    fetchEmployees,
    fetchLeaves,
    createLeave as createLeaveAPI,
    updateLeave as updateLeaveAPI,
    deleteLeave as deleteLeaveAPI,
    LeaveRecordAPI
} from '../../services/api';

const { Text } = Typography;

interface EmployeeWithType extends Employee {
    employeeType?: 'permanent' | 'contractor';
}

const LeaveTrackerPage: React.FC = () => {
    const { user } = useAuth();
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<'1' | '3'>('1');
    const [startDate, setStartDate] = useState(dayjs().startOf('month'));
    const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
    const [employees, setEmployees] = useState<EmployeeWithType[]>([]);
    const [createLeaveModalOpen, setCreateLeaveModalOpen] = useState(false);
    const [editingLeave, setEditingLeave] = useState<LeaveRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterOptions>({
        leaveTypes: [],
        employeeTypes: [],
        daysRange: [0, 15],
    });

    // Fetch data from API
    const loadData = async () => {
        try {
            setLoading(true);
            const [empData, leaveData] = await Promise.all([
                fetchEmployees(),
                fetchLeaves()
            ]);

            // Map API data to frontend types (include employeeType)
            setEmployees(empData.map(e => ({
                id: e.id,
                name: e.name,
                role: e.role,
                department: e.department,
                avatarUrl: e.avatarUrl,
                employeeType: e.employeeType || 'permanent'
            })));

            setLeaves(leaveData.map(l => ({
                id: l.id,
                employeeId: l.employeeId,
                startDate: l.startDate,
                endDate: l.endDate,
                type: l.type as LeaveType,
                status: l.status as 'Applied'
            })));
        } catch (error) {
            message.error('Failed to load data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Calculate end date based on view mode
    const endDate = useMemo(() => {
        const months = parseInt(viewMode);
        return startDate.add(months, 'month').subtract(1, 'day');
    }, [startDate, viewMode]);

    // Calculate leave days for an employee
    const getEmployeeLeaveDays = (employeeId: string): number => {
        return leaves
            .filter(l => l.employeeId === employeeId)
            .reduce((total, leave) => {
                const start = dayjs(leave.startDate);
                const end = dayjs(leave.endDate);
                return total + end.diff(start, 'day') + 1;
            }, 0);
    };

    // Filter employees based on search and filters
    const filteredEmployees = useMemo(() => {
        let result = employees;

        // Search filter
        if (searchValue.trim()) {
            const search = searchValue.toLowerCase();
            result = result.filter(
                emp =>
                    emp.name.toLowerCase().includes(search) ||
                    emp.role.toLowerCase().includes(search)
            );
        }

        // Employee type filter - only apply if at least one type is selected
        if (filters.employeeTypes.length > 0) {
            result = result.filter(emp => {
                const empType = emp.employeeType || 'permanent';
                return filters.employeeTypes.includes(empType);
            });
        }

        // Leave type filter - show only employees with matching leave types
        if (filters.leaveTypes.length > 0) {
            const employeeIdsWithMatchingLeaves = leaves
                .filter(l => filters.leaveTypes.includes(l.type))
                .map(l => l.employeeId);
            result = result.filter(emp =>
                employeeIdsWithMatchingLeaves.includes(emp.id)
            );
        }

        // Leave days filter using slider range
        if (filters.daysRange[0] !== 0 || filters.daysRange[1] !== 15) {
            result = result.filter(emp => {
                const days = getEmployeeLeaveDays(emp.id);
                return days >= filters.daysRange[0] && days <= filters.daysRange[1];
            });
        }

        return result;
    }, [searchValue, employees, filters, leaves]);

    // Filter leaves based on leave type filter
    const filteredLeaves = useMemo(() => {
        if (filters.leaveTypes.length === 0) return leaves;
        return leaves.filter(l => filters.leaveTypes.includes(l.type));
    }, [leaves, filters.leaveTypes]);

    // Format date range display
    const dateRangeDisplay = useMemo(() => {
        const start = startDate.format('MMMM YYYY');
        const end = endDate.format('MMMM YYYY');
        if (start === end) return start;
        return `${startDate.format('MMMM YYYY')} – ${endDate.format('MMMM YYYY')}`;
    }, [startDate, endDate]);

    const handlePrevious = () => {
        const months = parseInt(viewMode);
        setStartDate(prev => prev.subtract(months, 'month'));
    };

    const handleNext = () => {
        const months = parseInt(viewMode);
        setStartDate(prev => prev.add(months, 'month'));
    };

    const handleCreateLeave = () => {
        setEditingLeave(null);
        setCreateLeaveModalOpen(true);
    };

    const handleEditLeave = (leave: LeaveRecord) => {
        // Only allow editing own leaves
        if (leave.employeeId !== user?.id) {
            message.warning('You can only edit your own leaves');
            return;
        }
        setEditingLeave(leave);
        setCreateLeaveModalOpen(true);
    };

    const handleDeleteLeave = async (leaveId: string) => {
        // Find the leave to check ownership
        const leave = leaves.find(l => l.id === leaveId);
        if (leave && leave.employeeId !== user?.id) {
            message.warning('You can only delete your own leaves');
            return;
        }

        try {
            await deleteLeaveAPI(leaveId);
            message.success('Leave deleted successfully');
            loadData(); // Refresh data
        } catch (error) {
            message.error('Failed to delete leave');
            console.error(error);
        }
    };

    const handleLeaveSubmit = async (values: {
        startDate: string;
        endDate: string;
        type: LeaveType;
        description: string;
        employeeId?: string;
    }) => {
        try {
            if (editingLeave) {
                // Update existing leave - only own leaves allowed
                if (editingLeave.employeeId !== user?.id) {
                    message.error('You can only edit your own leaves');
                    return;
                }
                await updateLeaveAPI(editingLeave.id, {
                    id: editingLeave.id,
                    employeeId: editingLeave.employeeId,
                    startDate: values.startDate,
                    endDate: values.endDate,
                    type: values.type,
                    status: 'Applied'
                });
                message.success('Leave updated successfully!');
            } else {
                // Create new leave - always for the logged-in user
                if (!user) {
                    message.error('You must be logged in to create a leave');
                    return;
                }
                const newLeave: LeaveRecordAPI = {
                    id: `leave-${Date.now()}`,
                    employeeId: user.id, // Always use logged-in user's ID
                    startDate: values.startDate,
                    endDate: values.endDate,
                    type: values.type,
                    status: 'Applied',
                };
                await createLeaveAPI(newLeave);
                message.success('Leave request submitted successfully!');
            }
            loadData(); // Refresh data
        } catch (error) {
            message.error(editingLeave ? 'Failed to update leave' : 'Failed to create leave');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className='leave-tracker-page'>
            {/* Date Navigation with Filters and Create Leave */}
            <div className="date-navigation" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text className="date-range" style={{ fontSize: 18, fontWeight: 600 }}>{dateRangeDisplay}</Text>
                    <div className="nav-arrows">
                        <button className="nav-arrow" onClick={handlePrevious}>
                            <FiChevronLeft size={16} />
                        </button>
                        <button className="nav-arrow" onClick={handleNext}>
                            <FiChevronRight size={16} />
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FilterBar
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onCreateLeave={handleCreateLeave}
                        filters={filters}
                        onFiltersChange={setFilters}
                        hideViewMode={true}
                    />
                </div>
            </div>

            {/* Search and Scheduler Container */}
            <div className="scheduler-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="scheduler-search-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="search-section">
                        <SearchInput
                            value={searchValue}
                            onChange={setSearchValue}
                            placeholder="Find employee"
                        />
                    </div>
                    <FilterBar
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onCreateLeave={handleCreateLeave}
                        filters={filters}
                        onFiltersChange={setFilters}
                        hideFilters={true}
                    />
                </div>
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <Scheduler
                        employees={filteredEmployees}
                        leaves={filteredLeaves}
                        startDate={startDate}
                        endDate={endDate}
                        viewMode={viewMode}
                        onEditLeave={handleEditLeave}
                        onDeleteLeave={handleDeleteLeave}
                        currentUserId={user?.id}
                    />
                </div>
            </div>

            <CreateLeaveModal
                open={createLeaveModalOpen}
                onClose={() => {
                    setCreateLeaveModalOpen(false);
                    setEditingLeave(null);
                }}
                onSubmit={handleLeaveSubmit}
                initialValues={editingLeave}
            />
        </div>
    );
};

export default LeaveTrackerPage;
