// src/customer/pages/CustomerLogin.js - UPDATED WITH APPROVAL CHECK
import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Divider, Alert } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/authService';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const CustomerLogin = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setShowPendingMessage(false);
    
    try {
      await authService.signInWithGoogle();
      message.success('Successfully signed in with Google!');
      // Redirect to products or home page for customers  
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo);
    } catch (error) {
      message.error('Google sign-in failed: ' + error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    setShowPendingMessage(false);
    
    try {
      const user = await login(values.email, values.password);
      
      // Get user profile to check approval status
      const userProfile = await authService.getUserProfile(user.uid);
      
      // Check if wholesale customer is approved
      if (userProfile.customerType === 'wholesale' && userProfile.approvalStatus === 'pending') {
        setShowPendingMessage(true);
        message.warning('Your wholesale account is pending admin approval');
        return;
      }
      
      if (userProfile.customerType === 'wholesale' && userProfile.approvalStatus === 'rejected') {
        message.error('Your wholesale account application has been rejected. Please contact support.');
        return;
      }
      
      message.success('Login successful!');
      // Redirect to products or home page for customers
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo);
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

        {/* Pending Approval Message */}
        {showPendingMessage && (
          <Alert
            message="Account Pending Approval"
            description={
              <div>
                <p>Your wholesale account is currently pending admin approval.</p>
                <p><strong>What happens next?</strong></p>
                <ul style={{ marginLeft: '16px', marginTop: '8px' }}>
                  <li>Our admin team will review your application</li>
                  <li>You'll receive an email notification once approved</li>
                  <li>After approval, you can access wholesale pricing</li>
                </ul>
                <p style={{ marginTop: '12px' }}>
                  <Text type="secondary">
                    Need help? Contact us at support@ecoprintsolutions.com
                  </Text>
                </p>
              </div>
            }
            type="warning"
            icon={<ClockCircleOutlined />}
            style={{ marginBottom: '24px' }}
            showIcon
          />
        )}
        
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
              disabled={showPendingMessage}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {!showPendingMessage && (
          <>
            <Divider>or</Divider>

            <Button 
              icon={<GoogleOutlined />}
              block
              style={{ height: '45px', marginBottom: '20px' }}
              loading={googleLoading}
              onClick={handleGoogleSignIn}
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
          </>
        )}
      </Card>
    </div>
  );
};

export default CustomerLogin;