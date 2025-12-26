import React, { useState, useEffect } from 'react';
import { Card, Typography, Switch, Divider, message, Button, TimePicker, Tag, Input, Spin, Drawer } from 'antd';
import { FiBell, FiSave, FiClock, FiUsers, FiPlus, FiEdit2, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
    fetchNotificationSettings,
    updateNotificationSettings,
    NotificationSettingsAPI
} from '../../services/api';
import dayjs from 'dayjs';
import { PageHeader } from '../common';
import './SettingsPage.css';

const { Text } = Typography;

interface NotificationSettings {
    email: boolean;
    push: boolean;
}

const SettingsPage: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const isManager = user?.isManager || false;

    const [notifications, setNotifications] = useState<NotificationSettings>({
        email: true,
        push: true,
    });

    // Email schedule settings - saved state from server
    const [savedEmailSettings, setSavedEmailSettings] = useState<NotificationSettingsAPI | null>(null);
    // Email schedule settings - pending edits
    const [pendingEmailSettings, setPendingEmailSettings] = useState<NotificationSettingsAPI | null>(null);
    const [emailSettingsLoading, setEmailSettingsLoading] = useState(true);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newRecipient, setNewRecipient] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Load email notification settings
    useEffect(() => {
        const loadEmailSettings = async () => {
            try {
                const settings = await fetchNotificationSettings();
                setSavedEmailSettings(settings);
                setPendingEmailSettings(settings);
                // Sync email toggle with server state
                setNotifications(prev => ({ ...prev, email: settings.enabled }));
            } catch (error) {
                console.error('Failed to load email settings:', error);
                message.error('Failed to load email settings');
            } finally {
                setEmailSettingsLoading(false);
            }
        };
        loadEmailSettings();
    }, []);

    const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
        setNotifications(prev => ({ ...prev, [key]: value }));

        // When email toggle changes, update the pending email settings and control drawer
        if (key === 'email' && pendingEmailSettings) {
            const updatedSettings = { ...pendingEmailSettings, enabled: value };
            setPendingEmailSettings(updatedSettings);
            // Auto-save the enabled state
            updateNotificationSettings(updatedSettings)
                .then(() => setSavedEmailSettings(updatedSettings))
                .catch(err => console.error('Failed to update email enabled state:', err));

            // Open drawer when enabled
            if (value) {
                setDrawerOpen(true);
            } else {
                setDrawerOpen(false);
            }
        }
    };

    const handleScheduledTimeChange = (time: dayjs.Dayjs | null) => {
        if (pendingEmailSettings && time) {
            setPendingEmailSettings({ ...pendingEmailSettings, scheduledTime: time.format('HH:mm') });
        }
    };

    const handleAddRecipient = () => {
        if (!newRecipient.trim() || !pendingEmailSettings) return;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newRecipient.trim())) {
            message.error('Please enter a valid email address');
            return;
        }

        if (pendingEmailSettings.recipients.includes(newRecipient.trim())) {
            message.warning('This email is already in the list');
            return;
        }

        setPendingEmailSettings({
            ...pendingEmailSettings,
            recipients: [...pendingEmailSettings.recipients, newRecipient.trim()]
        });
        setNewRecipient('');
    };

    const handleRemoveRecipient = (email: string) => {
        if (pendingEmailSettings) {
            setPendingEmailSettings({
                ...pendingEmailSettings,
                recipients: pendingEmailSettings.recipients.filter(r => r !== email)
            });
        }
    };

    const handleCancelEmailEdit = () => {
        // Revert pending changes to saved state
        setPendingEmailSettings(savedEmailSettings);
        setIsEditingEmail(false);
        setNewRecipient('');
    };

    const handleSaveEmailSettings = async () => {
        if (!pendingEmailSettings) return;

        try {
            await updateNotificationSettings(pendingEmailSettings);
            setSavedEmailSettings(pendingEmailSettings);
            message.success('Email notification settings saved!');
            setIsEditingEmail(false);
        } catch (error) {
            console.error('Failed to save email settings:', error);
            message.error('Failed to save email settings');
        }
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        // Revert any unsaved changes when closing
        if (isEditingEmail) {
            setPendingEmailSettings(savedEmailSettings);
            setIsEditingEmail(false);
            setNewRecipient('');
        }
    };

    // Use pending values for display
    const displayEmailSettings = pendingEmailSettings;

    return (
        <div className="settings-page">
            <PageHeader title="Settings" />

            {/* Theme Settings */}
            <Card className="settings-card" title={<><FiSun size={18} /> Appearance</>}>
                <div className="setting-row setting-row-with-description">
                    <div className="setting-header-row">
                        <Text strong>Dark Mode</Text>
                        <Switch
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                            checkedChildren={<span className="switch-icon"><FiMoon size={10} /></span>}
                            unCheckedChildren={<span className="switch-icon"><FiSun size={10} /></span>}
                        />
                    </div>
                    <Text type="secondary" className="setting-description">
                        Switch between light and dark theme
                    </Text>
                </div>
            </Card>

            <Card className="settings-card" title={<><FiBell /> Notifications</>}>
                <div className="setting-row">
                    <div className="setting-info">
                        <div>
                            <Text strong>Email Notifications</Text>
                            <Text type="secondary">Receive leave summary via email</Text>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {notifications.email && (
                            <Button
                                type="text"
                                icon={<FiClock />}
                                onClick={() => setDrawerOpen(true)}
                                className="schedule-button"
                            />
                        )}
                        <Switch
                            checked={notifications.email}
                            onChange={(v) => handleNotificationChange('email', v)}
                        />
                    </div>
                </div>

                <Divider />

                <div className="setting-row">
                    <div className="setting-info">
                        <div>
                            <Text strong>Push Notifications</Text>
                            <Text type="secondary">Receive push notifications</Text>
                        </div>
                    </div>
                    <Switch
                        checked={notifications.push}
                        onChange={(v) => handleNotificationChange('push', v)}
                    />
                </div>
            </Card>

            {/* Email Notification Schedule Drawer */}
            <Drawer
                title={<><FiClock /> Email Notification Schedule</>}
                placement="right"
                open={drawerOpen}
                onClose={handleDrawerClose}
                width={400}
                extra={
                    isManager && !isEditingEmail && (
                        <Button
                            type="text"
                            icon={<FiEdit2 />}
                            onClick={() => setIsEditingEmail(true)}
                        >
                            Edit
                        </Button>
                    )
                }
                className="email-schedule-drawer"
            >
                {emailSettingsLoading ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <Spin />
                    </div>
                ) : displayEmailSettings ? (
                    <>
                        <div className="drawer-setting-row">
                            <div className="setting-info">
                                <FiClock className="setting-icon" />
                                <div>
                                    <Text strong>Scheduled Time</Text>
                                    <Text type="secondary">Time to send daily notifications</Text>
                                </div>
                            </div>
                            {isManager && isEditingEmail ? (
                                <TimePicker
                                    value={dayjs(displayEmailSettings.scheduledTime, 'HH:mm')}
                                    onChange={handleScheduledTimeChange}
                                    format="HH:mm"
                                    className="schedule-time-picker"
                                />
                            ) : (
                                <Tag color="blue">{displayEmailSettings.scheduledTime}</Tag>
                            )}
                        </div>

                        <Divider />

                        <div className="drawer-setting-row drawer-setting-row-recipients">
                            <div className="setting-info">
                                <FiUsers className="setting-icon" />
                                <div>
                                    <Text strong>Recipients</Text>
                                    <Text type="secondary">
                                        {displayEmailSettings.recipients.length === 0
                                            ? 'Notifications sent to manager only'
                                            : `${displayEmailSettings.recipients.length} recipient(s)`}
                                    </Text>
                                </div>
                            </div>
                        </div>

                        <div className="recipients-container">
                            {displayEmailSettings.recipients.length > 0 ? (
                                <div className="recipients-tags">
                                    {displayEmailSettings.recipients.map(email => (
                                        <Tag
                                            key={email}
                                            closable={isManager && isEditingEmail}
                                            onClose={() => handleRemoveRecipient(email)}
                                            className="recipient-tag"
                                        >
                                            {email}
                                        </Tag>
                                    ))}
                                </div>
                            ) : (
                                <Text type="secondary" italic>
                                    No recipients added. Notifications will be sent to manager only.
                                </Text>
                            )}

                            {isManager && isEditingEmail && (
                                <div className="add-recipient-row">
                                    <Input
                                        placeholder="Enter email address"
                                        value={newRecipient}
                                        onChange={(e) => setNewRecipient(e.target.value)}
                                        onPressEnter={handleAddRecipient}
                                        style={{ width: '100%' }}
                                    />
                                    <Button
                                        type="dashed"
                                        icon={<FiPlus />}
                                        onClick={handleAddRecipient}
                                        style={{ marginTop: 8 }}
                                    >
                                        Add Recipient
                                    </Button>
                                </div>
                            )}
                        </div>

                        {isManager && isEditingEmail && (
                            <div className="email-settings-actions">
                                <Button onClick={handleCancelEmailEdit}>
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<FiSave />}
                                    onClick={handleSaveEmailSettings}
                                >
                                    Save
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <Text type="secondary">Failed to load settings</Text>
                )}
            </Drawer>
        </div>
    );
};

export default SettingsPage;
