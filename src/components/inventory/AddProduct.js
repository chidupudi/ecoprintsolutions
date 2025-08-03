// src/components/inventory/AddProduct.js
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, message, Row, Col, Switch } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { dbService } from '../../services/dbService';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const AddProduct = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoryData = await dbService.getAll('categories', 'name', 'asc');
      setCategories(categoryData);
    } catch (error) {
      message.error('Failed to load categories');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Generate SKU if not provided
      if (!values.sku) {
        const timestamp = Date.now().toString().slice(-6);
        values.sku = `${values.category.toUpperCase()}_${timestamp}`;
      }

      // Set default values
      const productData = {
        ...values,
        currentStock: values.currentStock || 0,
        isActive: values.isActive !== false,
        compatibility: values.compatibility ? values.compatibility.split(',').map(s => s.trim()) : [],
      };

      await dbService.create('products', productData);
      message.success('Product added successfully!');
      form.resetFields();
      
      // Optionally navigate back to product list
      // navigate('/inventory/products');
    } catch (error) {
      message.error('Failed to add product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/inventory/products')}
        >
          Back to Products
        </Button>
        <h2 style={{ margin: 0 }}>Add New Product</h2>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 16]}>
            {/* Basic Information */}
            <Col xs={24}>
              <h3>Basic Information</h3>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Product Name"
                name="name"
                rules={[{ required: true, message: 'Please enter product name!' }]}
              >
                <Input placeholder="e.g., 12A Cartridge" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="SKU"
                name="sku"
                rules={[{ required: true, message: 'Please enter SKU!' }]}
              >
                <Input placeholder="e.g., CART_12A" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select category!' }]}
              >
                <Select placeholder="Select category">
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please enter description!' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Detailed product description..."
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Compatibility"
                name="compatibility"
                tooltip="Enter printer models separated by commas (e.g., 103, 303, 703)"
              >
                <Input placeholder="e.g., 103, 303, 703" />
              </Form.Item>
            </Col>

            {/* Pricing */}
            <Col xs={24}>
              <h3>Pricing Information</h3>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Cost Price"
                name="costPrice"
                rules={[{ required: true, message: 'Please enter cost price!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="320"
                  prefix="₹"
                  min={0}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Wholesale Price"
                name="wholesalePrice"
                rules={[{ required: true, message: 'Please enter wholesale price!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="380"
                  prefix="₹"
                  min={0}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Retail Price"
                name="retailPrice"
                rules={[{ required: true, message: 'Please enter retail price!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="450"
                  prefix="₹"
                  min={0}
                />
              </Form.Item>
            </Col>

            {/* Inventory */}
            <Col xs={24}>
              <h3>Inventory Information</h3>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Current Stock"
                name="currentStock"
                rules={[{ required: true, message: 'Please enter current stock!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="25"
                  min={0}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Minimum Stock Level"
                name="minStockLevel"
                rules={[{ required: true, message: 'Please enter minimum stock level!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="5"
                  min={0}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Maximum Stock Level"
                name="maxStockLevel"
                rules={[{ required: true, message: 'Please enter maximum stock level!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="100"
                  min={0}
                />
              </Form.Item>
            </Col>

            {/* Additional Options */}
            <Col xs={24}>
              <h3>Availability & Visibility</h3>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Product Status"
                name="isActive"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch 
                  checkedChildren="Active" 
                  unCheckedChildren="Inactive" 
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Available for Retail Customers"
                name="availableForRetail"
                valuePropName="checked"
                initialValue={true}
                tooltip="Show this product to retail customers"
              >
                <Switch 
                  checkedChildren="Yes" 
                  unCheckedChildren="No" 
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Available for Wholesale Customers"
                name="availableForWholesale"
                valuePropName="checked"
                initialValue={true}
                tooltip="Show this product to wholesale customers"
              >
                <Switch 
                  checkedChildren="Yes" 
                  unCheckedChildren="No" 
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Minimum Order Quantity (MOQ)"
                name="minOrderQuantity"
                tooltip="Minimum quantity required per order (especially for wholesale)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="1"
                  min={1}
                  initialValue={1}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Unit of Measurement"
                name="unit"
                rules={[{ required: true, message: 'Please select unit!' }]}
                initialValue="piece"
              >
                <Select placeholder="Select unit">
                  <Option value="piece">Piece</Option>
                  <Option value="set">Set</Option>
                  <Option value="pack">Pack</Option>
                  <Option value="box">Box</Option>
                  <Option value="carton">Carton</Option>
                  <Option value="kg">Kilogram</Option>
                  <Option value="meter">Meter</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Submit Button */}
            <Col xs={24}>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  Add Product
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AddProduct;