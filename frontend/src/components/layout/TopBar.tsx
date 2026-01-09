import { useState, useEffect, useCallback } from 'react';
import { Layout, Avatar, Badge, Dropdown, Typography, message, List, Button, Empty } from 'antd';
import { FiBell, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useAuth } from '../../context/AuthContext';
import {
    fetchNotificationsForUser,
    fetchUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    AppNotificationAPI
} from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import './TopBar.css';

dayjs.extend(relativeTime);

const { Header } = Layout;
const { Text } = Typography;

const TopBar: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<AppNotificationAPI[]>([]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Fetch unread count
    const loadUnreadCount = useCallback(async () => {
        if (!user?.id) return;
        try {
            const count = await fetchUnreadNotificationCount(user.id);
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, [user?.id]);

    // Fetch notifications
    const loadNotifications = useCallback(async () => {
        if (!user?.id) return;
        try {
            const data = await fetchNotificationsForUser(user.id);
            setNotifications(data.slice(0, 10)); // Show last 10
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, [user?.id]);

    // Poll for unread count every 30 seconds
    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [loadUnreadCount]);

    // Load notifications when dropdown opens
    useEffect(() => {
        if (notificationsOpen) {
            loadNotifications();
        }
    }, [notificationsOpen, loadNotifications]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user?.id) return;
        try {
            await markAllNotificationsAsRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            message.success('All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        if (e.key === 'logout') {
            logout();
            message.success('Logged out successfully');
            navigate('/login');
        } else if (e.key === 'settings') {
            navigate('/settings');
        } else if (e.key === 'profile') {
            navigate('/profile');
        }
    };

    const userMenuItems: MenuProps['items'] = [
        { key: 'profile', label: 'My Profile' },
        { key: 'settings', label: 'Settings' },
        { type: 'divider' },
        { key: 'logout', label: 'Logout', danger: true },
    ];

    // Generate avatar URL from user name
    const avatarUrl = user
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e91e63&color=fff&size=32&bold=true`
        : '';

    const notificationDropdownContent = (
        <div className="notification-dropdown">
            <div className="notification-header">
                <Text strong>Notifications</Text>
                {unreadCount > 0 && (
                    <Button
                        type="link"
                        size="small"
                        icon={<FiCheck size={14} />}
                        onClick={handleMarkAllAsRead}
                    >
                        Mark all read
                    </Button>
                )}
            </div>
            <div className="notification-list">
                {notifications.length > 0 ? (
                    <List
                        dataSource={notifications}
                        renderItem={(item) => (
                            <List.Item
                                className={`notification-item ${!item.read ? 'unread' : ''}`}
                                onClick={() => !item.read && handleMarkAsRead(item.id)}
                            >
                                <div className="notification-content">
                                    <Text strong className="notification-title">{item.title}</Text>
                                    <Text className="notification-message">{item.message}</Text>
                                    <Text type="secondary" className="notification-time">
                                        {dayjs(item.createdAt).fromNow()}
                                    </Text>
                                </div>
                                {!item.read && <div className="unread-dot" />}
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty
                        description="No notifications"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        className="notification-empty"
                    />
                )}
            </div>
        </div>
    );

    return (
        <Header className="topbar">
            {/* Brand Icon Section - Clickable */}
            <div className="topbar-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                <div className="brand-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#fff" />
                        <path d="M2 17L12 22L22 17" stroke="#fff" strokeWidth="2" />
                        <path d="M2 12L12 17L22 12" stroke="#fff" strokeWidth="2" />
                    </svg>
                </div>
                <Text className="brand-subtitle">Leave Management Tool</Text>
            </div>

            <div className="topbar-actions">
                <Dropdown
                    dropdownRender={() => notificationDropdownContent}
                    trigger={['click']}
                    open={notificationsOpen}
                    onOpenChange={setNotificationsOpen}
                    overlayClassName="notification-dropdown-overlay"
                >
                    <div className="notification-wrapper">
                        <Badge count={unreadCount} size="small">
                            <FiBell size={20} className="notification-icon" />
                        </Badge>
                    </div>
                </Dropdown>

                <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} trigger={['click']}>
                    <div className="user-profile">
                        <Avatar
                            size={32}
                            src={avatarUrl}
                        />
                        <span className="user-name">{user?.name || 'User'}</span>
                    </div>
                </Dropdown>
            </div>
        </Header>
    );
};

export default TopBar;
