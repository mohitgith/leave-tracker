import React, { useRef, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { Employee, LeaveRecord } from '../../types';
import MonthSection from './MonthSection';
import './VerticalScheduler.css';

interface VerticalSchedulerProps {
    employees: Employee[];
    leaves: LeaveRecord[];
    startDate: dayjs.Dayjs; // First month to show
    endDate: dayjs.Dayjs;   // Last month to show
    currentMonth?: dayjs.Dayjs;
    onEditLeave?: (leave: LeaveRecord) => void;
    onDeleteLeave?: (leaveId: string) => void;
    currentUserId?: string;
}

// Constants for height calculation
const MONTH_HEADER_HEIGHT = 40; // Days header row (fixed height in CSS)
const EMPLOYEE_ROW_HEIGHT = 32; // Each employee row (fixed height in CSS)
const MONTH_BORDER_HEIGHT = 2;  // Border between months (1px top + 1px bottom)
const VISIBLE_MONTHS = 3;       // Show 3 months at a time

const VerticalScheduler: React.FC<VerticalSchedulerProps> = ({
    employees,
    leaves,
    startDate,
    endDate,
    currentMonth = dayjs(),
    onEditLeave,
    onDeleteLeave,
    currentUserId,
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const currentMonthRef = useRef<HTMLDivElement>(null);

    // Generate array of months between startDate and endDate
    const getMonths = () => {
        const months: dayjs.Dayjs[] = [];
        let current = startDate.startOf('month');
        const end = endDate.endOf('month');

        while (current.isBefore(end) || current.isSame(end, 'month')) {
            months.push(current);
            current = current.add(1, 'month');
        }
        return months;
    };

    const months = getMonths();

    // Calculate container height to show exactly 3 months
    const containerHeight = useMemo(() => {
        const employeeCount = employees.length;
        const monthHeight = MONTH_HEADER_HEIGHT + (employeeCount * EMPLOYEE_ROW_HEIGHT) + MONTH_BORDER_HEIGHT;
        return VISIBLE_MONTHS * monthHeight;
    }, [employees.length]);

    // Scroll to current month on mount
    useEffect(() => {
        if (currentMonthRef.current && scrollContainerRef.current) {
            currentMonthRef.current.scrollIntoView({ block: 'start', behavior: 'auto' });
        }
    }, []);

    return (
        <div className="vertical-scheduler">
            <div
                className="vertical-scheduler-container"
                ref={scrollContainerRef}
                style={{ height: containerHeight }}
            >
                {months.map((month) => {
                    const isCurrentMonth = month.isSame(currentMonth, 'month');
                    return (
                        <div
                            key={month.format('YYYY-MM')}
                            ref={isCurrentMonth ? currentMonthRef : undefined}
                        >
                            <MonthSection
                                month={month}
                                employees={employees}
                                leaves={leaves}
                                onEditLeave={onEditLeave}
                                onDeleteLeave={onDeleteLeave}
                                currentUserId={currentUserId}
                                isCurrentMonth={isCurrentMonth}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VerticalScheduler;
