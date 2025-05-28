// src/components/customers/CustomerApproval.js - NEW COMPONENT
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Card, message, 
  Modal, Descriptions, Avatar, Row, Col,
  Input, Select, Tooltip, Popconfirm
} from 'antd';
import { 
  CheckOutlined, CloseOutlined, EyeOutlined,
  ClockCircleOutlined, UserOutlined, SearchOutlined,
  MailOutlined, PhoneOutlined
} from '@ant-design/icons';
import { dbService } from '../../services/dbService';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const CustomerApproval = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchText, statusFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      // Get wholesale customers that need approval
      const wholesaleCustomers = await dbService.queryDocuments('users', [
        { field: 'customerType', operator: '==', value: 'wholesale' }
      ], 'requestedAt', 'desc');
      
      setCustomers(wholesaleCustomers);
    } catch (error) {
      message.error('Failed to load customers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchText) {
      filtered = filtered.filter(customer =>
        customer.displayName?.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.approvalStatus === statusFilter);
    }

    setFilteredCustomers(filtered);
  };

  const handleApproval = async (customerId, status, reason = '') => {
    setActionLoading(true);
    try {
      const updateData = {
        approvalStatus: status,
        isApproved: status === 'approved',
        approvedAt: status === 'approved' ? new Date() : null,
        rejectedAt: status === 'rejected' ? new Date() : null,
        approvalReason: reason
      };

      await dbService.update('users', customerId, updateData);
      
      message.success(`Customer ${status} successfully!`);
      setModalVisible(false);
      loadCustomers();
      
      // TODO: Send email notification to customer
      // await sendApprovalEmail(customer.email, status, reason);
      
    } catch (error) {
      message.error(`Failed to ${status} customer`);
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const showCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.displayName}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-',
    },
    {
      title: 'Requested On',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date) => date ? moment(date?.toDate ? date.toDate() : date).format('DD MMM YYYY, HH:mm') : '-',
      sorter: (a, b) => {
        const dateA = moment(a.requestedAt?.toDate ? a.requestedAt.toDate() : a.requestedAt);
        const dateB = moment(b.requestedAt?.toDate ? b.requestedAt.toDate() : b.requestedAt);
        return dateA.valueOf() - dateB.valueOf();
      },
    },
    {
      title: 'Status',
      dataIndex: 'approvalStatus',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={
          status === 'pending' ? <ClockCircleOutlined /> :
          status === 'approved' ? <CheckOutlined /> :
          <CloseOutlined />
        }>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Pending Review', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.approvalStatus === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => showCustomerDetails(record)}
              size="small"
            />
          </Tooltip>
          
          {record.approvalStatus === 'pending' && (
            <>
              <Popconfirm
                title="Approve this wholesale customer?"
                description="This will give them access to wholesale pricing and features."
                onConfirm={() => handleApproval(record.id, 'approved')}
                okText="Approve"
                cancelText="Cancel"
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  loading={actionLoading}
                >
                  Approve
                </Button>
              </Popconfirm>
              
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                onClick={() => showCustomerDetails(record)}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const ApprovalModal = () => (
    <Modal
      title="Customer Details & Approval"
      visible={modalVisible}
      onCancel={() => setModalVisible(false)}
      width={600}
      footer={null}
    >
      {selectedCustomer && (
        <div>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">
              {selectedCustomer.displayName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined />
                {selectedCustomer.email}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              <Space>
                <PhoneOutlined />
                {selectedCustomer.phone || 'Not provided'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Customer Type">
              <Tag color="blue">Wholesale Customer</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Registration Date">
              {selectedCustomer.createdAt ? 
                moment(selectedCustomer.createdAt?.toDate ? selectedCustomer.createdAt.toDate() : selectedCustomer.createdAt)
                  .format('DD MMM YYYY, HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Current Status">
              <Tag color={getStatusColor(selectedCustomer.approvalStatus)}>
                {getStatusText(selectedCustomer.approvalStatus)}
              </Tag>
            </Descriptions.Item>
            {selectedCustomer.approvalReason && (
              <Descriptions.Item label="Previous Action Reason">
                {selectedCustomer.approvalReason}
              </Descriptions.Item>
            )}
          </Descriptions>

          {selectedCustomer.approvalStatus === 'pending' && (
            <div style={{ marginTop: '24px' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    block
                    size="large"
                    loading={actionLoading}
                    onClick={() => handleApproval(selectedCustomer.id, 'approved')}
                  >
                    Approve Customer
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    block
                    size="large"
                    onClick={() => {
                      Modal.confirm({
                        title: 'Reject Customer Application',
                        content: (
                          <div>
                            <p>Please provide a reason for rejection:</p>
                            <TextArea
                              rows={3}
                              placeholder="Reason for rejection..."
                              id="rejection-reason"
                            />
                          </div>
                        ),
                        onOk: () => {
                          const reason = document.getElementById('rejection-reason').value;
                          if (reason.trim()) {
                            handleApproval(selectedCustomer.id, 'rejected', reason);
                          } else {
                            message.error('Please provide a reason for rejection');
                            return false;
                          }
                        },
                        okText: 'Reject',
                        okType: 'danger',
                      });
                    }}
                  >
                    Reject Application
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </div>
      )}
    </Modal>
  );

  const pendingCount = customers.filter(c => c.approvalStatus === 'pending').length;
  const approvedCount = customers.filter(c => c.approvalStatus === 'approved').length;
  const rejectedCount = customers.filter(c => c.approvalStatus === 'rejected').length;

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Wholesale Customer Approvals</h2>
          {pendingCount > 0 && (
            <Tag color="orange" style={{ fontSize: '14px', padding: '4px 12px' }}>
              {pendingCount} Pending Review
            </Tag>
          )}
        </div>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>
                  {pendingCount}
                </div>
                <div>Pending Review</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                  {approvedCount}
                </div>
                <div>Approved</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }}>
                  {rejectedCount}
                </div>
                <div>Rejected</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search customers..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="pending">Pending Review</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="all">All Status</Option>
            </Select>
          </Col>
        </Row>

        {/* Customers Table */}
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
          }}
        />
      </Card>

      <ApprovalModal />
    </div>
  );
};

export default CustomerApproval;