// src/components/reports/Reports.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Table, Select, DatePicker, 
  Button, Space, Tabs, Progress, message 
} from 'antd';
import { 
  DownloadOutlined, FileExcelOutlined, FilePdfOutlined,
  RiseOutlined, FallOutlined, WarningOutlined, ShopOutlined
} from '@ant-design/icons';
import { dbService } from '../../services/dbService';
import moment from 'moment';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [reportData, setReportData] = useState({
    inventory: {},
    sales: {},
    lowStock: [],
    topProducts: [],
    recentTransactions: []
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Load products for inventory analysis
      const products = await dbService.getAll('products');
      
      // Load transactions for the date range
      const transactions = await dbService.queryDocuments(
        'inventory_transactions',
        [],
        'createdAt',
        'desc',
        100
      );

      // Calculate inventory metrics
      const totalProducts = products.length;
      const lowStockItems = products.filter(p => p.currentStock <= p.minStockLevel);
      const outOfStockItems = products.filter(p => p.currentStock === 0);
      const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);

      // Calculate stock turns and movement
      const stockMovements = transactions.filter(t => 
        moment(t.createdAt?.toDate ? t.createdAt.toDate() : t.createdAt)
          .isBetween(dateRange[0], dateRange[1])
      );

      // Top moving products
      const productMovement = {};
      stockMovements.forEach(transaction => {
        if (!productMovement[transaction.productId]) {
          productMovement[transaction.productId] = {
            productName: transaction.productName,
            totalMovement: 0,
            stockIn: 0,
            stockOut: 0
          };
        }
        productMovement[transaction.productId].totalMovement += transaction.quantity;
        if (transaction.type === 'stock_in') {
          productMovement[transaction.productId].stockIn += transaction.quantity;
        } else {
          productMovement[transaction.productId].stockOut += transaction.quantity;
        }
      });

      const topProducts = Object.values(productMovement)
        .sort((a, b) => b.totalMovement - a.totalMovement)
        .slice(0, 10);

      setReportData({
        inventory: {
          totalProducts,
          lowStockCount: lowStockItems.length,
          outOfStockCount: outOfStockItems.length,
          totalValue,
          stockHealth: Math.round(((totalProducts - lowStockItems.length) / totalProducts) * 100)
        },
        lowStock: lowStockItems,
        topProducts,
        recentTransactions: stockMovements.slice(0, 20)
      });

    } catch (error) {
      message.error('Failed to load report data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const inventoryColumns = [
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
        <span style={{ color: stock <= record.minStockLevel ? '#ff4d4f' : '#52c41a' }}>
          {stock}
        </span>
      ),
    },
    {
      title: 'Min Level',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
    },
    {
      title: 'Value',
      key: 'value',
      render: (_, record) => `₹${(record.currentStock * record.costPrice).toLocaleString()}`,
    },
  ];

  const movementColumns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Total Movement',
      dataIndex: 'totalMovement',
      key: 'totalMovement',
      sorter: (a, b) => a.totalMovement - b.totalMovement,
    },
    {
      title: 'Stock In',
      dataIndex: 'stockIn',
      key: 'stockIn',
      render: (value) => <span style={{ color: '#52c41a' }}>+{value}</span>,
    },
    {
      title: 'Stock Out',
      dataIndex: 'stockOut',
      key: 'stockOut',
      render: (value) => <span style={{ color: '#ff4d4f' }}>-{value}</span>,
    },
  ];

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => moment(date?.toDate ? date.toDate() : date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span style={{ color: type === 'stock_in' ? '#52c41a' : '#ff4d4f' }}>
          {type === 'stock_in' ? 'IN' : 'OUT'}
        </span>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
  ];

  const exportToCSV = (data, filename) => {
    // Simple CSV export function
    message.info('Export functionality will be implemented with a proper CSV library');
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Reports & Analytics</h2>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
          />
          <Button icon={<FileExcelOutlined />} onClick={() => exportToCSV(reportData, 'inventory_report')}>
            Export Excel
          </Button>
        </Space>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={reportData.inventory.totalProducts}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={reportData.inventory.lowStockCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Out of Stock"
              value={reportData.inventory.outOfStockCount}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<FallOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Inventory Value"
              value={reportData.inventory.totalValue}
              precision={0}
              prefix="₹"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Stock Health */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Inventory Health">
            <Progress
              type="circle"
              percent={reportData.inventory.stockHealth || 0}
              format={percent => `${percent}%`}
              status={reportData.inventory.stockHealth > 80 ? 'success' : 
                     reportData.inventory.stockHealth > 60 ? 'normal' : 'exception'}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <p>Overall inventory health based on stock levels</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Quick Stats">
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                    {reportData.inventory.totalProducts - reportData.inventory.lowStockCount}
                  </div>
                  <div style={{ fontSize: '12px' }}>Healthy Stock</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff7e6', borderRadius: '4px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14' }}>
                    {reportData.inventory.lowStockCount}
                  </div>
                  <div style={{ fontSize: '12px' }}>Need Attention</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Detailed Reports */}
      <Tabs defaultActiveKey="1">
        <TabPane tab="Low Stock Alert" key="1">
          <Card>
            <Table
              columns={inventoryColumns}
              dataSource={reportData.lowStock}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Top Moving Products" key="2">
          <Card>
            <Table
              columns={movementColumns}
              dataSource={reportData.topProducts}
              rowKey="productName"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Recent Transactions" key="3">
          <Card>
            <Table
              columns={transactionColumns}
              dataSource={reportData.recentTransactions}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 15 }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Reports;