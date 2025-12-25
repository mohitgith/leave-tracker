import React, { useState, useEffect } from 'react';
import { Input, Tooltip, message, Spin } from 'antd';
import {
    SearchOutlined,
    CompressOutlined,
    PlusOutlined,
    MinusOutlined,
    UserAddOutlined,
    FilterOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import { fetchOrgChart, createEmployee, updateEmployee, deleteEmployee, OrgEmployeeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import EmployeeDetailModal from './EmployeeDetailModal';
import AddEmployeeModal from './AddEmployeeModal';
import './OrgChart.css';

type OrgEmployee = OrgEmployeeAPI;

// Status types for employees
type EmployeeStatus = 'in-office' | 'remote' | 'on-leave' | 'sick-leave';

// Get status based on employee (simulated - in real app this would come from backend)
const getEmployeeStatus = (employee: OrgEmployee): EmployeeStatus => {
    // Simulate different statuses based on name hash
    const hash = employee.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const statuses: EmployeeStatus[] = ['in-office', 'in-office', 'in-office', 'remote', 'on-leave', 'sick-leave'];
    return statuses[hash % statuses.length];
};

// Manager Card Component
const ManagerCard: React.FC<{
    employee: OrgEmployee;
    onNodeClick: (emp: OrgEmployee) => void;
    childrenCount: number;
    children?: OrgEmployee[];
}> = ({ employee, onNodeClick, childrenCount, children = [] }) => {
    return (
        <div className="manager-section">
            <div className="manager-card" onClick={() => onNodeClick(employee)}>
                <div className="manager-badge">TEAM LEAD</div>
                <div className="manager-content">
                    <div className="manager-avatar-section">
                        <img src={employee.avatarUrl} alt={employee.name} className="manager-avatar" />
                    </div>
                    <div className="manager-info">
                        <h3 className="manager-name">{employee.name}</h3>
                        <p className="manager-role">{employee.role}</p>
                        <div className="manager-meta">
                            <div className="reports-avatars">
                                {children.slice(0, 3).map((child) => (
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
                    <div className="status-segment active"></div>
                    <div className="status-segment remote"></div>
                    <div className="status-segment leave"></div>
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

    return (
        <div className="org-chart-wrapper">
            {/* Header */}
            <div className="org-chart-header">
                <div className="header-left">
                    <div className="breadcrumb">
                        <span className="breadcrumb-item">Leave Tracker</span>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-item active">Org Chart</span>
                    </div>
                    <h1 className="page-title">Organizational Structure</h1>
                </div>

                {/* Status Key */}
                <div className="status-key">
                    <span className="status-key-label">Status Key:</span>
                    <div className="status-key-item">
                        <span className="status-dot-key in-office"></span>
                        <span>In Office</span>
                    </div>
                    <div className="status-key-item">
                        <span className="status-dot-key remote"></span>
                        <span>Remote</span>
                    </div>
                    <div className="status-key-item">
                        <span className="status-dot-key on-leave"></span>
                        <span>On Leave</span>
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
                    <button className="header-btn">
                        <FilterOutlined /> Filter
                    </button>
                    <button className="header-btn primary">
                        <DownloadOutlined /> Export
                    </button>
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
                                children={orgChartData.children}
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
