import { Layout, Menu, Tooltip } from 'antd';
import {
    AppstoreOutlined,
    TeamOutlined,
    FileTextOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import './Sidebar.css';

const { Sider } = Layout;

interface SidebarProps {
    collapsed?: boolean;
    onNavigate: (key: string) => void;
    selectedKey?: string;
}

const menuItems = [
    { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
    { key: 'employees', icon: <TeamOutlined />, label: 'Employees' },
    { key: 'documents', icon: <FileTextOutlined />, label: 'Leave Tracker' },
];

const bottomItems = [
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed = true, onNavigate, selectedKey = 'dashboard' }) => {
    return (
        <Sider
            collapsed={collapsed}
            collapsedWidth={60}
            width={200}
            className="sidebar"
            theme="dark"
        >
            <div className="sidebar-logo">
                <AppstoreOutlined className="logo-icon" />
            </div>

            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[selectedKey]}
                className="sidebar-menu"
                onClick={({ key }) => onNavigate(key)}
                items={menuItems.map(item => ({
                    key: item.key,
                    icon: collapsed ? (
                        <Tooltip title={item.label} placement="right">
                            {item.icon}
                        </Tooltip>
                    ) : item.icon,
                    label: collapsed ? null : item.label,
                }))}
            />

            <div className="sidebar-bottom">
                <Menu
                    theme="dark"
                    mode="inline"
                    className="sidebar-menu"
                    selectedKeys={[selectedKey]}
                    onClick={({ key }) => onNavigate(key)}
                    items={bottomItems.map(item => ({
                        key: item.key,
                        icon: collapsed ? (
                            <Tooltip title={item.label} placement="right">
                                {item.icon}
                            </Tooltip>
                        ) : item.icon,
                        label: collapsed ? null : item.label,
                    }))}
                />
            </div>
        </Sider>
    );
};

export default Sidebar;
