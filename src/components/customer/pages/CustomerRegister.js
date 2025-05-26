// src/customer/pages/CustomerRegister.js
import React, { useState } from 'react';
import { 
  Form, Input, Button, Card, message, Typography, 
  Select, Checkbox, Divider 
} from 'antd';
import { 
  UserOutlined, LockOutlined, MailOutlined, 
  PhoneOutlined, GoogleOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const CustomerRegister = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        displayName: values.firstName + ' ' + values.lastName,
        customerType: values.customerType,
        phone: values.phone,
        role: values.customerType === 'wholesale' ? 'customer_wholesale' : 'customer_retail'
      };

      await register(values.email, values.password, userData);
      message.success('Account created successfully! Welcome to Eco Print Solutions!');
      navigate('/');
    } catch (error) {
      message.error('Registration failed: ' + error.message);
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
        maxWidth: 500, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            Create Account
          </Title>
          <Text type="secondary">
            Join Eco Print Solutions for the best printing deals
          </Text>
        </div>
        
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              label="First Name"
              name="firstName"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Please enter your first name!' }]}
            >
              <Input placeholder="First Name" />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Please enter your last name!' }]}
            >
              <Input placeholder="Last Name" />
            </Form.Item>
          </div>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="your@email.com" 
            />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[{ required: true, message: 'Please enter your phone number!' }]}
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="+91 9876543210" 
            />
          </Form.Item>

          <Form.Item
            label="Customer Type"
            name="customerType"
            initialValue="retail"
            rules={[{ required: true, message: 'Please select customer type!' }]}
          >
            <Select>
              <Option value="retail">
                <div>
                  <div style={{ fontWeight: 'bold' }}>Retail Customer</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    For individual purchases
                  </div>
                </div>
              </Option>
              <Option value="wholesale">
                <div>
                  <div style={{ fontWeight: 'bold' }}>Wholesale Customer</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    For bulk purchases and business
                  </div>
                </div>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Create a strong password" 
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[{ required: true, message: 'Please confirm your password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirm your password" 
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              { 
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('Please accept the terms and conditions!'))
              }
            ]}
          >
            <Checkbox>
              I agree to the <Link to="/terms">Terms & Conditions</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Divider>or</Divider>

        <Button 
          icon={<GoogleOutlined />}
          block
          size="large"
          style={{ marginBottom: '20px' }}
        >
          Sign up with Google
        </Button>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Already have an account? {' '}
            <Link to="/login" style={{ color: '#1890ff', fontWeight: 'bold' }}>
              Sign in here
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default CustomerRegister;