import React, { useState, useEffect } from 'react';
import { Modal, Checkbox, Button } from 'antd';
import { LeaveType, LEAVE_TYPE_LABELS } from '../../types';
import './DashboardFilterModal.css';

interface DashboardFilterModalProps {
    visible: boolean;
    onClose: () => void;
    selectedTypes: LeaveType[];
    onApply: (types: LeaveType[]) => void;
}

const DashboardFilterModal: React.FC<DashboardFilterModalProps> = ({
    visible,
    onClose,
    selectedTypes,
    onApply,
}) => {
    const [tempSelectedTypes, setTempSelectedTypes] = useState<LeaveType[]>(selectedTypes);

    useEffect(() => {
        setTempSelectedTypes(selectedTypes);
    }, [selectedTypes, visible]);

    const handleTypeChange = (type: LeaveType, checked: boolean) => {
        if (checked) {
            setTempSelectedTypes([...tempSelectedTypes, type]);
        } else {
            setTempSelectedTypes(tempSelectedTypes.filter(t => t !== type));
        }
    };

    const handleApply = () => {
        onApply(tempSelectedTypes);
        onClose();
    };

    const handleClear = () => {
        setTempSelectedTypes([]);
    };

    return (
        <Modal
            title="Filter Leaves"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="clear" onClick={handleClear}>
                    Clear All
                </Button>,
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="apply" type="primary" onClick={handleApply}>
                    Apply Filters
                </Button>,
            ]}
            width={400}
            className="dashboard-filter-modal"
        >
            <div className="filter-section">
                <h4>Leave Types</h4>
                <div className="filter-checkboxes">
                    {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                        <Checkbox
                            key={value}
                            checked={tempSelectedTypes.includes(value as LeaveType)}
                            onChange={(e) => handleTypeChange(value as LeaveType, e.target.checked)}
                        >
                            {label}
                        </Checkbox>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default DashboardFilterModal;
