export interface OrderItem {
  sku?: string;
  title?: string;
  quantity?: number;
  primaryImageUrl?: string;
  productId?: string;
  product_id?: string;
  productID?: string;
  [key: string]: unknown;
  price?: string;
}

export interface BuyerAddress {
  state?: string;
  [key: string]: unknown;
}

export interface BuyerDetails {
  name?: string;
  address?: BuyerAddress;
  [key: string]: unknown;
}

export interface Order {
  orderId?: string | number;
  order_id?: string | number;
  buyerDetails?: BuyerDetails;
  orderItems?: OrderItem[];
  [key: string]: unknown;
}

export interface ProductDetails {
  name: string;
  label: string;
  weight: string;
  unite: string;
  computedCost?: number;
  itemSku?: string;
}

export interface OrderProductDetailRow {
  imageUrl: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  unitWeight: number;
  totalWeight: number;
}

export interface StateData {
  selectedType?: string;
  timestamp?: string;
  rtd?: Order[];
  handover?: Order[];
  [key: string]: unknown;
}

export interface SelectedOrdersState extends StateData {
  id?: string | number;
  userId: string;
  selectedType?: "rtd" | "handover";
}

export interface OrdersStateListQuery {
  page?: number;
  limit?: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface SavedOrderStateRow {
  id?: string | number;
  user_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  state_data?: {
    timestamp?: string;
    states?: StateData;
    [key: string]: unknown;
  };
  order_data?: {
    timestamp?: string;
    states?: StateData;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface SavedOrderStatesPage {
  rows: SavedOrderStateRow[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
