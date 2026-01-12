import React from 'react';
import { Button, ConfigProvider, theme } from 'antd';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import './ErrorPage.css';

const NotFoundPage: React.FC = () => {

    const handleGoBack = () => {
        // Use native browser navigation to ensure page reloads with data
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Fallback: full page navigation to dashboard
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className="light-theme-override error-page-container">
            <ConfigProvider
                theme={{
                    algorithm: theme.defaultAlgorithm,
                    token: {
                        colorBgContainer: '#fff',
                        colorText: '#333',
                    }
                }}
            >
                <div className="error-page-content">
                    <div className="error-icon error-icon-404">
                        <FiAlertCircle size={80} />
                    </div>
                    <h1 className="error-code">404</h1>
                    <h2 className="error-title">Page Not Found</h2>
                    <p className="error-message">
                        The page you are looking for doesn't exist or has been moved.
                    </p>
                    <Button
                        type="primary"
                        size="large"
                        icon={<FiArrowLeft />}
                        onClick={handleGoBack}
                        className="error-button"
                    >
                        Go Back
                    </Button>
                </div>
            </ConfigProvider>
        </div>
    );
};

export default NotFoundPage;
