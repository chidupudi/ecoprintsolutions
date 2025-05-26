// src/components/DatabaseSetup.js
import React, { useState } from 'react';
import { initializeDatabase } from '../utils/initializeDatabase';
import { createAdminUser } from '../utils/createAdminUser';

const DatabaseSetup = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [adminForm, setAdminForm] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  const handleInitializeDatabase = async () => {
    setLoading(true);
    setMessage('Initializing database...');
    
    const result = await initializeDatabase();
    
    if (result.success) {
      setMessage('✅ Database initialized successfully with sample data!');
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
    
    setLoading(false);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (!adminForm.email || !adminForm.password || !adminForm.displayName) {
      setMessage('❌ Please fill in all admin user fields');
      return;
    }

    setLoading(true);
    setMessage('Creating admin user...');
    
    const result = await createAdminUser(
      adminForm.email,
      adminForm.password,
      adminForm.displayName
    );
    
    if (result.success) {
      setMessage('✅ Admin user created successfully!');
      setAdminForm({ email: '', password: '', displayName: '' });
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>🚀 Database Setup</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Step 1: Initialize Database</h3>
        <p>This will create collections and add sample data (products, categories, suppliers)</p>
        <button 
          onClick={handleInitializeDatabase}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Initializing...' : 'Initialize Database'}
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Step 2: Create Admin User</h3>
        <form onSubmit={handleCreateAdmin}>
          <div style={{ marginBottom: '15px' }}>
            <label>Admin Email:</label>
            <input
              type="email"
              value={adminForm.email}
              onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
              placeholder="admin@ecoprintsolutions.com"
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Admin Password:</label>
            <input
              type="password"
              value={adminForm.password}
              onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
              placeholder="Strong password"
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Display Name:</label>
            <input
              type="text"
              value={adminForm.displayName}
              onChange={(e) => setAdminForm({...adminForm, displayName: e.target.value})}
              placeholder="Admin User"
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Admin User'}
          </button>
        </form>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default DatabaseSetup;