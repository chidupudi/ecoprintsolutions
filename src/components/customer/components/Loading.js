// src/customer/components/Loading.js
import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Loading = ({ 
  size = 'large', 
  message = 'Loading...', 
  fullScreen = false,
  style = {} 
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '40px',
    ...style
  };

  return (
    <div style={containerStyle}>
      <Spin indicator={antIcon} size={size} />
      {message && (
        <Text type="secondary" style={{ marginTop: '16px', fontSize: '16px' }}>
          {message}
        </Text>
      )}
    </div>
  );
};

export default Loading;