import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  CartItem,
  Product,
  ProductInput,
  Sale,
  UtangGroup,
  Variant,
} from '../types';
import { getCategorySalesToday, getMonthlyCashSales } from '../utils/analytics';

const toNumber = (value: number | string): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const txId = () => {
  const uniquePart =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `TX-${uniquePart.toUpperCase()}`;
};

type AppState = {
  user: User | null;
  loading: boolean;
  inventory: Product[];
  sales: Sale[];
  cart: CartItem[];
  cashInput: string;
  receiptSale: Sale | null;
  utangData: UtangGroup[];
  totalCollectibles: number;
  categorySalesToday: Record<string, number>;
  monthlySales: Record<string, number>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setCashInput: (v: string) => void;
  addToCartWithVariant: (product: Product, variant: Variant) => void;
  addCustomItemToCart: (item: { name: string; category: string; price: number }) => void;
  updateCartQty: (cartItemId: string, delta: number) => void;
  removeCartItem: (cartItemId: string) => void;
  clearCart: () => void;
  processCheckout: (customerName: string, actualCash: number) => Promise<void>;
  quickAdjustStock: (productId: string, variantId: string, delta: number) => Promise<void>;
  saveProduct: (product: ProductInput, editId?: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  processPartialPayment: (customerName: string, amount: number) => Promise<void>;
  setReceiptSale: (sale: Sale | null) => void;
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashInput, setCashInput] = useState('0');
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!user) {
      setInventory([]);
      setSales([]);
      return;
    }

    const inventoryCol = collection(db, `users/${user.uid}/inventory`);
    const salesCol = query(collection(db, `users/${user.uid}/sales`), orderBy('timestamp', 'desc'));

    const unsubInventory = onSnapshot(inventoryCol, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
      setInventory(data);
    });

    const unsubSales = onSnapshot(salesCol, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Sale[];
      setSales(data);
    });

    return () => {
      unsubInventory();
      unsubSales();
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const addToCartWithVariant = (product: Product, variant: Variant) => {
    setCart((prev) => {
      const key = `${product.id}:${variant.id}`;
      const existing = prev.find((item) => item.id === key);
      const inCartQty = existing?.quantity ?? 0;

      if (variant.stock !== null && inCartQty >= variant.stock) {
        return prev;
      }

      if (existing) {
        return prev.map((item) =>
          item.id === key ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...prev,
        {
          id: key,
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          category: product.category,
          variantName: variant.name,
          price: toNumber(variant.price),
          quantity: 1,
          stock: variant.stock,
        },
      ];
    });
  };

  const addCustomItemToCart = (item: { name: string; category: string; price: number }) => {
    setCart((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: item.name,
        category: item.category,
        price: toNumber(item.price),
        quantity: 1,
        stock: null,
        isCustom: true,
      },
    ]);
  };

  const updateCartQty = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id !== cartItemId) {
            return item;
          }

          const nextQty = item.quantity + delta;
          if (nextQty <= 0) {
            return null;
          }

          if (item.stock !== null && nextQty > item.stock) {
            return item;
          }

          return { ...item, quantity: nextQty };
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setCashInput('0');
  };

  const processCheckout = async (customerName: string, actualCash: number) => {
    if (!user || cart.length === 0) {
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const safeCash = Math.max(0, toNumber(actualCash));
    const balance = Math.max(0, total - safeCash);
    const change = Math.max(0, safeCash - total);
    const isUtang = balance > 0;

    const salePayload = {
      transactionId: txId(),
      items: cart,
      total,
      cashReceived: safeCash,
      change,
      balance,
      customerName: customerName.trim() || 'Walk-in',
      isUtang,
      timestamp: new Date().toISOString(),
      ...(isUtang ? {} : { settledAt: new Date().toISOString() }),
    };

    const saleRef = await addDoc(collection(db, `users/${user.uid}/sales`), salePayload);

    for (const item of cart) {
      if (!item.productId || !item.variantId || item.stock === null) {
        continue;
      }

      const product = inventory.find((p) => p.id === item.productId);
      if (!product) {
        continue;
      }

      const variants = product.variants.map((v) => {
        if (v.id !== item.variantId || v.stock === null) {
          return v;
        }

        return { ...v, stock: Math.max(0, v.stock - item.quantity) };
      });

      await updateDoc(doc(db, `users/${user.uid}/inventory/${item.productId}`), { variants });
    }

    const createdSale: Sale = {
      id: saleRef.id,
      ...salePayload,
    };
    clearCart();
    setReceiptSale(createdSale);
  };

  const quickAdjustStock = async (productId: string, variantId: string, delta: number) => {
    if (!user) {
      return;
    }

    const product = inventory.find((p) => p.id === productId);
    if (!product) {
      return;
    }

    const variants = product.variants.map((variant) => {
      if (variant.id !== variantId || variant.stock === null) {
        return variant;
      }

      return { ...variant, stock: Math.max(0, variant.stock + delta) };
    });

    await updateDoc(doc(db, `users/${user.uid}/inventory/${productId}`), { variants });
  };

  const saveProduct = async (product: ProductInput, editId?: string) => {
    if (!user) {
      return;
    }

    const normalized = {
      ...product,
      variants: product.variants.map((v) => ({
        ...v,
        price: toNumber(v.price),
        costPrice: toNumber(v.costPrice),
        stock: v.stock === null ? null : Math.max(0, toNumber(v.stock)),
      })),
    };

    if (editId) {
      await updateDoc(doc(db, `users/${user.uid}/inventory/${editId}`), normalized);
      return;
    }

    const id = `prod-${Date.now()}`;
    await setDoc(doc(db, `users/${user.uid}/inventory/${id}`), normalized);
  };

  const deleteProduct = async (productId: string) => {
    if (!user) {
      return;
    }

    await deleteDoc(doc(db, `users/${user.uid}/inventory/${productId}`));
  };

  const utangData = useMemo<UtangGroup[]>(() => {
    const grouped = sales
      .filter((sale) => sale.isUtang && sale.balance > 0)
      .reduce<Record<string, UtangGroup>>((acc, sale) => {
        const key = sale.customerName || 'Unknown';
        if (!acc[key]) {
          acc[key] = {
            customerName: key,
            totalBalance: 0,
            transactions: [],
          };
        }

        acc[key].totalBalance += sale.balance;
        acc[key].transactions.push(sale);
        return acc;
      }, {});

    return Object.values(grouped).sort((a, b) => b.totalBalance - a.totalBalance);
  }, [sales]);

  const totalCollectibles = useMemo(
    () => utangData.reduce((sum, group) => sum + group.totalBalance, 0),
    [utangData],
  );

  const processPartialPayment = async (customerName: string, amount: number) => {
    if (!user || amount <= 0) {
      return;
    }

    const unpaid = sales
      .filter((sale) => sale.customerName === customerName && sale.balance > 0)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let remaining = amount;

    for (const sale of unpaid) {
      if (remaining <= 0) {
        break;
      }

      const applied = Math.min(remaining, sale.balance);
      const nextBalance = sale.balance - applied;
      const isSettled = nextBalance <= 0;

      await updateDoc(doc(db, `users/${user.uid}/sales/${sale.id}`), {
        balance: Math.max(0, nextBalance),
        isUtang: !isSettled,
        ...(isSettled ? { settledAt: new Date().toISOString() } : {}),
      });

      remaining -= applied;
    }
  };

  const categorySalesToday = useMemo(() => getCategorySalesToday(sales), [sales]);
  const monthlySales = useMemo(() => getMonthlyCashSales(sales), [sales]);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        inventory,
        sales,
        cart,
        cashInput,
        receiptSale,
        utangData,
        totalCollectibles,
        categorySalesToday,
        monthlySales,
        login,
        signup,
        logout,
        setCashInput,
        addToCartWithVariant,
        addCustomItemToCart,
        updateCartQty,
        removeCartItem,
        clearCart,
        processCheckout,
        quickAdjustStock,
        saveProduct,
        deleteProduct,
        processPartialPayment,
        setReceiptSale,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
};
