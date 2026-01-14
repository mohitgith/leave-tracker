import React from 'react';
import dayjs from 'dayjs';
import { Employee, LeaveRecord } from '../../types';
import { TimelineConfig, generateTimelineConfig } from '../../lib/timelineUtils';
import TimelineGrid from './TimelineGrid';
import './MonthSection.css';

interface MonthSectionProps {
    month: dayjs.Dayjs; // The month to display
    employees: Employee[];
    leaves: LeaveRecord[];
    onEditLeave?: (leave: LeaveRecord) => void;
    onDeleteLeave?: (leaveId: string) => void;
    currentUserId?: string;
    isCurrentMonth?: boolean;
}

const DAY_WIDTH = 28;

const MonthSection: React.FC<MonthSectionProps> = ({
    month,
    employees,
    leaves,
    onEditLeave,
    onDeleteLeave,
    currentUserId,
    isCurrentMonth = false,
}) => {
    const startDate = month.startOf('month');
    const endDate = month.endOf('month');
    const daysInMonth = endDate.date();

    // Generate timeline config for this single month
    const config: TimelineConfig = generateTimelineConfig(startDate, endDate, DAY_WIDTH);

    // Filter leaves for this month
    const monthLeaves = leaves.filter(leave => {
        const leaveStart = dayjs(leave.startDate);
        const leaveEnd = dayjs(leave.endDate);
        return (
            leaveStart.isBefore(endDate.add(1, 'day')) &&
            leaveEnd.isAfter(startDate.subtract(1, 'day'))
        );
    });

    // Generate gridlines
    const gridlines: React.ReactNode[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const date = month.date(day);
        const isWeekend = date.day() === 0 || date.day() === 6;
        const isToday = date.isSame(dayjs(), 'day');
        gridlines.push(
            <div
                key={day}
                className={`month-gridline ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}`}
                style={{ flex: 1, minWidth: DAY_WIDTH }}
            />
        );
    }

    return (
        <div className={`month-section ${isCurrentMonth ? 'current-month' : ''}`}>
            {/* Month Header with label and days */}
            <div className="month-section-header">
                <div className="month-section-label">
                    <span className="month-name">{month.format('MMM')}</span>
                    <span className="month-year">{month.format('YYYY')}</span>
                </div>
                <div className="month-section-days-header">
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const date = month.date(day);
                        const isWeekend = date.day() === 0 || date.day() === 6;
                        const isToday = date.isSame(dayjs(), 'day');
                        const dayInitial = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.day()];
                        return (
                            <div
                                key={day}
                                className={`month-section-day ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}`}
                                style={{ width: DAY_WIDTH }}
                            >
                                <span className="day-initial">{dayInitial}</span>
                                <span className="day-number">{day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Employee Rows */}
            <div className="month-section-body">
                {employees.map(employee => (
                    <div key={employee.id} className="month-section-employee-row">
                        <div className="month-section-employee-info">
                            <img
                                src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&size=24`}
                                alt={employee.name}
                                className="month-section-avatar"
                            />
                            <span className="month-section-employee-name">{employee.name}</span>
                        </div>
                        <div className="month-section-timeline" style={{ minWidth: daysInMonth * DAY_WIDTH }}>
                            {/* Gridlines */}
                            <div className="month-section-gridlines">
                                {gridlines}
                            </div>
                            {/* Leave bars */}
                            <TimelineGrid
                                employees={[employee]}
                                leaves={monthLeaves.filter(l => l.employeeId === employee.id)}
                                config={config}
                                onEditLeave={onEditLeave}
                                onDeleteLeave={onDeleteLeave}
                                currentUserId={currentUserId}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MonthSection;
