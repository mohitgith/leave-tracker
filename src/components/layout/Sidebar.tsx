import React from 'react';
import { Layout, Menu, Tooltip } from 'antd';
import {
    PlusCircleOutlined,
    AppstoreOutlined,
    SwapOutlined,
    TeamOutlined,
    FileTextOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import './Sidebar.css';

const { Sider } = Layout;

interface SidebarProps {
    collapsed?: boolean;
}

const menuItems = [
    { key: 'add', icon: <PlusCircleOutlined />, label: 'Add' },
    { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
    { key: 'transfers', icon: <SwapOutlined />, label: 'Transfers' },
    { key: 'employees', icon: <TeamOutlined />, label: 'Employees' },
    { key: 'documents', icon: <FileTextOutlined />, label: 'Documents' },
];

const bottomItems = [
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed = true }) => {
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
                defaultSelectedKeys={['documents']}
                className="sidebar-menu"
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
