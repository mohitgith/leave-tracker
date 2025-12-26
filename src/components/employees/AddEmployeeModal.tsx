import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { OrgEmployeeAPI, fetchOrgChart } from '../../services/api';

type OrgEmployee = OrgEmployeeAPI;

interface AddEmployeeModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    initialValues?: OrgEmployee | null;
}

// Helper function to flatten org chart into list of managers
const getManagers = (employee: OrgEmployee, managers: OrgEmployee[] = []): OrgEmployee[] => {
    // Add this employee if they are permanent and a manager (have children)
    if (employee.children && employee.children.length > 0) {
        managers.push(employee);
    }
    // Also add the root even if no children (always a potential manager)
    if (managers.length === 0) {
        managers.push(employee);
    }
    // Recursively check children
    if (employee.children) {
        employee.children.forEach(child => getManagers(child, managers));
    }
    return managers;
};

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
    const [form] = Form.useForm();
    const [managers, setManagers] = useState<OrgEmployee[]>([]);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
            // Load managers
            loadManagers();
        }
    }, [open, initialValues, form]);

    const loadManagers = async () => {
        try {
            const orgData = await fetchOrgChart();
            const managerList = getManagers(orgData);
            setManagers(managerList);
        } catch (error) {
            console.error('Failed to load managers:', error);
        }
    };

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                onSubmit(values);
                onClose();
                message.success(initialValues ? 'Employee updated successfully' : 'Employee added successfully');
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title={initialValues ? "Edit Team Member" : "Add Team Member"}
            open={open}
            onOk={handleOk}
            onCancel={onClose}
            okText={initialValues ? "Save" : "Add"}
            cancelText="Cancel"
        >
            <Form
                form={form}
                layout="vertical"
                name="add_employee_form"
            >
                <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please input the name!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="id" label="Employee ID" rules={[{ required: true, message: 'Please input the ID!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please input the email!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="phone" label="Mobile Number">
                    <Input />
                </Form.Item>
                <Form.Item name="role" label="Department / Role" rules={[{ required: true, message: 'Please input the role!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="reportsTo" label="Reports To" rules={[{ required: true, message: 'Please select a manager!' }]}>
                    <Select placeholder="Select a manager">
                        {managers.map(manager => (
                            <Select.Option key={manager.id} value={manager.id}>
                                {manager.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="location" label="Location" initialValue="Steller Foods Headquarters">
                    <Select>
                        <Select.Option value="Steller Foods Headquarters">Steller Foods Headquarters</Select.Option>
                        <Select.Option value="London Office">London Office</Select.Option>
                        <Select.Option value="New York Office">New York Office</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddEmployeeModal;
