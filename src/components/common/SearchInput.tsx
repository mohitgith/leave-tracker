import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './SearchInput.css';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = 'Find employee',
}) => {
    return (
        <Input
            prefix={<SearchOutlined className="search-icon" />}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="search-input"
            allowClear
        />
    );
};

export default SearchInput;
