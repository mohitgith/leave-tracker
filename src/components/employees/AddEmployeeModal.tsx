import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { OrgEmployeeAPI } from '../../services/api';

type OrgEmployee = OrgEmployeeAPI;

interface AddEmployeeModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    initialValues?: OrgEmployee | null;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

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
