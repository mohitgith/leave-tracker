import React, { useState } from 'react';
import { Input, Tooltip, message } from 'antd';
import {
    SearchOutlined,
    CompressOutlined,
    PlusOutlined,
    MinusOutlined,
    TeamOutlined,
    EditOutlined,
    MailOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { orgChartData, OrgEmployee } from '../../data/orgChartData';
import EmployeeDetailModal from './EmployeeDetailModal';
import AddEmployeeModal from './AddEmployeeModal';
import './OrgChart.css';

interface RecursiveNodeProps {
    employee: OrgEmployee;
    onNodeClick: (emp: OrgEmployee) => void;
    onEditClick: (emp: OrgEmployee) => void;
}

const RecursiveNode: React.FC<RecursiveNodeProps> = ({ employee, onNodeClick, onEditClick }) => {
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
                        <MailOutlined style={{ marginRight: 6, color: '#999' }} />
                        <span className="email-text">{employee.email}</span>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="edit-btn" onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(employee);
                    }}>
                        <EditOutlined style={{ marginRight: 4 }} /> Edit
                    </div>
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const OrgChart: React.FC = () => {
    const [scale, setScale] = useState(1);
    const [selectedEmployee, setSelectedEmployee] = useState<OrgEmployee | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<OrgEmployee | null>(null);

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

    const handleFormSubmit = (values: any) => {
        console.log('Form Values:', values);
        // Here you would typically update the orgChartData state
        setIsAddModalOpen(false);
        message.success(editingEmployee ? 'Updated successfully' : 'Added successfully');
    };

    return (
        <div className="org-chart-wrapper">
            <div className="org-chart-header">
                <Input
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="Search employees..."
                    className="search-input"
                    size="large"
                />
                <button className="global-add-btn" onClick={handleAddClick}>
                    <UserAddOutlined style={{ marginRight: 8 }} /> Add Member
                </button>
            </div>

            <div className="org-chart-viewport">
                <div className="transform-container" style={{ transform: `scale(${scale})` }}>
                    <div className="tree">
                        <RecursiveNode
                            employee={orgChartData}
                            onNodeClick={setSelectedEmployee}
                            onEditClick={handleEditClick}
                        />
                    </div>
                </div>
            </div>

            <div className="zoom-controls">
                <Tooltip title="Zoom Out">
                    <div className="zoom-btn" onClick={handleZoomOut}><MinusOutlined /></div>
                </Tooltip>
                <div style={{ minWidth: 40, textAlign: 'center', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {Math.round(scale * 100)}%
                </div>
                <Tooltip title="Zoom In">
                    <div className="zoom-btn" onClick={handleZoomIn}><PlusOutlined /></div>
                </Tooltip>
                <div style={{ width: 1, height: 20, background: '#eee', margin: '0 4px' }} />
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
