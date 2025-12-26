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
            case 'org-chart':
                navigate('/org-chart');
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
        if (path.includes('org-chart')) return 'org-chart';
        if (path.includes('leave-tracker')) return 'documents';
        if (path.includes('settings')) return 'settings';
        return 'dashboard';
    };

    // Check if current route should hide sidebar
    const shouldHideSidebar = () => {
        const path = location.pathname;
        return path.includes('/settings') || path.includes('/profile');
    };

    const hideSidebar = shouldHideSidebar();

    return (
        <Layout style={{ minHeight: '100vh', flexDirection: 'column' }}>
            {/* TopBar at the very top, full width */}
            <TopBar />

            {/* Below TopBar: Sidebar and Content side by side */}
            <Layout style={{ flex: 1, flexDirection: 'row', marginTop: 56 }}>
                {!hideSidebar && <Sidebar onNavigate={handleNavigate} selectedKey={getSelectedKey()} />}

                <Content
                    className="main-content"
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        marginLeft: hideSidebar ? 0 : 60 // Account for sidebar width
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
