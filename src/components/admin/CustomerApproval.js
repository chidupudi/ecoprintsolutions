// src/components/admin/WholesaleApprovals.js - NEW COMPONENT
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Card, message, Modal, 
  Descriptions, Typography, Row, Col, Input, Select
} from 'antd';
import { 
  CheckOutlined, CloseOutlined, EyeOutlined, 
  UserOutlined, PhoneOutlined, MailOutlined,
  ShopOutlined, SearchOutlined
} from '@ant-design/icons';
import { dbService } from '../../services/dbService';

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
        user.approvalStatus === 'pending' || user.role === 'customer_wholesale_pending'
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
    setDetailsVisible(true);
  };

  const handleApproval = async (userId, action, reason = '') => {
    setActionLoading(true);
    try {
      const updateData = {
        approvalStatus: action,
        role: action === 'approved' ? 'customer_wholesale' : 'customer_retail',
        isActive: action === 'approved',
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
      await loadWholesaleRequests();
      
    } catch (error) {
      console.error('Error updating approval status:', error);
      message.error('Failed to update approval status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (userId) => {
    handleApproval(userId, 'approved');
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
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending Approval',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Business Name',
      dataIndex: 'businessName',
      key: 'businessName',
      render: (text, record) => (
        <div>
          <Text strong>{text || record.wholesaleDetails?.businessName || 'N/A'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.displayName}
          </Text>
        </div>
      ),
    },
    {
      title: 'Contact Info',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: '4px' }}>
            <MailOutlined style={{ marginRight: '4px' }} />
            <Text style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
          <div>
            <PhoneOutlined style={{ marginRight: '4px' }} />
            <Text style={{ fontSize: '12px' }}>{record.phone}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Business Type',
      dataIndex: ['wholesaleDetails', 'businessType'],
      key: 'businessType',
      render: (type) => type ? <Tag>{type.replace('_', ' ').toUpperCase()}</Tag> : 'N/A',
    },
    {
      title: 'GST Number',
      dataIndex: ['wholesaleDetails', 'gstNumber'],
      key: 'gstNumber',
      render: (gst) => gst || 'Not provided',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = record.approvalStatus || 'pending';
        return <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>;
      },
    },
    {
      title: 'Applied On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        if (!date) return 'N/A';
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString('en-IN');
      },
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
          {record.approvalStatus === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                loading={actionLoading}
              >
                Approve
              </Button>
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
    if (statusFilter === 'all') return true;
    return (request.approvalStatus || 'pending') === statusFilter;
  });

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            Wholesale Account Approvals
          </Title>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
          >
            <Option value="all">All Requests</Option>
            <Option value="pending">Pending Approval</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </div>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>
                  {pendingApprovals.length}
                </div>
                <div>Pending Approval</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                  {allRequests.filter(r => r.approvalStatus === 'approved').length}
                </div>
                <div>Approved</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }}>
                  {allRequests.filter(r => r.approvalStatus === 'rejected').length}
                </div>
                <div>Rejected</div>
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
              {selectedUser.approvalStatus === 'pending' && (
                <>
                  {actionType === 'reject' ? (
                    <>
                      <Button
                        danger
                        onClick={() => handleReject(selectedUser.id)}
                        loading={actionLoading}
                      >
                        Confirm Rejection
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        danger
                        onClick={() => setActionType('reject')}
                      >
                        Reject
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => handleApprove(selectedUser.id)}
                        loading={actionLoading}
                      >
                        Approve
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
            <Descriptions title="Business Information" bordered column={2}>
              <Descriptions.Item label="Business Name">
                {selectedUser.businessName || selectedUser.wholesaleDetails?.businessName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Business Type">
                {selectedUser.wholesaleDetails?.businessType?.replace('_', ' ').toUpperCase() || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="GST Number">
                {selectedUser.wholesaleDetails?.gstNumber || 'Not provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Monthly Volume">
                {selectedUser.wholesaleDetails?.estimatedMonthlyVolume || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Business Address" span={2}>
                {selectedUser.wholesaleDetails?.businessAddress || 'Not provided'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Contact Information" bordered column={2} style={{ marginTop: 24 }}>
              <Descriptions.Item label="Contact Person">
                {selectedUser.displayName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedUser.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Applied On">
                {selectedUser.createdAt ? 
                  new Date(selectedUser.createdAt.toDate ? selectedUser.createdAt.toDate() : selectedUser.createdAt).toLocaleDateString('en-IN') : 
                  'N/A'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Personal Address" span={2}>
                {selectedUser.address || 'Not provided'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Status Information" bordered column={2} style={{ marginTop: 24 }}>
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
                  {new Date(selectedUser.approvedAt.toDate ? selectedUser.approvedAt.toDate() : selectedUser.approvedAt).toLocaleDateString('en-IN')}
                </Descriptions.Item>
              )}
              {selectedUser.rejectedAt && (
                <Descriptions.Item label="Rejected On">
                  {new Date(selectedUser.rejectedAt.toDate ? selectedUser.rejectedAt.toDate() : selectedUser.rejectedAt).toLocaleDateString('en-IN')}
                </Descriptions.Item>
              )}
              {selectedUser.rejectionReason && (
                <Descriptions.Item label="Rejection Reason" span={2}>
                  {selectedUser.rejectionReason}
                </Descriptions.Item>
              )}
            </Descriptions>

            {actionType === 'reject' && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Rejection Reason</Title>
                <TextArea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this wholesale account request..."
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