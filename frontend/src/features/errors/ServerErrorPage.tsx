import React from 'react';
import { Button, ConfigProvider, theme } from 'antd';
import { useLocation } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import './ErrorPage.css';

const ServerErrorPage: React.FC = () => {
    const location = useLocation();

    // Get the original URL that caused the error (passed via state)
    const errorUrl = (location.state as any)?.errorUrl || null;

    const handleRefresh = () => {
        if (errorUrl) {
            // Navigate to the original page that caused the error (full reload)
            window.location.href = errorUrl;
        } else {
            // If no error URL stored, go back in history with reload
            window.history.back();
        }
    };

    const handleGoBack = () => {
        // Use native browser navigation to ensure page reloads with data
        if (window.history.length > 2) {
            window.history.go(-2); // Go back 2 steps (skip the error page)
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
                    <div className="error-icon error-icon-500">
                        <FiAlertTriangle size={80} />
                    </div>
                    <h1 className="error-code">500</h1>
                    <h2 className="error-title">Server Error</h2>
                    <p className="error-message">
                        Something went wrong on our end. Please try again later.
                    </p>
                    <div className="error-buttons">
                        <Button
                            size="large"
                            icon={<FiRefreshCw />}
                            onClick={handleRefresh}
                            className="error-button-secondary"
                        >
                            Try Again
                        </Button>
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
                </div>
            </ConfigProvider>
        </div>
    );
};

export default ServerErrorPage;
