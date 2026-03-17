import { Package } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "../lib/useLanguage";
import type { SelectedOrdersState } from "../types/orders";
import OrderPagesList from "./orders/OrderPagesList";
import useOrderData from "./orders/useOrderData";
import { LOADING_PRODUCT } from "./orders/utils";

const sessionImageCache = new Set<string>();
const inFlightImageLoads = new Map<string, Promise<void>>();

interface OrdersPageProps {
  selectedOrdersState?: SelectedOrdersState | null;
}

const OrdersPage = ({ selectedOrdersState = null }: OrdersPageProps) => {
  const { t } = useLanguage();
  const { stateData, orders, products, resolveProduct } =
    useOrderData(selectedOrdersState);

  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [product, setProduct] = useState(LOADING_PRODUCT);

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const copiedSkuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleImageLoad = useCallback((url) => {
    if (url) {
      sessionImageCache.add(url);
      inFlightImageLoads.delete(url);
    }
    setIsImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const checkAndLoadImage = useCallback((url) => {
    if (!url) {
      setIsImageLoading(false);
      return;
    }

    if (sessionImageCache.has(url)) {
      setIsImageLoading(false);
      return;
    }

    const pendingLoad = inFlightImageLoads.get(url);
    if (pendingLoad) {
      setIsImageLoading(true);
      pendingLoad.finally(() => {
        setIsImageLoading(false);
      });
      return;
    }

    setIsImageLoading(true);

    const loadPromise = new Promise<void>((resolve) => {
      const preloadImg = new Image();
      preloadImg.onload = () => {
        sessionImageCache.add(url);
        inFlightImageLoads.delete(url);
        setIsImageLoading(false);
        resolve();
      };
      preloadImg.onerror = () => {
        inFlightImageLoads.delete(url);
        setIsImageLoading(false);
        resolve();
      };
      preloadImg.src = url;

      if (preloadImg.complete) {
        sessionImageCache.add(url);
        inFlightImageLoads.delete(url);
        setIsImageLoading(false);
        resolve();
      }
    });

    inFlightImageLoads.set(url, loadPromise);
  }, []);

  const copySku = useCallback(async (sku) => {
    const safeSku = String(sku || "").trim();
    if (!safeSku) return;

    try {
      if (window?.isAndroid) {
        await window?.AndroidClipboard.setText(safeSku);
      } else {
        await navigator.clipboard.writeText(safeSku);
      }

      setCopiedSku(safeSku);

      if (copiedSkuTimerRef.current) {
        clearTimeout(copiedSkuTimerRef.current);
      }

      copiedSkuTimerRef.current = setTimeout(() => {
        setCopiedSku((current) => (current === safeSku ? null : current));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy SKU:", error);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copiedSkuTimerRef.current) {
        clearTimeout(copiedSkuTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (copiedSkuTimerRef.current) {
      clearTimeout(copiedSkuTimerRef.current);
      copiedSkuTimerRef.current = null;
    }
    setCopiedSku(null);
    setSelectedOrderIndex(null);
    setSelectedItemIndex(0);
    setProduct(LOADING_PRODUCT);
  }, [stateData?.id, stateData?.selectedType, stateData?.timestamp]);

  const selectOrderRef = useRef<((orderIndex: number) => void) | null>(null);
  selectOrderRef.current = (orderIndex) => {
    const order = orders[orderIndex];

    setSelectedOrderIndex(orderIndex);
    setSelectedItemIndex(0);

    const firstItem = order?.orderItems?.[0];
    if (products.length > 0 && firstItem) {
      setProduct(resolveProduct(firstItem));
      checkAndLoadImage(firstItem.primaryImageUrl);
    } else {
      setProduct(LOADING_PRODUCT);
    }
  };

  const selectOrder = useCallback((index) => {
    selectOrderRef.current?.(index);
  }, []);

  useEffect(() => {
    if (
      orders.length > 0 &&
      products.length > 0 &&
      selectedOrderIndex === null
    ) {
      selectOrder(0);
    }
  }, [orders, products, selectedOrderIndex, selectOrder]);

  const handleSelectItem = useCallback(
    (itemIndex) => {
      if (selectedOrderIndex === null) return;

      const order = orders[selectedOrderIndex];
      const item = order?.orderItems?.[itemIndex];
      if (!item) return;

      setSelectedItemIndex(itemIndex);
      setProduct(resolveProduct(item));
      checkAndLoadImage(item.primaryImageUrl);
    },
    [checkAndLoadImage, orders, resolveProduct, selectedOrderIndex],
  );

  useEffect(() => {
    if (selectedOrderIndex === null) return;

    const currentOrder = orders[selectedOrderIndex];
    const currentItem =
      currentOrder?.orderItems?.[selectedItemIndex] ??
      currentOrder?.orderItems?.[0];

    if (!currentItem?.primaryImageUrl) {
      setIsImageLoading(false);
      return;
    }

    checkAndLoadImage(currentItem.primaryImageUrl);
  }, [checkAndLoadImage, orders, selectedItemIndex, selectedOrderIndex]);

  return (
    <div className="relative flex flex-col h-[calc(100svh-4.5rem)] overflow-hidden">
      <div className="relative opacity-30 flex justify-center items-center gap-2 my-1 shrink-0">
        <div className="px-2 py-0.5 border border-primary-200 dark:border-primary-700 rounded-md">
          <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
            {stateData?.selectedType
              ? t(`home.${stateData.selectedType}`)
              : t("common.loading")}
          </p>
        </div>
        <div className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {stateData?.timestamp} • {orders.length} orders
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <OrderPagesList
          orders={orders}
          selectedOrderIndex={selectedOrderIndex}
          onSelectOrder={selectOrder}
          selectedItemIndex={selectedItemIndex}
          product={product}
          isImageLoading={isImageLoading}
          onImageLoad={handleImageLoad}
          onImageError={handleImageError}
          onSelectItem={handleSelectItem}
          onCopySku={copySku}
          copiedSku={copiedSku}
          resolveProduct={resolveProduct}
        />
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
            <Package className="w-8 h-8 text-gray-400 dark:text-gray-600" />
          </div>
          <div className="max-w-sm mx-auto px-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {t("orders.noOrdersFound")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t("orders.noOrdersFoundMessage")}{" "}
              <span className="font-medium text-primary">
                {stateData?.selectedType}
              </span>{" "}
              {t("orders.state")}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
