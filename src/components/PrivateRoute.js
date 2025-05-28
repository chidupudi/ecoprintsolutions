// src/components/PrivateRoute.js - FIXED VERSION
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole = null, adminOnly = false }) => {
  const { currentUser, userProfile, loading, isAdmin, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: '#666' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Wait for user profile to load
  if (!userProfile) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: '#666' }}>
            Loading user profile...
          </p>
        </div>
      </div>
    );
  }

  // Check if admin only route
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if specific role is required
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // User is authenticated and has required permissions
  return children;
};

export default PrivateRoute;