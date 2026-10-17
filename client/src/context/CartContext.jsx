import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('wholesale_cart');
    return saved ? JSON.parse(saved) : {};
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('wholesale_cart', JSON.stringify(cart));
  }, [cart]);

  // Compute live tier unit price for any product based on current quantity
  const getTierPrice = (product, qty) => {
    if (!product) return 0;
    if (!qty || qty <= 0) return product.base_price;
    if (!product.price_tiers || product.price_tiers.length === 0) return product.base_price;

    const matchedTiers = product.price_tiers
      .filter(t => qty >= t.min_qty && (t.max_qty === null || qty <= t.max_qty))
      .sort((a, b) => b.min_qty - a.min_qty);

    if (matchedTiers.length > 0) {
      return matchedTiers[0].unit_price;
    }
    return product.base_price;
  };

  const addToCart = (product, qty) => {
    const quantity = Math.max(1, parseInt(qty, 10) || product.min_order_qty || 1);
    setCart(prev => {
      const existing = prev[product.product_id];
      const newQty = existing ? existing.quantity + quantity : quantity;
      return {
        ...prev,
        [product.product_id]: {
          product,
          quantity: newQty
        }
      };
    });
  };

  const updateCartQty = (productId, newQty, productFallback = null) => {
    const qty = Math.max(0, parseInt(newQty, 10) || 0);
    setCart(prev => {
      const updated = { ...prev };
      if (qty === 0) {
        delete updated[productId];
      } else {
        const prod = updated[productId]?.product || productFallback;
        if (prod) {
          updated[productId] = {
            product: prod,
            quantity: qty
          };
        }
      }
      return updated;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem('wholesale_cart');
  };

  const cartItems = Object.values(cart);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce((sum, item) => {
    const unitPrice = getTierPrice(item.product, item.quantity);
    return sum + (unitPrice * item.quantity);
  }, 0);

  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <CartContext.Provider value={{
      cart,
      cartItems,
      totalItemCount,
      subtotal,
      tax,
      total,
      getTierPrice,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      isCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false)
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
