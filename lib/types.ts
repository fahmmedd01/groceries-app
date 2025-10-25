export type Retailer = 
  // Warehouse Clubs
  | 'costco' | 'samsclub' | 'bjs'
  // Supermarkets
  | 'walmart' | 'target' | 'kroger' | 'publix' | 'safeway' | 'albertsons' 
  | 'heb' | 'meijer' | 'wegmans' | 'gianteagle' | 'foodlion' | 'stopandshop'
  | 'giantfood' | 'marianos' | 'harristeeter' | 'shoprite' | 'ralphs' 
  | 'fredmeyer' | 'qfc' | 'kingsoopers' | 'smiths' | 'frys' | 'dillons'
  | 'marketbasket' | 'wincofoods' | 'lidl'
  // Specialty Grocers
  | 'wholefoods' | 'traderjoes' | 'aldi' | 'sprouts' | 'freshthyme'
  // Pharmacies
  | 'cvs' | 'walgreens' | 'riteaid' | 'duanereade'
  // Other
  | 'other';

export interface GroceryItem {
  name: string;
  quantity: number;
  unit?: string;
  brand?: string | null;
  size?: string | null;
  notes?: string[];
  retailer?: string | null;
}

export interface ParsedGroceryList {
  items: GroceryItem[];
}

export interface ListItem {
  id: string;
  list_id: string;
  name: string;
  brand: string | null;
  quantity: number;
  size: string | null;
  notes: string | null;
  retailer: string;
  order_index: number;
  purchased?: boolean;
  purchased_retailer?: string | null;
  purchased_at?: string | null;
}

export interface GroceryList {
  id: string;
  user_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  status?: string;
  items?: ListItem[];
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface Store {
  id: string;
  user_id: string;
  name: string;
  retailer: string;
  address: string | null;
  created_at: string;
}

export interface ShoppingSession {
  id: string;
  user_id: string;
  list_id: string;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
}

