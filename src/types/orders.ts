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
}

export interface StateData {
  selectedType?: string;
  timestamp?: string;
  rtd?: Order[];
  handover?: Order[];
  [key: string]: unknown;
}
