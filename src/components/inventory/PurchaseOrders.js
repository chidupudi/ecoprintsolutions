import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Card, Input, Select, message, 
  Modal, Descriptions, Row, Col, Statistic
} from 'antd';
import { 
  PlusOutlined, EyeOutlined, SearchOutlined,
  CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../../services/dbService';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchText, statusFilter]);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const orderData = await dbService.queryDocuments('purchase_orders', [], 'purchaseDate', 'desc');
      setOrders(orderData);
    } catch (error) {
      message.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchText) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchText.toLowerCase()) ||
        order.supplierName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await dbService.update('purchase_orders', orderId, { 
        status: newStatus,
        updatedAt: new Date()
      });
      message.success('Order status updated successfully!');
      loadPurchaseOrders();
    } catch (error) {
      message.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      shipped: 'purple',
      received: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'PO ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id.slice(-8)}`,
      width: 120,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: 'Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
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
            <Option value="confirmed">Confirmed</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="received">Received</Option>
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
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    received: orders.filter(o => o.status === 'received').length,
    totalValue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Purchase Orders</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/inventory/create-purchase-order')}
          >
            Create Purchase Order
          </Button>
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
              <Statistic title="Confirmed" value={orderStats.confirmed} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Total Value" value={orderStats.totalValue} precision={2} prefix="₹" />
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
            <Option value="confirmed">Confirmed</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="received">Received</Option>
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
        title={`Purchase Order Details - #${selectedOrder?.id?.slice(-8) || ''}`}
        visible={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        width={800}
        footer={null}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered size="small">
              <Descriptions.Item label="Supplier" span={2}>
                {selectedOrder.supplierName}
              </Descriptions.Item>
              <Descriptions.Item label="Purchase Date" span={2}>
                {moment(selectedOrder.purchaseDate?.toDate ? selectedOrder.purchaseDate.toDate() : selectedOrder.purchaseDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Expected Delivery" span={2}>
                {selectedOrder.expectedDelivery ? 
                  moment(selectedOrder.expectedDelivery?.toDate ? selectedOrder.expectedDelivery.toDate() : selectedOrder.expectedDelivery).format('DD/MM/YYYY') : 
                  'Not specified'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {selectedOrder.createdBy || 'Unknown'}
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

            {/* Notes */}
            {selectedOrder.notes && (
              <div style={{ marginTop: 16 }}>
                <h4>Notes</h4>
                <p>{selectedOrder.notes}</p>
              </div>
            )}

            {/* Order Summary */}
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                Total Amount: ₹{selectedOrder.totalAmount?.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseOrders;