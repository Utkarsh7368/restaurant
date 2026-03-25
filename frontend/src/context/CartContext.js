import React, { createContext, useState, useContext } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (_id, delta) => {
    setCartItems(prev => {
      return prev.reduce((acc, item) => {
        if (item._id === _id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return acc; // remove item
          return [...acc, { ...item, quantity: newQty }];
        }
        return [...acc, item];
      }, []);
    });
  };

  const removeFromCart = (_id) => {
    setCartItems(prev => prev.filter(i => i._id !== _id));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cartItems.reduce((sum, item) => {
    const priceNum = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace('₹', ''));
    return sum + (priceNum * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
