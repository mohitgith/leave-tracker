import React, { useState, useEffect } from 'react';
import { Checkbox, Button, Dropdown } from 'antd';
import { FiFilter } from 'react-icons/fi';
import { LeaveType, LEAVE_TYPE_LABELS } from '../../types';
import './FilterDropdown.css';

interface FilterDropdownProps {
    selectedTypes: LeaveType[];
    onApply: (types: LeaveType[]) => void;
    buttonClassName?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
    selectedTypes,
    onApply,
    buttonClassName = '',
}) => {
    const [tempSelectedTypes, setTempSelectedTypes] = useState<LeaveType[]>(selectedTypes);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setTempSelectedTypes(selectedTypes);
    }, [selectedTypes]);

    const handleTypeChange = (type: LeaveType, checked: boolean) => {
        if (checked) {
            setTempSelectedTypes([...tempSelectedTypes, type]);
        } else {
            setTempSelectedTypes(tempSelectedTypes.filter(t => t !== type));
        }
    };

    const handleApply = () => {
        onApply(tempSelectedTypes);
        setOpen(false);
    };

    const handleClear = () => {
        setTempSelectedTypes([]);
    };

    const dropdownContent = (
        <div className="filter-dropdown-content">
            <div className="filter-dropdown-header">
                <h4>Filter by Leave Type</h4>
            </div>
            <div className="filter-dropdown-body">
                {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                    <div key={value} className="filter-checkbox-item">
                        <Checkbox
                            checked={tempSelectedTypes.includes(value as LeaveType)}
                            onChange={(e) => handleTypeChange(value as LeaveType, e.target.checked)}
                        >
                            {label}
                        </Checkbox>
                    </div>
                ))}
            </div>
            <div className="filter-dropdown-footer">
                <Button size="small" onClick={handleClear}>
                    Clear
                </Button>
                <Button size="small" type="primary" onClick={handleApply}>
                    Apply
                </Button>
            </div>
        </div>
    );

    return (
        <Dropdown
            open={open}
            onOpenChange={setOpen}
            dropdownRender={() => dropdownContent}
            trigger={['click']}
            placement="bottomLeft"
        >
            <button className={buttonClassName}>
                <FiFilter size={16} />
                <span>Filter</span>
                {selectedTypes.length > 0 && (
                    <span className="filter-badge">{selectedTypes.length}</span>
                )}
            </button>
        </Dropdown>
    );
};

export default FilterDropdown;
