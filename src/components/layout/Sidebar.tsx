import { Layout, Menu, Tooltip } from 'antd';
import { RiDashboardHorizontalLine, RiOrganizationChart, RiCalendarScheduleLine, RiSettings5Line } from "react-icons/ri";
import './Sidebar.css';

const { Sider } = Layout;

interface SidebarProps {
    collapsed?: boolean;
    onNavigate: (key: string) => void;
    selectedKey?: string;
}

const menuItems = [
    { key: 'dashboard', icon: <RiDashboardHorizontalLine size={18} />, label: 'Dashboard' },
    { key: 'org-chart', icon: <RiOrganizationChart size={18} />, label: 'Org Chart' },
    { key: 'documents', icon: <RiCalendarScheduleLine size={18} />, label: 'Leave Tracker' },
];

const bottomItems = [
    { key: 'settings', icon: <RiSettings5Line size={18} />, label: 'Settings' },
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
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[selectedKey]}
                className="sidebar-menu"
                onClick={({ key }) => onNavigate(key)}
                items={menuItems.map(item => ({
                    key: item.key,
                    icon: collapsed ? (
                        <Tooltip title={item.label} placement="right" mouseEnterDelay={0}>
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
                            <Tooltip title={item.label} placement="right" mouseEnterDelay={0}>
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
