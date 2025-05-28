import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Input, Select, DatePicker, Button, Tag,
  Row, Col, Statistic, Space
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, DownloadOutlined,
  RiseOutlined, FallOutlined
} from '@ant-design/icons';
import { dbService } from '../../services/dbService';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const InventoryTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    dateRange: null
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const transactionData = await dbService.queryDocuments(
        'inventory_transactions', 
        [], 
        'date', 
        'desc',
        100
      );
      setTransactions(transactionData);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(transaction =>
        transaction.productName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.productSku?.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.reason?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange.length === 2) {
      filtered = filtered.filter(transaction => {
        const transactionDate = moment(transaction.date?.toDate ? transaction.date.toDate() : transaction.date);
        return transactionDate.isBetween(filters.dateRange[0], filters.dateRange[1], 'day', '[]');
      });
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date?.toDate ? date.toDate() : date).format('DD/MM/YYYY HH:mm'),
      width: 140,
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productSku}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'stock_in' ? 'green' : 'red'} icon={type === 'stock_in' ? <RiseOutlined /> : <FallOutlined />}>
          {type === 'stock_in' ? 'Stock In' : 'Stock Out'}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: 'Previous Stock',
      dataIndex: 'previousStock',
      key: 'previousStock',
      width: 120,
    },
    {
      title: 'New Stock',
      dataIndex: 'newStock',
      key: 'newStock',
      width: 100,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
    },
  ];

  const transactionStats = {
    total: transactions.length,
    stockIn: transactions.filter(t => t.type === 'stock_in').length,
    stockOut: transactions.filter(t => t.type === 'stock_out').length,
    totalStockIn: transactions.filter(t => t.type === 'stock_in').reduce((sum, t) => sum + (t.quantity || 0), 0),
    totalStockOut: transactions.filter(t => t.type === 'stock_out').reduce((sum, t) => sum + (t.quantity || 0), 0)
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Inventory Transactions</h2>
          <p style={{ margin: 0, color: '#666' }}>
            Track all inventory movements and stock changes
          </p>
        </div>

        {/* Transaction Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="Total Transactions" value={transactionStats.total} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic 
                title="Stock In" 
                value={transactionStats.totalStockIn} 
                valueStyle={{ color: '#52c41a' }}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic 
                title="Stock Out" 
                value={transactionStats.totalStockOut} 
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<FallOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic 
                title="Net Change" 
                value={transactionStats.totalStockIn - transactionStats.totalStockOut} 
                valueStyle={{ color: transactionStats.totalStockIn >= transactionStats.totalStockOut ? '#52c41a' : '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search transactions..."
              allowClear
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by type"
              style={{ width: '100%' }}
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
            >
              <Option value="all">All Types</Option>
              <Option value="stock_in">Stock In</Option>
              <Option value="stock_out">Stock Out</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col xs={24} sm={2}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilters({ search: '', type: 'all', dateRange: null })}
            >
              Clear
            </Button>
          </Col>
        </Row>

        {/* Transactions Table */}
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default InventoryTransactions;