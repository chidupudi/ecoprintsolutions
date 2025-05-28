import React, { useState } from 'react';
import { 
  Card, Form, Input, Button, message, Typography, 
  Space, Avatar, Divider, Row, Col, Select, Tabs
} from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, 
  HomeOutlined, EditOutlined, SaveOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import { dbService } from '../../../services/dbService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const { currentUser, userProfile } = useAuth();

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      await dbService.update('users', currentUser.uid, {
        ...values,
        updatedAt: new Date()
      });
      message.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Avatar size={80} icon={<UserOutlined />} />
          <Title level={3} style={{ marginTop: '16px' }}>
            {userProfile?.displayName || 'User Profile'}
          </Title>
          <Text type="secondary">{currentUser?.email}</Text>
        </div>

        <Tabs defaultActiveKey="1">
          <TabPane tab="Personal Information" key="1">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              initialValues={{
                displayName: userProfile?.displayName || '',
                email: currentUser?.email || '',
                phone: userProfile?.phone || '',
                address: userProfile?.address || '',
                customerType: userProfile?.customerType || 'retail'
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Full Name"
                    name="displayName"
                    rules={[{ required: true, message: 'Please enter your full name!' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      disabled={!editing}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      disabled={true}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Phone Number"
                    name="phone"
                    rules={[{ required: true, message: 'Please enter your phone number!' }]}
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      disabled={!editing}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Customer Type"
                    name="customerType"
                  >
                    <Select disabled={true}>
                      <Option value="retail">Retail Customer</Option>
                      <Option value="wholesale">Wholesale Customer</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="Address"
                    name="address"
                  >
                    <TextArea 
                      rows={3}
                      disabled={!editing}
                      placeholder="Enter your complete address"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                {!editing ? (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Space>
                    <Button onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Save Changes
                    </Button>
                  </Space>
                )}
              </div>
            </Form>
          </TabPane>

          <TabPane tab="Account Settings" key="2">
            <div>
              <Title level={4}>Account Information</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Card size="small">
                  <Row>
                    <Col span={8}><Text strong>Account Status:</Text></Col>
                    <Col span={16}>
                      {userProfile?.isActive ? (
                        <Text style={{ color: '#52c41a' }}>Active</Text>
                      ) : (
                        <Text style={{ color: '#ff4d4f' }}>Inactive</Text>
                      )}
                    </Col>
                  </Row>
                </Card>
                
                <Card size="small">
                  <Row>
                    <Col span={8}><Text strong>Member Since:</Text></Col>
                    <Col span={16}>
                      <Text>
                        {userProfile?.createdAt ? 
                          new Date(userProfile.createdAt.toDate ? userProfile.createdAt.toDate() : userProfile.createdAt).toLocaleDateString() :
                          'N/A'
                        }
                      </Text>
                    </Col>
                  </Row>
                </Card>

                <Card size="small">
                  <Row>
                    <Col span={8}><Text strong>Last Login:</Text></Col>
                    <Col span={16}>
                      <Text>
                        {userProfile?.lastLogin ? 
                          new Date(userProfile.lastLogin.toDate ? userProfile.lastLogin.toDate() : userProfile.lastLogin).toLocaleDateString() :
                          'N/A'
                        }
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </Space>

              <Divider />

              <Title level={4}>Security</Title>
              <Button type="primary" ghost>
                Change Password
              </Button>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProfilePage;