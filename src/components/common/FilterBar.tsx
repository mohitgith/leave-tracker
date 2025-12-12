import { Tag, Button, Radio, Avatar, Tooltip } from 'antd';
import {
    FilterOutlined,
    UserOutlined,
    CloseOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import './FilterBar.css';

interface FilterBarProps {
    viewMode: '1' | '3';
    onViewModeChange: (mode: '1' | '3') => void;
    onCreateLeave: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
    viewMode,
    onViewModeChange,
    onCreateLeave,
}) => {
    const handleViewChange = (e: RadioChangeEvent) => {
        onViewModeChange(e.target.value);
    };

    return (
        <div className="filter-bar">
            <div className="filter-left">
                <Button
                    icon={<FilterOutlined />}
                    className="filter-button"
                >
                    Filters
                </Button>

                <Tag className="filter-tag" closable closeIcon={<CloseOutlined />}>
                    <UserOutlined style={{ marginRight: 4 }} />
                    My absences
                </Tag>

                <Tag className="filter-tag avatar-tag" closable closeIcon={<CloseOutlined />}>
                    <div className="avatar-group">
                        <Avatar size={20} src="https://ui-avatars.com/api/?name=A&background=0066b3&color=fff&size=20" />
                        <Avatar size={20} src="https://ui-avatars.com/api/?name=B&background=4db6ac&color=fff&size=20" style={{ marginLeft: -8 }} />
                        <Avatar size={20} src="https://ui-avatars.com/api/?name=C&background=f5a623&color=fff&size=20" style={{ marginLeft: -8 }} />
                        <Avatar size={20} src="https://ui-avatars.com/api/?name=D&background=e91e63&color=fff&size=20" style={{ marginLeft: -8 }} />
                    </div>
                </Tag>

                <Tag className="filter-tag icon-tag" closable closeIcon={<CloseOutlined />}>
                    <div className="icon-group">
                        <span className="leave-icon vacation">🏖️</span>
                        <span className="leave-icon sick">🤒</span>
                        <span className="leave-icon remote">🏠</span>
                    </div>
                </Tag>

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
