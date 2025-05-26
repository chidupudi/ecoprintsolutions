import React, { useState } from 'react';
import { 
  Card, Row, Col, Form, Input, Button, Steps, 
  Typography, Space, Divider, Select, message,
  Radio, Checkbox, Alert, Spin 
} from 'antd';
import { 
  UserOutlined, HomeOutlined, CreditCardOutlined,
  CheckCircleOutlined, ArrowLeftOutlined, SafetyCertificateOutlined,
  TruckOutlined, GiftOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../../../context/AuthContext';
import { dbService } from '../../../services/dbService';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingInfo, setShippingInfo] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { currentUser, userProfile } = useAuth();

  const steps = [
    {
      title: 'Shipping Details',
      icon: <HomeOutlined />,
      description: 'Delivery information'
    },
    {
      title: 'Payment Method',
      icon: <CreditCardOutlined />,
      description: 'Choose payment option'
    },
    {
      title: 'Review & Place Order',
      icon: <CheckCircleOutlined />,
      description: 'Confirm your order'
    }
  ];

  // Calculate pricing
  const subtotal = getTotalPrice();
  const taxRate = 0.18; // 18% GST
  const taxAmount = subtotal * taxRate;
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const totalAmount = subtotal + taxAmount + shippingFee;

  const handleShippingSubmit = async (values) => {
    setShippingInfo(values);
    setCurrentStep(1);
  };

  const handlePaymentSubmit = () => {
    if (!paymentMethod) {
      message.error('Please select a payment method');
      return;
    }
    setCurrentStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!termsAccepted) {
      message.error('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerId: currentUser.uid,
        customerName: userProfile?.displayName || shippingInfo?.firstName + ' ' + shippingInfo?.lastName,
        customerEmail: currentUser.email,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        shippingAddress: shippingInfo,
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        tax: taxAmount,
        shippingFee: shippingFee,
        totalAmount: totalAmount,
        status: 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        notes: shippingInfo?.notes || ''
      };

      const orderId = await dbService.create('sales_orders', orderData);
      
      message.success('Order placed successfully!');
      clearCart();
      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error('Order placement error:', error);
      message.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ShippingForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleShippingSubmit}
      initialValues={{
        firstName: userProfile?.displayName?.split(' ')[0] || '',
        lastName: userProfile?.displayName?.split(' ')[1] || '',
        email: currentUser?.email || '',
        phone: userProfile?.phone || ''
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: 'Please enter first name!' }]}
          >
            <Input size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: 'Please enter last name!' }]}
          >
            <Input size="large" />
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
            <Input size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[
              { required: true, message: 'Please enter phone number!' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit phone number!' }
            ]}
          >
            <Input size="large" placeholder="9876543210" />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item
            label="Street Address"
            name="address"
            rules={[{ required: true, message: 'Please enter address!' }]}
          >
            <TextArea rows={3} placeholder="House number, street name, area" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: 'Please enter city!' }]}
          >
            <Input size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            label="State"
            name="state"
            rules={[{ required: true, message: 'Please select state!' }]}
          >
            <Select size="large" placeholder="Select state" showSearch>
              <Option value="Andhra Pradesh">Andhra Pradesh</Option>
              <Option value="Telangana">Telangana</Option>
              <Option value="Karnataka">Karnataka</Option>
              <Option value="Tamil Nadu">Tamil Nadu</Option>
              <Option value="Kerala">Kerala</Option>
              <Option value="Maharashtra">Maharashtra</Option>
              <Option value="Gujarat">Gujarat</Option>
              <Option value="Rajasthan">Rajasthan</Option>
              <Option value="Delhi">Delhi</Option>
              <Option value="West Bengal">West Bengal</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            label="PIN Code"
            name="pincode"
            rules={[
              { required: true, message: 'Please enter PIN code!' },
              { pattern: /^[0-9]{6}$/, message: 'Please enter valid 6-digit PIN code!' }
            ]}
          >
            <Input size="large" placeholder="500001" />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item
            label="Delivery Instructions (Optional)"
            name="notes"
          >
            <TextArea 
              rows={2} 
              placeholder="Any special delivery instructions..."
              maxLength={200}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <div style={{ textAlign: 'right', marginTop: '24px' }}>
        <Button type="primary" htmlType="submit" size="large">
          Continue to Payment
        </Button>
      </div>
    </Form>
  );

  const PaymentForm = () => (
    <div>
      <Title level={4} style={{ marginBottom: '24px' }}>Select Payment Method</Title>
      
      <Radio.Group 
        value={paymentMethod} 
        onChange={(e) => setPaymentMethod(e.target.value)}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Radio value="cod">
            <Card 
              size="small" 
              style={{ width: '100%', marginLeft: '8px', cursor: 'pointer' }}
              hoverable
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '2rem' }}>💵</div>
                <div>
                  <Text strong style={{ fontSize: '16px' }}>Cash on Delivery</Text>
                  <br />
                  <Text type="secondary">Pay when you receive your order</Text>
                  <br />
                  <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                    ✓ Most popular • ✓ No online payment required
                  </Text>
                </div>
              </div>
            </Card>
          </Radio>
          
          <Radio value="upi">
            <Card 
              size="small" 
              style={{ width: '100%', marginLeft: '8px', cursor: 'pointer' }}
              hoverable
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '2rem' }}>📱</div>
                <div>
                  <Text strong style={{ fontSize: '16px' }}>UPI Payment</Text>
                  <br />
                  <Text type="secondary">PhonePe, Google Pay, Paytm, and more</Text>
                  <br />
                  <Text style={{ color: '#1890ff', fontSize: '12px' }}>
                    ✓ Instant payment • ✓ Secure & fast
                  </Text>
                </div>
              </div>
            </Card>
          </Radio>
          
          <Radio value="card">
            <Card 
              size="small" 
              style={{ width: '100%', marginLeft: '8px', cursor: 'pointer' }}
              hoverable
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '2rem' }}>💳</div>
                <div>
                  <Text strong style={{ fontSize: '16px' }}>Credit/Debit Card</Text>
                  <br />
                  <Text type="secondary">Visa, Mastercard, RuPay accepted</Text>
                  <br />
                  <Text style={{ color: '#722ed1', fontSize: '12px' }}>
                    ✓ All major cards • ✓ EMI available
                  </Text>
                </div>
              </div>
            </Card>
          </Radio>

          <Radio value="netbanking">
            <Card 
              size="small" 
              style={{ width: '100%', marginLeft: '8px', cursor: 'pointer' }}
              hoverable
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '2rem' }}>🏦</div>
                <div>
                  <Text strong style={{ fontSize: '16px' }}>Net Banking</Text>
                  <br />
                  <Text type="secondary">All major banks supported</Text>
                  <br />
                  <Text style={{ color: '#faad14', fontSize: '12px' }}>
                    ✓ Direct bank transfer • ✓ Highly secure
                  </Text>
                </div>
              </div>
            </Card>
          </Radio>
        </Space>
      </Radio.Group>
      
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Space>
          <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Your payment information is encrypted and secure
          </Text>
        </Space>
      </div>
      
      <div style={{ textAlign: 'right', marginTop: '32px' }}>
        <Space>
          <Button size="large" onClick={() => setCurrentStep(0)}>
            Back to Shipping
          </Button>
          <Button type="primary" size="large" onClick={handlePaymentSubmit}>
            Review Order
          </Button>
        </Space>
      </div>
    </div>
  );

  const OrderReview = () => (
    <div>
      <Title level={4} style={{ marginBottom: '24px' }}>Review Your Order</Title>
      
      {/* Order Items */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={5}>Order Items ({cartItems.length})</Title>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {cartItems.map(item => (
            <div key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  background: '#f5f5f5',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text>📦</Text>
                </div>
                <div>
                  <Text strong>{item.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    SKU: {item.sku} • Qty: {item.quantity}
                  </Text>
                </div>
              </div>
              <Text strong>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </div>
          ))}
        </div>
      </Card>

      {/* Shipping Address */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={5}>Delivery Address</Title>
        <div>
          <Text strong>{shippingInfo?.firstName} {shippingInfo?.lastName}</Text>
          <br />
          <Text>{shippingInfo?.address}</Text>
          <br />
          <Text>{shippingInfo?.city}, {shippingInfo?.state} - {shippingInfo?.pincode}</Text>
          <br />
          <Space style={{ marginTop: '8px' }}>
            <Text>📞 {shippingInfo?.phone}</Text>
            <Text>📧 {shippingInfo?.email}</Text>
          </Space>
          {shippingInfo?.notes && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Note: {shippingInfo.notes}
              </Text>
            </>
          )}
        </div>
      </Card>

      {/* Payment Method */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={5}>Payment Method</Title>
        <Text>
          {paymentMethod === 'cod' ? '💵 Cash on Delivery' : 
           paymentMethod === 'upi' ? '📱 UPI Payment' : 
           paymentMethod === 'card' ? '💳 Credit/Debit Card' :
           paymentMethod === 'netbanking' ? '🏦 Net Banking' : paymentMethod}
        </Text>
      </Card>

      {/* Delivery Information */}
      <Alert
        message="Estimated Delivery: 2-3 business days"
        description="Your order will be delivered between 9 AM to 8 PM. You'll receive SMS updates about your delivery."
        type="info"
        showIcon
        icon={<TruckOutlined />}
        style={{ marginBottom: '24px' }}
      />

      {/* Terms and Conditions */}
      <div style={{ marginBottom: '24px' }}>
        <Checkbox 
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        >
          I agree to the <a href="/terms" target="_blank">Terms & Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
        </Checkbox>
      </div>
      
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button size="large" onClick={() => setCurrentStep(1)}>
            Back to Payment
          </Button>
          <Button 
            type="primary" 
            size="large"
            loading={loading}
            onClick={handlePlaceOrder}
            disabled={!termsAccepted}
          >
            {loading ? 'Placing Order...' : `Place Order - ₹${totalAmount.toFixed(2)}`}
          </Button>
        </Space>
      </div>
    </div>
  );

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div style={{ 
        padding: '40px 20px', 
        minHeight: 'calc(100vh - 64px)',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <Title level={3}>Your cart is empty</Title>
          <Text type="secondary">Add some items to your cart before checkout</Text>
          <div style={{ marginTop: '24px' }}>
            <Button type="primary" size="large" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/cart')}
            style={{ marginBottom: '16px' }}
          >
            Back to Cart
          </Button>
          <Title level={2}>Checkout</Title>
        </div>

        {/* Steps */}
        <Card style={{ marginBottom: '24px' }}>
          <Steps current={currentStep} responsive={false}>
            {steps.map((step, index) => (
              <Step 
                key={index}
                title={step.title} 
                icon={step.icon}
                description={step.description}
              />
            ))}
          </Steps>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card>
              {currentStep === 0 && <ShippingForm />}
              {currentStep === 1 && <PaymentForm />}
              {currentStep === 2 && <OrderReview />}
            </Card>
          </Col>

          {/* Order Summary Sidebar */}
          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: '20px' }}>
              <Card title="Order Summary">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text>Subtotal ({cartItems.length} items)</Text>
                      <Text>₹{subtotal.toFixed(2)}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text>Shipping</Text>
                      <Text style={{ color: shippingFee === 0 ? '#52c41a' : '#000' }}>
                        {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text>Tax (18% GST)</Text>
                      <Text>₹{taxAmount.toFixed(2)}</Text>
                    </div>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Title level={4}>Total</Title>
                      <Title level={4} style={{ color: '#1890ff' }}>
                        ₹{totalAmount.toFixed(2)}
                      </Title>
                    </div>
                  </div>

                  {/* Savings */}
                  {subtotal >= 500 && (
                    <Alert
                      message={`You saved ₹50 on shipping!`}
                      type="success"
                      showIcon
                      icon={<GiftOutlined />}
                    />
                  )}
                </Space>
              </Card>

              {/* Security Info */}
              <Card size="small" style={{ marginTop: '16px', textAlign: 'center' }}>
                <Space direction="vertical" size="small">
                  <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                  <Text strong>Secure Checkout</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Your information is protected with 256-bit SSL encryption
                  </Text>
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckoutPage;