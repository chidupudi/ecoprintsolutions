
// src/components/customer/PendingApproval.js
import React from 'react';
import { Result, Button, Card, Typography, Space } from 'antd';
import { ClockCircleOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';

const { Title, Text } = Typography;

const PendingApproval = () => {
  const { logout } = AuthContext();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <Card style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <Result
          icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
          title="Account Pending Approval"
          subTitle="Your wholesale account is currently under review. We'll notify you once it's approved."
          extra={[
            <Button key="logout" onClick={logout}>
              Logout & Login with Different Account
            </Button>
          ]}
        />
        
        <Card style={{ marginTop: '24px', backgroundColor: '#f9f9f9' }}>
          <Title level={5}>What happens next?</Title>
          <div style={{ textAlign: 'left' }}>
            <p>✓ Our team will review your wholesale application</p>
            <p>✓ We may contact you for additional verification</p>
            <p>✓ You'll receive an email once approved</p>
            <p>✓ Approval typically takes 1-2 business days</p>
          </div>
        </Card>

        <Card style={{ marginTop: '16px', backgroundColor: '#e6f7ff' }}>
          <Title level={5}>Need Help?</Title>
          <Space direction="vertical">
            <div>
              <PhoneOutlined /> Call us: +91 9876543210
            </div>
            <div>
              <MailOutlined /> Email: support@ecoprintsolutions.com
            </div>
            <Text type="secondary">Available Mon-Sat, 9 AM - 8 PM</Text>
          </Space>
        </Card>
      </Card>
    </div>
  );
};

export default PendingApproval;