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
    onEditLeave?: (leave: LeaveRecord) => void;
    onDeleteLeave?: (leaveId: string) => void;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({ 
    employees, 
    leaves, 
    config,
    onEditLeave,
    onDeleteLeave
}) => {
    const today = dayjs();
    const totalDays = config.totalDays;

    const leavesByEmployee = useMemo(() => {
        const grouped: Record<string, LeaveRecord[]> = {};
        employees.forEach(emp => {
            grouped[emp.id] = leaves.filter(l => l.employeeId === emp.id);
        });
        return grouped;
    }, [employees, leaves]);

    // Generate all day columns for grid lines with percentage positions
    const generateDayColumns = useMemo(() => {
        const columns: { percentOffset: number; percentWidth: number; isMonthStart: boolean; isWeekend: boolean; isToday: boolean }[] = [];
        let currentDate = config.startDate.startOf('month');
        const endDate = config.endDate.endOf('month');
        let dayIndex = 0;

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            const isMonthStart = currentDate.date() === 1;
            const isWeekend = currentDate.day() === 0 || currentDate.day() === 6;
            const isToday = currentDate.isSame(today, 'day');

            columns.push({
                percentOffset: (dayIndex / totalDays) * 100,
                percentWidth: (1 / totalDays) * 100,
                isMonthStart,
                isWeekend,
                isToday,
            });

            dayIndex++;
            currentDate = currentDate.add(1, 'day');
        }
        return columns;
    }, [config, today, totalDays]);

    return (
        <div className="timeline-grid">
            {/* Day column grid lines */}
            <div className="grid-lines">
                {generateDayColumns.map((col, index) => (
                    <div
                        key={index}
                        className={`grid-column ${col.isMonthStart ? 'grid-column-month' : ''} ${col.isWeekend ? 'grid-column-weekend' : ''} ${col.isToday ? 'grid-column-today' : ''}`}
                        style={{
                            left: `${col.percentOffset}%`,
                            width: `${col.percentWidth}%`
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

                        // Convert pixel position to percentage
                        const leftPercent = (position.left / (totalDays * config.dayWidth)) * 100;
                        const widthPercent = (position.width / (totalDays * config.dayWidth)) * 100;

                        return (
                            <EventBlock
                                key={leave.id}
                                leave={leave}
                                leftPercent={leftPercent}
                                widthPercent={widthPercent}
                                onEdit={onEditLeave}
                                onDelete={onDeleteLeave}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default TimelineGrid;
