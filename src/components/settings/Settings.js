// src/components/settings/Settings.js
import React, { useState, useEffect } from 'react';
import { 
  Card, Form, Input, InputNumber, Switch, Button, 
  message, Row, Col, Tabs, Upload 
} from 'antd';
import { SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { dbService } from '../../services/dbService';

const { TabPane } = Tabs;
const { TextArea } = Input;

const Settings = () => {
  const [businessForm] = Form.useForm();
  const [taxForm] = Form.useForm();
  const [inventoryForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await dbService.read('settings', 'general');
      setSettings(settingsData);
      
      // Populate forms
      businessForm.setFieldsValue(settingsData.businessInfo);
      taxForm.setFieldsValue(settingsData.taxSettings);
      inventoryForm.setFieldsValue(settingsData.inventorySettings);
    } catch (error) {
      console.log('No settings found, using defaults');
      // Set default values
      const defaultSettings = {
        businessInfo: {
          name: 'Eco Print Solutions',
          address: '',
          phone: '',
          email: '',
          gst: '',
          logo: ''
        },
        taxSettings: {
          gstRate: 18,
          enableGst: true
        },
        inventorySettings: {
          lowStockAlert: true,
          autoReorderPoint: false,
          defaultMargin: 25
        }
      };
      setSettings(defaultSettings);
      businessForm.setFieldsValue(defaultSettings.businessInfo);
      taxForm.setFieldsValue(defaultSettings.taxSettings);
      inventoryForm.setFieldsValue(defaultSettings.inventorySettings);
    }
  };

  const saveBusinessInfo = async (values) => {
    setLoading(true);
    try {
      const updatedSettings = {
        ...settings,
        businessInfo: values
      };
      
      await dbService.update('settings', 'general', updatedSettings);
      setSettings(updatedSettings);
      message.success('Business information saved successfully!');
    } catch (error) {
      message.error('Failed to save business information');
    } finally {
      setLoading(false);
    }
  };

  const saveTaxSettings = async (values) => {
    setLoading(true);
    try {
      const updatedSettings = {
        ...settings,
        taxSettings: values
      };
      
      await dbService.update('settings', 'general', updatedSettings);
      setSettings(updatedSettings);
      message.success('Tax settings saved successfully!');
    } catch (error) {
      message.error('Failed to save tax settings');
    } finally {
      setLoading(false);
    }
  };

  const saveInventorySettings = async (values) => {
    setLoading(true);
    try {
      const updatedSettings = {
        ...settings,
        inventorySettings: values
      };
      
      await dbService.update('settings', 'general', updatedSettings);
      setSettings(updatedSettings);
      message.success('Inventory settings saved successfully!');
    } catch (error) {
      message.error('Failed to save inventory settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>System Settings</h2>
      
      <Tabs defaultActiveKey="1">
        <TabPane tab="Business Information" key="1">
          <Card>
            <Form
              form={businessForm}
              layout="vertical"
              onFinish={saveBusinessInfo}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Business Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter business name!' }]}
                  >
                    <Input placeholder="Your Business Name" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="GST Number"
                    name="gst"
                  >
                    <Input placeholder="GST Registration Number" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Phone Number"
                    name="phone"
                    rules={[{ required: true, message: 'Please enter phone number!' }]}
                  >
                    <Input placeholder="+91 9876543210" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter email!' },
                      { type: 'email', message: 'Please enter valid email!' }
                    ]}
                  >
                    <Input placeholder="business@email.com" />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label="Business Address"
                    name="address"
                    rules={[{ required: true, message: 'Please enter business address!' }]}
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="Complete business address with city, state, and pincode" 
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Save Business Information
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Tax Settings" key="2">
          <Card>
            <Form
              form={taxForm}
              layout="vertical"
              onFinish={saveTaxSettings}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Enable GST"
                    name="enableGst"
                    valuePropName="checked"
                  >
                    <Switch 
                      checkedChildren="Enabled" 
                      unCheckedChildren="Disabled" 
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="GST Rate (%)"
                    name="gstRate"
                    rules={[{ required: true, message: 'Please enter GST rate!' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={50}
                      placeholder="18"
                      suffix="%"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Save Tax Settings
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Inventory Settings" key="3">
          <Card>
            <Form
              form={inventoryForm}
              layout="vertical"
              onFinish={saveInventorySettings}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Low Stock Alerts"
                    name="lowStockAlert"
                    valuePropName="checked"
                  >
                    <Switch 
                      checkedChildren="Enabled" 
                      unCheckedChildren="Disabled" 
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Auto Reorder Point"
                    name="autoReorderPoint"
                    valuePropName="checked"
                  >
                    <Switch 
                      checkedChildren="Enabled" 
                      unCheckedChildren="Disabled" 
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Default Profit Margin (%)"
                    name="defaultMargin"
                    rules={[{ required: true, message: 'Please enter default margin!' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={100}
                      placeholder="25"
                      suffix="%"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Save Inventory Settings
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings;