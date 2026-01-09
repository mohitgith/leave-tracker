import React from 'react';
import './PageHeader.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    variant?: 'wide' | 'narrow'; // wide = 1400px, narrow = 700px
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, variant = 'wide' }) => {
    return (
        <div className={`page-header page-header--${variant}`}>
            <h1 className="page-header-title">{title}</h1>
            {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
    );
};

export default PageHeader;

