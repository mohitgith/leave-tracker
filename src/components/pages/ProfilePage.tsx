import React, { useState } from 'react';
import { Card, Avatar, Typography, Button, Form, Input, Divider, message, Upload } from 'antd';
import { CameraOutlined, MailOutlined, PhoneOutlined, TeamOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import type { UploadChangeParam } from 'antd/es/upload';
import './ProfilePage.css';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string>(
        user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e91e63&color=fff&size=128&bold=true` : ''
    );

    const handleAvatarChange = (info: UploadChangeParam) => {
        if (info.file.status === 'done' && info.file.response) {
            setAvatarUrl(info.file.response.url);
            message.success('Profile picture updated!');
        }
    };

    // Fake upload handling - just show a success message
    const handleCustomUpload = () => {
        message.info('Profile picture upload is simulated in this demo');
        setIsEditing(false);
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <Title level={2}>My Profile</Title>
            </div>

            <Card className="profile-card">
                <div className="profile-avatar-section">
                    <div className="avatar-container">
                        <Avatar
                            size={120}
                            src={avatarUrl}
                        />
                        <Button 
                            className="edit-avatar-btn"
                            icon={<CameraOutlined />}
                            shape="circle"
                            onClick={() => setIsEditing(!isEditing)}
                        />
                    </div>
                    <div className="profile-name">
                        <Title level={3}>{user?.name || 'User'}</Title>
                        <Text type="secondary">{user?.role || 'Employee'}</Text>
                    </div>
                </div>

                {isEditing && (
                    <div className="avatar-upload-section">
                        <Text>Edit Profile Picture</Text>
                        <div className="upload-actions">
                            <Upload
                                showUploadList={false}
                                onChange={handleAvatarChange}
                                beforeUpload={() => false}
                            >
                                <Button type="primary">Choose File</Button>
                            </Upload>
                            <Button onClick={handleCustomUpload}>Save</Button>
                            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                    </div>
                )}

                <Divider />

                <Form layout="vertical" className="profile-form">
                    <Form.Item label="Full Name">
                        <Input 
                            value={user?.name || ''} 
                            disabled 
                            prefix={<IdcardOutlined />}
                        />
                    </Form.Item>

                    <Form.Item label="Role">
                        <Input 
                            value={user?.role || ''} 
                            disabled 
                            prefix={<TeamOutlined />}
                        />
                    </Form.Item>

                    <Form.Item label="Department">
                        <Input 
                            value={user?.department || ''} 
                            disabled 
                            prefix={<TeamOutlined />}
                        />
                    </Form.Item>

                    <Form.Item label="Email">
                        <Input 
                            value={user?.name ? `${user.name.toLowerCase().replace(' ', '.')}@hsbc.com` : ''} 
                            disabled 
                            prefix={<MailOutlined />}
                        />
                    </Form.Item>

                    <Form.Item label="Phone">
                        <Input 
                            value="+91 98765 43210" 
                            disabled 
                            prefix={<PhoneOutlined />}
                        />
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ProfilePage;
