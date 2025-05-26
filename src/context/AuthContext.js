// src/context/AuthContext.js
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
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        // User is logged out
        setCurrentUser(null);
        setUserProfile(null);
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

  // Value object that will be provided to all children
  const value = {
    // User data
    currentUser,
    userProfile,
    loading,
    
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
    getCustomerType
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Example usage in a component:
/*
import { useAuth } from '../context/AuthContext';

const SomeComponent = () => {
  const { 
    currentUser, 
    userProfile, 
    login, 
    logout, 
    isAdmin,
    hasPermission 
  } = useAuth();

  if (!currentUser) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {userProfile?.displayName}</h1>
      {isAdmin() && <AdminPanel />}
      {hasPermission('inventory_write') && <AddProductButton />}
      <button onClick={logout}>Logout</button>
    </div>
  );
};
*/