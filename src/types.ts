export type Category = 'Cigarettes' | 'Softdrink' | 'Load' | 'Tindahan' | string;

export type Variant = {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number | null;
};

export type Product = {
  id: string;
  name: string;
  category: Category;
  image?: string;
  variants: Variant[];
};

export type CartItem = {
  id: string;
  productId?: string;
  variantId?: string;
  name: string;
  category: Category;
  variantName?: string;
  price: number;
  quantity: number;
  stock: number | null;
  isCustom?: boolean;
};

export type Sale = {
  id: string;
  transactionId: string;
  items: CartItem[];
  total: number;
  cashReceived: number;
  change: number;
  balance: number;
  customerName: string;
  isUtang: boolean;
  timestamp: string;
  settledAt?: string;
};

export type UtangGroup = {
  customerName: string;
  totalBalance: number;
  transactions: Sale[];
};

export type ProductInput = Omit<Product, 'id'>;
