// src/components/sales/OrderList.js
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Card, Input, Select, message, 
  Modal, Descriptions, Timeline, Row, Col, Statistic
} from 'antd';
import { 
  EyeOutlined, SearchOutlined, FilterOutlined,
  CheckCircleOutlined, ClockCircleOutlined, TruckOutlined
} from '@ant-design/icons';
import { dbService } from '../../services/dbService';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchText, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orderData = await dbService.queryDocuments('sales_orders', [], 'orderDate', 'desc');
      setOrders(orderData);
    } catch (error) {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchText) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await dbService.update('sales_orders', orderId, { 
        status: newStatus,
        updatedAt: new Date()
      });
      message.success('Order status updated successfully!');
      loadOrders();
    } catch (error) {
      message.error('Failed to update order status');
    }
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

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id.slice(-8)}`,
      width: 120,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div>{record.customerName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.customerEmail}</div>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => moment(date?.toDate ? date.toDate() : date).format('DD/MM/YYYY'),
      width: 100,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => `${items?.length || 0} items`,
      width: 80,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `₹${amount?.toFixed(2) || '0.00'}`,
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'orange'}>
          {status?.toUpperCase()}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setDetailsVisible(true);
            }}
          />
          <Select
            size="small"
            value={record.status}
            onChange={(value) => updateOrderStatus(record.id, value)}
            style={{ width: 120 }}
          >
            <Option value="pending">Pending</Option>
            <Option value="processing">Processing</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Space>
      ),
      width: 200,
    },
  ];

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Sales Orders</h2>
        </div>

        {/* Order Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Total Orders" value={orderStats.total} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Pending" value={orderStats.pending} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Processing" value={orderStats.processing} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Revenue" value={orderStats.totalRevenue} precision={2} prefix="₹" />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search orders..."
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          
          <Select
            placeholder="Filter by status"
            style={{ width: 200 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">All Status</Option>
            <Option value="pending">Pending</Option>
            <Option value="processing">Processing</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </div>

        {/* Orders Table */}
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Order Details Modal */}
      <Modal
        title={`Order Details - #${selectedOrder?.id?.slice(-8) || ''}`}
        visible={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        width={800}
        footer={null}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered size="small">
              <Descriptions.Item label="Customer" span={2}>
                {selectedOrder.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.customerEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Order Date" span={2}>
                {moment(selectedOrder.orderDate?.toDate ? selectedOrder.orderDate.toDate() : selectedOrder.orderDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method" span={2}>
                {selectedOrder.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={selectedOrder.paymentStatus === 'paid' ? 'green' : 'orange'}>
                  {selectedOrder.paymentStatus?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* Order Items */}
            <div style={{ marginTop: 16 }}>
              <h4>Order Items</h4>
              <Table
                size="small"
                dataSource={selectedOrder.items || []}
                pagination={false}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: 'productName',
                    key: 'productName',
                  },
                  {
                    title: 'SKU',
                    dataIndex: 'sku',
                    key: 'sku',
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Unit Price',
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    render: (price) => `₹${price?.toFixed(2)}`,
                  },
                  {
                    title: 'Total',
                    dataIndex: 'totalPrice',
                    key: 'totalPrice',
                    render: (total) => `₹${total?.toFixed(2)}`,
                  },
                ]}
              />
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <div style={{ marginTop: 16 }}>
                <h4>Shipping Address</h4>
                <p>
                  {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}<br />
                  {selectedOrder.shippingAddress.address}<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </p>
              </div>
            )}

            {/* Order Summary */}
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <div>Subtotal: ₹{selectedOrder.subtotal?.toFixed(2)}</div>
              <div>Tax: ₹{selectedOrder.tax?.toFixed(2)}</div>
              <div>Shipping: ₹{selectedOrder.shippingFee?.toFixed(2) || '0.00'}</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                Total: ₹{selectedOrder.totalAmount?.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderList;