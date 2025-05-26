// src/components/DashboardHome.js
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Progress } from 'antd';
import { 
  ShoppingOutlined, 
  InboxOutlined, 
  DollarOutlined,
  TrophyOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { dbService } from '../../services/dbService';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalRevenue: 0,
    todaySales: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load products
      const products = await dbService.getAll('products');
      const lowStock = products.filter(product => 
        product.currentStock <= product.minStockLevel
      );

      setStats({
        totalProducts: products.length,
        lowStockItems: lowStock.length,
        totalRevenue: 125000, // This would come from sales data
        todaySales: 12500
      });

      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock, record) => (
        <Tag color={stock <= record.minStockLevel ? 'red' : 'green'}>
          {stock}
        </Tag>
      ),
    },
    {
      title: 'Min Level',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
    },
    {
      title: 'Action Required',
      key: 'action',
      render: () => <Tag color="orange">Reorder</Tag>,
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={stats.lowStockItems}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Sales"
              value={stats.todaySales}
              prefix={<TrophyOutlined />}
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Inventory Health" bordered={false}>
            <div style={{ marginBottom: 16 }}>
              <span>Stock Status</span>
              <Progress 
                percent={Math.round(((stats.totalProducts - stats.lowStockItems) / stats.totalProducts) * 100)} 
                status={stats.lowStockItems > 0 ? "exception" : "success"}
                format={percent => `${percent}% Healthy`}
              />
            </div>
            <div>
              <span style={{ color: '#52c41a' }}>● In Stock: {stats.totalProducts - stats.lowStockItems}</span><br/>
              <span style={{ color: '#ff4d4f' }}>● Low Stock: {stats.lowStockItems}</span>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" bordered={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Tag color="blue" style={{ cursor: 'pointer', textAlign: 'center', padding: '8px' }}>
                Add New Product
              </Tag>
              <Tag color="green" style={{ cursor: 'pointer', textAlign: 'center', padding: '8px' }}>
                Create Purchase Order
              </Tag>
              <Tag color="orange" style={{ cursor: 'pointer', textAlign: 'center', padding: '8px' }}>
                View Reports
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert Table */}
      {stats.lowStockItems > 0 && (
        <Card 
          title="🚨 Low Stock Alert" 
          style={{ marginTop: 24 }}
          extra={<Tag color="red">Action Required</Tag>}
        >
          <Table
            columns={lowStockColumns}
            dataSource={lowStockProducts}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default DashboardHome;