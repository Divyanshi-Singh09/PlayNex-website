'use client';

import React, {createContext, useContext, useEffect, useState, useCallback} from 'react';
import type {CustomerUser} from '@/lib/shopify-customer';
import {useCart, type CartItem} from './CartProvider';

type AuthContextType = {
  user: CustomerUser | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalReason: 'checkout' | 'account' | null;
  pendingCartItem: CartItem | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: {
      address1: string;
      address2?: string;
      city: string;
      province: string;
      zip: string;
      country?: string;
    };
  }) => Promise<{ success: boolean; error?: string }>;
  updateDetails: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  }) => Promise<{ success: boolean; error?: string; customer?: CustomerUser }>;
  refreshUser: () => Promise<CustomerUser | null>;
  logout: () => Promise<void>;
  recoverPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  openAuthModal: (reasonOrItem?: 'checkout' | 'account' | CartItem) => void;
  closeAuthModal: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<CustomerUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('playnex_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<'checkout' | 'account' | null>(null);
  const [pendingCartItem, setPendingCartItem] = useState<CartItem | null>(null);
  const cart = useCart();

  // Load session from cookie on mount
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.customer) {
          setUser(data.customer);
          try {
            localStorage.setItem('playnex_customer_user', JSON.stringify(data.customer));
          } catch {}
          return data.customer;
        }
      }
    } catch (err) {
      console.error('Session refresh failed:', err);
    }
    return null;
  }, []);

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.customer) {
            setUser(data.customer);
            try {
              localStorage.setItem('playnex_customer_user', JSON.stringify(data.customer));
            } catch {}
          } else if (mounted) {
            setUser(null);
            try {
              localStorage.removeItem('playnex_customer_user');
            } catch {}
          }
        } else if (mounted) {
          setUser(null);
          try {
            localStorage.removeItem('playnex_customer_user');
          } catch {}
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const openAuthModal = useCallback((reasonOrItem?: 'checkout' | 'account' | CartItem) => {
    // If the person is already signed in, do NOT ask them for signin!
    if (user) {
      if (reasonOrItem === 'checkout') {
        cart.setOpen(true);
      }
      return;
    }

    if (typeof reasonOrItem === 'string') {
      setAuthModalReason(reasonOrItem);
      setPendingCartItem(null);
    } else if (reasonOrItem && typeof reasonOrItem === 'object') {
      setPendingCartItem(reasonOrItem);
      setAuthModalReason(null);
    } else {
      setAuthModalReason(null);
    }
    setIsAuthModalOpen(true);
  }, [user, cart]);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
  }, []);

  const handlePostAuthAction = useCallback(
    (customer: CustomerUser) => {
      setUser(customer);
      try {
        localStorage.setItem('playnex_customer_user', JSON.stringify(customer));
      } catch {}
      setIsAuthModalOpen(false);

      if (pendingCartItem) {
        cart.add(pendingCartItem);
        cart.setOpen(true);
        setPendingCartItem(null);
      } else if (authModalReason === 'checkout') {
        // Reopen cart drawer for checkout flow
        cart.setOpen(true);
      }
      setAuthModalReason(null);
    },
    [pendingCartItem, authModalReason, cart]
  );

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });
      const data = await res.json();
      if (!res.ok || !data.customer) {
        return {success: false, error: data.error || 'Invalid email or password.'};
      }
      handlePostAuthAction(data.customer);
      return {success: true};
    } catch {
      return {success: false, error: 'Network error. Please try again.'};
    }
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: {
      address1: string;
      address2?: string;
      city: string;
      province: string;
      zip: string;
      country?: string;
    };
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.customer) {
        return {success: false, error: resData.error || 'Registration failed.'};
      }
      handlePostAuthAction(resData.customer);
      return {success: true};
    } catch {
      return {success: false, error: 'Network error. Please try again.'};
    }
  };

  const updateDetails = async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/details', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.customer) {
        return {success: false, error: resData.error || 'Could not update profile details.'};
      }
      setUser(resData.customer);
      try {
        localStorage.setItem('playnex_customer_user', JSON.stringify(resData.customer));
        if (resData.customer.defaultAddress || resData.customer.phone) {
          localStorage.setItem(
            'playnex_saved_delivery_address',
            JSON.stringify({
              phone: resData.customer.phone || data.phone || '',
              address1: resData.customer.defaultAddress?.address1 || data.address1 || '',
              address2: resData.customer.defaultAddress?.address2 || data.address2 || '',
              city: resData.customer.defaultAddress?.city || data.city || '',
              province: resData.customer.defaultAddress?.province || data.province || '',
              zip: resData.customer.defaultAddress?.zip || data.zip || '',
              country: resData.customer.defaultAddress?.country || data.country || 'India'
            })
          );
        }
      } catch {}
      return {success: true, customer: resData.customer};
    } catch {
      return {success: false, error: 'Network error. Please try again.'};
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {method: 'POST'});
    } catch {
      // Ignored
    } finally {
      setUser(null);
      try {
        localStorage.removeItem('playnex_customer_user');
      } catch {}
      setPendingCartItem(null);
      // Clear all items and close the bag when customer logs out
      cart.clear();
      cart.setOpen(false);
      cart.showToast('Signed out. Your shopping bag has been cleared.');
    }
  };

  const recoverPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email})
      });
      const data = await res.json();
      if (!res.ok) {
        return {success: false, error: data.error || 'Password recovery failed.'};
      }
      return {success: true};
    } catch {
      return {success: false, error: 'Network error. Please try again.'};
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        authModalReason,
        pendingCartItem,
        login,
        register,
        updateDetails,
        refreshUser,
        logout,
        recoverPassword,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

