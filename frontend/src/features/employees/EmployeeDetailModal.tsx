import React from 'react';
import { Modal, Typography, Button, message, Divider, Avatar, Popconfirm } from 'antd';
import { FiMail, FiPhone, FiCopy, FiMapPin, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { OrgEmployee } from '../../types';

interface EmployeeDetailModalProps {
    employee: OrgEmployee | null;
    open: boolean;
    onClose: () => void;
    onEdit?: (employee: OrgEmployee) => void;
    onDelete?: (employee: OrgEmployee) => void;
    showActions?: boolean;
}

const { Title, Text } = Typography;

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, open, onClose, onEdit, onDelete, showActions = false }) => {
    if (!employee) return null;

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        message.success(`${label} copied to clipboard!`);
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={
                showActions && employee ? (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button
                            icon={<FiEdit2 />}
                            onClick={() => onEdit?.(employee)}
                            type="default"
                            title="Edit"
                        />
                        <Popconfirm
                            title="Delete Employee"
                            description="Are you sure you want to delete this employee?"
                            onConfirm={() => onDelete?.(employee)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                        >
                            <Button danger icon={<FiTrash2 />} title="Delete" />
                        </Popconfirm>
                    </div>
                ) : null
            }
            width={450}
            centered
        >
            <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Avatar
                    size={100}
                    src={employee.avatarUrl}
                    style={{ border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Title level={4} style={{ marginBottom: 4, marginTop: 16 }}>{employee.name}</Title>
                <Text type="secondary" style={{ fontSize: 16 }}>{employee.role}</Text>

                <div style={{ marginTop: 8, color: '#666' }}>
                    <FiMapPin style={{ marginRight: 6 }} />
                    {employee.location}
                </div>
            </div>

            <Divider />

            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            background: '#e6f7ff',
                            padding: 8,
                            borderRadius: '50%',
                            color: '#1890ff'
                        }}>
                            <FiMail />
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Email</Text>
                            <Text strong>{employee.email}</Text>
                        </div>
                    </div>
                    <Button
                        type="text"
                        icon={<FiCopy />}
                        onClick={() => handleCopy(employee.email, 'Email')}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            background: '#f6ffed',
                            padding: 8,
                            borderRadius: '50%',
                            color: '#52c41a'
                        }}>
                            <FiPhone />
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Phone</Text>
                            <Text strong>{employee.phone}</Text>
                        </div>
                    </div>
                    <Button
                        type="text"
                        icon={<FiCopy />}
                        onClick={() => handleCopy(employee.phone, 'Phone Number')}
                    />
                </div>
            </div>

            <Divider />

            <div style={{ padding: '0 16px 16px', textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Team Size</Text>
                <Title level={4} style={{ margin: 0, color: '#0066b3' }}>
                    {employee.children?.length || 0} Members
                </Title>
            </div>
        </Modal>
    );
};

export default EmployeeDetailModal;
