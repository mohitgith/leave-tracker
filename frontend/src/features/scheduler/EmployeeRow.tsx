import React from 'react';
import { Avatar, Typography } from 'antd';
import { Employee } from '../../types';
import './EmployeeRow.css';

const { Text } = Typography;

interface EmployeeRowProps {
    employee: Employee;
}

const EmployeeRow: React.FC<EmployeeRowProps> = ({ employee }) => {
    return (
        <div className="employee-row">
            <Avatar
                size={28}
                src={employee.avatarUrl}
                className="employee-avatar"
            />
            <div className="employee-info">
                <Text className="employee-name">{employee.name}</Text>
            </div>
        </div>
    );
};

export default EmployeeRow;
