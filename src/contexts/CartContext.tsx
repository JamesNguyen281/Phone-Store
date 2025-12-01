import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, DienThoai } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (dienThoai: DienThoai, soLuong?: number) => void;
  removeFromCart: (dienThoaiId: string) => void;
  updateQuantity: (dienThoaiId: string, soLuong: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (dienThoai: DienThoai, soLuong: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.dien_thoai.id === dienThoai.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.dien_thoai.id === dienThoai.id
            ? { ...item, so_luong: item.so_luong + soLuong }
            : item
        );
      }

      return [...prevCart, { dien_thoai: dienThoai, so_luong: soLuong }];
    });
  };

  const removeFromCart = (dienThoaiId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.dien_thoai.id !== dienThoaiId));
  };

  const updateQuantity = (dienThoaiId: string, soLuong: number) => {
    if (soLuong <= 0) {
      removeFromCart(dienThoaiId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.dien_thoai.id === dienThoaiId ? { ...item, so_luong: soLuong } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.so_luong, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.dien_thoai.gia_tien * item.so_luong, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
