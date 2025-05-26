// src/customer/CustomerApp.js - FIXED ROUTING
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
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

const CustomerApp = () => {
  const { currentUser } = useAuth();

  return (
    <ErrorBoundary>
      <Layout style={{ minHeight: '100vh' }}>
        <CustomerNavbar />
        
        <Content style={{ marginTop: 64 }}>
          <Routes>
            <Route path="/" element={<CustomerHome />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:category" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<CustomerRegister />} />
            
            {/* Protected Routes */}
            {currentUser && (
              <>
                <Route path="/checkout" element={<CheckoutPage />} />

                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} />
              </>
            )}
            
            {/* Fallback for protected routes when not logged in */}
            {!currentUser && (
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