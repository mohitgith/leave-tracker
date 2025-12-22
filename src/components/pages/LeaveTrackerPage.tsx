import React, { useState, useMemo, useEffect } from 'react';
import { Typography, message, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Scheduler } from '../scheduler';
import { FilterBar, SearchInput, CreateLeaveModal } from '../common';
import { LeaveType, LeaveRecord, Employee } from '../../types';
import { 
    fetchEmployees, 
    fetchLeaves, 
    createLeave as createLeaveAPI, 
    updateLeave as updateLeaveAPI, 
    deleteLeave as deleteLeaveAPI,
    LeaveRecordAPI
} from '../../services/api';

const { Text } = Typography;

const LeaveTrackerPage: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<'1' | '3'>('1');
    const [startDate, setStartDate] = useState(dayjs().startOf('month'));
    const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [createLeaveModalOpen, setCreateLeaveModalOpen] = useState(false);
    const [editingLeave, setEditingLeave] = useState<LeaveRecord | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch data from API
    const loadData = async () => {
        try {
            setLoading(true);
            const [empData, leaveData] = await Promise.all([
                fetchEmployees(),
                fetchLeaves()
            ]);
            
            // Map API data to frontend types
            setEmployees(empData.map(e => ({
                id: e.id,
                name: e.name,
                role: e.role,
                department: e.department,
                avatarUrl: e.avatarUrl
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

    // Filter employees based on search
    const filteredEmployees = useMemo(() => {
        if (!searchValue.trim()) return employees;
        const search = searchValue.toLowerCase();
        return employees.filter(
            emp =>
                emp.name.toLowerCase().includes(search) ||
                emp.role.toLowerCase().includes(search)
        );
    }, [searchValue, employees]);

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
        setEditingLeave(leave);
        setCreateLeaveModalOpen(true);
    };

    const handleDeleteLeave = async (leaveId: string) => {
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
                // Update existing leave
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
                // Create new leave
                const newLeave: LeaveRecordAPI = {
                    id: `leave-${Date.now()}`,
                    employeeId: values.employeeId || '1', // Use selected employee or default
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
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Date Navigation */}
            <div className="date-navigation" style={{ padding: '16px 24px' }}>
                <Text className="date-range" style={{ fontSize: 18, fontWeight: 600 }}>{dateRangeDisplay}</Text>
                <div className="nav-arrows">
                    <button className="nav-arrow" onClick={handlePrevious}>
                        <LeftOutlined />
                    </button>
                    <button className="nav-arrow" onClick={handleNext}>
                        <RightOutlined />
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onCreateLeave={handleCreateLeave}
            />

            {/* Search and Scheduler Container */}
            <div className="scheduler-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="scheduler-search-row">
                    <div className="search-section">
                        <SearchInput
                            value={searchValue}
                            onChange={setSearchValue}
                            placeholder="Find employee"
                        />
                        <div className="manager-info">
                            <span className="manager-label">Manager:</span>
                            <span className="manager-name">Lohit Ganta</span>
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <Scheduler
                        employees={filteredEmployees}
                        leaves={leaves}
                        startDate={startDate}
                        endDate={endDate}
                        viewMode={viewMode}
                        onEditLeave={handleEditLeave}
                        onDeleteLeave={handleDeleteLeave}
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
                employees={employees}
            />
        </div>
    );
};

export default LeaveTrackerPage;
