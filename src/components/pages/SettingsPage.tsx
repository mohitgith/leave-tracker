import React, { useState } from 'react';
import { Card, Typography, Switch, Divider, Radio, message, Button } from 'antd';
import { 
    BulbOutlined, 
    BellOutlined, 
    MailOutlined,
    MobileOutlined,
    SaveOutlined
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import './SettingsPage.css';

const { Title, Text } = Typography;

interface NotificationSettings {
    email: boolean;
    push: boolean;
    leaveApproval: boolean;
    leaveReminder: boolean;
}

const SettingsPage: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState<NotificationSettings>({
        email: true,
        push: true,
        leaveApproval: true,
        leaveReminder: true,
    });

    const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
        setNotifications(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        message.success('Settings saved successfully!');
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <Title level={2}>Settings</Title>
            </div>

            {/* Theme Settings */}
            <Card className="settings-card" title={<><BulbOutlined /> Appearance</>}>
                <div className="setting-row">
                    <div className="setting-info">
                        <Text strong>Dark Mode</Text>
                        <Text type="secondary">Switch between light and dark theme</Text>
                    </div>
                    <Switch 
                        checked={theme === 'dark'} 
                        onChange={toggleTheme}
                        checkedChildren="Dark"
                        unCheckedChildren="Light"
                    />
                </div>
                
                <Divider />
                
                <div className="setting-row">
                    <div className="setting-info">
                        <Text strong>Theme Color</Text>
                        <Text type="secondary">Choose your preferred accent color</Text>
                    </div>
                    <Radio.Group defaultValue="hsbc" buttonStyle="solid">
                        <Radio.Button value="hsbc" style={{ background: '#db0011', color: '#fff', borderColor: '#db0011' }}>HSBC Red</Radio.Button>
                        <Radio.Button value="blue">Blue</Radio.Button>
                        <Radio.Button value="green">Green</Radio.Button>
                    </Radio.Group>
                </div>
            </Card>

            {/* Notification Settings */}
            <Card className="settings-card" title={<><BellOutlined /> Notifications</>}>
                <div className="setting-row">
                    <div className="setting-info">
                        <MailOutlined className="setting-icon" />
                        <div>
                            <Text strong>Email Notifications</Text>
                            <Text type="secondary">Receive updates via email</Text>
                        </div>
                    </div>
                    <Switch 
                        checked={notifications.email} 
                        onChange={(v) => handleNotificationChange('email', v)}
                    />
                </div>

                <Divider />

                <div className="setting-row">
                    <div className="setting-info">
                        <MobileOutlined className="setting-icon" />
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

                <Divider />

                <div className="setting-row">
                    <div className="setting-info">
                        <div>
                            <Text strong>Leave Approval Alerts</Text>
                            <Text type="secondary">Get notified when leaves are approved/rejected</Text>
                        </div>
                    </div>
                    <Switch 
                        checked={notifications.leaveApproval} 
                        onChange={(v) => handleNotificationChange('leaveApproval', v)}
                    />
                </div>

                <Divider />

                <div className="setting-row">
                    <div className="setting-info">
                        <div>
                            <Text strong>Leave Reminders</Text>
                            <Text type="secondary">Reminder before your leave starts</Text>
                        </div>
                    </div>
                    <Switch 
                        checked={notifications.leaveReminder} 
                        onChange={(v) => handleNotificationChange('leaveReminder', v)}
                    />
                </div>
            </Card>

            <div className="settings-actions">
                <Button type="primary" icon={<SaveOutlined />} size="large" onClick={handleSave}>
                    Save Settings
                </Button>
            </div>
        </div>
    );
};

export default SettingsPage;
