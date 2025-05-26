// src/components/inventory/PurchaseOrderCreate.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { 
  Card, Form, Select, Button, Table, InputNumber, Input,
  message, Row, Col, Space, Divider, DatePicker 
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const PurchaseOrderCreate = () => {
  const [form] = Form.useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  const loadSuppliers = async () => {
    try {
      const supplierData = await dbService.queryDocuments('suppliers', [
        { field: 'isActive', operator: '==', value: true }
      ]);
      setSuppliers(supplierData);
    } catch (error) {
      message.error('Failed to load suppliers');
    }
  };

  const loadProducts = async () => {
    try {
      const productData = await dbService.queryDocuments('products', [
        { field: 'isActive', operator: '==', value: true }
      ]);
      setProducts(productData);
    } catch (error) {
      message.error('Failed to load products');
    }
  };

  const addOrderItem = () => {
    const newItem = {
      key: Date.now(),
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    setOrderItems([...orderItems, newItem]);
  };

  const removeOrderItem = (key) => {
    setOrderItems(orderItems.filter(item => item.key !== key));
  };

  const updateOrderItem = (key, field, value) => {
    const updatedItems = orderItems.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.productName = product.name;
            updatedItem.unitPrice = product.costPrice || 0;
          }
        }
        
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    });
    setOrderItems(updatedItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const onFinish = async (values) => {
    if (orderItems.length === 0) {
      message.error('Please add at least one item to the purchase order');
      return;
    }

    if (orderItems.some(item => !item.productId || item.quantity <= 0 || item.unitPrice <= 0)) {
      message.error('Please fill all item details correctly');
      return;
    }

    setLoading(true);
    try {
      const purchaseOrderData = {
        supplierId: values.supplierId,
        supplierName: suppliers.find(s => s.id === values.supplierId)?.name,
        items: orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        totalAmount: calculateTotal(),
        purchaseDate: values.purchaseDate ? values.purchaseDate.toDate() : new Date(),
        expectedDelivery: values.expectedDelivery ? values.expectedDelivery.toDate() : null,
        status: 'pending',
        paymentStatus: 'pending',
        notes: values.notes || '',
        createdBy: userProfile?.displayName || 'Unknown',
        createdById: userProfile?.uid
      };

      const orderId = await dbService.create('purchase_orders', purchaseOrderData);
      
      message.success(`Purchase Order #${orderId.slice(-6)} created successfully!`);
      form.resetFields();
      setOrderItems([]);
      setSelectedSupplier(null);

    } catch (error) {
      message.error('Failed to create purchase order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'productId',
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Select Product"
          value={value}
          onChange={(val) => updateOrderItem(record.key, 'productId', val)}
          showSearch
          optionFilterProp="children"
        >
          {products.map(product => (
            <Option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (value, record) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => updateOrderItem(record.key, 'quantity', val)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Unit Price (₹)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      render: (value, record) => (
        <InputNumber
          min={0}
          precision={2}
          value={value}
          onChange={(val) => updateOrderItem(record.key, 'unitPrice', val)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Total (₹)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (value) => `₹${(value || 0).toFixed(2)}`,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="primary"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeOrderItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div>
      <h2>Create Purchase Order</h2>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Supplier"
                name="supplierId"
                rules={[{ required: true, message: 'Please select supplier!' }]}
              >
                <Select
                  placeholder="Select Supplier"
                  showSearch
                  optionFilterProp="children"
                  onChange={(value) => {
                    const supplier = suppliers.find(s => s.id === value);
                    setSelectedSupplier(supplier);
                  }}
                >
                  {suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.contactPerson}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                label="Purchase Date"
                name="purchaseDate"
                initialValue={moment()}
                rules={[{ required: true, message: 'Please select purchase date!' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Expected Delivery"
                name="expectedDelivery"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {selectedSupplier && (
            <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6f8fa' }}>
              <Row>
                <Col span={8}>
                  <strong>Contact:</strong> {selectedSupplier.contactPerson}
                </Col>
                <Col span={8}>
                  <strong>Phone:</strong> {selectedSupplier.phone}
                </Col>
                <Col span={8}>
                  <strong>Payment Terms:</strong> {selectedSupplier.paymentTerms}
                </Col>
              </Row>
            </Card>
          )}

          <Divider>Order Items</Divider>

          <div style={{ marginBottom: 16 }}>
            <Button
              type="dashed"
              onClick={addOrderItem}
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
            >
              Add Item
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={orderItems}
            pagination={false}
            size="small"
            scroll={{ x: 600 }}
          />

          {orderItems.length > 0 && (
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Space direction="vertical" size="small">
                <div style={{ fontSize: 16 }}>
                  <strong>Subtotal: ₹{calculateTotal().toFixed(2)}</strong>
                </div>
                <div style={{ fontSize: 18, color: '#1890ff' }}>
                  <strong>Total Amount: ₹{calculateTotal().toFixed(2)}</strong>
                </div>
              </Space>
            </div>
          )}

          <Form.Item
            label="Notes"
            name="notes"
            style={{ marginTop: 16 }}
          >
            <TextArea rows={3} placeholder="Additional notes for this purchase order" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
              disabled={orderItems.length === 0}
            >
              Create Purchase Order
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PurchaseOrderCreate;