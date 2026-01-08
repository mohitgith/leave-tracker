import React from 'react';
import { Table, Popconfirm } from 'antd';
import { FiMail, FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { OrgEmployeeAPI } from '../../services/api';

interface OrgListProps {
    employees: OrgEmployeeAPI[];
    showManager?: boolean;
    onEmployeeClick?: (emp: OrgEmployeeAPI) => void;
    onEditClick?: (emp: OrgEmployeeAPI) => void;
    onDeleteClick?: (emp: OrgEmployeeAPI) => void;
    showActions?: boolean;
    hideEmailLocation?: boolean;
    hideHeaders?: boolean;
}

const OrgList: React.FC<OrgListProps> = ({
    employees,
    showManager: _showManager = true,
    onEmployeeClick,
    onEditClick,
    onDeleteClick,
    showActions = true,
    hideEmailLocation = false,
    hideHeaders = false
}) => {
    const columns: any[] = [
        {
            title: 'Employee',
            key: 'employee',
            render: (_: any, record: OrgEmployeeAPI) => (
                <div
                    className="list-employee-cell"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEmployeeClick?.(record);
                    }}
                    style={{ cursor: onEmployeeClick ? 'pointer' : 'default' }}
                >
                    <img src={record.avatarUrl} alt={record.name} className="list-avatar" />
                    <div className="list-info">
                        <div className="list-name">{record.name}</div>
                        <div className="list-role">{record.role}</div>
                    </div>
                </div>
            ),
        },
    ];

    // Conditionally add Email and Location columns
    if (!hideEmailLocation) {
        columns.push(
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
            }
        );
    }

    // Conditionally add Actions column if showActions is true
    if (showActions && (onEditClick || onDeleteClick)) {
        columns.push({
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: OrgEmployeeAPI) => (
                <div className="list-actions">
                    {onEditClick && (
                        <button
                            className="list-action-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(record);
                            }}
                        >
                            <FiEdit2 size={14} />
                        </button>
                    )}
                    {onDeleteClick && (
                        <Popconfirm
                            title="Delete Employee"
                            description="Are you sure?"
                            onConfirm={(e) => {
                                e?.stopPropagation();
                                onDeleteClick(record);
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                            okText="Yes"
                            cancelText="No"
                        >
                            <button
                                className="list-action-btn list-action-delete"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <FiTrash2 size={14} />
                            </button>
                        </Popconfirm>
                    )}
                </div>
            ),
        } as any);
    }

    return (
        <div className="org-list-container">
            <Table<OrgEmployeeAPI>
                dataSource={employees}
                rowKey="id"
                pagination={false}
                rowSelection={undefined}
                expandable={{ childrenColumnName: 'none' }}
                showHeader={!hideHeaders}
                onRow={(record) => ({
                    onClick: () => onEmployeeClick?.(record),
                    style: { cursor: onEmployeeClick ? 'pointer' : 'default' }
                })}
                columns={columns}
            />
        </div>
    );
};

export default OrgList;
