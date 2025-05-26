// src/customer/pages/ProductsPage.js
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Tag, Input, Select, Pagination, 
  Spin, Empty, Space, Typography, Slider, Checkbox 
} from 'antd';
import { 
  ShoppingCartOutlined, SearchOutlined, FilterOutlined,
  PrinterOutlined, AppstoreOutlined, UnorderedListOutlined 
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { dbService } from '../../../services/dbService';
import { useCart } from '../hooks/useCart';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    priceRange: [0, 2000],
    inStock: false
  });

  const navigate = useNavigate();
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    // Handle URL parameters
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [searchParams, category]);

  useEffect(() => {
    filterProducts();
  }, [products, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productData = await dbService.queryDocuments('products', [
        { field: 'isActive', operator: '==', value: true }
      ]);
      setProducts(productData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryData = await dbService.queryDocuments('categories', [
        { field: 'isActive', operator: '==', value: true }
      ]);
      setCategories(categoryData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.sku.toLowerCase().includes(filters.search.toLowerCase()) ||
        (product.compatibility && product.compatibility.join(' ').toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.retailPrice >= filters.priceRange[0] && 
      product.retailPrice <= filters.priceRange[1]
    );

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.currentStock > 0);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      priceRange: [0, 2000],
      inStock: false
    });
  };

  const ProductCard = ({ product }) => (
    <Card 
      className="product-card"
      hoverable
      cover={
        <div className="product-image">
          <PrinterOutlined style={{ fontSize: '3rem', color: '#d9d9d9' }} />
        </div>
      }
      actions={[
        <Button 
          type="primary" 
          icon={<ShoppingCartOutlined />}
          onClick={() => addToCart(product)}
          disabled={product.currentStock === 0}
        >
          Add to Cart
        </Button>,
        <Button 
          type="link" 
          onClick={() => navigate(`/product/${product.id}`)}
        >
          View Details
        </Button>
      ]}
    >
      <Card.Meta
        title={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text strong>{product.name}</Text>
            <Tag color="blue">{product.sku}</Tag>
          </Space>
        }
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text ellipsis style={{ fontSize: '12px' }}>{product.description}</Text>
            <div>
              <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                ₹{product.retailPrice}
              </Text>
            </div>
            <div>
              <Tag color={product.currentStock > product.minStockLevel ? 'green' : 
                          product.currentStock > 0 ? 'orange' : 'red'}>
                {product.currentStock > 0 ? `Stock: ${product.currentStock}` : 'Out of Stock'}
              </Tag>
            </div>
            {product.compatibility && product.compatibility.length > 0 && (
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Compatible: {product.compatibility.slice(0, 3).join(', ')}
                {product.compatibility.length > 3 && '...'}
              </Text>
            )}
          </Space>
        }
      />
    </Card>
  );

  const ProductListItem = ({ product }) => (
    <Card style={{ marginBottom: '16px' }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={6}>
          <div className="product-image" style={{ height: '120px' }}>
            <PrinterOutlined style={{ fontSize: '2rem', color: '#d9d9d9' }} />
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Title level={5}>{product.name}</Title>
            <Tag color="blue">{product.sku}</Tag>
            <Text type="secondary">{product.description}</Text>
            {product.compatibility && product.compatibility.length > 0 && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Compatible: {product.compatibility.join(', ')}
              </Text>
            )}
          </Space>
        </Col>
        <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
              ₹{product.retailPrice}
            </Text>
            <Tag color={product.currentStock > product.minStockLevel ? 'green' : 
                        product.currentStock > 0 ? 'orange' : 'red'}>
              {product.currentStock > 0 ? `Stock: ${product.currentStock}` : 'Out of Stock'}
            </Tag>
            <Button 
              type="primary" 
              icon={<ShoppingCartOutlined />}
              onClick={() => addToCart(product)}
              disabled={product.currentStock === 0}
              block
            >
              Add to Cart
            </Button>
            <Button 
              type="link" 
              onClick={() => navigate(`/product/${product.id}`)}
              block
            >
              View Details
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div style={{ padding: '20px', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>
            {category ? 
              categories.find(c => c.id === category)?.name || 'Products' : 
              'All Products'
            }
          </Title>
          <Text type="secondary">
            {filteredProducts.length} products found
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Filters Sidebar */}
          <Col xs={24} lg={6}>
            <Card title={<Space><FilterOutlined />Filters</Space>}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Search */}
                <div>
                  <Text strong>Search</Text>
                  <Search
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    style={{ marginTop: '8px' }}
                  />
                </div>

                {/* Category */}
                <div>
                  <Text strong>Category</Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    value={filters.category}
                    onChange={(value) => handleFilterChange('category', value)}
                  >
                    <Option value="all">All Categories</Option>
                    {categories.map(cat => (
                      <Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Text strong>Price Range</Text>
                  <div style={{ padding: '16px 8px' }}>
                    <Slider
                      range
                      min={0}
                      max={2000}
                      value={filters.priceRange}
                      onChange={(value) => handleFilterChange('priceRange', value)}
                      tooltip={{
                        formatter: (value) => `₹${value}`
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                      <Text type="secondary">₹{filters.priceRange[0]}</Text>
                      <Text type="secondary">₹{filters.priceRange[1]}</Text>
                    </div>
                  </div>
                </div>

                {/* In Stock Only */}
                <div>
                  <Checkbox
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  >
                    In Stock Only
                  </Checkbox>
                </div>

                {/* Clear Filters */}
                <Button type="link" onClick={clearFilters} style={{ padding: 0 }}>
                  Clear All Filters
                </Button>
              </Space>
            </Card>
          </Col>

          {/* Products */}
          <Col xs={24} lg={18}>
            {/* View Controls */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <Space>
                <Text>View:</Text>
                <Button.Group>
                  <Button
                    type={viewMode === 'grid' ? 'primary' : 'default'}
                    icon={<AppstoreOutlined />}
                    onClick={() => setViewMode('grid')}
                  />
                  <Button
                    type={viewMode === 'list' ? 'primary' : 'default'}
                    icon={<UnorderedListOutlined />}
                    onClick={() => setViewMode('list')}
                  />
                </Button.Group>
              </Space>

              <Select defaultValue="popular" style={{ width: 200 }}>
                <Option value="popular">Most Popular</Option>
                <Option value="price-low">Price: Low to High</Option>
                <Option value="price-high">Price: High to Low</Option>
                <Option value="newest">Newest First</Option>
              </Select>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <Empty 
                description="No products found"
                style={{ margin: '50px 0' }}
              />
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <Row gutter={[24, 24]}>
                    {paginatedProducts.map(product => (
                      <Col xs={24} sm={12} lg={8} key={product.id}>
                        <ProductCard product={product} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div>
                    {paginatedProducts.map(product => (
                      <ProductListItem key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredProducts.length}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) => 
                      `${range[0]}-${range[1]} of ${total} products`
                    }
                  />
                </div>
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductsPage;