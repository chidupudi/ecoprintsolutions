// src/context/AuthContext.js - UPDATED WITH APPROVAL CHECKS
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component that wraps your app
export const AuthProvider = ({ children }) => {
  // State to track current user
  const [currentUser, setCurrentUser] = useState(null);
  
  // State to track user profile data from Firestore
  const [userProfile, setUserProfile] = useState(null);
  
  // Loading state for initial auth check
  const [loading, setLoading] = useState(true);
  
  // User access status (for approval system)
  const [userAccess, setUserAccess] = useState({ hasAccess: true, reason: null });

  // Effect to listen for authentication state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        // User is logged in
        setCurrentUser(user);
        try {
          // Fetch additional user data from Firestore
          const profile = await authService.getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Check user access (approval status)
          const accessStatus = await authService.checkUserAccess(user.uid);
          setUserAccess(accessStatus);
          
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
          setUserAccess({ hasAccess: false, reason: 'Profile not found' });
        }
      } else {
        // User is logged out
        setCurrentUser(null);
        setUserProfile(null);
        setUserAccess({ hasAccess: true, reason: null });
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const user = await authService.login(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (email, password, userData) => {
    try {
      const user = await authService.register(email, password, userData);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return userProfile?.role === role;
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return userProfile?.permissions?.includes(permission);
  };

  // Check if user is admin
  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

  // Check if user is manager (admin or manager role)
  const isManager = () => {
    return userProfile?.role === 'admin' || userProfile?.role === 'manager';
  };

  // Check if user is customer
  const isCustomer = () => {
    return userProfile?.role?.includes('customer');
  };

  // Get customer type (retail/wholesale)
  const getCustomerType = () => {
    return userProfile?.customerType || 'retail';
  };

  // Check if user is approved (for wholesale customers)
  const isApproved = () => {
    if (!userProfile) return false;
    
    // Retail customers are always approved
    if (userProfile.customerType === 'retail') return true;
    
    // Wholesale customers need approval
    return userProfile.approvalStatus === 'approved';
  };

  // Get approval status message
  const getApprovalMessage = () => {
    if (!userProfile || userProfile.customerType === 'retail') return null;
    
    switch (userProfile.approvalStatus) {
      case 'pending':
        return 'Your wholesale account is pending admin approval. You will be notified once approved.';
      case 'rejected':
        return 'Your wholesale account application has been rejected. Please contact support for more information.';
      case 'approved':
        return null;
      default:
        return 'Unknown approval status. Please contact support.';
    }
  };

  // Check if user can access specific features
  const canAccessFeature = (feature) => {
    if (!currentUser || !userProfile) return false;
    
    // Admin can access everything
    if (isAdmin()) return true;
    
    // Check user access first
    if (!userAccess.hasAccess) return false;
    
    // Feature-specific checks
    switch (feature) {
      case 'shopping':
        return isApproved();
      case 'wholesale_pricing':
        return userProfile.customerType === 'wholesale' && isApproved();
      case 'orders':
        return isApproved();
      case 'checkout':
        return isApproved();
      default:
        return true;
    }
  };

  // Refresh user data (useful after approval status changes)
  const refreshUserData = async () => {
    if (currentUser) {
      try {
        const profile = await authService.getUserProfile(currentUser.uid);
        setUserProfile(profile);
        
        const accessStatus = await authService.checkUserAccess(currentUser.uid);
        setUserAccess(accessStatus);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  // Value object that will be provided to all children
  const value = {
    // User data
    currentUser,
    userProfile,
    loading,
    userAccess,
    
    // Authentication functions
    login,
    register,
    logout,
    resetPassword,
    
    // Role/permission checking functions
    hasRole,
    hasPermission,
    isAdmin,
    isManager,
    isCustomer,
    getCustomerType,
    
    // Approval system functions
    isApproved,
    getApprovalMessage,
    canAccessFeature,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};