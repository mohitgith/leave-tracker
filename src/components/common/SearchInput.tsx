import React from 'react';
import { Input } from 'antd';
import { FiSearch } from 'react-icons/fi';
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
            prefix={<FiSearch className="search-icon" />}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="search-input"
            allowClear
        />
    );
};

export default SearchInput;
