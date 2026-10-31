'use client';
import React, {createContext, useContext, useEffect, useMemo, useState, useCallback} from 'react';
import {formatPrice} from '@/lib/shopify';

export type CartItem = {
  id: string;
  handle: string;
  title: string;
  variantTitle: string;
  image: string | null;
  amount: string;
  currency: string;
  quantity: number;
  vendor: string;
  category: 'original' | 'discover';
};

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  currency: string;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  update: (id: string, quantity: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (state: boolean) => void;
  showToast: (msg: string) => void;
};

const CartContext = createContext<CartContextType | null>(null);
const KEY = 'playnex-shop-cart-v2';

export function CartProvider({children}: {children: React.ReactNode}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const value = localStorage.getItem(KEY);
      if (value) {
        const v = JSON.parse(value);
        if (Array.isArray(v)) {
          setItems(
            v
              .filter((x) => x && typeof x.id === 'string' && Number.isInteger(x.quantity) && x.quantity > 0)
              .slice(0, 50)
          );
        }
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {}
    }
  }, [items, ready]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const add = (item: CartItem) => {
    setItems((previous) => {
      const found = previous.find((x) => x.id === item.id);
      return found
        ? previous.map((x) =>
            x.id === item.id ? {...x, quantity: Math.min(10, x.quantity + item.quantity)} : x
          )
        : [...previous, item];
    });
    showToast(`Added "${item.title}" to your bag!`);
    setOpen(true);
  };

  const update = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((previous) => previous.filter((x) => x.id !== id));
      return;
    }
    setItems((previous) =>
      previous.map((x) => (x.id === id ? {...x, quantity: Math.max(1, Math.min(10, quantity))} : x))
    );
  };

  const clear = () => {
    setItems([]);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  };

  const remove = (id: string) => {
    const item = items.find((x) => x.id === id);
    if (item) {
      showToast(`Removed "${item.title}" from your bag`);
    }
    setItems((previous) => previous.filter((x) => x.id !== id));
  };

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      total: items.reduce((s, i) => s + Number(i.amount) * i.quantity, 0),
      currency: items[0]?.currency || 'INR',
      add,
      remove,
      update,
      clear,
      open,
      setOpen,
      showToast
    }),
    [items, open, showToast]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="cart-toast" role="status" aria-live="polite" onClick={() => setToast(null)}>
          <span className="cart-toast-icon">✓</span>
          <span className="cart-toast-msg">{toast}</span>
          <button type="button" className="cart-toast-close" aria-label="Dismiss notification">
            ×
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart requires CartProvider');
  return ctx;
}

export const price = (amount: number, currency = 'INR') => formatPrice(amount, currency);
