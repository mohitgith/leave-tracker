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

// Use API type for OrgEmployee
type OrgEmployee = OrgEmployeeAPI;

// Manager/Root Card Component
interface ManagerCardProps {
    employee: OrgEmployee;
    onNodeClick: (emp: OrgEmployee) => void;
    onEditClick: (emp: OrgEmployee) => void;
    childrenCount: number;
}

const ManagerCard: React.FC<ManagerCardProps> = ({ employee, onNodeClick, onEditClick, childrenCount }) => {
    const employeeType = (employee as any).employeeType || 'permanent';

    return (
        <div className="manager-card-wrapper">
            <div
                className="manager-card"
                onClick={() => onNodeClick(employee)}
            >
                {/* Team Lead Badge */}
                <div className="manager-badge">Team Lead</div>

                <div className="manager-content">
                    <div className="manager-avatar-wrapper">
                        <img src={employee.avatarUrl} alt={employee.name} className="manager-avatar" />
                        <span className="status-dot online"></span>
                    </div>
                    <div className="manager-info">
                        <h3 className="manager-name">{employee.name}</h3>
                        <p className="manager-role">{employee.role}</p>
                        <div className="manager-meta">
                            <div className="reports-avatars">
                                {employee.children?.slice(0, 3).map((child, idx) => (
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

                {/* Team Status Bar */}
                <div className="team-status-bar">
                    <div className="status-segment active" style={{ width: '75%' }} title="Active"></div>
                    <div className="status-segment remote" style={{ width: '15%' }} title="Remote"></div>
                    <div className="status-segment leave" style={{ width: '10%' }} title="On Leave"></div>
                </div>
            </div>

            {/* Vertical connector down */}
            <div className="connector-from-manager"></div>
        </div>
    );
};

// Individual Employee Card (Compact version for team members)
interface EmployeeNodeProps {
    employee: OrgEmployee;
    onNodeClick: (emp: OrgEmployee) => void;
    onEditClick: (emp: OrgEmployee) => void;
    onDeleteClick: (emp: OrgEmployee) => void;
    position: 'left' | 'center' | 'right';
}

const EmployeeNode: React.FC<EmployeeNodeProps> = ({
    employee,
    onNodeClick,
    onEditClick,
    onDeleteClick,
    position
}) => {
    const employeeType = (employee as any).employeeType || 'permanent';
    const isContractor = employeeType === 'contractor';

    return (
        <div className={`employee-node ${position}`}>
            {/* Horizontal connector line */}
            <div className={`horizontal-connector ${position}`}></div>

            <div
                className={`compact-card ${isContractor ? 'contractor' : 'permanent'}`}
                onClick={() => onNodeClick(employee)}
            >
                <div className="compact-avatar-wrapper">
                    <img src={employee.avatarUrl} alt={employee.name} className="compact-avatar" />
                </div>
                <div className="compact-info">
                    <p className="compact-name">{employee.name}</p>
                    <p className="compact-role">{employee.role}</p>
                </div>
                <span className={`status-indicator ${isContractor ? 'contractor' : 'permanent'}`}></span>
            </div>
        </div>
    );
};

// Column of employees with vertical line
interface EmployeeColumnProps {
    employees: OrgEmployee[];
    onNodeClick: (emp: OrgEmployee) => void;
    onEditClick: (emp: OrgEmployee) => void;
    onDeleteClick: (emp: OrgEmployee) => void;
    position: 'left' | 'center' | 'right';
}

const EmployeeColumn: React.FC<EmployeeColumnProps> = ({
    employees,
    onNodeClick,
    onEditClick,
    onDeleteClick,
    position
}) => {
    if (employees.length === 0) return null;

    return (
        <div className={`employee-column ${position}`}>
            {/* Vertical connector from top horizontal line */}
            <div className={`vertical-connector-top ${position}`}></div>

            {/* Vertical line running through column */}
            <div className={`vertical-line ${position}`}></div>

            {/* Employee nodes */}
            {employees.map((emp, idx) => (
                <EmployeeNode
                    key={emp.id}
                    employee={emp}
                    onNodeClick={onNodeClick}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
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

    // Split children into 2-3 columns
    const splitIntoColumns = (children: OrgEmployee[] = []) => {
        const total = children.length;
        if (total === 0) return { left: [], center: [], right: [] };

        // Always try to split into 2 columns (left and right)
        // If more than 8 employees, use 3 columns
        if (total <= 8) {
            const half = Math.ceil(total / 2);
            return {
                left: children.slice(0, half),
                center: [],
                right: children.slice(half)
            };
        } else {
            const third = Math.ceil(total / 3);
            return {
                left: children.slice(0, third),
                center: children.slice(third, third * 2),
                right: children.slice(third * 2)
            };
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" />
            </div>
        );
    }

    const columns = splitIntoColumns(orgChartData?.children);
    const hasMultipleColumns = columns.left.length > 0 && columns.right.length > 0;

    return (
        <div className="org-chart-wrapper">
            <div className="org-chart-header">
                <Input
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="Search employees..."
                    className="search-input"
                    size="large"
                />

                {/* Legend for employee types */}
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
                                onEditClick={handleEditClick}
                                childrenCount={orgChartData.children?.length || 0}
                            />
                        )}

                        {/* Horizontal line connecting columns */}
                        {hasMultipleColumns && (
                            <div className="horizontal-connector-bar"></div>
                        )}

                        {/* Employee Columns */}
                        <div className="columns-container">
                            <EmployeeColumn
                                employees={columns.left}
                                onNodeClick={setSelectedEmployee}
                                onEditClick={handleEditClick}
                                onDeleteClick={handleDeleteClick}
                                position="left"
                            />
                            {columns.center.length > 0 && (
                                <EmployeeColumn
                                    employees={columns.center}
                                    onNodeClick={setSelectedEmployee}
                                    onEditClick={handleEditClick}
                                    onDeleteClick={handleDeleteClick}
                                    position="center"
                                />
                            )}
                            <EmployeeColumn
                                employees={columns.right}
                                onNodeClick={setSelectedEmployee}
                                onEditClick={handleEditClick}
                                onDeleteClick={handleDeleteClick}
                                position="right"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="zoom-controls">
                <Tooltip title="Zoom Out">
                    <div className="zoom-btn" onClick={handleZoomOut}><MinusOutlined /></div>
                </Tooltip>
                <div className="zoom-value">
                    {Math.round(scale * 100)}%
                </div>
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
