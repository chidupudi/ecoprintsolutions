import { useState, useEffect, createContext, useContext } from 'react';
import { message } from 'antd';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity + quantity > product.currentStock) {
        message.warning('Cannot add more items than available stock');
        return false;
      }
      
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      if (quantity > product.currentStock) {
        message.warning('Cannot add more items than available stock');
        return false;
      }
      
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        image: product.imageUrl,
        currentStock: product.currentStock,
        quantity: quantity
      }]);
    }
    
    message.success(`${product.name} added to cart`);
    return true;
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
    message.success('Item removed from cart');
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    const item = cartItems.find(item => item.id === productId);
    if (newQuantity > item.currentStock) {
      message.warning('Cannot exceed available stock');
      return;
    }

    setCartItems(cartItems.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    message.success('Cart cleared');
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
