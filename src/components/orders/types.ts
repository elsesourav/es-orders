import type { Order, ProductDetails } from "../../types/orders";

export type SelectOrderFn = (index: number) => void;

export interface OrderCardProps {
  order: Order;
  productDetails: ProductDetails;
  selectedItemIndex: number;
  isActive: boolean;
  isEvenNumberedCard?: boolean;
  orderNumber?: number;
  onOrderBadgeClick?: () => void;
  isImageLoading: boolean;
  onImageLoad?: (url: string) => void;
  onImageError?: () => void;
  onSelectItem?: (index: number) => void;
  onCopySku?: (sku: string) => void;
  copiedSku: string | null;
}

export interface OrderPagesListProps {
  orders: Order[];
  selectedOrderIndex: number | null;
  onSelectOrder: SelectOrderFn;
  selectedItemIndex: number;
  product: ProductDetails;
  isImageLoading: boolean;
  onImageLoad: (url: string) => void;
  onImageError: () => void;
  onSelectItem: (index: number) => void;
  onCopySku: (sku: string) => void;
  copiedSku: string | null;
  resolveProduct: (item: any) => ProductDetails;
}
