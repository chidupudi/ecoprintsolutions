// src/customer/pages/CartPage.js - COMPLETE VERSION
import React from 'react';
import { 
  Card, Row, Col, Button, InputNumber, Typography, 
  Space, Divider, Empty, Tag, message, Tooltip,
  Popconfirm, Alert
} from 'antd';
import { 
  DeleteOutlined, ShoppingOutlined, ArrowLeftOutlined,
  PrinterOutlined, PlusOutlined, MinusOutlined, 
  ClearOutlined, SafetyCertificateOutlined,
  TruckOutlined, GiftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../../../context/AuthContext';

const { Title, Text } = Typography;

const CartPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotalPrice,
    getTotalItems 
  } = useCart();

  const handleCheckout = () => {
    if (!currentUser) {
      message.info('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const subtotal = getTotalPrice();
  const taxRate = 0.18; // 18% GST
  const taxAmount = subtotal * taxRate;
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const totalAmount = subtotal + taxAmount + shippingFee;

  const CartItem = ({ item }) => (
    <Card 
      style={{ marginBottom: '16px' }}
      bodyStyle={{ padding: '16px' }}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Product Image */}
        <Col xs={24} sm={4}>
          <div style={{ 
            height: '80px', 
            background: '#f5f5f5', 
            borderRadius: '8px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => navigate(`/product/${item.id}`)}
          >
            {item.image ? (
              <img 
                src={item.image} 
                alt={item.name}
                style={{ maxHeight: '70px', maxWidth: '70px', objectFit: 'contain' }}
              />
            ) : (
              <PrinterOutlined style={{ fontSize: '2rem', color: '#d9d9d9' }} />
            )}
          </div>
        </Col>
        
        {/* Product Info */}
        <Col xs={24} sm={10}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Title 
              level={5} 
              style={{ margin: 0, cursor: 'pointer' }}
              onClick={() => navigate(`/product/${item.id}`)}
            >
              {item.name}
            </Title>
            <Tag color="blue">{item.sku}</Tag>
            <Space>
              <Text type="secondary">Stock: {item.currentStock}</Text>
              {item.currentStock <= 5 && (
                <Tag color="orange" size="small">Low Stock</Tag>
              )}
            </Space>
          </Space>
        </Col>
        
        {/* Unit Price */}
        <Col xs={12} sm={3}>
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
              ₹{item.price}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>per item</Text>
          </div>
        </Col>
        
        {/* Quantity Controls */}
        <Col xs={12} sm={4}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button 
                size="small" 
                icon={<MinusOutlined />}
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              />
              <InputNumber
                size="small"
                min={1}
                max={item.currentStock}
                value={item.quantity}
                onChange={(value) => updateQuantity(item.id, value)}
                style={{ 
                  width: '60px',
                  textAlign: 'center'
                }}
              />
              <Button 
                size="small" 
                icon={<PlusOutlined />}
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.currentStock}
              />
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Max: {item.currentStock}
            </Text>
          </div>
        </Col>
        
        {/* Total Price & Actions */}
        <Col xs={24} sm={3}>
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
              ₹{(item.price * item.quantity).toFixed(2)}
            </Text>
            <br />
            <Popconfirm
              title="Remove this item?"
              description="Are you sure you want to remove this item from your cart?"
              onConfirm={() => removeFromCart(item.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                style={{ marginTop: '8px' }}
                size="small"
              >
                Remove
              </Button>
            </Popconfirm>
          </div>
        </Col>
      </Row>

      {/* Stock Warning */}
      {item.quantity > item.currentStock && (
        <Alert
          message="Insufficient Stock"
          description={`Only ${item.currentStock} items available. Please adjust quantity.`}
          type="warning"
          showIcon
          style={{ marginTop: '12px' }}
        />
      )}
    </Card>
  );

  // Empty Cart State
  if (cartItems.length === 0) {
    return (
      <div style={{ 
        padding: '40px 20px', 
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <Empty 
            image={<ShoppingOutlined style={{ fontSize: '4rem', color: '#d9d9d9' }} />}
            description={
              <div>
                <Title level={3} style={{ color: '#666' }}>Your cart is empty</Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Looks like you haven't added any items to your cart yet.
                  <br />
                  Start shopping to find amazing deals on printing supplies!
                </Text>
              </div>
            }
          />
          <Space size="large" style={{ marginTop: '32px' }}>
            <Button 
              type="primary" 
              size="large"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/products')}
            >
              Start Shopping
            </Button>
            <Button 
              size="large"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Space>
          
          {/* Featured Categories */}
          <div style={{ marginTop: '40px' }}>
            <Text type="secondary">Popular Categories:</Text>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Button type="link" onClick={() => navigate('/products/cartridges')}>
                Cartridges
              </Button>
              <Button type="link" onClick={() => navigate('/products/inks')}>
                Inks
              </Button>
              <Button type="link" onClick={() => navigate('/products/drums')}>
                Drums
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cart with Items
  return (
    <div style={{ padding: '20px', minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Space size="large">
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={handleContinueShopping}
              size="large"
            >
              Continue Shopping
            </Button>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Shopping Cart
              </Title>
              <Text type="secondary">
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
              </Text>
            </div>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          {/* Cart Items */}
          <Col xs={24} lg={16}>
            <div style={{ marginBottom: '20px' }}>
              {/* Free Shipping Banner */}
              {subtotal < 500 && (
                <Alert
                  message={`Add ₹${(500 - subtotal).toFixed(2)} more for FREE shipping!`}
                  type="info"
                  showIcon
                  icon={<TruckOutlined />}
                  style={{ marginBottom: '16px' }}
                />
              )}
              
              {subtotal >= 500 && (
                <Alert
                  message="🎉 You qualify for FREE shipping!"
                  type="success"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}
            </div>

            {/* Cart Items List */}
            <div>
              {cartItems.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
              
            {/* Cart Actions */}
            <Card style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <Space>
                  <Popconfirm
                    title="Clear entire cart?"
                    description="This will remove all items from your cart. This action cannot be undone."
                    onConfirm={clearCart}
                    okText="Yes, Clear Cart"
                    cancelText="Cancel"
                    okType="danger"
                  >
                    <Button 
                      icon={<ClearOutlined />}
                      danger
                    >
                      Clear Cart
                    </Button>
                  </Popconfirm>
                </Space>
                
                <Button 
                  onClick={handleContinueShopping}
                  size="large"
                >
                  Continue Shopping
                </Button>
              </div>
            </Card>
          </Col>

          {/* Order Summary */}
          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: '20px' }}>
              {/* Order Summary Card */}
              <Card title="Order Summary" style={{ marginBottom: '16px' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* Price Breakdown */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text>Subtotal ({getTotalItems()} items)</Text>
                      <Text>₹{subtotal.toFixed(2)}</Text>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text>Shipping</Text>
                      <Text style={{ color: shippingFee === 0 ? '#52c41a' : undefined }}>
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

                  {/* Checkout Button */}
                  <Button 
                    type="primary" 
                    size="large" 
                    block
                    onClick={handleCheckout}
                    style={{ height: '50px', fontSize: '16px' }}
                  >
                    {currentUser ? 'Proceed to Checkout' : 'Login to Checkout'}
                  </Button>

                  {/* Security Badge */}
                  <div style={{ textAlign: 'center' }}>
                    <Space>
                      <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Secure checkout with SSL encryption
                      </Text>
                    </Space>
                  </div>
                </Space>
              </Card>

              {/* Delivery Info Card */}
              <Card 
                title={<Space><TruckOutlined />Delivery Information</Space>}
                size="small"
                style={{ marginBottom: '16px' }}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🚚</span>
                    <Text style={{ fontSize: '13px' }}>Free delivery on orders above ₹500</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📦</span>
                    <Text style={{ fontSize: '13px' }}>Same day delivery within city</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔄</span>
                    <Text style={{ fontSize: '13px' }}>30-day return policy</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>💳</span>
                    <Text style={{ fontSize: '13px' }}>Cash on delivery available</Text>
                  </div>
                </Space>
              </Card>

              {/* Savings Card */}
              {subtotal >= 1000 && (
                <Card 
                  title={<Space><GiftOutlined />You're Saving!</Space>}
                  size="small"
                  style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}
                >
                  <Space direction="vertical" size="small">
                    <Text style={{ color: '#52c41a', fontSize: '13px' }}>
                      🎉 Free shipping: ₹{shippingFee === 0 ? '50' : '0'} saved
                    </Text>
                    {subtotal >= 2000 && (
                      <Text style={{ color: '#52c41a', fontSize: '13px' }}>
                        🎁 Bulk discount eligible
                      </Text>
                    )}
                  </Space>
                </Card>
              )}

              {/* Help Card */}
              <Card size="small" style={{ marginTop: '16px' }}>
                <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
                  <Text strong style={{ fontSize: '13px' }}>Need Help?</Text>
                  <Space split={<Divider type="vertical" />}>
                    <Button type="link" size="small">Chat Support</Button>
                    <Button type="link" size="small">Call Us</Button>
                  </Space>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    +91 9876543210 | Available 9 AM - 8 PM
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

export default CartPage;