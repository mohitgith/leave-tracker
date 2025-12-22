import { Popover, Button, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { LeaveRecord, LEAVE_TYPE_COLORS, LEAVE_TYPE_LABELS } from '../../types';
import './EventBlock.css';

interface EventBlockProps {
    leave: LeaveRecord;
    leftPercent: number;
    widthPercent: number;
    onEdit?: (leave: LeaveRecord) => void;
    onDelete?: (leaveId: string) => void;
    isOwner?: boolean;
}

const EventBlock: React.FC<EventBlockProps> = ({ 
    leave, 
    leftPercent, 
    widthPercent,
    onEdit,
    onDelete,
    isOwner = false
}) => {
    const colors = LEAVE_TYPE_COLORS[leave.type];
    const label = LEAVE_TYPE_LABELS[leave.type];

    const startDate = dayjs(leave.startDate).format('MMM D');
    const endDate = dayjs(leave.endDate).format('MMM D, YYYY');
    const duration = dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1;

    // Show label text if width is sufficient (roughly more than 5% of container)
    const showLabel = widthPercent > 5;
    const displayText = showLabel ? label : '';

    // Tooltip content for non-owners
    const tooltipContent = (
        <div className="event-tooltip">
            <div className="tooltip-type">{label}</div>
            <div className="tooltip-dates">{startDate} - {endDate}</div>
            <div className="tooltip-duration">{duration} day{duration > 1 ? 's' : ''}</div>
        </div>
    );

    // Popover content with actions for owners
    const popoverContent = (
        <div className="event-popover">
            <div className="popover-header">
                <div className="popover-type">{label}</div>
                <div className="popover-dates">{startDate} - {endDate}</div>
                <div className="popover-duration">{duration} day{duration > 1 ? 's' : ''}</div>
            </div>
            <div className="popover-actions">
                <Button 
                    size="small" 
                    icon={<EditOutlined />} 
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(leave);
                    }}
                >
                    Edit
                </Button>
                <Popconfirm
                    title="Delete Leave"
                    description="Are you sure you want to delete this leave?"
                    onConfirm={(e) => {
                        e?.stopPropagation();
                        onDelete?.(leave.id);
                    }}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button 
                        size="small" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Delete
                    </Button>
                </Popconfirm>
            </div>
        </div>
    );

    const blockElement = (
        <div
            className="event-block"
            style={{
                left: `${leftPercent}%`,
                width: `calc(${widthPercent}% - 2px)`,
                backgroundColor: colors.bg,
                borderColor: colors.border,
            }}
        >
            {showLabel && <span className="event-label">{displayText}</span>}
        </div>
    );

    // For owners, show popover with actions
    // For non-owners, show tooltip with info only
    if (isOwner) {
        return (
            <Popover 
                content={popoverContent} 
                trigger="click" 
                placement="top"
                overlayClassName="event-popover-overlay"
            >
                {blockElement}
            </Popover>
        );
    }

    return (
        <Tooltip title={tooltipContent} placement="top">
            {blockElement}
        </Tooltip>
    );
};

export default EventBlock;
