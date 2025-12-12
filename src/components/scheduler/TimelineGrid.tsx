import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Employee, LeaveRecord } from '../../types';
import { TimelineConfig, calculateLeavePosition } from '../../utils/timelineUtils';
import EventBlock from './EventBlock';
import './TimelineGrid.css';

interface TimelineGridProps {
    employees: Employee[];
    leaves: LeaveRecord[];
    config: TimelineConfig;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({ employees, leaves, config }) => {
    const today = dayjs();

    const leavesByEmployee = useMemo(() => {
        const grouped: Record<string, LeaveRecord[]> = {};
        employees.forEach(emp => {
            grouped[emp.id] = leaves.filter(l => l.employeeId === emp.id);
        });
        return grouped;
    }, [employees, leaves]);

    const gridWidth = config.totalDays * config.dayWidth;

    // Generate all day columns for grid lines
    const generateDayColumns = useMemo(() => {
        const columns: { offset: number; isMonthStart: boolean; isWeekend: boolean; isToday: boolean }[] = [];
        let currentDate = config.startDate.startOf('month');
        const endDate = config.endDate.endOf('month');
        let offset = 0;

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            const isMonthStart = currentDate.date() === 1;
            const isWeekend = currentDate.day() === 0 || currentDate.day() === 6;
            const isToday = currentDate.isSame(today, 'day');

            columns.push({
                offset,
                isMonthStart,
                isWeekend,
                isToday,
            });

            offset += config.dayWidth;
            currentDate = currentDate.add(1, 'day');
        }
        return columns;
    }, [config, today]);

    return (
        <div className="timeline-grid" style={{ width: `${gridWidth}px` }}>
            {/* Day column grid lines */}
            <div className="grid-lines">
                {generateDayColumns.map((col, index) => (
                    <div
                        key={index}
                        className={`grid-column ${col.isMonthStart ? 'grid-column-month' : ''} ${col.isWeekend ? 'grid-column-weekend' : ''} ${col.isToday ? 'grid-column-today' : ''}`}
                        style={{
                            left: `${col.offset}px`,
                            width: `${config.dayWidth}px`
                        }}
                    />
                ))}
            </div>

            {/* Employee rows */}
            {employees.map(employee => (
                <div key={employee.id} className="timeline-row">
                    {leavesByEmployee[employee.id]?.map(leave => {
                        const position = calculateLeavePosition(leave, config);
                        if (!position.visible) return null;

                        return (
                            <EventBlock
                                key={leave.id}
                                leave={leave}
                                left={position.left}
                                width={position.width}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default TimelineGrid;
