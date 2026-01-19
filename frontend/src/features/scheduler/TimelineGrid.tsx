import { useMemo } from 'react';
import { Employee, LeaveRecord } from '../../types';
import { TimelineConfig, calculateLeavePosition } from '../../lib/timelineUtils';
import EventBlock from './EventBlock';
import './TimelineGrid.css';

interface TimelineGridProps {
    employees: Employee[];
    leaves: LeaveRecord[];
    config: TimelineConfig;
    onEditLeave?: (leave: LeaveRecord) => void;
    onDeleteLeave?: (leaveId: string) => void;
    currentUserId?: string;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({
    employees,
    leaves,
    config,
    onEditLeave,
    onDeleteLeave,
    currentUserId
}) => {
    const totalDays = config.totalDays;
    const totalWidth = config.dayWidth * totalDays;

    const leavesByEmployee = useMemo(() => {
        const grouped: Record<string, LeaveRecord[]> = {};
        employees.forEach(emp => {
            grouped[emp.id] = leaves.filter(l => l.employeeId === emp.id);
        });
        return grouped;
    }, [employees, leaves]);

    return (
        <div className="timeline-grid" style={{ width: '100%', minWidth: `${totalWidth}px` }}>
            {/* Employee rows */}
            {employees.map(employee => (
                <div key={employee.id} className="timeline-row">
                    {leavesByEmployee[employee.id]?.map(leave => {
                        const position = calculateLeavePosition(leave, config);
                        if (!position.visible) return null;

                        // Convert pixel position to percentage
                        const leftPercent = (position.left / (totalDays * config.dayWidth)) * 100;
                        const widthPercent = (position.width / (totalDays * config.dayWidth)) * 100;

                        // Check if current user owns this leave
                        const isOwner = currentUserId === leave.employeeId;

                        return (
                            <EventBlock
                                key={leave.id}
                                leave={leave}
                                leftPercent={leftPercent}
                                widthPercent={widthPercent}
                                onEdit={isOwner ? onEditLeave : undefined}
                                onDelete={isOwner ? onDeleteLeave : undefined}
                                isOwner={isOwner}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default TimelineGrid;

