// src/customer/components/ErrorBoundary.js
import React from 'react';
import { Result, Button, Typography, Space } from 'antd';
import { HomeOutlined, ReloadOutlined, BugOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div style={{ 
          padding: '40px 20px', 
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <Result
              status="500"
              title="Oops! Something went wrong"
              subTitle="We're sorry for the inconvenience. The page encountered an unexpected error."
              icon={<BugOutlined style={{ color: '#ff4d4f' }} />}
              extra={
                <Space direction="vertical" size="large">
                  <Paragraph type="secondary">
                    Don't worry, our team has been notified and is working to fix this issue.
                    You can try refreshing the page or go back to the homepage.
                  </Paragraph>
                  
                  <Space wrap>
                    <Button 
                      type="primary" 
                      icon={<ReloadOutlined />}
                      onClick={() => window.location.reload()}
                      size="large"
                    >
                      Refresh Page
                    </Button>
                    
                    <Button 
                      icon={<HomeOutlined />}
                      onClick={() => window.location.href = '/'}
                      size="large"
                    >
                      Go Home
                    </Button>
                  </Space>
                </Space>
              }
            />
            
            {/* Error Details (for development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginTop: '40px', 
                padding: '20px', 
                backgroundColor: '#fff', 
                borderRadius: '8px',
                textAlign: 'left',
                border: '1px solid #d9d9d9'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#ff4d4f'
                }}>
                  Error Details (Development Mode)
                </summary>
                <div style={{ 
                  fontSize: '12px', 
                  fontFamily: 'monospace',
                  color: '#666',
                  whiteSpace: 'pre-wrap'
                }}>
                  <strong>Error:</strong> {this.state.error.toString()}
                  <br /><br />
                  <strong>Stack Trace:</strong>
                  <br />
                  {this.state.errorInfo.componentStack}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;