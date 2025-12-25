import React, { useState, useEffect } from 'react';
import { Input, Tooltip, message, Popconfirm, Spin } from 'antd';
import {
    SearchOutlined,
    CompressOutlined,
    PlusOutlined,
    MinusOutlined,
    EditOutlined,
    UserAddOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { fetchOrgChart, createEmployee, updateEmployee, deleteEmployee, OrgEmployeeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import EmployeeDetailModal from './EmployeeDetailModal';
import AddEmployeeModal from './AddEmployeeModal';
import './OrgChart.css';

type OrgEmployee = OrgEmployeeAPI;

// Manager/Root Card Component
const ManagerCard: React.FC<{
    employee: OrgEmployee;
    onNodeClick: (emp: OrgEmployee) => void;
    childrenCount: number;
}> = ({ employee, onNodeClick, childrenCount }) => {
    return (
        <div className="manager-section">
            <div className="manager-card" onClick={() => onNodeClick(employee)}>
                <div className="manager-badge">Team Lead</div>
                <div className="manager-content">
                    <div className="manager-avatar-section">
                        <img src={employee.avatarUrl} alt={employee.name} className="manager-avatar" />
                        <span className="status-dot online"></span>
                    </div>
                    <div className="manager-info">
                        <h3 className="manager-name">{employee.name}</h3>
                        <p className="manager-role">{employee.role}</p>
                        <div className="manager-meta">
                            <div className="reports-avatars">
                                {employee.children?.slice(0, 3).map((child) => (
                                    <div
                                        key={child.id}
                                        className="mini-avatar"
                                        style={{ backgroundImage: `url(${child.avatarUrl})` }}
                                    />
                                ))}
                            </div>
                            <span className="reports-count">{childrenCount} Reports</span>
                        </div>
                    </div>
                </div>
                <div className="team-status-bar">
                    <div className="status-segment active" style={{ width: '75%' }}></div>
                    <div className="status-segment remote" style={{ width: '15%' }}></div>
                    <div className="status-segment leave" style={{ width: '10%' }}></div>
                </div>
            </div>
            {/* Vertical connector down from manager */}
            <div className="connector-down"></div>
        </div>
    );
};

// Employee Card for column
const EmployeeCard: React.FC<{
    employee: OrgEmployee;
    onNodeClick: (emp: OrgEmployee) => void;
    side: 'left' | 'right';
}> = ({ employee, onNodeClick, side }) => {
    const employeeType = (employee as any).employeeType || 'permanent';
    const isContractor = employeeType === 'contractor';
    const colorClass = side === 'left' ? 'blue' : 'purple';

    return (
        <div className={`emp-card-wrapper ${side}`}>
            {/* Horizontal connector from vertical line to card */}
            <div className={`h-connector ${side}`}></div>

            <div
                className={`emp-card ${colorClass} ${isContractor ? 'contractor' : 'permanent'}`}
                onClick={() => onNodeClick(employee)}
            >
                <img src={employee.avatarUrl} alt={employee.name} className="emp-avatar" />
                <div className={`emp-info ${side}`}>
                    <p className="emp-name">{employee.name}</p>
                    <p className="emp-role">{employee.role}</p>
                </div>
                <span className={`status-indicator ${isContractor ? 'contractor' : 'permanent'}`}></span>
            </div>
        </div>
    );
};

// Column of employees
const EmployeeColumn: React.FC<{
    employees: OrgEmployee[];
    onNodeClick: (emp: OrgEmployee) => void;
    side: 'left' | 'right';
}> = ({ employees, onNodeClick, side }) => {
    if (employees.length === 0) return null;

    return (
        <div className={`emp-column ${side}`}>
            {/* Vertical connector from horizontal bar */}
            <div className={`v-connector-top ${side}`}></div>

            {/* Vertical line through all cards */}
            <div className={`v-line ${side}`}></div>

            {/* Employee cards */}
            {employees.map((emp) => (
                <EmployeeCard
                    key={emp.id}
                    employee={emp}
                    onNodeClick={onNodeClick}
                    side={side}
                />
            ))}
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
            loadOrgChart();
        } catch (error) {
            message.error('Failed to delete employee');
            console.error(error);
        }
    };

    const handleFormSubmit = async (values: any) => {
        try {
            if (editingEmployee) {
                await updateEmployee(editingEmployee.id, {
                    ...values,
                    id: editingEmployee.id,
                    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(values.name)}&background=random&color=fff&size=64&bold=true`,
                    managerId: '0',
                    department: 'ENABLEMENT R&C',
                });
                message.success('Employee updated successfully');
            } else {
                await createEmployee({
                    ...values,
                    managerId: '0',
                    department: 'ENABLEMENT R&C',
                });
                message.success('Employee added successfully');
            }
            setIsAddModalOpen(false);
            loadOrgChart();
        } catch (error) {
            message.error(editingEmployee ? 'Failed to update employee' : 'Failed to add employee');
            console.error(error);
        }
    };

    // Split children into left and right columns
    const splitColumns = (children: OrgEmployee[] = []) => {
        const half = Math.ceil(children.length / 2);
        return {
            left: children.slice(0, half),
            right: children.slice(half)
        };
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" />
            </div>
        );
    }

    const columns = splitColumns(orgChartData?.children);
    const hasChildren = (orgChartData?.children?.length || 0) > 0;

    return (
        <div className="org-chart-wrapper">
            <div className="org-chart-header">
                <Input
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="Search employees..."
                    className="search-input"
                    size="large"
                />
                <div className="employee-type-legend">
                    <div className="legend-item">
                        <div className="legend-dot permanent-dot"></div>
                        <span>Permanent</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot contractor-dot"></div>
                        <span>Contractor</span>
                    </div>
                </div>
                {isManager && (
                    <button className="global-add-btn" onClick={handleAddClick}>
                        <UserAddOutlined style={{ marginRight: 8 }} /> Add Member
                    </button>
                )}
            </div>

            <div className="org-chart-viewport">
                <div className="transform-container" style={{ transform: `scale(${scale})` }}>
                    <div className="org-tree">
                        {/* Manager Card */}
                        {orgChartData && (
                            <ManagerCard
                                employee={orgChartData}
                                onNodeClick={setSelectedEmployee}
                                childrenCount={orgChartData.children?.length || 0}
                            />
                        )}

                        {/* Horizontal connector bar */}
                        {hasChildren && <div className="h-connector-bar"></div>}

                        {/* Employee Columns */}
                        {hasChildren && (
                            <div className="columns-wrapper">
                                <EmployeeColumn
                                    employees={columns.left}
                                    onNodeClick={setSelectedEmployee}
                                    side="left"
                                />
                                <EmployeeColumn
                                    employees={columns.right}
                                    onNodeClick={setSelectedEmployee}
                                    side="right"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="zoom-controls">
                <Tooltip title="Zoom Out">
                    <div className="zoom-btn" onClick={handleZoomOut}><MinusOutlined /></div>
                </Tooltip>
                <div className="zoom-value">{Math.round(scale * 100)}%</div>
                <Tooltip title="Zoom In">
                    <div className="zoom-btn" onClick={handleZoomIn}><PlusOutlined /></div>
                </Tooltip>
                <div className="zoom-divider" />
                <Tooltip title="Fit Screen">
                    <div className="zoom-btn" onClick={handleResetZoom}><CompressOutlined /></div>
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
