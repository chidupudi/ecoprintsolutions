// src/components//dashboard/Dashboard.js
import React, { useState } from 'react';
import { Layout, Menu, Typography, Button, Avatar, Dropdown, Space } from 'antd';
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  InboxOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import components (we'll create these)
import DashboardHome from './DashboardHome';
import ProductList from '../inventory/ProductList';
import AddProduct from '../inventory/AddProduct';
import InventoryTransactions from '../inventory/InventoryTransactions';
import PurchaseOrders from '../inventory/PurchaseOrders';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
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
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: 'Inventory',
      children: [
        {
          key: '/inventory/products',
          label: 'Products',
        },
        {
          key: '/inventory/add-product',
          label: 'Add Product',
        },
        {
          key: '/inventory/transactions',
          label: 'Transactions',
        },
        {
          key: '/inventory/purchase-orders',
          label: 'Purchase Orders',
        },
      ],
    },
    {
      key: 'sales',
      icon: <ShoppingOutlined />,
      label: 'Sales',
      children: [
        {
          key: '/sales/orders',
          label: 'Orders',
        },
        {
          key: '/sales/customers',
          label: 'Customers',
        },
      ],
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
    },
    {
      key: '/storefront',
      icon: <ShopOutlined />,
      label: 'Storefront',
    },
  ];

  const onMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 6px rgba(0,21,41,0.05)',
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {!collapsed ? (
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              EcoPrint
            </Title>
          ) : (
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              EP
            </Title>
          )}
        </div>
        
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={onMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div></div>
          
          <Space>
            <span>Welcome, {userProfile?.displayName || currentUser?.email}</span>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Avatar 
                icon={<UserOutlined />} 
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ 
          margin: '24px 16px',
          padding: 24,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/inventory/products" element={<ProductList />} />
            <Route path="/inventory/add-product" element={<AddProduct />} />
            <Route path="/inventory/transactions" element={<InventoryTransactions />} />
            <Route path="/inventory/purchase-orders" element={<PurchaseOrders />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;