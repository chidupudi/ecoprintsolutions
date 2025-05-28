// src/customer/CustomerApp.js - UPDATED WITH APPROVAL GUARDS
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, Alert, Card, Button, Space, Typography } from 'antd';
import { ClockCircleOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import CustomerNavbar from './CustomerNavbar';
import CustomerHome from './pages/CustomerHome';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from '../../context/AuthContext';
import './customer.css';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

// Component to show when user is pending approval
const PendingApprovalPage = () => {
  const { userProfile, logout } = useAuth();
  
  return (
    <div style={{ 
      padding: '40px 20px', 
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <Card style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px' }}>
          <ClockCircleOutlined style={{ fontSize: '4rem', color: '#faad14' }} />
        </div>
        
        <Title level={2} style={{ color: '#faad14' }}>
          Account Pending Approval
        </Title>
        
        <div style={{ marginBottom: '24px' }}>
          <Text style={{ fontSize: '16px', lineHeight: '1.6' }}>
            Thank you for registering as a wholesale customer with Eco Print Solutions!
            <br /><br />
            Your account is currently being reviewed by our admin team. 
            Once approved, you'll have access to:
          </Text>
        </div>
        
        <div style={{ 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Wholesale pricing on all products</li>
            <li>Bulk order discounts</li>
            <li>Priority customer support</li>
            <li>Extended payment terms</li>
            <li>Dedicated account manager</li>
          </ul>
        </div>
        
        <Alert
          message="What happens next?"
          description={
            <div style={{ textAlign: 'left' }}>
              <p><strong>1. Review Process:</strong> Our team will verify your business information</p>
              <p><strong>2. Email Notification:</strong> You'll receive an email once your account is approved</p>
              <p><strong>3. Access Granted:</strong> After approval, you can log in and start shopping</p>
            </div>
          }
          type="info"
          style={{ marginBottom: '24px' }}
        />
        
        <div style={{ marginBottom: '24px' }}>
          <Text strong>Account Details:</Text>
          <div style={{ marginTop: '8px' }}>
            <Text>Name: {userProfile?.displayName}</Text><br />
            <Text>Email: {userProfile?.email}</Text><br />
            <Text>Type: Wholesale Customer</Text><br />
            <Text>Status: Pending Approval</Text>
          </div>
        </div>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>Need Help?</Title>
            <Space direction="vertical" size="small">
              <Space>
                <MailOutlined />
                <Text>support@ecoprintsolutions.com</Text>
              </Space>
              <Space>
                <PhoneOutlined />
                <Text>+91 9876543210</Text>
              </Space>
              <Text type="secondary">Available Mon-Sat: 9 AM - 8 PM</Text>
            </Space>
          </div>
          
          <Button type="primary" onClick={logout} size="large">
            Sign Out
          </Button>
        </Space>
      </Card>
    </div>
  );
};

// Component to show when user is rejected
const RejectedApprovalPage = () => {
  const { userProfile, logout } = useAuth();
  
  return (
    <div style={{ 
      padding: '40px 20px', 
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <Card style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <Title level={2} style={{ color: '#ff4d4f' }}>
          Application Not Approved
        </Title>
        
        <div style={{ marginBottom: '24px' }}>
          <Text style={{ fontSize: '16px' }}>
            Unfortunately, your wholesale account application has not been approved at this time.
          </Text>
        </div>
        
        {userProfile?.approvalReason && (
          <Alert
            message="Reason"
            description={userProfile.approvalReason}
            type="error"
            style={{ marginBottom: '24px' }}
          />
        )}
        
        <div style={{ marginBottom: '24px' }}>
          <Text>
            You can still shop with us as a retail customer, or contact our support team 
            if you believe this decision was made in error.
          </Text>
        </div>
        
        <Space>
          <Button type="primary" onClick={() => window.location.href = '/register'}>
            Register as Retail Customer
          </Button>
          <Button onClick={logout}>
            Sign Out
          </Button>
        </Space>
      </Card>
    </div>
  );
};

const CustomerApp = () => {
  const { currentUser, userProfile, canAccessFeature, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  // Check if logged-in user needs approval
  if (currentUser && userProfile) {
    if (userProfile.customerType === 'wholesale' && userProfile.approvalStatus === 'pending') {
      return (
        <Layout style={{ minHeight: '100vh' }}>
          <CustomerNavbar />
          <Content style={{ marginTop: 64 }}>
            <PendingApprovalPage />
          </Content>
        </Layout>
      );
    }
    
    if (userProfile.customerType === 'wholesale' && userProfile.approvalStatus === 'rejected') {
      return (
        <Layout style={{ minHeight: '100vh' }}>
          <CustomerNavbar />
          <Content style={{ marginTop: 64 }}>
            <RejectedApprovalPage />
          </Content>
        </Layout>
      );
    }
  }

  return (
    <ErrorBoundary>
      <Layout style={{ minHeight: '100vh' }}>
        <CustomerNavbar />
        
        <Content style={{ marginTop: 64 }}>
          <Routes>
            <Route path="/" element={<CustomerHome />} />
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<CustomerRegister />} />
            
            {/* Protected routes - require approval for wholesale customers */}
            <Route 
              path="/products" 
              element={
                canAccessFeature('shopping') ? 
                <ProductsPage /> : 
                <CustomerLogin />
              } 
            />
            <Route 
              path="/products/:category" 
              element={
                canAccessFeature('shopping') ? 
                <ProductsPage /> : 
                <CustomerLogin />
              } 
            />
            <Route 
              path="/cart" 
              element={
                canAccessFeature('shopping') ? 
                <CartPage /> : 
                <CustomerLogin />
              } 
            />
            
            {/* Authenticated routes */}
            {currentUser && canAccessFeature('checkout') && (
              <>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} />
              </>
            )}
            
            {/* Fallback for protected routes when not logged in or not approved */}
            {(!currentUser || !canAccessFeature('checkout')) && (
              <>
                <Route path="/checkout" element={<CustomerLogin />} />
                <Route path="/profile" element={<CustomerLogin />} />
                <Route path="/orders" element={<CustomerLogin />} />
                <Route path="/orders/:orderId" element={<CustomerLogin />} />
              </>
            )}
          </Routes>
        </Content>

        <Footer style={{ textAlign: 'center', backgroundColor: '#001529', color: 'white' }}>
          <div style={{ padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                <div>
                  <h3 style={{ color: 'white', marginBottom: '15px' }}>Eco Print Solutions</h3>
                  <p style={{ margin: 0, opacity: 0.8 }}>
                    Your trusted partner for all printing needs. Quality products, competitive prices, and excellent service.
                  </p>
                </div>
                
                <div>
                  <h4 style={{ color: 'white', marginBottom: '15px' }}>Quick Links</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <a href="/products" style={{ color: 'rgba(255,255,255,0.8)' }}>All Products</a>
                    <a href="/products/cartridges" style={{ color: 'rgba(255,255,255,0.8)' }}>Cartridges</a>
                    <a href="/products/inks" style={{ color: 'rgba(255,255,255,0.8)' }}>Inks</a>
                    <a href="/products/drums" style={{ color: 'rgba(255,255,255,0.8)' }}>Drums</a>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ color: 'white', marginBottom: '15px' }}>Customer Service</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>📞 +91 9876543210</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>📧 info@ecoprintsolutions.com</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>🕒 Mon-Sat: 9 AM - 8 PM</span>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ color: 'white', marginBottom: '15px' }}>Policies</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <a href="/privacy" style={{ color: 'rgba(255,255,255,0.8)' }}>Privacy Policy</a>
                    <a href="/terms" style={{ color: 'rgba(255,255,255,0.8)' }}>Terms & Conditions</a>
                    <a href="/returns" style={{ color: 'rgba(255,255,255,0.8)' }}>Return Policy</a>
                    <a href="/shipping" style={{ color: 'rgba(255,255,255,0.8)' }}>Shipping Info</a>
                  </div>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  © 2024 Eco Print Solutions. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </Footer>
      </Layout>
    </ErrorBoundary>
  );
};

export default CustomerApp;