// src/components/inventory/ProductList.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Card, Input, Select, message, Modal, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { dbService } from '../../services/dbService';

const { Search } = Input;
const { Option } = Select;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchText, categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productData = await dbService.getAll('products', 'name', 'asc');
      setProducts(productData);
    } catch (error) {
      message.error('Failed to load products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryData = await dbService.getAll('categories', 'name', 'asc');
      setCategories(categoryData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (productId) => {
    try {
      await dbService.delete('products', productId);
      message.success('Product deleted successfully!');
      loadProducts();
    } catch (error) {
      message.error('Failed to delete product: ' + error.message);
    }
  };

  const getStockStatus = (currentStock, minStockLevel) => {
    if (currentStock <= 0) {
      return <Tag color="red">Out of Stock</Tag>;
    } else if (currentStock <= minStockLevel) {
      return <Tag color="orange">Low Stock</Tag>;
    } else {
      return <Tag color="green">In Stock</Tag>;
    }
  };

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 120,
      sorter: (a, b) => a.currentStock - b.currentStock,
      render: (stock, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{stock}</div>
          {getStockStatus(stock, record.minStockLevel)}
        </div>
      ),
    },
    {
      title: 'Retail Price',
      dataIndex: 'retailPrice',
      key: 'retailPrice',
      width: 120,
      render: (price) => `₹${price}`,
      sorter: (a, b) => a.retailPrice - b.retailPrice,
    },
    {
      title: 'Wholesale Price',
      dataIndex: 'wholesalePrice',
      key: 'wholesalePrice',
      width: 130,
      render: (price) => `₹${price}`,
      sorter: (a, b) => a.wholesalePrice - b.wholesalePrice,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this product?"
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

  const handleEdit = (product) => {
    // Navigate to edit page or open edit modal
    message.info(`Edit functionality for ${product.name} - Coming soon!`);
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Product Inventory</h2>
          <Button type="primary" icon={<PlusOutlined />}>
            Add New Product
          </Button>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search products..."
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          
          <Select
            placeholder="Filter by category"
            style={{ width: 200 }}
            value={categoryFilter}
            onChange={setCategoryFilter}
          >
            <Option value="all">All Categories</Option>
            {categories.map(category => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Summary Cards */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Card size="small" style={{ minWidth: 150 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {products.length}
              </div>
              <div>Total Products</div>
            </div>
          </Card>
          
          <Card size="small" style={{ minWidth: 150 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {products.filter(p => p.currentStock > p.minStockLevel).length}
              </div>
              <div>In Stock</div>
            </div>
          </Card>
          
          <Card size="small" style={{ minWidth: 150 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                {products.filter(p => p.currentStock <= p.minStockLevel && p.currentStock > 0).length}
              </div>
              <div>Low Stock</div>
            </div>
          </Card>
          
          <Card size="small" style={{ minWidth: 150 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                {products.filter(p => p.currentStock <= 0).length}
              </div>
              <div>Out of Stock</div>
            </div>
          </Card>
        </div>

        {/* Products Table */}
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ProductList;