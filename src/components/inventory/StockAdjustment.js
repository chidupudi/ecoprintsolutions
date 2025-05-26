// src/components/inventory/StockAdjustment.js
import React, { useState, useEffect } from 'react';
import { 
  Card, Form, Select, InputNumber, Input, Button, Table, 
  message, Space, Tag, DatePicker, Row, Col 
} from 'antd';
import { PlusOutlined, MinusOutlined, SaveOutlined } from '@ant-design/icons';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const StockAdjustment = () => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('in');
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const { userProfile } = useAuth();

  useEffect(() => {
    loadProducts();
    loadRecentTransactions();
  }, []);

  const loadProducts = async () => {
    try {
      const productData = await dbService.getAll('products', 'name', 'asc');
      setProducts(productData);
    } catch (error) {
      message.error('Failed to load products');
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const transactions = await dbService.queryDocuments(
        'inventory_transactions',
        [],
        'createdAt',
        'desc',
        10
      );
      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const onProductSelect = (productId) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
  };

  const onFinish = async (values) => {
    if (!selectedProduct) {
      message.error('Please select a product');
      return;
    }

    setLoading(true);
    try {
      const adjustmentQuantity = adjustmentType === 'in' ? values.quantity : -values.quantity;
      const newStock = selectedProduct.currentStock + adjustmentQuantity;

      if (newStock < 0) {
        message.error('Insufficient stock for this adjustment');
        setLoading(false);
        return;
      }

      // Create transaction record
      const transactionData = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productSku: selectedProduct.sku,
        type: adjustmentType === 'in' ? 'stock_in' : 'stock_out',
        quantity: Math.abs(values.quantity),
        previousStock: selectedProduct.currentStock,
        newStock: newStock,
        reason: values.reason || 'Manual adjustment',
        notes: values.notes || '',
        date: values.date ? values.date.toDate() : new Date(),
        createdBy: userProfile?.displayName || 'Unknown',
        createdById: userProfile?.uid
      };

      // Save transaction
      await dbService.create('inventory_transactions', transactionData);

      // Update product stock
      await dbService.update('products', selectedProduct.id, {
        currentStock: newStock
      });

      message.success(`Stock ${adjustmentType === 'in' ? 'added' : 'removed'} successfully!`);
      form.resetFields();
      setSelectedProduct(null);
      loadProducts();
      loadRecentTransactions();

    } catch (error) {
      message.error('Failed to adjust stock: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date?.toDate ? date.toDate() : date).format('DD/MM/YYYY HH:mm'),
      width: 130,
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'stock_in' ? 'green' : 'red'}>
          {type === 'stock_in' ? 'Stock In' : 'Stock Out'}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: 'Previous',
      dataIndex: 'previousStock',
      key: 'previousStock',
      width: 80,
    },
    {
      title: 'New Stock',
      dataIndex: 'newStock',
      key: 'newStock',
      width: 90,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
  ];

  return (
    <div>
      <h2>Stock Adjustment</h2>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Adjust Stock">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                label="Select Product"
                name="productId"
                rules={[{ required: true, message: 'Please select a product!' }]}
              >
                <Select
                  placeholder="Search and select product"
                  showSearch
                  optionFilterProp="children"
                  onChange={onProductSelect}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {products.map(product => (
                    <Option key={product.id} value={product.id}>
                      {product.name} ({product.sku}) - Current: {product.currentStock}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedProduct && (
                <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6f8fa' }}>
                  <Row>
                    <Col span={12}>
                      <strong>Current Stock:</strong> {selectedProduct.currentStock}
                    </Col>
                    <Col span={12}>
                      <strong>Min Level:</strong> {selectedProduct.minStockLevel}
                    </Col>
                  </Row>
                </Card>
              )}

              <Form.Item
                label="Adjustment Type"
                name="adjustmentType"
                initialValue="in"
              >
                <Select onChange={setAdjustmentType}>
                  <Option value="in">
                    <PlusOutlined /> Stock In (Add)
                  </Option>
                  <Option value="out">
                    <MinusOutlined /> Stock Out (Remove)
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Quantity"
                name="quantity"
                rules={[
                  { required: true, message: 'Please enter quantity!' },
                  { type: 'number', min: 1, message: 'Quantity must be at least 1!' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter quantity"
                  min={1}
                />
              </Form.Item>

              <Form.Item
                label="Date"
                name="date"
                initialValue={moment()}
                rules={[{ required: true, message: 'Please select date!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  showTime
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>

              <Form.Item
                label="Reason"
                name="reason"
                rules={[{ required: true, message: 'Please enter reason!' }]}
              >
                <Select placeholder="Select reason">
                  <Option value="Purchase">New Purchase</Option>
                  <Option value="Return">Customer Return</Option>
                  <Option value="Damage">Damaged Items</Option>
                  <Option value="Sale">Direct Sale</Option>
                  <Option value="Transfer">Stock Transfer</Option>
                  <Option value="Correction">Stock Correction</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Notes"
                name="notes"
              >
                <TextArea
                  rows={3}
                  placeholder="Additional notes (optional)"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  block
                >
                  {adjustmentType === 'in' ? 'Add Stock' : 'Remove Stock'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Transactions">
            <Table
              columns={transactionColumns}
              dataSource={recentTransactions}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 400 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StockAdjustment;