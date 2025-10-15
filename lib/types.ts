export type Retailer = 'walmart' | 'walgreens' | 'marianos' | 'costco' | 'samsclub';

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface GroceryItem {
  name: string;
  quantity: number;
  unit?: string;
  brand?: string | null;
  size?: string | null;
  notes?: string[];
}

export interface ParsedGroceryList {
  items: GroceryItem[];
}

export interface RetailerProduct {
  retailer: Retailer;
  title: string;
  brand: string;
  size: string;
  price: number;
  stockStatus: StockStatus;
  productUrl: string;
  imageUrl: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  name: string;
  brand: string | null;
  quantity: number;
  size: string | null;
  notes: string | null;
  order_index: number;
  purchased?: boolean;
  purchased_retailer?: string | null;
  purchased_at?: string | null;
  matches?: RetailerProduct[];
}

export interface GroceryList {
  id: string;
  user_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
  zip_code: string;
  is_active?: boolean;
  status?: string;
  items?: ListItem[];
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  default_zip_code: string | null;
  created_at: string;
}

export interface BestPriceOption {
  item: ListItem;
  bestMatch: RetailerProduct;
  alternativeMatches: RetailerProduct[];
}

export interface RetailerSummary {
  retailer: Retailer;
  itemCount: number;
  totalPrice: number;
  items: {
    item: ListItem;
    match: RetailerProduct;
  }[];
}

