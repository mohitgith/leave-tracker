import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Divider, ConfigProvider, theme } from 'antd';
import { FiUser, FiLock } from 'react-icons/fi';
import { BsWindows } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import hsbcLogo from '../../assets/hsbc-logo.png';

const HSBCLogo = () => (
    <img src={hsbcLogo} alt="HSBC Logo" width="200" height="70" />
);

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        const success = await login(values.username, values.password);
        setLoading(false);

        if (success) {
            message.success('Login successful');
            navigate('/dashboard');
        } else {
            message.error('Invalid username or password');
        }
    };

    const handleSSOLogin = () => {
        // No operation - SSO not implemented
        message.info('SSO Login is not available at this time');
    };

    return (
        <div
            className="light-theme-override"
            data-theme="light"
            style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f5f7fa',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000
            }}
        >
            <div style={{ marginBottom: 40, transform: 'scale(1.5)' }}>
                <HSBCLogo />
            </div>

            <ConfigProvider
                theme={{
                    algorithm: theme.defaultAlgorithm,
                    token: {
                        colorBgContainer: '#fff',
                        colorText: '#333',
                        colorTextPlaceholder: '#999',
                    }
                }}
            >
                <div style={{
                    width: 400,
                    padding: 40,
                    background: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: 24, fontWeight: 400, color: '#333' }}>Log In</h2>

                    <Form
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input
                                prefix={<FiUser className="site-form-item-icon" />}
                                placeholder="Username"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password
                                prefix={<FiLock className="site-form-item-icon" />}
                                type="password"
                                placeholder="Password"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>

                            <a style={{ float: 'right', color: '#db0011' }} href="">
                                Forgot password?
                            </a>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ width: '100%', background: '#db0011', borderColor: '#db0011' }}
                                size="large"
                                loading={loading}
                            >
                                Log In
                            </Button>
                        </Form.Item>

                        <Divider>or</Divider>

                        <Button
                            style={{ width: '100%' }}
                            size="large"
                            onClick={handleSSOLogin}
                        >
                            Login with SSO
                        </Button>
                    </Form>
                </div>
            </ConfigProvider>

            <div style={{ marginTop: 24, textAlign: 'center', color: '#666', fontSize: 12 }}>
                © Copyright HSBC Group 2025. All rights reserved.
            </div>
        </div>
    );
};

export default LoginPage;
