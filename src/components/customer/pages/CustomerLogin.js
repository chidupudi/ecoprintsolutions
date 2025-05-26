// src/customer/pages/CustomerLogin.js
import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const CustomerLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Login successful!');
      navigate('/');
    } catch (error) {
      message.error('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card style={{ 
        width: '100%', 
        maxWidth: 400, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            Welcome Back
          </Title>
          <Text type="secondary">
            Sign in to your account to continue shopping
          </Text>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email address" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              style={{ height: '45px', fontSize: '16px' }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider>or</Divider>

        <Button 
          icon={<GoogleOutlined />}
          block
          style={{ height: '45px', marginBottom: '20px' }}
        >
          Continue with Google
        </Button>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Don't have an account? {' '}
            <Link to="/register" style={{ color: '#1890ff', fontWeight: 'bold' }}>
              Sign up here
            </Link>
          </Text>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/forgot-password" style={{ color: '#1890ff' }}>
            Forgot your password?
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default CustomerLogin;