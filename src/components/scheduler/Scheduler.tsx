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
    const containerRef = useRef<HTMLDivElement>(null);
    const [dayWidth, setDayWidth] = useState(32);

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

    // Calculate day width to fill container
    useEffect(() => {
        const updateDayWidth = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const totalDays = getTotalDays();
                // Calculate width to fill container, with a minimum
                const calculatedWidth = Math.max(containerWidth / totalDays, viewMode === '1' ? 28 : 14);
                setDayWidth(calculatedWidth);
            }
        };

        updateDayWidth();
        window.addEventListener('resize', updateDayWidth);
        return () => window.removeEventListener('resize', updateDayWidth);
    }, [viewMode, getTotalDays]);

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

                {/* Timeline grid (scrollable) */}
                <div className="scheduler-timeline" ref={timelineRef}>
                    <div ref={containerRef} style={{ width: '100%', minWidth: 'fit-content' }}>
                        <TimelineGrid
                            employees={employees}
                            leaves={leaves}
                            config={config}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scheduler;
