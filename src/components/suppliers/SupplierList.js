// src/components/suppliers/SupplierList.js
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Card, Input, Modal, Form, 
  message, Popconfirm, Row, Col, Tag 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  PhoneOutlined, MailOutlined, SearchOutlined 
} from '@ant-design/icons';
import { dbService } from '../../services/dbService';

const { Search } = Input;
const { TextArea } = Input;

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchText]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const supplierData = await dbService.getAll('suppliers', 'name', 'asc');
      setSuppliers(supplierData);
    } catch (error) {
      message.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    let filtered = suppliers;

    if (searchText) {
      filtered = filtered.filter(supplier =>
        supplier.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        supplier.contactPerson?.toLowerCase().includes(searchText.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredSuppliers(filtered);
  };

  const showModal = (supplier = null) => {
    setEditingSupplier(supplier);
    if (supplier) {
      form.setFieldsValue({
        ...supplier,
        address: supplier.address ? Object.values(supplier.address).join(', ') : ''
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Parse address back to object format
      const addressParts = values.address ? values.address.split(',') : [];
      const supplierData = {
        ...values,
        address: {
          street: addressParts[0]?.trim() || '',
          city: addressParts[1]?.trim() || '',
          state: addressParts[2]?.trim() || '',
          pincode: addressParts[3]?.trim() || '',
          country: 'India'
        }
      };

      if (editingSupplier) {
        await dbService.update('suppliers', editingSupplier.id, supplierData);
        message.success('Supplier updated successfully!');
      } else {
        await dbService.create('suppliers', supplierData);
        message.success('Supplier added successfully!');
      }
      
      setIsModalVisible(false);
      loadSuppliers();
    } catch (error) {
      message.error('Operation failed: ' + error.message);
    }
  };

  const handleDelete = async (supplierId) => {
    try {
      await dbService.update('suppliers', supplierId, { isActive: false });
      message.success('Supplier deactivated successfully!');
      loadSuppliers();
    } catch (error) {
      message.error('Failed to deactivate supplier');
    }
  };

  const columns = [
    {
      title: 'Supplier Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email ? (
        <Space>
          <MailOutlined />
          {email}
        </Space>
      ) : '-',
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
      title: 'Payment Terms',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
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
            title="Are you sure you want to deactivate this supplier?"
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
          <h2 style={{ margin: 0 }}>Supplier Management</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add Supplier
          </Button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search suppliers..."
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </div>

        {/* Summary */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                  {suppliers.length}
                </div>
                <div>Total Suppliers</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                  {suppliers.filter(s => s.isActive).length}
                </div>
                <div>Active Suppliers</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>
                  {suppliers.filter(s => !s.isActive).length}
                </div>
                <div>Inactive Suppliers</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Suppliers Table */}
        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} suppliers`,
          }}
        />
      </Card>

      {/* Add/Edit Supplier Modal */}
      <Modal
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            paymentTerms: '30 days',
            isActive: true
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Supplier Name"
                name="name"
                rules={[{ required: true, message: 'Please enter supplier name!' }]}
              >
                <Input placeholder="Supplier Company Name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Contact Person"
                name="contactPerson"
                rules={[{ required: true, message: 'Please enter contact person!' }]}
              >
                <Input placeholder="Contact Person Name" />
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
                <Input placeholder="supplier@email.com" />
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
            <Col xs={24}>
              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: 'Please enter address!' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Street, City, State, Pincode" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Payment Terms"
                name="paymentTerms"
                rules={[{ required: true, message: 'Please enter payment terms!' }]}
              >
                <Input placeholder="e.g., 30 days, COD, Advance" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierList;