import React, { useState, useEffect } from 'react';
import { Input, Tooltip, message, Popconfirm, Spin, Radio, Table } from 'antd';
import { FiSearch, FiMinimize2, FiPlus, FiMinus, FiEdit2, FiMail, FiUserPlus, FiTrash2, FiList } from 'react-icons/fi';
import { RiOrganizationChart } from 'react-icons/ri';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'tree' | 'list'>('list');

    const isManager = user?.isManager ?? false;

    // Filter org chart data based on search term (recursive)
    const filterOrgData = (node: OrgEmployee, term: string): OrgEmployee | null => {
        if (!term.trim()) return node;

        const lowerTerm = term.toLowerCase();
        const matchesName = node.name.toLowerCase().includes(lowerTerm);
        const matchesRole = node.role?.toLowerCase().includes(lowerTerm);
        const matchesEmail = node.email?.toLowerCase().includes(lowerTerm);

        // Filter children recursively
        const filteredChildren = node.children
            ?.map(child => filterOrgData(child, term))
            .filter((child): child is OrgEmployee => child !== null) || [];

        // Include node if it matches OR has matching children
        if (matchesName || matchesRole || matchesEmail || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
        }
        return null;
    };

    const filteredOrgData = orgChartData ? filterOrgData(orgChartData, searchTerm) : null;

    // Flatten org tree to list for table view
    const flattenOrgData = (node: OrgEmployee | null): OrgEmployee[] => {
        if (!node) return [];
        const result: OrgEmployee[] = [node];
        if (node.children) {
            node.children.forEach(child => {
                result.push(...flattenOrgData(child));
            });
        }
        return result;
    };

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
                <div className="header-top-row">
                    <Input
                        prefix={<FiSearch size={16} style={{ color: '#bfbfbf' }} />}
                        placeholder="Search employees..."
                        className="search-input"
                        size="large"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                    />

                    {isManager && (
                        <button className="create-leave-button" onClick={handleAddClick}>
                            <FiUserPlus size={16} style={{ marginRight: 8 }} /> Add Employee
                        </button>
                    )}
                </div>

                <div className="header-bottom-row">
                    <Radio.Group
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                        className="view-mode-toggle"
                        optionType="button"
                        buttonStyle="solid"
                    >
                        <Tooltip title="List View">
                            <Radio.Button value="list">
                                <FiList size={16} />
                            </Radio.Button>
                        </Tooltip>
                        <Tooltip title="Tree View">
                            <Radio.Button value="tree">
                                <RiOrganizationChart size={16} />
                            </Radio.Button>
                        </Tooltip>
                    </Radio.Group>
                </div>
            </div>

            {viewMode === 'tree' ? (
                <div className="org-chart-viewport">
                    <div className="transform-container" style={{ transform: `scale(${scale})` }}>
                        <div className="tree">
                            {filteredOrgData && (
                                <RecursiveNode
                                    employee={filteredOrgData}
                                    onNodeClick={setSelectedEmployee}
                                    onEditClick={handleEditClick}
                                    onDeleteClick={handleDeleteClick}
                                />
                            )}
                            {searchTerm && !filteredOrgData && (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                    No employees found matching "{searchTerm}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="org-list-container">
                    <Table<OrgEmployee>
                        dataSource={flattenOrgData(filteredOrgData)}
                        rowKey="id"
                        pagination={false}
                        rowSelection={undefined}
                        expandable={{ childrenColumnName: 'none' }}
                        onRow={(record) => ({
                            onClick: () => setSelectedEmployee(record),
                            style: { cursor: 'pointer' }
                        })}
                        locale={{ emptyText: searchTerm ? `No employees found matching "${searchTerm}"` : 'No data' }}
                        columns={[
                            {
                                title: 'Employee',
                                key: 'employee',
                                render: (_, record: OrgEmployee) => (
                                    <div className="list-employee-cell">
                                        <img src={record.avatarUrl} alt={record.name} className="list-avatar" />
                                        <div className="list-info">
                                            <div className="list-name">{record.name}</div>
                                            <div className="list-role">{record.role}</div>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                title: 'Email',
                                dataIndex: 'email',
                                key: 'email',
                                render: (email: string) => (
                                    <div className="list-email">
                                        <FiMail size={14} style={{ marginRight: 6 }} />
                                        {email}
                                    </div>
                                ),
                            },
                            {
                                title: 'Location',
                                dataIndex: 'location',
                                key: 'location',
                            },
                            {
                                title: 'Actions',
                                key: 'actions',
                                width: 150,
                                render: (_, record: OrgEmployee) => (
                                    <div className="list-actions">
                                        <button className="list-action-btn" onClick={(e) => { e.stopPropagation(); handleEditClick(record); }}>
                                            <FiEdit2 size={14} />
                                        </button>
                                        <Popconfirm
                                            title="Delete Employee"
                                            description="Are you sure?"
                                            onConfirm={(e) => { e?.stopPropagation(); handleDeleteClick(record); }}
                                            onCancel={(e) => e?.stopPropagation()}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <button className="list-action-btn list-action-delete" onClick={(e) => e.stopPropagation()}>
                                                <FiTrash2 size={14} />
                                            </button>
                                        </Popconfirm>
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>
            )}

            {viewMode === 'tree' && (
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
            )}

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