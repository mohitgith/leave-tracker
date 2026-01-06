import { Layout, Menu, Tooltip } from 'antd';
import { RiDashboardHorizontalLine, RiOrganizationChart, RiCalendarScheduleLine, RiSettings5Line } from "react-icons/ri";
import { useState, useEffect, useRef } from 'react';
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
    const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number; opacity: number }>({
        top: 0,
        height: 44,
        opacity: 0
    });
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Calculate indicator position based on selected item
        const updateIndicatorPosition = () => {
            if (!menuRef.current) return;

            const allItems = [...menuItems, ...bottomItems];
            const selectedIndex = allItems.findIndex(item => item.key === selectedKey);

            if (selectedIndex !== -1) {
                // Account for settings being in bottom menu
                const isBottomItem = selectedIndex >= menuItems.length;
                const itemHeight = 44;
                const itemMargin = 0;

                let topPosition;
                if (isBottomItem) {
                    // Settings is in bottom menu - calculate from bottom
                    const bottomMenuElement = menuRef.current.querySelector('.sidebar-bottom .ant-menu-item');
                    if (bottomMenuElement) {
                        const rect = bottomMenuElement.getBoundingClientRect();
                        const containerRect = menuRef.current.getBoundingClientRect();
                        topPosition = rect.top - containerRect.top;
                    } else {
                        topPosition = 0;
                    }
                } else {
                    // Regular menu item
                    topPosition = selectedIndex * (itemHeight + itemMargin);
                }

                setIndicatorStyle({
                    top: topPosition,
                    height: itemHeight,
                    opacity: 1
                });
            }
        };

        updateIndicatorPosition();
        // Small delay to ensure DOM is ready
        const timer = setTimeout(updateIndicatorPosition, 50);

        return () => clearTimeout(timer);
    }, [selectedKey]);

    return (
        <Sider
            collapsed={collapsed}
            collapsedWidth={60}
            width={200}
            className="sidebar"
            theme="dark"
        >
            <div ref={menuRef} style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Animated selection indicator */}
                <div
                    className="sidebar-selection-indicator"
                    style={{
                        transform: `translateY(${indicatorStyle.top}px)`,
                        height: `${indicatorStyle.height}px`,
                        opacity: indicatorStyle.opacity
                    }}
                />

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
            </div>
        </Sider>
    );
};

export default Sidebar;
