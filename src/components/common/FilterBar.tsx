import { useState } from 'react';
import { Button, Radio, Tooltip, Dropdown, Checkbox, Slider, Space, Divider } from 'antd';
import {
    FilterOutlined,
    PlusOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import type { LeaveType, EmployeeType } from '../../types';
import './FilterBar.css';

export interface FilterOptions {
    leaveTypes: LeaveType[];
    employeeTypes: EmployeeType[];
    daysRange: [number, number];
}

interface FilterBarProps {
    viewMode: '1' | '3';
    onViewModeChange: (mode: '1' | '3') => void;
    onCreateLeave: () => void;
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
    viewMode,
    onViewModeChange,
    onCreateLeave,
    filters,
    onFiltersChange,
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleViewChange = (e: RadioChangeEvent) => {
        onViewModeChange(e.target.value);
    };

    const handleLeaveTypeChange = (type: LeaveType, checked: boolean) => {
        const newTypes = checked
            ? [...filters.leaveTypes, type]
            : filters.leaveTypes.filter(t => t !== type);
        onFiltersChange({ ...filters, leaveTypes: newTypes });
    };

    const handleEmployeeTypeChange = (type: EmployeeType, checked: boolean) => {
        const newTypes = checked
            ? [...filters.employeeTypes, type]
            : filters.employeeTypes.filter(t => t !== type);
        onFiltersChange({ ...filters, employeeTypes: newTypes });
    };

    const handleDaysRangeChange = (value: number[]) => {
        onFiltersChange({ ...filters, daysRange: [value[0], value[1]] });
    };

    const clearFilters = () => {
        onFiltersChange({
            leaveTypes: [],
            employeeTypes: [],
            daysRange: [0, 15],
        });
    };

    const hasActiveFilters = 
        filters.leaveTypes.length > 0 || 
        filters.employeeTypes.length > 0 || 
        filters.daysRange[0] !== 0 || 
        filters.daysRange[1] !== 15;

    const getActiveFilterCount = () => {
        let count = filters.leaveTypes.length + filters.employeeTypes.length;
        if (filters.daysRange[0] !== 0 || filters.daysRange[1] !== 15) count++;
        return count;
    };

    const filterDropdownContent = (
        <div className="filter-dropdown-content">
            <div className="filter-section">
                <div className="filter-section-title">Leave Type</div>
                <Space direction="vertical">
                    <Checkbox 
                        checked={filters.leaveTypes.includes('vacation')}
                        onChange={(e) => handleLeaveTypeChange('vacation', e.target.checked)}
                    >
                        Annual Leave
                    </Checkbox>
                    <Checkbox 
                        checked={filters.leaveTypes.includes('sick')}
                        onChange={(e) => handleLeaveTypeChange('sick', e.target.checked)}
                    >
                        Sick Leave
                    </Checkbox>
                </Space>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div className="filter-section">
                <div className="filter-section-title">Employee Type</div>
                <Space direction="vertical">
                    <Checkbox 
                        checked={filters.employeeTypes.includes('permanent')}
                        onChange={(e) => handleEmployeeTypeChange('permanent', e.target.checked)}
                    >
                        Permanent
                    </Checkbox>
                    <Checkbox 
                        checked={filters.employeeTypes.includes('contractor')}
                        onChange={(e) => handleEmployeeTypeChange('contractor', e.target.checked)}
                    >
                        Contractor
                    </Checkbox>
                </Space>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div className="filter-section">
                <div className="filter-section-title">Leave Duration: {filters.daysRange[0]} - {filters.daysRange[1]} days</div>
                <Slider 
                    range
                    min={0}
                    max={15}
                    value={filters.daysRange}
                    onChange={handleDaysRangeChange}
                    className="days-slider"
                />
            </div>

            {hasActiveFilters && (
                <>
                    <Divider style={{ margin: '12px 0' }} />
                    <Button 
                        type="link" 
                        icon={<CloseOutlined />} 
                        onClick={clearFilters}
                        className="clear-filters-btn"
                    >
                        Clear All Filters
                    </Button>
                </>
            )}
        </div>
    );

    return (
        <div className="filter-bar">
            <div className="filter-left">
                <Dropdown
                    dropdownRender={() => filterDropdownContent}
                    trigger={['click']}
                    open={dropdownOpen}
                    onOpenChange={setDropdownOpen}
                    overlayClassName="filter-dropdown-overlay"
                >
                    <Button
                        icon={<FilterOutlined />}
                        className={`filter-button ${hasActiveFilters ? 'filter-active' : ''}`}
                    >
                        Filters {hasActiveFilters && `(${getActiveFilterCount()})`}
                    </Button>
                </Dropdown>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="create-leave-button"
                    onClick={onCreateLeave}
                >
                    Create Leave
                </Button>
            </div>

            <div className="filter-right">
                <Radio.Group
                    value={viewMode}
                    onChange={handleViewChange}
                    className="view-mode-group"
                    optionType="button"
                    buttonStyle="solid"
                >
                    <Tooltip title="1 Month View">
                        <Radio.Button value="1">
                            <span className="view-label">1</span>
                            <span className="view-sublabel">month</span>
                        </Radio.Button>
                    </Tooltip>
                    <Tooltip title="3 Months View">
                        <Radio.Button value="3">
                            <span className="view-label">3</span>
                            <span className="view-sublabel">months</span>
                        </Radio.Button>
                    </Tooltip>
                </Radio.Group>
            </div>
        </div>
    );
};

export default FilterBar;
