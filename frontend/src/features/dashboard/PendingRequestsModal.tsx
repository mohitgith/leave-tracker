import React from 'react';
import { Modal } from 'antd';
import { FiCalendar, FiUser } from 'react-icons/fi';
import './PendingRequestsModal.css';

interface LeaveItem {
    leave: {
        id: string;
        employeeId: string;
        startDate: string;
        endDate: string;
        type: string;
        status: string;
    };
    employeeName: string;
    employeeRole: string;
    avatarUrl: string;
    department?: string;
}

interface PendingRequestsModalProps {
    visible: boolean;
    onClose: () => void;
    requests: LeaveItem[];
}

const PendingRequestsModal: React.FC<PendingRequestsModalProps> = ({ visible, onClose, requests }) => {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getLeaveTypeClass = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'sick':
                return 'sick';
            case 'vacation':
                return 'vacation';
            default:
                return 'personal';
        }
    };

    const getLeaveTypeLabel = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'sick':
                return 'Sick Leave';
            case 'vacation':
                return 'Vacation';
            default:
                return 'Personal';
        }
    };

    return (
        <Modal
            title={
                <div className="pending-modal-title">
                    <FiCalendar size={20} />
                    <span>Leave Requests</span>
                    <span className="pending-count-badge">{requests.length} Requests</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={900}
            className="pending-requests-modal"
        >
            <div className="pending-requests-list">
                {requests.length > 0 ? (
                    requests.map((item, index) => (
                        <div key={item.leave.id || index} className="pending-request-item">
                            <div className="pending-avatar-wrapper">
                                <img
                                    src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.employeeName || 'User')}&background=random`}
                                    alt={item.employeeName}
                                    className="pending-avatar"
                                />
                            </div>
                            <div className="pending-info">
                                <p className="pending-name">{item.employeeName}</p>
                            </div>
                            <span className={`pending-type-badge ${getLeaveTypeClass(item.leave.type)}`}>
                                {getLeaveTypeLabel(item.leave.type)}
                            </span>
                            <span className="pending-dates">
                                <FiCalendar size={14} style={{ marginRight: 4 }} />
                                {formatDate(item.leave.startDate)} - {formatDate(item.leave.endDate)}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="empty-pending-state">
                        <FiUser size={48} className="empty-icon" />
                        <p className="empty-text">No pending requests</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PendingRequestsModal;
