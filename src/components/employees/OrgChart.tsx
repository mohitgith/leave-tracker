import React, { useState, useEffect } from 'react';
import { Input, Tooltip, message, Spin } from 'antd';
import {
    SearchOutlined,
    CompressOutlined,
    PlusOutlined,
    MinusOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { fetchOrgChart, createEmployee, updateEmployee, deleteEmployee, OrgEmployeeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import EmployeeDetailModal from './EmployeeDetailModal';
import AddEmployeeModal from './AddEmployeeModal';
import './OrgChart.css';

type OrgEmployee = OrgEmployeeAPI;

// Status types for employees
type EmployeeStatus = 'annual-leave' | 'sick-leave';

// Get status based on employee (simulated - in real app this would come from backend)
const getEmployeeStatus = (employee: OrgEmployee): EmployeeStatus => {
    // Simulate different statuses based on name hash
    const hash = employee.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const statuses: EmployeeStatus[] = ['annual-leave', 'annual-leave', 'annual-leave', 'sick-leave'];
    return statuses[hash % statuses.length];
};

// Manager Card Component
const ManagerCard: React.FC<{
    employee: OrgEmployee;
    onNodeClick: (emp: OrgEmployee) => void;
    childrenCount: number;
}> = ({ employee, onNodeClick, childrenCount }) => {
    return (
        <div className="manager-section">
            <div className="manager-card" onClick={() => onNodeClick(employee)}>
                <div className="manager-badge">MANAGER</div>
                <div className="manager-content">
                    <div className="manager-avatar-section">
                        <img src={employee.avatarUrl} alt={employee.name} className="manager-avatar" />
                    </div>
                    <div className="manager-info">
                        <h3 className="manager-name">{employee.name}</h3>
                        <span className="reports-count">{childrenCount} Reports</span>
                    </div>
                </div>
            </div>
            <div className="connector-down"></div>
        </div>
    );
};

// Employee Card - compact uniform design
const EmployeeCard: React.FC<{
    employee: OrgEmployee;
    onNodeClick: (emp: OrgEmployee) => void;
    position: 'left' | 'center' | 'right';
}> = ({ employee, onNodeClick, position }) => {
    const status = getEmployeeStatus(employee);
    const isRightColumn = position === 'right';

    return (
        <div className={`emp-card-wrapper ${position}`}>
            <div className={`h-connector ${position}`}></div>
            <div className="emp-card" onClick={() => onNodeClick(employee)}>
                {isRightColumn ? (
                    <>
                        <div className="emp-info right">
                            <p className="emp-name">{employee.name}</p>
                            <p className="emp-role">{employee.role}</p>
                        </div>
                        <span className={`status-dot ${status}`}></span>
                        <img src={employee.avatarUrl} alt={employee.name} className="emp-avatar" />
                    </>
                ) : (
                    <>
                        <img src={employee.avatarUrl} alt={employee.name} className="emp-avatar" />
                        <div className="emp-info">
                            <p className="emp-name">{employee.name}</p>
                            <p className="emp-role">{employee.role}</p>
                        </div>
                        <span className={`status-dot ${status}`}></span>
                    </>
                )}
            </div>
        </div>
    );
};

// Employee Column with vertical connector
const EmployeeColumn: React.FC<{
    employees: OrgEmployee[];
    onNodeClick: (emp: OrgEmployee) => void;
    position: 'left' | 'center' | 'right';
}> = ({ employees, onNodeClick, position }) => {
    if (employees.length === 0) return <div className="emp-column empty"></div>;

    return (
        <div className={`emp-column ${position}`}>
            <div className={`v-connector-top ${position}`}></div>
            <div className={`v-line ${position}`}></div>
            {employees.map((emp) => (
                <EmployeeCard
                    key={emp.id}
                    employee={emp}
                    onNodeClick={onNodeClick}
                    position={position}
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

    // Split employees by type: contractors on left, permanent split between center and right
    const splitByType = (children: OrgEmployee[] = []) => {
        const contractors = children.filter(emp => (emp as any).employeeType === 'contractor');
        const permanent = children.filter(emp => (emp as any).employeeType !== 'contractor');

        // Split permanent employees between center and right columns
        const half = Math.ceil(permanent.length / 2);
        const centerPermanent = permanent.slice(0, half);
        const rightPermanent = permanent.slice(half);

        return {
            left: contractors,        // Contractors on left
            center: centerPermanent,  // Half of permanent in center
            right: rightPermanent     // Half of permanent on right
        };
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" />
            </div>
        );
    }

    const columns = splitByType(orgChartData?.children);
    const hasChildren = (orgChartData?.children?.length || 0) > 0;

    // Get today's date
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className="org-chart-wrapper">
            {/* Header - Same style as Dashboard */}
            <div className="org-chart-header">
                <div className="header-left">
                    <h1 className="page-title">Organizational Structure</h1>
                    <p className="page-subtitle">Team overview as of {today}</p>
                </div>

                {/* Status Key */}
                <div className="status-key">
                    <span className="status-key-label">Status Key:</span>
                    <div className="status-key-item">
                        <span className="status-dot-key annual-leave"></span>
                        <span>Annual Leave</span>
                    </div>
                    <div className="status-key-item">
                        <span className="status-dot-key sick-leave"></span>
                        <span>Sick Leave</span>
                    </div>
                </div>

                <div className="header-right">
                    <Input
                        prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                        placeholder="Find employee..."
                        className="search-input"
                    />
                    {isManager && (
                        <button className="add-member-btn" onClick={handleAddClick}>
                            <UserAddOutlined /> Add Member
                        </button>
                    )}
                </div>
            </div>

            {/* Chart Viewport */}
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

                        {/* Three columns */}
                        {hasChildren && (
                            <div className="columns-wrapper">
                                <EmployeeColumn
                                    employees={columns.left}
                                    onNodeClick={setSelectedEmployee}
                                    position="left"
                                />
                                <EmployeeColumn
                                    employees={columns.center}
                                    onNodeClick={setSelectedEmployee}
                                    position="center"
                                />
                                <EmployeeColumn
                                    employees={columns.right}
                                    onNodeClick={setSelectedEmployee}
                                    position="right"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Zoom Controls */}
            <div className="zoom-controls">
                <Tooltip title="Zoom In">
                    <div className="zoom-btn" onClick={handleZoomIn}><PlusOutlined /></div>
                </Tooltip>
                <Tooltip title="Zoom Out">
                    <div className="zoom-btn" onClick={handleZoomOut}><MinusOutlined /></div>
                </Tooltip>
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
