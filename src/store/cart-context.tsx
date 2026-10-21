// ============================================================================
// Cart Store & Context: src/store/cart-context.tsx
// Persistent client-side shopping cart keyed by (SKU + Size).
// ============================================================================

'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem } from '@/types/domain';

interface CartContextValue {
  items: CartItem[];
  totalQuantity: number;
  subtotalAmount: number;
  totalSavingsAmount: number;
  isHydrated: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (sku: string, size: string, quantity: number) => void;
  removeItem: (sku: string, size: string) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'vastra_studio_cart_v1';

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore storage read errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write errors
    }
  }, [items, isHydrated]);

  const addItem = (incoming: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.sku === incoming.sku && i.size === incoming.size
      );

      if (idx === -1) {
        const clampedQty = Math.min(incoming.quantity, Math.max(1, incoming.maxStock));
        return [...prev, { ...incoming, quantity: clampedQty }];
      }

      const updated = [...prev];
      const existing = updated[idx];
      const nextQuantity = Math.min(
        existing.quantity + incoming.quantity,
        Math.max(1, incoming.maxStock)
      );
      updated[idx] = {
        ...existing,
        unitPrice: incoming.unitPrice,
        originalPrice: incoming.originalPrice,
        maxStock: incoming.maxStock,
        quantity: nextQuantity,
      };
      return updated;
    });
  };

  const updateQuantity = (sku: string, size: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => !(i.sku === sku && i.size === size));
      }
      return prev.map((i) => {
        if (i.sku === sku && i.size === size) {
          return {
            ...i,
            quantity: Math.min(quantity, Math.max(1, i.maxStock)),
          };
        }
        return i;
      });
    });
  };

  const removeItem = (sku: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.sku === sku && i.size === size)));
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = useMemo<CartContextValue>(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalAmount = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const totalSavingsAmount = items.reduce((sum, item) => {
      const diff = Math.max(0, item.originalPrice - item.unitPrice);
      return sum + diff * item.quantity;
    }, 0);

    return {
      items,
      totalQuantity,
      subtotalAmount,
      totalSavingsAmount,
      isHydrated,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [items, isHydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
