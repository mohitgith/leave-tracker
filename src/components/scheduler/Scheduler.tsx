import React, { useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { Employee, LeaveRecord } from '../../types';
import { TimelineConfig, generateTimelineConfig } from '../../utils/timelineUtils';
import EmployeeRow from './EmployeeRow';
import TimelineHeader from './TimelineHeader';
import TimelineGrid from './TimelineGrid';
import './Scheduler.css';

interface SchedulerProps {
    employees: Employee[];
    leaves: LeaveRecord[];
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
    viewMode: '1' | '3'; // months
}

const Scheduler: React.FC<SchedulerProps> = ({
    employees,
    leaves,
    startDate,
    endDate,
    viewMode,
}) => {
    const timelineRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    // Calculate day width based on view mode - wider for better visibility
    const getDayWidth = () => {
        switch (viewMode) {
            case '1': return 32;  // Wider for 1 month view
            case '3': return 18;  // Reasonable size for 3 months
            default: return 18;
        }
    };

    const config: TimelineConfig = generateTimelineConfig(startDate, endDate, getDayWidth());
    const currentMonth = dayjs(); // March 2024 for the mockup

    // Sync scroll between header and grid
    useEffect(() => {
        const timeline = timelineRef.current;
        const header = headerRef.current;

        if (!timeline || !header) return;

        const handleScroll = () => {
            header.scrollLeft = timeline.scrollLeft;
        };

        timeline.addEventListener('scroll', handleScroll);
        return () => timeline.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="scheduler">
            {/* Header section */}
            <div className="scheduler-header">
                <div className="scheduler-header-left">
                    <div className="employee-search-header">
                        {/* Empty space for alignment */}
                    </div>
                </div>
                <div className="scheduler-header-right" ref={headerRef}>
                    <TimelineHeader config={config} currentMonth={currentMonth} />
                </div>
            </div>

            {/* Body section */}
            <div className="scheduler-body">
                {/* Employee list (left fixed column) */}
                <div className="scheduler-employees">
                    {employees.map(employee => (
                        <EmployeeRow key={employee.id} employee={employee} />
                    ))}
                </div>

                {/* Timeline grid (scrollable) */}
                <div className="scheduler-timeline" ref={timelineRef}>
                    <TimelineGrid
                        employees={employees}
                        leaves={leaves}
                        config={config}
                    />
                </div>
            </div>
        </div>
    );
};

export default Scheduler;
