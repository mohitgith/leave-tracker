import { useMemo } from 'react';
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
    const leavesByEmployee = useMemo(() => {
        const grouped: Record<string, LeaveRecord[]> = {};
        employees.forEach(emp => {
            grouped[emp.id] = leaves.filter(l => l.employeeId === emp.id);
        });
        return grouped;
    }, [employees, leaves]);

    const gridWidth = config.totalDays * config.dayWidth;

    return (
        <div className="timeline-grid" style={{ minWidth: `${gridWidth}px` }}>
            {/* Month divider lines */}
            <div className="grid-lines">
                {config.months.map((_monthData, index) => {
                    let offset = 0;
                    for (let i = 0; i < index; i++) {
                        offset += config.months[i].days * config.dayWidth;
                    }
                    return (
                        <div
                            key={index}
                            className="grid-line"
                            style={{ left: `${offset}px` }}
                        />
                    );
                })}
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
