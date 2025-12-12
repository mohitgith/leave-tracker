import React, { useState, useMemo } from 'react';
import { Layout, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Sidebar, TopBar } from './components/layout';
import { Scheduler } from './components/scheduler';
import { FilterBar, SearchInput } from './components/common';
import { employees, leaveRecords } from './data/mockData';
import './App.css';

const { Content } = Layout;
const { Text } = Typography;

const App: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<'1' | '3' | '6' | '12'>('1');
    const [startDate, setStartDate] = useState(dayjs('2024-01-01'));

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

    return (
        <Layout className="app-layout">
            <Sidebar />
            <Layout className="main-layout">
                <TopBar />
                <Content className="main-content">
                    {/* Date Navigation */}
                    <div className="date-navigation">
                        <Text className="date-range">{dateRangeDisplay}</Text>
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
                    />

                    {/* Search and Scheduler Container */}
                    <div className="scheduler-container">
                        <div className="scheduler-search-row">
                            <div className="search-wrapper">
                                <SearchInput
                                    value={searchValue}
                                    onChange={setSearchValue}
                                    placeholder="Find employee"
                                />
                            </div>
                        </div>
                        <Scheduler
                            employees={filteredEmployees}
                            leaves={leaveRecords}
                            startDate={startDate}
                            endDate={endDate}
                            viewMode={viewMode}
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;
