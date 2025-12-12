import { Layout, Avatar, Badge, Dropdown, Typography } from 'antd';
import {
    BellOutlined,
    DownOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import './TopBar.css';

const { Header } = Layout;
const { Text } = Typography;

const TopBar: React.FC = () => {
    const userMenuItems: MenuProps['items'] = [
        { key: 'profile', label: 'My Profile' },
        { key: 'settings', label: 'Settings' },
        { type: 'divider' },
        { key: 'logout', label: 'Logout' },
    ];

    return (
        <Header className="topbar">
            <div className="topbar-brand">
                <div className="brand-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#fff" />
                        <path d="M2 17L12 22L22 17" stroke="#fff" strokeWidth="2" />
                        <path d="M2 12L12 17L22 12" stroke="#fff" strokeWidth="2" />
                    </svg>
                </div>
                <Text className="brand-subtitle">Leave Tracker</Text>
            </div>

            <div className="topbar-actions">
                <div className="notification-wrapper">
                    <Badge count={0} showZero={false}>
                        <BellOutlined className="notification-icon" />
                    </Badge>
                </div>

                <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                    <div className="user-profile">
                        <Avatar
                            size={32}
                            src="https://ui-avatars.com/api/?name=Antonina&background=e91e63&color=fff&size=32&bold=true"
                        />
                        <span className="user-name">Antonina</span>
                        <DownOutlined className="dropdown-icon" />
                    </div>
                </Dropdown>
            </div>
        </Header>
    );
};

export default TopBar;
