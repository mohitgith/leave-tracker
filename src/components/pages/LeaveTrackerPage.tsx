import React, { useState, useMemo } from 'react';
import { Typography, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Scheduler } from '../scheduler';
import { FilterBar, SearchInput, CreateLeaveModal } from '../common';
import { employees, leaveRecords } from '../../data/mockData';
import { LeaveType } from '../../types';

const { Text } = Typography;

const LeaveTrackerPage: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<'1' | '3'>('1');
    const [startDate, setStartDate] = useState(dayjs().startOf('month'));
    const [leaves, setLeaves] = useState(leaveRecords);
    const [createLeaveModalOpen, setCreateLeaveModalOpen] = useState(false);

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
    }, [searchValue]);

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
        setCreateLeaveModalOpen(true);
    };

    const handleLeaveSubmit = (values: {
        startDate: string;
        endDate: string;
        type: LeaveType;
        description: string;
    }) => {
        const newLeave = {
            id: `leave-${Date.now()}`,
            employeeId: '1', // Hardcoded to first employee for demo
            startDate: values.startDate,
            endDate: values.endDate,
            type: values.type,
            status: 'Applied' as const,
        };

        setLeaves(prev => [...prev, newLeave]);
        message.success('Leave request submitted successfully!');
    };

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
                    />
                </div>
            </div>

            <CreateLeaveModal
                open={createLeaveModalOpen}
                onClose={() => setCreateLeaveModalOpen(false)}
                onSubmit={handleLeaveSubmit}
            />
        </div>
    );
};

export default LeaveTrackerPage;
