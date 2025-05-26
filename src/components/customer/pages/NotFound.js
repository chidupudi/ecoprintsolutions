// src/customer/pages/NotFound.js
import React from 'react';
import { Result, Button, Card, Row, Col, Typography } from 'antd';
import { HomeOutlined, ShoppingOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '40px 20px', 
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={
            <div>
              <Row gutter={[16, 16]} style={{ marginTop: '32px' }}>
                <Col xs={24} sm={8}>
                  <Button 
                    type="primary" 
                    icon={<HomeOutlined />}
                    onClick={() => navigate('/')}
                    block
                  >
                    Go Home
                  </Button>
                </Col>
                <Col xs={24} sm={8}>
                  <Button 
                    icon={<ShoppingOutlined />}
                    onClick={() => navigate('/products')}
                    block
                  >
                    Shop Now
                  </Button>
                </Col>
                <Col xs={24} sm={8}>
                  <Button 
                    icon={<SearchOutlined />}
                    onClick={() => navigate('/products')}
                    block
                  >
                    Search Products
                  </Button>
                </Col>
              </Row>
            </div>
          }
        />
        
        <Card style={{ marginTop: '32px' }}>
          <Title level={4}>Popular Categories</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Button 
                type="link" 
                onClick={() => navigate('/products/cartridges')}
                block
              >
                Cartridges
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button 
                type="link" 
                onClick={() => navigate('/products/inks')}
                block
              >
                Inks
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button 
                type="link" 
                onClick={() => navigate('/products/drums')}
                block
              >
                Drums
              </Button>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;