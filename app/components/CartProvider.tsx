"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  format: string;
  price: number;
  qty: number;
  coverImage: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "bp_cart";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("bp-cart-updated"));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
    const sync = () => setItems(readCart());
    window.addEventListener("storage", sync);
    window.addEventListener("bp-cart-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("bp-cart-updated", sync);
    };
  }, []);

  const commit = useCallback((next: CartItem[]) => {
    setItems(next);
    writeCart(next);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      const current = readCart();
      const existing = current.find((entry) => entry.id === item.id);
      const next = existing
        ? current.map((entry) => (entry.id === item.id ? { ...entry, qty: entry.qty + qty } : entry))
        : [...current, { ...item, qty }];
      commit(next);
    },
    [commit]
  );

  const setQty = useCallback(
    (id: string, qty: number) => {
      const current = readCart();
      const next = qty <= 0 ? current.filter((item) => item.id !== id) : current.map((item) => (item.id === id ? { ...item, qty } : item));
      commit(next);
    },
    [commit]
  );

  const removeItem = useCallback(
    (id: string) => {
      commit(readCart().filter((item) => item.id !== id));
    },
    [commit]
  );

  const clearCart = useCallback(() => commit([]), [commit]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    return { items, count, subtotal, addItem, setQty, removeItem, clearCart };
  }, [items, addItem, setQty, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
