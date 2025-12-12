import { Tooltip } from 'antd';
import dayjs from 'dayjs';
import { LeaveRecord, LEAVE_TYPE_COLORS, LEAVE_TYPE_LABELS } from '../../types';
import './EventBlock.css';

interface EventBlockProps {
    leave: LeaveRecord;
    leftPercent: number;
    widthPercent: number;
}

const EventBlock: React.FC<EventBlockProps> = ({ leave, leftPercent, widthPercent }) => {
    const colors = LEAVE_TYPE_COLORS[leave.type];
    const label = LEAVE_TYPE_LABELS[leave.type];

    const startDate = dayjs(leave.startDate).format('MMM D');
    const endDate = dayjs(leave.endDate).format('MMM D, YYYY');
    const duration = dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1;

    const isPending = leave.status === 'pending';
    const isRejected = leave.status === 'rejected';

    // Show label text if width is sufficient (roughly more than 5% of container)
    const showLabel = widthPercent > 5;
    const displayText = showLabel ? label : '';

    const tooltipContent = (
        <div className="event-tooltip">
            <div className="tooltip-type">{label}</div>
            <div className="tooltip-dates">{startDate} - {endDate}</div>
            <div className="tooltip-duration">{duration} day{duration > 1 ? 's' : ''}</div>
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
                    left: `${leftPercent}%`,
                    width: `calc(${widthPercent}% - 2px)`,
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                }}
            >
                {showLabel && <span className="event-label">{displayText}</span>}
            </div>
        </Tooltip>
    );
};

export default EventBlock;
