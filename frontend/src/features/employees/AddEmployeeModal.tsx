import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message, Spin, Tabs } from 'antd';
import { FiEdit2, FiTrash2, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { OrgEmployeeAPI, fetchOrgChart, fetchEmployees, EmployeeAPI, deleteEmployee, updateEmployee } from '../../services/api';
import './AddEmployeeModal.css';

type OrgEmployee = OrgEmployeeAPI;

interface AddEmployeeModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    initialValues?: OrgEmployee | null;
    onEmployeeUpdated?: () => void;
    onEmployeeDeleted?: () => void;
}

// Helper function to flatten org chart into list of managers
const getManagers = (employee: OrgEmployee, managers: OrgEmployee[] = []): OrgEmployee[] => {
    if (employee.children && employee.children.length > 0) {
        managers.push(employee);
    }
    if (managers.length === 0) {
        managers.push(employee);
    }
    if (employee.children) {
        employee.children.forEach(child => getManagers(child, managers));
    }
    return managers;
};

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
    open,
    onClose,
    onSubmit,
    initialValues,
    onEmployeeUpdated,
    onEmployeeDeleted
}) => {
    const [form] = Form.useForm();
    const [managers, setManagers] = useState<OrgEmployee[]>([]);
    const [employees, setEmployees] = useState<EmployeeAPI[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('add');
    const [editingEmployee, setEditingEmployee] = useState<EmployeeAPI | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            // Reset to add tab when modal opens
            if (initialValues) {
                setEditingEmployee(initialValues as any);
                setActiveTab('add');
                form.setFieldsValue(initialValues);
            } else {
                setActiveTab('add');
                setEditingEmployee(null);
                form.resetFields();
            }
            loadData();
        }
    }, [open, initialValues, form]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [orgData, employeeList] = await Promise.all([
                fetchOrgChart(),
                fetchEmployees()
            ]);
            const managerList = getManagers(orgData);
            setManagers(managerList);

            // Filter out managers from the employee list (only show non-managers in Team Members)
            const managerIds = new Set(managerList.map(m => m.id));
            const nonManagers = employeeList.filter(emp => !managerIds.has(emp.id));
            setEmployees(nonManagers);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOk = () => {
        form.validateFields()
            .then(async values => {
                if (editingEmployee) {
                    // Update existing employee
                    try {
                        await updateEmployee(editingEmployee.id, {
                            ...values,
                            managerId: values.reportsTo
                        });
                        message.success('Employee updated successfully');
                        onEmployeeUpdated?.();
                        setEditingEmployee(null);
                        form.resetFields();
                        await loadData();
                        setActiveTab('list');
                    } catch (error) {
                        message.error('Failed to update employee');
                    }
                } else {
                    // Add new employee
                    onSubmit(values);
                    form.resetFields();
                    await loadData();
                }
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const handleEdit = (employee: EmployeeAPI) => {
        setEditingEmployee(employee);
        form.setFieldsValue({
            id: employee.id,
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            role: employee.role,
            reportsTo: employee.managerId,
            location: employee.location
        });
        setActiveTab('add');
        setDeleteConfirmId(null);
    };

    const handleDeleteClick = (employeeId: string) => {
        setDeleteConfirmId(employeeId);
    };

    const handleDeleteConfirm = async (employeeId: string) => {
        try {
            await deleteEmployee(employeeId);
            message.success('Employee deleted successfully');
            setDeleteConfirmId(null);
            onEmployeeDeleted?.();
            await loadData();
        } catch (error) {
            message.error('Failed to delete employee');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmId(null);
    };

    const handleModalClose = () => {
        form.resetFields();
        setEditingEmployee(null);
        setDeleteConfirmId(null);
        setActiveTab('add');
        onClose();
    };

    const handleTabChange = (key: string) => {
        setActiveTab(key);
        if (key === 'add') {
            // Clear editing state when switching to add tab
            setEditingEmployee(null);
            form.resetFields();
        }
        setDeleteConfirmId(null);
    };

    const handleBackToList = () => {
        setEditingEmployee(null);
        form.resetFields();
        setActiveTab('list');
    };

    const renderAddForm = () => (
        <div className="employee-form-container">
            {editingEmployee && (
                <button className="back-to-list-btn" onClick={handleBackToList}>
                    <FiArrowLeft size={14} />
                    Back to List
                </button>
            )}
            <Form
                form={form}
                layout="vertical"
                name="add_employee_form"
            >
                <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please input the name!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="id" label="Employee ID" rules={[{ required: true, message: 'Please input the ID!' }]}>
                    <Input disabled={!!editingEmployee} />
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
        </div>
    );

    const renderListView = () => (
        <>
            {loading ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                    <Spin />
                </div>
            ) : employees.length === 0 ? (
                <div className="employee-list-empty">
                    <FiUsers className="employee-list-empty-icon" />
                    <p className="employee-list-empty-text">No employees found</p>
                </div>
            ) : (
                <div className="employee-list-container">
                    {employees.map(employee => (
                        <div key={employee.id} className="employee-list-item">
                            <div className="employee-list-info">
                                <img
                                    src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&size=40`}
                                    alt={employee.name}
                                    className="employee-list-avatar"
                                />
                                <div className="employee-list-details">
                                    <p className="employee-list-name">{employee.name}</p>
                                    <p className="employee-list-role">{employee.role}</p>
                                </div>
                            </div>

                            {deleteConfirmId === employee.id ? (
                                <div className="delete-confirm-inline">
                                    <span className="delete-confirm-text">Delete?</span>
                                    <button
                                        className="confirm-btn yes"
                                        onClick={() => handleDeleteConfirm(employee.id)}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className="confirm-btn no"
                                        onClick={handleDeleteCancel}
                                    >
                                        No
                                    </button>
                                </div>
                            ) : (
                                <div className="employee-list-actions">
                                    <button
                                        className="action-btn edit"
                                        onClick={() => handleEdit(employee)}
                                        title="Edit"
                                    >
                                        <FiEdit2 size={14} />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDeleteClick(employee.id)}
                                        title="Delete"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    const tabItems = [
        {
            key: 'add',
            label: editingEmployee ? 'Edit Employee' : 'Add Employee',
            children: renderAddForm()
        },
        {
            key: 'list',
            label: `Team Members (${employees.length})`,
            children: renderListView()
        }
    ];

    return (
        <Modal
            title="Employee Management"
            open={open}
            onOk={activeTab === 'add' ? handleOk : undefined}
            onCancel={handleModalClose}
            okText={editingEmployee ? "Save" : "Add"}
            cancelText="Close"
            footer={activeTab === 'list' ? null : undefined}
            width={520}
        >
            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={tabItems}
                className="employee-modal-tabs"
            />
        </Modal>
    );
};

export default AddEmployeeModal;
