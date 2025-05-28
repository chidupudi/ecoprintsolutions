// src/components/dashboard/Dashboard.js - FIXED VERSION
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
  ShopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import components
import DashboardHome from './DashboardHome';
import ProductList from '../inventory/ProductList';
import AddProduct from '../inventory/AddProduct';
import StockAdjustment from '../inventory/StockAdjustment';
import InventoryTransactions from '../inventory/InventoryTransactions';
import PurchaseOrders from '../inventory/PurchaseOrders';
import PurchaseOrderCreate from '../inventory/PurchaseOrderCreate';
import CustomerList from '../customer/CustomerList';
import WholesaleApprovals from '../customer/WholesaleApprovals';
import SupplierList from '../suppliers/SupplierList';
import Reports from '../reports/Reports';
import Storefront from '../storefront/Storefront';
import Settings from '../settings/Settings';

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
      navigate('/admin/login');
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
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: 'Inventory',
      children: [
        {
          key: '/admin/inventory/products',
          label: 'Products',
        },
        {
          key: '/admin/inventory/add-product',
          label: 'Add Product',
        },
        {
          key: '/admin/inventory/stock-adjustment',
          label: 'Stock Adjustment',
        },
        {
          key: '/admin/inventory/transactions',
          label: 'Transactions',
        },
        {
          key: '/admin/inventory/purchase-orders',
          label: 'Purchase Orders',
        },
        {
          key: '/admin/inventory/create-purchase-order',
          label: 'Create PO',
        },
      ],
    },
    {
      key: 'sales',
      icon: <ShoppingOutlined />,
      label: 'Sales',
      children: [
        {
          key: '/admin/sales/customers',
          label: 'All Customers',
        },
        {
          key: '/admin/sales/customer-approval',
          label: 'Wholesale Approvals',
        },
      ],
    },
    {
      key: '/admin/suppliers',
      icon: <UserOutlined />,
      label: 'Suppliers',
    },
    {
      key: '/admin/reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
    },
    {
      key: '/admin/storefront',
      icon: <ShopOutlined />,
      label: 'Storefront',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const onMenuClick = ({ key }) => {
    navigate(key);
  };

  // Get the current path to match with menu
  const getCurrentMenuKey = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') {
      return '/admin';
    }
    return path;
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
          selectedKeys={[getCurrentMenuKey()]}
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
            <Route path="/inventory/stock-adjustment" element={<StockAdjustment />} />
            <Route path="/inventory/transactions" element={<InventoryTransactions />} />
            <Route path="/inventory/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/inventory/create-purchase-order" element={<PurchaseOrderCreate />} />
            <Route path="/sales/customers" element={<CustomerList />} />
            <Route path="/sales/customer-approval" element={<WholesaleApprovals />} />
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/storefront" element={<Storefront />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;