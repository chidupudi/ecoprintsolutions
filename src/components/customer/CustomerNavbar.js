// src/customer/components/CustomerNavbar.js
import React, { useState } from 'react';
import { 
  Layout, Menu, Badge, Avatar, Dropdown, Space, Input, 
  Button, Drawer, Typography 
} from 'antd';
import { 
  HomeOutlined, ShoppingOutlined, ShoppingCartOutlined,
  UserOutlined, LoginOutlined, LogoutOutlined, SearchOutlined,
  MenuOutlined, PhoneOutlined, MailOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../customer/hooks/useCart';

const { Header } = Layout;
const { Search } = Input;
const { Title } = Typography;

const CustomerNavbar = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, logout } = useAuth();
  const { cartItems, getTotalItems } = useCart();

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        My Profile
      </Menu.Item>
      <Menu.Item key="orders" icon={<ShoppingOutlined />} onClick={() => navigate('/orders')}>
        Order History
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Products',
    },
    {
      key: '/products/cartridges',
      label: 'Cartridges',
    },
    {
      key: '/products/inks',
      label: 'Inks',
    },
    {
      key: '/products/drums',
      label: 'Drums',
    },
  ];

  const onMenuClick = ({ key }) => {
    navigate(key);
    setMobileMenuVisible(false);
  };

  return (
    <>
      <Header className="customer-navbar" style={{ background: '#001529', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          {/* Logo */}
          <div 
            style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Eco Print Solutions
          </div>

          {/* Desktop Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="desktop-menu" style={{ display: 'none' }}>
              <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={onMenuClick}
                style={{ background: 'transparent', border: 'none' }}
              />
            </div>

            {/* Search */}
            <Search
              placeholder="Search products..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 250, display: searchVisible ? 'block' : 'none' }}
            />
            
            <Space>
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={() => setSearchVisible(!searchVisible)}
                style={{ color: 'white' }}
              />

              {/* Cart */}
              <Badge count={getTotalItems()} showZero={false}>
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => navigate('/cart')}
                  style={{ color: 'white' }}
                />
              </Badge>

              {/* User Menu */}
              {currentUser ? (
                <Dropdown overlay={userMenu} placement="bottomRight">
                  <Avatar 
                    icon={<UserOutlined />} 
                    style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
                  />
                </Dropdown>
              ) : (
                <Space>
                  <Button type="link" onClick={() => navigate('/login')} style={{ color: 'white' }}>
                    Login
                  </Button>
                  <Button type="primary" onClick={() => navigate('/register')}>
                    Sign Up
                  </Button>
                </Space>
              )}

              {/* Mobile Menu Button */}
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuVisible(true)}
                style={{ color: 'white', display: 'block' }}
                className="mobile-menu-button"
              />
            </Space>
          </div>
        </div>
      </Header>

      {/* Mobile Menu Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        visible={mobileMenuVisible}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={onMenuClick}
        />
        
        <div style={{ padding: '20px 0', borderTop: '1px solid #f0f0f0', marginTop: '20px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneOutlined />
              <span>+91 9876543210</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MailOutlined />
              <span>info@ecoprintsolutions.com</span>
            </div>
          </Space>
        </div>
      </Drawer>

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-menu {
            display: block !important;
          }
          .mobile-menu-button {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default CustomerNavbar;