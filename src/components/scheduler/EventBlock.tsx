import React from 'react';
import { Tooltip } from 'antd';
import dayjs from 'dayjs';
import { LeaveRecord, LEAVE_TYPE_COLORS, LEAVE_TYPE_LABELS } from '../../types';
import './EventBlock.css';

interface EventBlockProps {
    leave: LeaveRecord;
    left: number;
    width: number;
}

const EventBlock: React.FC<EventBlockProps> = ({ leave, left, width }) => {
    const colors = LEAVE_TYPE_COLORS[leave.type];
    const label = LEAVE_TYPE_LABELS[leave.type];

    const startDate = dayjs(leave.startDate).format('MMM D');
    const endDate = dayjs(leave.endDate).format('MMM D, YYYY');

    const isPending = leave.status === 'pending';
    const isRejected = leave.status === 'rejected';

    const tooltipContent = (
        <div className="event-tooltip">
            <div className="tooltip-type">{label}</div>
            <div className="tooltip-dates">{startDate} - {endDate}</div>
            <div className={`tooltip-status tooltip-status-${leave.status}`}>
                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
            </div>
        </div>
    );

    return (
        <Tooltip title={tooltipContent} placement="top">
            <div
                className={`event-block ${isPending ? 'event-pending' : ''} ${isRejected ? 'event-rejected' : ''}`}
                style={{
                    left: `${left}px`,
                    width: `${Math.max(width - 2, 8)}px`,
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                }}
            />
        </Tooltip>
    );
};

export default EventBlock;
