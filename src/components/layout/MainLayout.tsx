import React from 'react';
import { Layout } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const { Content } = Layout;

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (key: string) => {
        // Map keys to routes
        switch (key) {
            case 'dashboard':
                navigate('/dashboard');
                break;
            case 'employees':
                navigate('/employees');
                break;
            case 'documents':
                navigate('/leave-tracker');
                break;
            case 'settings':
                navigate('/settings');
                break;
            default:
                navigate('/dashboard');
        }
    };

    // Map route to key for highlighting
    const getSelectedKey = () => {
        const path = location.pathname;
        if (path.includes('employees')) return 'employees';
        if (path.includes('leave-tracker')) return 'documents';
        if (path.includes('settings')) return 'settings';
        return 'dashboard';
    };

    return (
        <Layout style={{ minHeight: '100vh', flexDirection: 'row' }}>
            <Sidebar onNavigate={handleNavigate} selectedKey={getSelectedKey()} />
            <Layout style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TopBar />
                {/* Add marginTop for TopBar (56px) and marginLeft for Sidebar (60px) */}
                <Content style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f7fa', overflow: 'hidden', marginTop: 56, marginLeft: 60 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
