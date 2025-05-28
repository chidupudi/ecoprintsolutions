// src/components/customer/pages/CustomerHome.js - FIXED WITH DEBUG
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Typography, Space, Tag, 
  Carousel, Statistic, Input, Alert, Spin 
} from 'antd';
import { 
  ShoppingCartOutlined, PrinterOutlined, 
  InboxOutlined, TrophyOutlined, ArrowRightOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../../../services/dbService';
import { useCart } from '../hooks/useCart';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const CustomerHome = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    console.log('🔄 Starting to load home data...');
    setDebugInfo('Loading data...');
    
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Test basic connection
      console.log('🔗 Testing database connection...');
      
      // Load categories first
      console.log('📂 Loading categories...');
      setDebugInfo('Loading categories...');
      
      const cats = await dbService.getAll('categories');
      console.log('📂 Categories loaded:', cats.length, cats);
      setCategories(cats);
      
      if (cats.length === 0) {
        console.warn('⚠️ No categories found in database');
        setDebugInfo('No categories found');
      }
      
      // Load all products first to debug
      console.log('📦 Loading all products...');
      setDebugInfo('Loading all products...');
      
      const allProducts = await dbService.getAll('products');
      console.log('📦 All products loaded:', allProducts.length, allProducts);
      
      if (allProducts.length === 0) {
        console.warn('⚠️ No products found in database');
        setError('No products found in database. Please add some products first.');
        setDebugInfo('No products found in database');
        setLoading(false);
        return;
      }
      
      // Filter active products with stock
      const activeProducts = allProducts.filter(product => {
        const isActive = product.isActive === true;
        const hasStock = product.currentStock > 0;
        console.log(`Product ${product.name}: active=${isActive}, stock=${product.currentStock}, hasStock=${hasStock}`);
        return isActive && hasStock;
      });
      
      console.log('✅ Active products with stock:', activeProducts.length, activeProducts);
      
      if (activeProducts.length === 0) {
        console.warn('⚠️ No active products with stock found');
        setError('No products available. All products are either inactive or out of stock.');
        setDebugInfo('No active products with stock');
      }
      
      // Sort by stock level (highest first) and take first 8
      const sortedProducts = activeProducts.sort((a, b) => b.currentStock - a.currentStock);
      const featured = sortedProducts.slice(0, 8);
      
      console.log('⭐ Featured products:', featured.length, featured);
      setFeaturedProducts(featured);
      setDebugInfo(`Loaded ${featured.length} featured products, ${cats.length} categories`);
      
    } catch (error) {
      console.error('❌ Error loading home data:', error);
      setError('Failed to load data: ' + error.message);
      setDebugInfo('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const CategoryCard = ({ category }) => (
    <Card 
      className="category-card"
      hoverable
      onClick={() => navigate(`/products/${category.id}`)}
    >
      <div className="category-icon">
        <PrinterOutlined />
      </div>
      <Title level={4}>{category.name}</Title>
      <Text type="secondary">{category.description}</Text>
    </Card>
  );

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
            <Tag color={product.currentStock > product.minStockLevel ? 'green' : 'orange'}>
              Stock: {product.currentStock}
            </Tag>
          </Space>
        }
      />
    </Card>
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <Text>{debugInfo}</Text>
      </div>
    );
  }

  return (
    <div>
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Alert
          message="Debug Info"
          description={`${debugInfo} | Products: ${featuredProducts.length} | Categories: ${categories.length}`}
          type="info"
          style={{ margin: '16px 20px' }}
          closable
        />
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Data"
          description={error}
          type="error"
          style={{ margin: '16px 20px' }}
          action={
            <Button size="small" onClick={loadHomeData}>
              Retry
            </Button>
          }
        />
      )}

      {/* Hero Section */}
      <div className="hero-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Title className="hero-title" style={{ color: 'white' }}>
            Your Trusted Partner for All Printing Needs
          </Title>
          <Paragraph className="hero-subtitle" style={{ color: 'white' }}>
            Quality cartridges, inks, and drums at unbeatable prices. 
            Fast delivery and excellent customer service guaranteed.
          </Paragraph>
          
          <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: '500px' }}>
            <Search
              placeholder="Search for cartridges, inks, drums..."
              allowClear
              enterButton="Search"
              size="large"
              onSearch={handleSearch}
            />
            
            <Space wrap>
              <Button type="primary" size="large" onClick={() => navigate('/products')}>
                Shop Now
              </Button>
              <Button size="large" style={{ color: 'white', borderColor: 'white' }}>
                View Catalog
              </Button>
            </Space>
          </Space>
        </div>
      </div>

      {/* Statistics Section */}
      <div style={{ background: 'white', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <Statistic 
                  title="Products" 
                  value={featuredProducts.length} 
                  prefix={<InboxOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <Statistic 
                  title="Happy Customers" 
                  value={1250} 
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <Statistic 
                  title="Years Experience" 
                  value={15} 
                  valueStyle={{ color: '#faad14' }}
                />
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <Statistic 
                  title="Fast Delivery" 
                  value="24hrs" 
                  valueStyle={{ color: '#722ed1' }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <div style={{ background: '#f5f5f5', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <Title level={2}>Shop by Category</Title>
              <Paragraph type="secondary">
                Find exactly what you need for your printer
              </Paragraph>
            </div>
            
            <Row gutter={[24, 24]}>
              {categories.map(category => (
                <Col xs={24} sm={12} md={8} key={category.id}>
                  <CategoryCard category={category} />
                </Col>
              ))}
            </Row>
          </div>
        </div>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 ? (
        <div style={{ background: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '50px' 
            }}>
              <div>
                <Title level={2}>Featured Products</Title>
                <Paragraph type="secondary">
                  Best selling items this month
                </Paragraph>
              </div>
              <Button 
                type="primary" 
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/products')}
              >
                View All Products
              </Button>
            </div>
            
            <Row gutter={[24, 24]}>
              {featuredProducts.slice(0, 8).map(product => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <Title level={3}>No Products Available</Title>
          <Paragraph>
            Products will appear here once they are added to the inventory.
          </Paragraph>
        </div>
      )}

      {/* Features Section */}
      <div style={{ background: '#001529', color: 'white', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚚</div>
                <Title level={4} style={{ color: 'white' }}>Fast Delivery</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Same day delivery within city limits. Express shipping available nationwide.
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✅</div>
                <Title level={4} style={{ color: 'white' }}>Quality Guaranteed</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  All products tested and verified. 30-day return policy on all items.
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💰</div>
                <Title level={4} style={{ color: 'white' }}>Best Prices</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Competitive pricing with bulk discounts. Special rates for wholesale customers.
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;