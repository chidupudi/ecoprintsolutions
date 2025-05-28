import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Typography, Space, Tag, 
  InputNumber, Divider, Tabs, List, Rate, message,
  Breadcrumb, Spin, Image
} from 'antd';
import { 
  ShoppingCartOutlined, HeartOutlined, ShareAltOutlined,
  ArrowLeftOutlined, CheckCircleOutlined, TruckOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../../services/dbService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { userProfile } = useAuth();

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await dbService.read('products', productId);
      if (!productData) {
        throw new Error('Product not found');
      }
      setProduct(productData);
    } catch (error) {
      message.error(error.message || 'Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    try {
      if (!product) return;
      
      const success = addToCart(product, quantity);
      if (success) {
        message.success(`${product.name} added to cart`);
      } else {
        message.error('Failed to add item to cart');
      }
    } catch (error) {
      message.error('An error occurred while adding to cart');
    }
  };

  const getPrice = () => {
    if (!product) return 0;
    
    if (userProfile?.customerType === 'wholesale' && product.wholesalePrice) {
      return product.wholesalePrice;
    }
    return product.retailPrice || 0;
  };

  const isLowStock = () => {
    if (!product || !product.currentStock || !product.minStockLevel) return false;
    return product.currentStock <= product.minStockLevel;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Product not found</Title>
        <Button type="primary" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Breadcrumb style={{ marginBottom: '20px' }}>
        <Breadcrumb.Item>
          <Button type="link" onClick={() => navigate('/')} style={{ padding: 0 }}>
            Home
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Button type="link" onClick={() => navigate('/products')} style={{ padding: 0 }}>
            Products
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: '20px' }}
      >
        Back
      </Button>

      <Row gutter={[40, 40]}>
        <Col xs={24} md={12}>
          <Card>
            <div style={{ 
              height: '400px', 
              backgroundColor: '#f5f5f5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '8px'
            }}>
              {product.imageUrl && !imageError ? (
                <Image
                  src={product.imageUrl} 
                  alt={product.name}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  onError={() => setImageError(true)}
                  preview={false}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📦</div>
                  <Text>No Image Available</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={2} style={{ marginBottom: '8px' }}>{product.name}</Title>
              <Space>
                <Tag color="blue">{product.sku || 'N/A'}</Tag>
                {isLowStock() && (
                  <Tag color="orange">Low Stock</Tag>
                )}
                {userProfile?.customerType === 'wholesale' && (
                  <Tag color="purple">Wholesale Price</Tag>
                )}
              </Space>
            </div>

            <div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                ₹{getPrice().toFixed(2)}
              </div>
              {userProfile?.customerType === 'wholesale' && product.retailPrice && product.wholesalePrice && product.retailPrice !== product.wholesalePrice && (
                <div>
                  <Text type="secondary" delete style={{ fontSize: '18px' }}>
                    ₹{product.retailPrice.toFixed(2)}
                  </Text>
                  <Text style={{ color: '#52c41a', marginLeft: '10px' }}>
                    Save ₹{(product.retailPrice - product.wholesalePrice).toFixed(2)}
                  </Text>
                </div>
              )}
            </div>

            <div>
              <Space>
                {product.currentStock > 0 ? (
                  <>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text style={{ color: '#52c41a' }}>In Stock ({product.currentStock} available)</Text>
                  </>
                ) : (
                  <>
                    <Text style={{ color: '#ff4d4f' }}>Out of Stock</Text>
                  </>
                )}
              </Space>
            </div>

            <div>
              <Title level={4}>Description</Title>
              <Paragraph>{product.description || 'No description available'}</Paragraph>
            </div>

            {product.compatibility && product.compatibility.length > 0 && (
              <div>
                <Title level={4}>Compatibility</Title>
                <div>
                  {product.compatibility.map((model, index) => (
                    <Tag key={index} style={{ margin: '2px' }}>{model}</Tag>
                  ))}
                </div>
              </div>
            )}

            {product.specifications && (
              <div>
                <Title level={4}>Specifications</Title>
                <List
                  size="small"
                  dataSource={Object.entries(product.specifications)}
                  renderItem={([key, value]) => (
                    <List.Item>
                      <Text strong>{key}:</Text> <Text>{value}</Text>
                    </List.Item>
                  )}
                />
              </div>
            )}

            <Divider />

            <div>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Quantity:</Text>
                  <InputNumber
                    min={1}
                    max={product.currentStock}
                    value={quantity}
                    onChange={setQuantity}
                    style={{ marginLeft: '10px', width: '80px' }}
                    disabled={product.currentStock === 0}
                  />
                  {product.currentStock > 0 && (
                    <Text style={{ marginLeft: '10px', color: '#666' }}>
                      (Max: {product.currentStock})
                    </Text>
                  )}
                </div>

                <Space>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    disabled={product.currentStock === 0}
                    style={{ minWidth: '150px' }}
                  >
                    Add to Cart
                  </Button>
                  <Button size="large" icon={<HeartOutlined />}>
                    Wishlist
                  </Button>
                  <Button size="large" icon={<ShareAltOutlined />}>
                    Share
                  </Button>
                </Space>
              </Space>
            </div>

            <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TruckOutlined style={{ color: '#52c41a' }} />
                  <Text strong>Free Delivery</Text>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  • Same day delivery within city
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  • Cash on delivery available
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  • 30-day return policy
                </Text>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <Card style={{ marginTop: '40px' }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Product Details" key="1">
            <div>
              <Title level={4}>Product Information</Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div><Text strong>SKU:</Text> {product.sku || 'N/A'}</div>
                  <div><Text strong>Category:</Text> {product.category || 'N/A'}</div>
                  <div><Text strong>Current Stock:</Text> {product.currentStock || 0}</div>
                </Col>
                <Col xs={24} sm={12}>
                  <div><Text strong>Min Stock Level:</Text> {product.minStockLevel || 'N/A'}</div>
                  <div><Text strong>Max Stock Level:</Text> {product.maxStockLevel || 'N/A'}</div>
                </Col>
              </Row>
            </div>
          </TabPane>
          
          <TabPane tab="Specifications" key="2">
            {product.specifications ? (
              <List
                dataSource={Object.entries(product.specifications)}
                renderItem={([key, value]) => (
                  <List.Item>
                    <List.Item.Meta
                      title={key}
                      description={value}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">No specifications available</Text>
            )}
          </TabPane>

          <TabPane tab="Reviews" key="3">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Title level={4}>Customer Reviews</Title>
              <Text type="secondary">No reviews yet. Be the first to review this product!</Text>
              <div style={{ marginTop: '20px' }}>
                <Rate allowHalf defaultValue={0} />
                <div style={{ marginTop: '10px' }}>
                  <Button type="primary">Write a Review</Button>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProductDetailPage;