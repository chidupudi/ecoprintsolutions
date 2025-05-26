// src/components/customers/CustomerList.js
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Card, Input, Modal, Form, 
  Select, message, Popconfirm, Row, Col 
} from 'antd';
import { 
  UserAddOutlined, EditOutlined, DeleteOutlined, 
  PhoneOutlined, MailOutlined, SearchOutlined 
} from '@ant-design/icons';
import { dbService } from '../../services/dbService';

const { Search } = Input;
const { Option } = Select;

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchText, customerTypeFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      // Get users with customer roles
      const users = await dbService.queryDocuments('users', [
        { field: 'role', operator: 'in', value: ['customer_retail', 'customer_wholesale'] }
      ]);
      setCustomers(users);
    } catch (error) {
      message.error('Failed to load customers');
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

    if (customerTypeFilter !== 'all') {
      filtered = filtered.filter(customer => customer.customerType === customerTypeFilter);
    }

    setFilteredCustomers(filtered);
  };

  const showModal = (customer = null) => {
    setEditingCustomer(customer);
    if (customer) {
      form.setFieldsValue(customer);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingCustomer) {
        // Update existing customer
        await dbService.update('users', editingCustomer.id, values);
        message.success('Customer updated successfully!');
      } else {
        // Create new customer (this would typically be done through registration)
        const customerData = {
          ...values,
          role: values.customerType === 'wholesale' ? 'customer_wholesale' : 'customer_retail',
          isActive: true,
          createdAt: new Date()
        };
        await dbService.create('users', customerData);
        message.success('Customer added successfully!');
      }
      
      setIsModalVisible(false);
      loadCustomers();
    } catch (error) {
      message.error('Operation failed: ' + error.message);
    }
  };

  const handleDelete = async (customerId) => {
    try {
      await dbService.update('users', customerId, { isActive: false });
      message.success('Customer deactivated successfully!');
      loadCustomers();
    } catch (error) {
      message.error('Failed to deactivate customer');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'displayName',
      key: 'displayName',
      sorter: (a, b) => (a.displayName || '').localeCompare(b.displayName || ''),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone ? (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      ) : '-',
    },
    {
      title: 'Type',
      dataIndex: 'customerType',
      key: 'customerType',
      render: (type) => (
        <Tag color={type === 'wholesale' ? 'blue' : 'green'}>
          {type === 'wholesale' ? 'Wholesale' : 'Retail'}
        </Tag>
      ),
      filters: [
        { text: 'Retail', value: 'retail' },
        { text: 'Wholesale', value: 'wholesale' },
      ],
      onFilter: (value, record) => record.customerType === value,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date.toDate ? date.toDate() : date).toLocaleDateString() : '-',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to deactivate this customer?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Customer Management</h2>
          <Button 
            type="primary" 
            icon={<UserAddOutlined />}
            onClick={() => showModal()}
          >
            Add Customer
          </Button>
        </div>

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
              placeholder="Filter by type"
              style={{ width: '100%' }}
              value={customerTypeFilter}
              onChange={setCustomerTypeFilter}
            >
              <Option value="all">All Types</Option>
              <Option value="retail">Retail</Option>
              <Option value="wholesale">Wholesale</Option>
            </Select>
          </Col>
        </Row>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                  {customers.length}
                </div>
                <div>Total Customers</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                  {customers.filter(c => c.customerType === 'retail').length}
                </div>
                <div>Retail Customers</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#722ed1' }}>
                  {customers.filter(c => c.customerType === 'wholesale').length}
                </div>
                <div>Wholesale Customers</div>
              </div>
            </Card>
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

      {/* Add/Edit Customer Modal */}
      <Modal
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            customerType: 'retail',
            isActive: true
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Display Name"
                name="displayName"
                rules={[{ required: true, message: 'Please enter customer name!' }]}
              >
                <Input placeholder="Customer Name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter email!' },
                  { type: 'email', message: 'Please enter valid email!' }
                ]}
              >
                <Input placeholder="customer@email.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true, message: 'Please enter phone number!' }]}
              >
                <Input placeholder="+91 9876543210" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Customer Type"
                name="customerType"
                rules={[{ required: true, message: 'Please select customer type!' }]}
              >
                <Select>
                  <Option value="retail">Retail Customer</Option>
                  <Option value="wholesale">Wholesale Customer</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Address"
                name="address"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Customer address (optional)" 
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerList;