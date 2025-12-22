import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import hsbcLogo from '../../assets/hsbc-logo.png';

const HSBCLogo = () => (
    <img src={hsbcLogo} alt="HSBC Logo" width="200" height="70" />
);


const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = (_values: any) => {
        setLoading(true);
        // Fake login delay
        setTimeout(() => {
            localStorage.setItem('isAuthenticated', 'true');
            message.success('Login successful');
            navigate('/dashboard'); // Use navigate instead of window.location for smoother transition
        }, 1000);
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f5f7fa',
            flexDirection: 'column'
        }}>
            <div style={{ marginBottom: 40, transform: 'scale(1.5)' }}>
                <HSBCLogo />
            </div>

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
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            placeholder="Username"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
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
                        <Button type="primary" htmlType="submit" style={{ width: '100%', background: '#db0011', borderColor: '#db0011' }} size="large" loading={loading}>
                            Log In
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <div style={{ marginTop: 24, textAlign: 'center', color: '#666', fontSize: 12 }}>
                © Copyright HSBC Group 2025. All rights reserved.
            </div>
        </div>
    );
};

export default LoginPage;
