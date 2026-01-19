import React, { useMemo } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import { PageHeader } from '../';

const { Content } = Layout;

// Route to header configuration mapping
const getPageHeaderConfig = (pathname: string): { title: string; subtitle?: string; variant: 'wide' | 'narrow' } => {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });

    if (pathname.includes('/org-chart')) {
        return { title: 'Organization Chart', subtitle: `Team overview for ${today}`, variant: 'wide' };
    }
    if (pathname.includes('/leave-tracker')) {
        return { title: 'Leave Tracker', variant: 'wide' };
    }
    if (pathname.includes('/settings')) {
        return { title: 'Settings', variant: 'narrow' };
    }
    if (pathname.includes('/profile')) {
        return { title: 'My Profile', variant: 'narrow' };
    }
    // Default to dashboard
    return { title: 'Leave Dashboard', subtitle: `Overview for ${today}`, variant: 'wide' };
};

const MainLayout: React.FC = () => {
    const location = useLocation();

    // Get header config based on current route
    const headerConfig = useMemo(() => getPageHeaderConfig(location.pathname), [location.pathname]);

    return (
        <Layout style={{ minHeight: '100vh', flexDirection: 'column' }}>
            {/* TopBar at the very top, full width */}
            <TopBar />

            {/* Content below TopBar */}
            <Layout style={{ flex: 1, flexDirection: 'row', marginTop: 56 }}>
                <Content
                    className="main-content"
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Unified PageHeader - follows container position based on variant */}
                    <PageHeader title={headerConfig.title} subtitle={headerConfig.subtitle} variant={headerConfig.variant} />

                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;

