// src/components/storefront/Storefront.js
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, InputNumber, Tag, Input, Select, 
  Space, Badge, Drawer, List, message, Typography,
  Affix, Empty
} from 'antd';
import { 
  ShoppingCartOutlined, SearchOutlined,
  PlusOutlined, MinusOutlined, DeleteOutlined
} from '@ant-design/icons';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const Storefront = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartVisible, setCartVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { userProfile, getCustomerType } = useAuth();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchText, selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productData = await dbService.queryDocuments('products', [
        { field: 'isActive', operator: '==', value: true },
        { field: 'currentStock', operator: '>', value: 0 }
      ]);
      setProducts(productData);
    } catch (error) {
      message.error('Failed to load products');
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
      console.error('Failed to load categories');
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchText) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const getProductPrice = (product) => {
    const customerType = getCustomerType();
    return customerType === 'wholesale' ? product.wholesalePrice : product.retailPrice;
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        message.warning('Cannot add more items than available stock');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        ...product,
        quantity: 1,
        price: getProductPrice(product)
      }]);
    }
    message.success(`${product.name} added to cart`);
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.currentStock) {
      message.warning('Cannot exceed available stock');
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      message.warning('Your cart is empty');
      return;
    }

    message.info('Checkout functionality will be implemented next');
    console.log('Order Details:', {
      customer: userProfile,
      items: cart,
      total: calculateCartTotal()
    });
  };

  const ProductCard = ({ product }) => (
    <Card
      hoverable
      style={{ height: '100%' }}
      cover={
        <div style={{ 
          height: 200, 
          backgroundColor: '#f5f5f5', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Text type="secondary">No Image</Text>
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
            <Text ellipsis={{ rows: 2 }}>{product.description}</Text>
            
            <div>
              <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                ₹{getProductPrice(product)}
              </Text>
              {getCustomerType() === 'wholesale' && (
                <Text type="secondary" delete style={{ marginLeft: 8 }}>
                  ₹{product.retailPrice}
                </Text>
              )}
            </div>

            <div>
              <Tag color={product.currentStock > product.minStockLevel ? 'green' : 'orange'}>
                Stock: {product.currentStock}
              </Tag>
              {getCustomerType() === 'wholesale' && (
                <Tag color="purple">Wholesale Price</Tag>
              )}
            </div>

            {product.compatibility && product.compatibility.length > 0 && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Compatible: {product.compatibility.join(', ')}
                </Text>
              </div>
            )}
          </Space>
        }
      />
    </Card>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Eco Print Solutions Store
            </Title>
            {userProfile && (
              <Text type="secondary">
                Welcome, {userProfile.displayName} 
                {getCustomerType() === 'wholesale' && (
                  <Tag color="purple" style={{ marginLeft: 8 }}>Wholesale Customer</Tag>
                )}
              </Text>
            )}
          </Col>
          <Col>
            <Affix offsetTop={20}>
              <Badge count={getTotalCartItems()} showZero={false}>
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => setCartVisible(true)}
                  size="large"
                >
                  Cart (₹{calculateCartTotal().toFixed(2)})
                </Button>
              </Badge>
            </Affix>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search products..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by category"
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              <Option value="all">All Categories</Option>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">
              {filteredProducts.length} products found
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Products Grid */}
      <Row gutter={[16, 16]}>
        {filteredProducts.map(product => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>

      {filteredProducts.length === 0 && !loading && (
        <Empty 
          description="No products found"
          style={{ marginTop: 100 }}
        />
      )}

      {/* Cart Drawer */}
      <Drawer
        title={`Shopping Cart (${getTotalCartItems()} items)`}
        placement="right"
        onClose={() => setCartVisible(false)}
        visible={cartVisible}
        width={400}
        footer={
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>Total: ₹{calculateCartTotal().toFixed(2)}</Title>
            </div>
            <Button
              type="primary"
              size="large"
              block
              onClick={proceedToCheckout}
              disabled={cart.length === 0}
            >
              Proceed to Checkout
            </Button>
          </div>
        }
      >
        {cart.length === 0 ? (
          <Empty description="Your cart is empty" />
        ) : (
          <List
            dataSource={cart}
            renderItem={item => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>{item.name}</Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text>₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <Button 
                        size="small" 
                        icon={<MinusOutlined />}
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      />
                      <InputNumber
                        size="small"
                        min={1}
                        max={item.currentStock}
                        value={item.quantity}
                        onChange={(value) => updateCartQuantity(item.id, value)}
                        style={{ width: 60 }}
                      />
                      <Button 
                        size="small" 
                        icon={<PlusOutlined />}
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      />
                    </Space>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeFromCart(item.id)}
                    />
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </div>
  );
};

export default Storefront;