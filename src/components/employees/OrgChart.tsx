import React, { useState, useEffect } from 'react';
import { Input, Tooltip, message, Popconfirm, Spin } from 'antd';
import { FiSearch, FiMinimize2, FiPlus, FiMinus, FiEdit2, FiMail, FiUserPlus, FiTrash2 } from 'react-icons/fi';
import { fetchOrgChart, createEmployee, updateEmployee, deleteEmployee, OrgEmployeeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import EmployeeDetailModal from './EmployeeDetailModal';
import AddEmployeeModal from './AddEmployeeModal';

import './OrgChart.css';

// Use API type for OrgEmployee
type OrgEmployee = OrgEmployeeAPI;

interface RecursiveNodeProps {
    employee: OrgEmployee;
    onNodeClick: (emp: OrgEmployee) => void;
    onEditClick: (emp: OrgEmployee) => void;
    onDeleteClick: (emp: OrgEmployee) => void;
}

const RecursiveNode: React.FC<RecursiveNodeProps> = ({ employee, onNodeClick, onEditClick, onDeleteClick }) => {
    const hasChildren = employee.children && employee.children.length > 0;

    return (
        <div className="tree-node">
            <div className="employee-card" onClick={(e) => {
                e.stopPropagation();
                onNodeClick(employee);
            }}>
                <div className="card-header">
                    <img src={employee.avatarUrl} alt={employee.name} className="card-avatar" />
                    <div className="card-info">
                        <div className="emp-name">{employee.name}</div>
                        <div className="emp-role">{employee.role}</div>
                        <div className="emp-dept">{employee.location.split(' ')[0]}</div>
                    </div>
                </div>

                <div className="card-body">
                    <div className="email-row">
                        <FiMail size={14} style={{ marginRight: 6, color: '#999' }} />
                        <span className="email-text">{employee.email}</span>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="edit-btn" onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(employee);
                    }}>
                        <FiEdit2 size={12} style={{ marginRight: 4 }} /> Edit
                    </div>
                    {!hasChildren && (
                        <Popconfirm
                            title="Delete Employee"
                            description="Are you sure you want to delete this employee?"
                            onConfirm={(e) => {
                                e?.stopPropagation();
                                onDeleteClick(employee);
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                            okText="Yes"
                            cancelText="No"
                        >
                            <div className="delete-btn" onClick={(e) => e.stopPropagation()}>
                                <FiTrash2 size={12} style={{ marginRight: 4 }} /> Delete
                            </div>
                        </Popconfirm>
                    )}
                </div>
            </div>

            {hasChildren && (
                <div className="children-container">
                    {employee.children?.map(child => (
                        <RecursiveNode
                            key={child.id}
                            employee={child}
                            onNodeClick={onNodeClick}
                            onEditClick={onEditClick}
                            onDeleteClick={onDeleteClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const OrgChart: React.FC = () => {
    const { user } = useAuth();
    const [scale, setScale] = useState(1);
    const [selectedEmployee, setSelectedEmployee] = useState<OrgEmployee | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<OrgEmployee | null>(null);
    const [orgChartData, setOrgChartData] = useState<OrgEmployee | null>(null);
    const [loading, setLoading] = useState(true);

    const isManager = user?.isManager ?? false;

    // Fetch org chart data from API
    const loadOrgChart = async () => {
        try {
            setLoading(true);
            const data = await fetchOrgChart();
            setOrgChartData(data);
        } catch (error) {
            message.error('Failed to load org chart data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrgChart();
    }, []);

    // Zoom Logic
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.3));
    const handleResetZoom = () => setScale(1);

    const handleEditClick = (emp: OrgEmployee) => {
        setEditingEmployee(emp);
        setIsAddModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingEmployee(null);
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = async (emp: OrgEmployee) => {
        try {
            await deleteEmployee(emp.id);
            message.success('Employee deleted successfully');
            loadOrgChart(); // Refresh data
        } catch (error) {
            message.error('Failed to delete employee');
            console.error(error);
        }
    };

    const handleFormSubmit = async (values: any) => {
        try {
            if (editingEmployee) {
                // Update existing employee
                await updateEmployee(editingEmployee.id, {
                    ...values,
                    id: editingEmployee.id,
                    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(values.name)}&background=random&color=fff&size=64&bold=true`,
                    managerId: '0', // Default to manager
                    department: 'ENABLEMENT R&C',
                });
                message.success('Employee updated successfully');
            } else {
                // Create new employee
                await createEmployee({
                    ...values,
                    managerId: '0', // Default to manager
                    department: 'ENABLEMENT R&C',
                });
                message.success('Employee added successfully');
            }
            setIsAddModalOpen(false);
            loadOrgChart(); // Refresh data
        } catch (error) {
            message.error(editingEmployee ? 'Failed to update employee' : 'Failed to add employee');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="org-chart-wrapper">
            <div className="org-chart-header">

                <div className="header-actions">
                    <Input
                        prefix={<FiSearch size={16} style={{ color: '#bfbfbf' }} />}
                        placeholder="Search employees..."
                        className="search-input"
                        size="large"
                    />

                    {isManager && (
                        <button className="create-leave-button" onClick={handleAddClick}>
                            <FiUserPlus size={16} style={{ marginRight: 8 }} /> Add Member
                        </button>
                    )}
                </div>
            </div>

            <div className="org-chart-viewport">
                <div className="transform-container" style={{ transform: `scale(${scale})` }}>
                    <div className="tree">
                        {orgChartData && (
                            <RecursiveNode
                                employee={orgChartData}
                                onNodeClick={setSelectedEmployee}
                                onEditClick={handleEditClick}
                                onDeleteClick={handleDeleteClick}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="zoom-controls">
                <Tooltip title="Zoom Out">
                    <div className="zoom-btn" onClick={handleZoomOut}><FiMinus size={16} /></div>
                </Tooltip>
                <div className="zoom-percentage">
                    {Math.round(scale * 100)}%
                </div>
                <Tooltip title="Zoom In">
                    <div className="zoom-btn" onClick={handleZoomIn}><FiPlus size={16} /></div>
                </Tooltip>
                <div className="zoom-divider" />
                <Tooltip title="Fit Screen">
                    <div className="zoom-btn" onClick={handleResetZoom}><FiMinimize2 size={16} /></div>
                </Tooltip>
            </div>

            <EmployeeDetailModal
                employee={selectedEmployee}
                open={!!selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
            />

            <AddEmployeeModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialValues={editingEmployee}
            />
        </div>
    );
};

export default OrgChart;