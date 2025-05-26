// src/customer/pages/OrderHistory.js
import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Tag, Typography, Space, Button, 
  Empty, Spin, Input, Select, DatePicker, Row, Col,
  message, Tooltip 
} from 'antd';
import { 
  EyeOutlined, SearchOutlined, FilterOutlined,
  ShoppingOutlined, CalendarOutlined, DownloadOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { dbService } from '../../../services/dbService';
import Loading from '../components/Loading';
import moment from 'moment';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadOrders();
    }
  }, [currentUser]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchText, statusFilter, dateRange]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orderData = await dbService.queryDocuments('sales_orders', [
        { field: 'customerId', operator: '==', value: currentUser.uid }
      ], 'orderDate', 'desc');
      setOrders(orderData);
    } catch (error) {
      console.error('Error loading orders:', error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Text search
    if (searchText) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchText.toLowerCase()) ||
        order.items?.some(item => 
          item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter(order => {
        const orderDate = moment(order.orderDate?.toDate ? order.orderDate.toDate() : order.orderDate);
        return orderDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
      });
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Order Placed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        <Text strong style={{ color: '#1890ff' }}>
          #{id.slice(-8)}
        </Text>
      ),
      width: 120,
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => {
        const orderDate = moment(date?.toDate ? date.toDate() : date);
        return (
          <div>
            <Text>{orderDate.format('DD MMM YYYY')}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {orderDate.format('hh:mm A')}
            </Text>
          </div>
        );
      },
      sorter: (a, b) => {
        const dateA = moment(a.orderDate?.toDate ? a.orderDate.toDate() : a.orderDate);
        const dateB = moment(b.orderDate?.toDate ? b.orderDate.toDate() : b.orderDate);
        return dateA.valueOf() - dateB.valueOf();
      },
      width: 120,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div>
          <Text>{items?.length || 0} item{(items?.length || 0) !== 1 ? 's' : ''}</Text>
          {items && items.length > 0 && (
            <div style={{ marginTop: '4px' }}>
              <Tooltip title={
                items.map(item => `${item.productName} (${item.quantity})`).join(', ')
              }>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {items[0].productName}
                  {items.length > 1 && ` +${items.length - 1} more`}
                </Text>
              </Tooltip>
            </div>
          )}
        </div>
      ),
      width: 200,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
          ₹{amount?.toFixed(2) || '0.00'}
        </Text>
      ),
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Order Placed', value: 'pending' },
        { text: 'Processing', value: 'processing' },
        { text: 'Shipped', value: 'shipped' },
        { text: 'Delivered', value: 'delivered' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
      width: 120,
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : status === 'failed' ? 'red' : 'orange'}>
          {status?.toUpperCase() || 'PENDING'}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="primary"
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => navigate(`/orders/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Download Invoice">
            <Button 
              icon={<DownloadOutlined />} 
              size="small"
              onClick={() => message.info('Download feature coming soon')}
            />
          </Tooltip>
        </Space>
      ),
      width: 100,
    },
  ];

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalAmount: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  };

  if (loading) {
    return <Loading fullScreen message="Loading your orders..." />;
  }

  return (
    <div style={{ padding: '20px', minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>Order History</Title>
          <Text type="secondary">
            Track and manage all your orders in one place
          </Text>
        </div>

        {/* Order Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {orderStats.total}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Orders</div>
          </div>
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {orderStats.delivered}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Delivered</div>
          </div>
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
              {orderStats.pending + orderStats.processing}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>In Progress</div>
          </div>
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
              ₹{orderStats.totalAmount.toFixed(0)}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Spent</div>
          </div>
        </Card>
      </Col>
    </Row>

    {/* Filters */}
    <Card style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={8}>
          <Search
            placeholder="Search by order ID or product..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col xs={24} sm={6}>
          <Select
            placeholder="Filter by status"
            style={{ width: '100%' }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">All Status</Option>
            <Option value="pending">Order Placed</Option>
            <Option value="processing">Processing</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <RangePicker
            style={{ width: '100%' }}
            value={dateRange}
            onChange={setDateRange}
            placeholder={['Start Date', 'End Date']}
          />
        </Col>
        <Col xs={24} sm={2}>
          <Button
            icon={<FilterOutlined />}
            onClick={() => {
              setSearchText('');
              setStatusFilter('all');
              setDateRange(null);
            }}
          >
            Clear
          </Button>
        </Col>
      </Row>
    </Card>

    {/* Orders Table */}
    <Card>
      {filteredOrders.length === 0 && !loading ? (
        <Empty 
          image={<ShoppingOutlined style={{ fontSize: '4rem', color: '#d9d9d9' }} />}
          description={
            <div>
              <Title level={4}>No orders found</Title>
              <Text type="secondary">
                {orders.length === 0 ? 
                  "You haven't placed any orders yet. Start shopping to see your orders here!" :
                  "No orders match your current filters. Try adjusting your search criteria."
                }
              </Text>
            </div>
          }
          style={{ margin: '60px 0' }}
        >
          {orders.length === 0 && (
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/products')}
            >
              Start Shopping
            </Button>
          )}
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} orders`,
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      )}
    </Card>

    {/* Help Section */}
    {orders.length > 0 && (
      <Card style={{ marginTop: '24px', textAlign: 'center' }}>
        <Title level={5}>Need help with your order?</Title>
        <Text type="secondary">
          Contact our customer support team for any questions about your orders.
        </Text>
        <div style={{ marginTop: '16px' }}>
          <Space>
            <Button type="primary">Contact Support</Button>
            <Button>Order Help</Button>
          </Space>
        </div>
      </Card>
    )}
  </div>
</div>
);
};
export default OrderHistory;