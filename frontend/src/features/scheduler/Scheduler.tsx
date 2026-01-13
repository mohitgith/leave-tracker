import { useRef, useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { Employee, LeaveRecord } from '../../types';
import { TimelineConfig, generateTimelineConfig } from '../../lib/timelineUtils';
import EmployeeRow from './EmployeeRow';
import TimelineHeader from './TimelineHeader';
import TimelineGrid from './TimelineGrid';
import UnifiedGridlines from './UnifiedGridlines';
import './Scheduler.css';

interface SchedulerProps {
    employees: Employee[];
    leaves: LeaveRecord[];
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
    viewMode: '1' | '3'; // months
    onEditLeave?: (leave: LeaveRecord) => void;
    onDeleteLeave?: (leaveId: string) => void;
    currentUserId?: string;
}

const MONTHS_ROW_HEIGHT = 32;
const DAYS_ROW_HEIGHT = 36;
const ROW_HEIGHT = 48;

const Scheduler: React.FC<SchedulerProps> = ({
    employees,
    leaves,
    startDate,
    endDate,
    viewMode,
    onEditLeave,
    onDeleteLeave,
    currentUserId,
}) => {
    const timelineRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Calculate total days in the view
    const getTotalDays = useCallback(() => {
        let days = 0;
        let current = startDate.startOf('month');
        const end = endDate.endOf('month');
        while (current.isBefore(end) || current.isSame(end, 'day')) {
            days++;
            current = current.add(1, 'day');
        }
        return days;
    }, [startDate, endDate]);

    // Get container width on mount and resize
    useEffect(() => {
        const updateContainerWidth = () => {
            if (timelineRef.current) {
                setContainerWidth(timelineRef.current.clientWidth);
            }
        };

        // Use setTimeout to ensure DOM is ready
        const timer = setTimeout(updateContainerWidth, 0);
        window.addEventListener('resize', updateContainerWidth);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateContainerWidth);
        };
    }, [viewMode, startDate, endDate]);

    // Calculate day width to exactly fill container with no gaps
    // For multi-month views, enforce a minimum day width for readability
    const totalDays = getTotalDays();
    const MIN_DAY_WIDTH = 25; // Minimum width per day for readability
    const calculatedDayWidth = containerWidth > 0 ? containerWidth / totalDays : 10;

    // For 1-month view, fit to container; for longer views, use minimum width if needed
    const monthsInView = Math.round(totalDays / 30);
    const dayWidth = monthsInView <= 1
        ? calculatedDayWidth
        : Math.max(MIN_DAY_WIDTH, calculatedDayWidth);

    const config: TimelineConfig = generateTimelineConfig(startDate, endDate, dayWidth);
    const currentMonth = dayjs();

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
            {/* Left column - fixed employee header and list */}
            <div className="scheduler-left-column">
                <div className="scheduler-header-left">
                    <div className="employee-search-header">
                        {/* Empty space for alignment */}
                    </div>
                </div>
                <div className="scheduler-employees">
                    {employees.map(employee => (
                        <EmployeeRow key={employee.id} employee={employee} />
                    ))}
                </div>
            </div>

            {/* Right column - timeline with unified gridlines */}
            <div className="scheduler-right-column">
                {/* Unified gridlines spanning days row and body */}
                <div className="scheduler-timeline-wrapper" ref={headerRef}>
                    <UnifiedGridlines
                        config={config}
                        employeeCount={employees.length}
                        monthsRowHeight={MONTHS_ROW_HEIGHT}
                        daysRowHeight={DAYS_ROW_HEIGHT}
                        rowHeight={ROW_HEIGHT}
                    />
                    <div className="scheduler-header-right">
                        <TimelineHeader config={config} currentMonth={currentMonth} />
                    </div>
                    <div className="scheduler-timeline" ref={timelineRef}>
                        <TimelineGrid
                            employees={employees}
                            leaves={leaves}
                            config={config}
                            onEditLeave={onEditLeave}
                            onDeleteLeave={onDeleteLeave}
                            currentUserId={currentUserId}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scheduler;

