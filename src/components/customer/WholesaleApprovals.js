// src/components/customers/WholesaleApprovals.js
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Card, message, Modal, 
  Descriptions, Typography, Row, Col, Input, Select,
  Popconfirm
} from 'antd';
import { 
  CheckOutlined, CloseOutlined, EyeOutlined, 
  UserOutlined, PhoneOutlined, MailOutlined,
  ShopOutlined, SearchOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { dbService } from '../../services/dbService';
import moment from 'moment';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const WholesaleApprovals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadWholesaleRequests();
  }, []);

  const loadWholesaleRequests = async () => {
    try {
      setLoading(true);
      
      // Load all wholesale customers (pending, approved, rejected)
      const allWholesale = await dbService.queryDocuments('users', [
        { field: 'customerType', operator: '==', value: 'wholesale' }
      ], 'createdAt', 'desc');
      
      console.log('All wholesale requests:', allWholesale);
      
      const pending = allWholesale.filter(user => 
        user.approvalStatus === 'pending' || 
        (!user.approvalStatus && user.role === 'customer_wholesale')
      );
      
      setPendingApprovals(pending);
      setAllRequests(allWholesale);
      
    } catch (error) {
      console.error('Error loading wholesale requests:', error);
      message.error('Failed to load wholesale requests');
    } finally {
      setLoading(false);
    }
  };

  const showUserDetails = (user) => {
    setSelectedUser(user);
    setActionType(null);
    setRejectionReason('');
    setDetailsVisible(true);
  };

  const handleApproval = async (userId, action, reason = '') => {
    setActionLoading(true);
    try {
      const updateData = {
        approvalStatus: action,
        isApproved: action === 'approved',
        role: action === 'approved' ? 'customer_wholesale' : 'customer_wholesale',
        isActive: true,
        approvedAt: action === 'approved' ? new Date() : null,
        rejectedAt: action === 'rejected' ? new Date() : null,
        rejectionReason: action === 'rejected' ? reason : '',
        updatedAt: new Date()
      };

      await dbService.update('users', userId, updateData);
      
      message.success(
        `Wholesale request ${action === 'approved' ? 'approved' : 'rejected'} successfully!`
      );
      
      setDetailsVisible(false);
      setRejectionReason('');
      setActionType(null);
      await loadWholesaleRequests();
      
    } catch (error) {
      console.error('Error updating approval status:', error);
      message.error('Failed to update approval status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (userId) => {
    Modal.confirm({
      title: 'Approve Wholesale Account?',
      content: 'This will grant the customer access to wholesale pricing and features.',
      onOk: () => handleApproval(userId, 'approved'),
      okText: 'Approve',
      okType: 'primary',
    });
  };

  const handleReject = (userId) => {
    if (!rejectionReason.trim()) {
      message.error('Please provide a reason for rejection');
      return;
    }
    handleApproval(userId, 'rejected', rejectionReason);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red'
    };
    return colors[status] || 'orange';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending Approval',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return texts[status] || 'Pending Approval';
  };

  const columns = [
    {
      title: 'Customer Details',
      key: 'customer',
      render: (_, record) => (
        <div>
          <Text strong>{record.displayName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <MailOutlined style={{ marginRight: '4px' }} />
            {record.email}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <PhoneOutlined style={{ marginRight: '4px' }} />
            {record.phone || 'No phone provided'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Business Info',
      key: 'business',
      render: (_, record) => (
        <div>
          <Text>{record.businessName || record.wholesaleDetails?.businessName || 'Not provided'}</Text>
          <br />
          {record.wholesaleDetails?.gstNumber && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              GST: {record.wholesaleDetails.gstNumber}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Request Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        if (!date) return 'N/A';
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return moment(dateObj).format('DD MMM YYYY, HH:mm');
      },
      sorter: (a, b) => {
        const dateA = moment(a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt);
        const dateB = moment(b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt);
        return dateA.valueOf() - dateB.valueOf();
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = record.approvalStatus || 'pending';
        return (
          <Tag 
            color={getStatusColor(status)} 
            icon={
              status === 'pending' ? <ClockCircleOutlined /> :
              status === 'approved' ? <CheckOutlined /> :
              <CloseOutlined />
            }
          >
            {getStatusText(status)}
          </Tag>
        );
      },
      filters: [
        { text: 'Pending Approval', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => (record.approvalStatus || 'pending') === value,
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
            onClick={() => showUserDetails(record)}
          >
            View Details
          </Button>
          {(record.approvalStatus === 'pending' || !record.approvalStatus) && (
            <>
              <Popconfirm
                title="Approve this wholesale account?"
                description="This will grant access to wholesale pricing and features."
                onConfirm={() => handleApproval(record.id, 'approved')}
                okText="Approve"
                cancelText="Cancel"
              >
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  loading={actionLoading}
                >
                  Approve
                </Button>
              </Popconfirm>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => {
                  setSelectedUser(record);
                  setActionType('reject');
                  setDetailsVisible(true);
                }}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const filteredData = allRequests.filter(request => {
    const status = request.approvalStatus || 'pending';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesSearch = !searchText || 
      request.displayName?.toLowerCase().includes(searchText.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      request.businessName?.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0, marginBottom: 16 }}>
            Wholesale Account Approvals
          </Title>
          
          {/* Filters */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search customers..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                placeholder="Filter by status"
              >
                <Option value="all">All Requests</Option>
                <Option value="pending">Pending Approval</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                  {pendingApprovals.length}
                </div>
                <div style={{ color: '#666' }}>Pending Approval</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {allRequests.filter(r => r.approvalStatus === 'approved').length}
                </div>
                <div style={{ color: '#666' }}>Approved</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                  {allRequests.filter(r => r.approvalStatus === 'rejected').length}
                </div>
                <div style={{ color: '#666' }}>Rejected</div>
              </div>
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} requests`,
          }}
        />
      </Card>

      {/* User Details Modal */}
      <Modal
        title="Wholesale Account Details"
        visible={detailsVisible}
        onCancel={() => {
          setDetailsVisible(false);
          setActionType(null);
          setRejectionReason('');
        }}
        width={800}
        footer={
          selectedUser && (
            <Space>
              <Button onClick={() => setDetailsVisible(false)}>
                Close
              </Button>
              {(selectedUser.approvalStatus === 'pending' || !selectedUser.approvalStatus) && (
                <>
                  {actionType === 'reject' ? (
                    <Button
                      danger
                      onClick={() => handleReject(selectedUser.id)}
                      loading={actionLoading}
                      disabled={!rejectionReason.trim()}
                    >
                      Confirm Rejection
                    </Button>
                  ) : (
                    <>
                      <Button
                        danger
                        onClick={() => setActionType('reject')}
                      >
                        Reject Application
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => handleApproval(selectedUser.id, 'approved')}
                        loading={actionLoading}
                      >
                        Approve Account
                      </Button>
                    </>
                  )}
                </>
              )}
            </Space>
          )
        }
      >
        {selectedUser && (
          <div>
            <Descriptions title="Personal Information" bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Full Name">
                {selectedUser.displayName}
              </Descriptions.Item>
              <Descriptions.Item label="Email Address">
                {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {selectedUser.phone || 'Not provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Type">
                <Tag color="blue">Wholesale Customer</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Registration Date" span={2}>
                {selectedUser.createdAt ? 
                  moment(selectedUser.createdAt.toDate ? selectedUser.createdAt.toDate() : selectedUser.createdAt)
                    .format('DD MMMM YYYY, HH:mm') : 
                  'Not available'
                }
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Business Information" bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Business Name">
                {selectedUser.businessName || selectedUser.wholesaleDetails?.businessName || 'Not provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Business Type">
                {selectedUser.wholesaleDetails?.businessType?.replace('_', ' ').toUpperCase() || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="GST Number">
                {selectedUser.wholesaleDetails?.gstNumber || 'Not provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Monthly Volume">
                {selectedUser.wholesaleDetails?.estimatedMonthlyVolume || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Business Address" span={2}>
                {selectedUser.wholesaleDetails?.businessAddress || selectedUser.address || 'Not provided'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Account Status" bordered column={2}>
              <Descriptions.Item label="Current Status">
                <Tag color={getStatusColor(selectedUser.approvalStatus || 'pending')}>
                  {getStatusText(selectedUser.approvalStatus || 'pending')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Account Active">
                <Tag color={selectedUser.isActive ? 'green' : 'red'}>
                  {selectedUser.isActive ? 'Yes' : 'No'}
                </Tag>
              </Descriptions.Item>
              {selectedUser.approvedAt && (
                <Descriptions.Item label="Approved On">
                  {moment(selectedUser.approvedAt.toDate ? selectedUser.approvedAt.toDate() : selectedUser.approvedAt)
                    .format('DD MMMM YYYY, HH:mm')}
                </Descriptions.Item>
              )}
              {selectedUser.rejectedAt && (
                <Descriptions.Item label="Rejected On">
                  {moment(selectedUser.rejectedAt.toDate ? selectedUser.rejectedAt.toDate() : selectedUser.rejectedAt)
                    .format('DD MMMM YYYY, HH:mm')}
                </Descriptions.Item>
              )}
              {selectedUser.rejectionReason && (
                <Descriptions.Item label="Rejection Reason" span={2}>
                  <Text type="danger">{selectedUser.rejectionReason}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {actionType === 'reject' && (
              <div style={{ marginTop: 24 }}>
                <Title level={5} style={{ color: '#ff4d4f' }}>
                  Rejection Reason *
                </Title>
                <TextArea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejecting this wholesale account request. This will be communicated to the customer."
                  showCount
                  maxLength={500}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WholesaleApprovals;