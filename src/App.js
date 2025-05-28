import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './components/customer/hooks/useCart';
import Dashboard from './components/dashboard/Dashboard';
import CustomerApp from './components/customer/CustomerApp';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './components/customer/pages/NotFound';
import './App.css';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin/login" element={<Login />} />
                <Route 
                  path="/admin/*" 
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                
                {/* Customer Routes */}
                <Route path="/*" element={<CustomerApp />} />
                
                {/* Fallback 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;