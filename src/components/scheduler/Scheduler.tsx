import { useRef, useEffect, useState, useCallback } from 'react';
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
    onEditLeave?: (leave: LeaveRecord) => void;
    onDeleteLeave?: (leaveId: string) => void;
}

const Scheduler: React.FC<SchedulerProps> = ({
    employees,
    leaves,
    startDate,
    endDate,
    viewMode,
    onEditLeave,
    onDeleteLeave,
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
    const totalDays = getTotalDays();
    const dayWidth = containerWidth > 0 ? containerWidth / totalDays : 10;

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

                {/* Timeline grid */}
                <div className="scheduler-timeline" ref={timelineRef}>
                    <TimelineGrid
                        employees={employees}
                        leaves={leaves}
                        config={config}
                        onEditLeave={onEditLeave}
                        onDeleteLeave={onDeleteLeave}
                    />
                </div>
            </div>
        </div>
    );
};

export default Scheduler;
