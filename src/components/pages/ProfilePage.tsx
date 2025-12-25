import React, { useState } from 'react';
import { Card, Avatar, Typography, Button, Form, Input, Divider, message, Upload, Modal } from 'antd';
import { CameraOutlined, MailOutlined, PhoneOutlined, TeamOutlined, IdcardOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string>(
        user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e91e63&color=fff&size=128&bold=true` : ''
    );

    const handleSaveAvatar = () => {
        message.success('Profile picture updated!');
        setIsModalOpen(false);
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
                            onClick={() => setIsModalOpen(true)}
                        />
                    </div>
                    <div className="profile-name">
                        <Title level={3}>{user?.name || 'User'}</Title>
                        <Text type="secondary">{user?.role || 'Employee'}</Text>
                    </div>
                </div>

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

            {/* Avatar Upload Modal */}
            <Modal
                title="Change Profile Picture"
                open={isModalOpen}
                onOk={handleSaveAvatar}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
                cancelText="Cancel"
            >
                <div className="avatar-modal-content">
                    <div className="current-avatar">
                        <Avatar size={100} src={avatarUrl} />
                        <Text type="secondary">Current Avatar</Text>
                    </div>
                    <div className="avatar-upload-area">
                        <Upload.Dragger
                            showUploadList={false}
                            beforeUpload={(file) => {
                                // Preview the image
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    if (e.target?.result) {
                                        setAvatarUrl(e.target.result as string);
                                    }
                                };
                                reader.readAsDataURL(file);
                                return false;
                            }}
                        >
                            <p className="upload-icon">
                                <UploadOutlined style={{ fontSize: 32, color: '#9FA1A4' }} />
                            </p>
                            <p className="upload-text">Click or drag file to upload</p>
                            <p className="upload-hint">Support JPG, PNG up to 5MB</p>
                        </Upload.Dragger>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProfilePage;
