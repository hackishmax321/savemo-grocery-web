import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Context
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [orders, setOrders] = useState(() => {
    // Load orders from localStorage on initial render
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Add item to cart
  const addToCart = (item, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity,
          updatedAt: new Date().toISOString()
        };
        return updatedCart;
      } else {
        // Add new item to cart
        const cartItem = {
          ...item,
          quantity,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return [...prevCart, cartItem];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  // Update item quantity in cart
  const updateCartItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Place order from cart
  const placeOrder = (shippingInfo = {}) => {
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    const newOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      items: [...cart],
      total: getCartTotal(),
      status: 'processing',
      createdAt: new Date().toISOString(),
      shippingInfo,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);
    clearCart(); // Clear cart after placing order
    
    return newOrder;
  };

  // Load all orders
  const loadOrders = () => {
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Get order by ID
  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  // Cancel order
  const cancelOrder = (orderId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : order
      )
    );
  };

  // Delete order (only if not shipped)
  const deleteOrder = (orderId) => {
    const order = getOrderById(orderId);
    if (order && order.status === 'cancelled') {
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      return true;
    }
    return false;
  };

  // Add item to wishlist (if needed)
  const addToWishlist = (item) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!wishlist.some(wishlistItem => wishlistItem.id === item.id)) {
      wishlist.push({
        ...item,
        addedAt: new Date().toISOString()
      });
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      return true;
    }
    return false;
  };

  // Remove item from wishlist
  const removeFromWishlist = (itemId) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updatedWishlist = wishlist.filter(item => item.id !== itemId);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  // Load wishlist
  const loadWishlist = () => {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
  };

  // Check if item is in wishlist
  const isInWishlist = (itemId) => {
    const wishlist = loadWishlist();
    return wishlist.some(item => item.id === itemId);
  };

  const value = {
    cart,
    orders,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    placeOrder,
    loadOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    addToWishlist,
    removeFromWishlist,
    loadWishlist,
    isInWishlist
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};