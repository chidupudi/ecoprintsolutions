// src/customer/pages/OrderDetails.js
import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Space, Tag, Timeline, Button, 
  Row, Col, Divider, Table, Steps, message, Spin,
  Alert, Empty 
} from 'antd';
import { 
  ArrowLeftOutlined, PrinterOutlined, DownloadOutlined,
  TruckOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ShoppingOutlined, PhoneOutlined, MailOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../../services/dbService';
import { useAuth } from '../../../context/AuthContext';
import Loading from '../components/Loading';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const OrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await dbService.read('sales_orders', orderId);
      
      // Check if this order belongs to the current user
      if (orderData.customerId !== currentUser?.uid) {
        message.error('Order not found or access denied');
        navigate('/orders');
        return;
      }
      
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
      message.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatus = (status) => {
    const statuses = {
      pending: { color: 'orange', text: 'Order Placed', description: 'Your order has been received and is being processed' },
      processing: { color: 'blue', text: 'Processing', description: 'Your order is being prepared for shipment' },
      shipped: { color: 'purple', text: 'Shipped', description: 'Your order is on the way to your address' },
      delivered: { color: 'green', text: 'Delivered', description: 'Your order has been successfully delivered' },
      cancelled: { color: 'red', text: 'Cancelled', description: 'This order has been cancelled' }
    };
    return statuses[status] || { color: 'default', text: status, description: '' };
  };

  const getPaymentStatus = (status) => {
    const statuses = {
      pending: { color: 'orange', text: 'Payment Pending' },
      paid: { color: 'green', text: 'Payment Received' },
      failed: { color: 'red', text: 'Payment Failed' },
      refunded: { color: 'purple', text: 'Refunded' }
    };
    return statuses[status] || { color: 'default', text: status };
  };

  const getCurrentStep = (status) => {
    const steps = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1
    };
    return steps[status] || 0;
  };

  const orderColumns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (name, record) => (
        <Space>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            background: '#f5f5f5', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PrinterOutlined style={{ fontSize: '20px', color: '#999' }} />
          </div>
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              SKU: {record.sku}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `₹${price.toFixed(2)}`,
      align: 'center',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (total) => (
        <Text strong style={{ color: '#1890ff' }}>
          ₹{total.toFixed(2)}
        </Text>
      ),
      align: 'right',
    },
  ];

  if (loading) {
    return <Loading fullScreen message="Loading order details..." />;
  }

  if (!order) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Empty description="Order not found" />
        <Button type="primary" onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const statusInfo = getOrderStatus(order.status);
  const paymentInfo = getPaymentStatus(order.paymentStatus);
  const orderDate = new Date(order.orderDate?.toDate ? order.orderDate.toDate() : order.orderDate);
  const estimatedDelivery = order.estimatedDelivery ? 
    new Date(order.estimatedDelivery?.toDate ? order.estimatedDelivery.toDate() : order.estimatedDelivery) : 
    null;

  return (
    <div style={{ padding: '20px', minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/orders')}
            style={{ marginBottom: '16px' }}
          >
            Back to Orders
          </Button>
          
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  Order #{order.id.slice(-8)}
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Placed on {orderDate.toLocaleDateString('en-IN', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button icon={<PrinterOutlined />} size="large">
                    Print Invoice
                  </Button>
                  <Button icon={<DownloadOutlined />} type="primary" size="large">
                    Download PDF
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Order Status Alert */}
        <Alert
          message={statusInfo.text}
          description={statusInfo.description}
          type={order.status === 'delivered' ? 'success' : 
               order.status === 'cancelled' ? 'error' : 'info'}
          showIcon
          style={{ marginBottom: '24px' }}
        />

        {/* Order Progress */}
        <Card title="Order Status" style={{ marginBottom: '24px' }}>
          {order.status !== 'cancelled' ? (
            <Steps current={getCurrentStep(order.status)} status={order.status === 'delivered' ? 'finish' : 'process'}>
              <Step 
                title="Order Placed" 
                description="Order confirmed"
                icon={<CheckCircleOutlined />} 
              />
              <Step 
                title="Processing" 
                description="Preparing items"
                icon={<ClockCircleOutlined />} 
              />
              <Step 
                title="Shipped" 
                description="On the way"
                icon={<TruckOutlined />} 
              />
              <Step 
                title="Delivered" 
                description="Order completed"
                icon={<CheckCircleOutlined />} 
              />
            </Steps>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="danger" style={{ fontSize: '18px' }}>
                This order has been cancelled
              </Text>
            </div>
          )}
        </Card>

        <Row gutter={[24, 24]}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Order Items */}
            <Card title={`Items (${order.items?.length || 0})`} style={{ marginBottom: '24px' }}>
              <Table
                columns={orderColumns}
                dataSource={order.items || []}
                pagination={false}
                rowKey="productId"
                size="middle"
              />
              
              <Divider />
              
              {/* Order Summary */}
              <Row justify="end">
                <Col xs={24} sm={16} md={12}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Subtotal:</Text>
                      <Text>₹{order.subtotal?.toFixed(2) || '0.00'}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Tax (18% GST):</Text>
                      <Text>₹{order.tax?.toFixed(2) || '0.00'}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Shipping:</Text>
                      <Text style={{ color: '#52c41a' }}>Free</Text>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Title level={5}>Total:</Title>
                      <Title level={5} style={{ color: '#1890ff' }}>
                        ₹{order.totalAmount?.toFixed(2) || '0.00'}
                      </Title>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Order Timeline */}
            <Card title="Order Activity">
              <Timeline>
                <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                  <div>
                    <Text strong>Order Placed</Text>
                    <br />
                    <Text type="secondary">
                      {orderDate.toLocaleString('en-IN')}
                    </Text>
                    <br />
                    <Text type="secondary">Order confirmed and payment initiated</Text>
                  </div>
                </Timeline.Item>
                
                {order.status !== 'pending' && (
                  <Timeline.Item color="blue" dot={<ClockCircleOutlined />}>
                    <div>
                      <Text strong>Order Processing</Text>
                      <br />
                      <Text type="secondary">Your order is being prepared</Text>
                    </div>
                  </Timeline.Item>
                )}
                
                {(order.status === 'shipped' || order.status === 'delivered') && (
                  <Timeline.Item color="purple" dot={<TruckOutlined />}>
                    <div>
                      <Text strong>Order Shipped</Text>
                      <br />
                      <Text type="secondary">Your package is on the way</Text>
                    </div>
                  </Timeline.Item>
                )}
                
                {order.status === 'delivered' && (
                  <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                    <div>
                      <Text strong>Order Delivered</Text>
                      <br />
                      <Text type="secondary">Package delivered successfully</Text>
                    </div>
                  </Timeline.Item>
                )}
                
                {order.status === 'cancelled' && (
                  <Timeline.Item color="red">
                    <div>
                      <Text strong>Order Cancelled</Text>
                      <br />
                      <Text type="secondary">This order has been cancelled</Text>
                    </div>
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Order Information */}
            <Card title="Order Information" style={{ marginBottom: '24px' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>Order Status</Text>
                  <br />
                  <Tag color={statusInfo.color} style={{ marginTop: '4px' }}>
                    {statusInfo.text}
                  </Tag>
                </div>
                
                <Divider style={{ margin: '8px 0' }} />
                
                <div>
                  <Text strong>Payment Status</Text>
                  <br />
                  <Tag color={paymentInfo.color} style={{ marginTop: '4px' }}>
                    {paymentInfo.text}
                  </Tag>
                </div>
                
                <div>
                  <Text strong>Payment Method</Text>
                  <br />
                  <Text>
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                     order.paymentMethod === 'upi' ? 'UPI Payment' :
                     order.paymentMethod === 'card' ? 'Credit/Debit Card' :
                     order.paymentMethod?.toUpperCase()}
                  </Text>
                </div>
                
                {estimatedDelivery && (
                  <div>
                    <Text strong>Estimated Delivery</Text>
                    <br />
                    <Space style={{ marginTop: '4px' }}>
                      <TruckOutlined />
                      <Text>
                        {estimatedDelivery.toLocaleDateString('en-IN', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </Space>
                  </div>
                )}
              </Space>
            </Card>

            {/* Shipping Address */}
            <Card title="Shipping Address" style={{ marginBottom: '24px' }}>
              {order.shippingAddress ? (
                <div>
                  <Text strong>
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </Text>
                  <br />
                  <Text>{order.shippingAddress.address}</Text>
                  <br />
                  <Text>
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </Text>
                  <br />
                  <Space style={{ marginTop: '8px' }}>
                    <PhoneOutlined />
                    <Text>{order.shippingAddress.phone}</Text>
                  </Space>
                  {order.shippingAddress.email && (
                    <>
                      <br />
                      <Space style={{ marginTop: '4px' }}>
                        <MailOutlined />
                        <Text>{order.shippingAddress.email}</Text>
                      </Space>
                    </>
                  )}
                </div>
              ) : (
                <Text type="secondary">No shipping address available</Text>
              )}
            </Card>

            {/* Need Help */}
            <Card title="Need Help?" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>Contact our customer support for any queries about your order.</Text>
                <Space direction="vertical" size="small">
                  <Space>
                    <PhoneOutlined />
                    <Text>+91 9876543210</Text>
                  </Space>
                  <Space>
                    <MailOutlined />
                    <Text>support@ecoprintsolutions.com</Text>
                  </Space>
                </Space>
                <Button type="primary" block style={{ marginTop: '12px' }}>
                  Contact Support
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default OrderDetails;