import { Popover, Button, Popconfirm } from 'antd';
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
}

const EventBlock: React.FC<EventBlockProps> = ({ 
    leave, 
    leftPercent, 
    widthPercent,
    onEdit,
    onDelete
}) => {
    const colors = LEAVE_TYPE_COLORS[leave.type];
    const label = LEAVE_TYPE_LABELS[leave.type];

    const startDate = dayjs(leave.startDate).format('MMM D');
    const endDate = dayjs(leave.endDate).format('MMM D, YYYY');
    const duration = dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1;

    // Show label text if width is sufficient (roughly more than 5% of container)
    const showLabel = widthPercent > 5;
    const displayText = showLabel ? label : '';

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

    return (
        <Popover 
            content={popoverContent} 
            trigger="click" 
            placement="top"
            overlayClassName="event-popover-overlay"
        >
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
        </Popover>
    );
};

export default EventBlock;
