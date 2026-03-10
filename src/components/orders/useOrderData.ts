import { useCallback, useEffect, useState } from "react";
import { listItems } from "../../api/itemsApi";
import { getMapSkuByOldSku } from "../../api/mapSkusApi";
import { shopsyModifySkuId } from "../../utils/idAndSkuUtils";
import {
  calculateWeightInGrams,
  DEFAULT_PRODUCT,
  LOADING_PRODUCT,
} from "./utils";

/**
 * Hook that owns all data-fetching and product-resolution logic for orders.
 */
const useOrderData = () => {
  const [stateData, setStateData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [skuMappings, setSkuMappings] = useState({});

  // ── Fetch orders from localStorage + products from API ──────────────
  useEffect(() => {
    const storedState = localStorage.getItem("es_orders_selected_state");
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState);
        setStateData(parsedState);
        const ordersArray =
          parsedState.selectedType === "rtd"
            ? parsedState.rtd
            : parsedState.handover;
        setOrders(ordersArray || []);
      } catch (error) {
        console.error("Error parsing stored state:", error);
      }
    }

    const fetchProducts = async () => {
      try {
        const data = await listItems();
        setProducts(
          (data || []).map((item) => ({
            ...item,
            sku_id: item.sku_id || item.item_sku,
          })),
        );
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // ── Fetch SKU mappings for all orders ───────────────────────────────
  useEffect(() => {
    if (orders.length === 0) return;

    const fetchMappings = async () => {
      try {
        const allSkus = new Set();
        orders.forEach((order) =>
          order.orderItems?.forEach(
            (item) => item.sku && allSkus.add(item.sku),
          ),
        );

        const results = await Promise.all(
          Array.from(allSkus).map(async (sku) => {
            try {
              const normalizedSku = String(sku || "").trim();
              if (!normalizedSku) return null;

              const mapping = await getMapSkuByOldSku(normalizedSku);
              return mapping
                ? { sku: normalizedSku, newSku: mapping.new_sku }
                : null;
            } catch {
              return null;
            }
          }),
        );

        const mappings: Record<string, string> = {};
        results.forEach((r) => {
          if (r && typeof r.sku === "string") {
            mappings[r.sku] = String(r.newSku || "");
          }
        });
        setSkuMappings(mappings);
      } catch (error) {
        console.error("Error fetching SKU mappings:", error);
      }
    };

    fetchMappings();
  }, [orders]);

  // ── Resolve product details from an order item ──────────────────────
  const resolveProduct = useCallback(
    (item) => {
      if (!products.length) return LOADING_PRODUCT;

      const originalSku = item.sku;
      const modified = shopsyModifySkuId(originalSku);
      const sku = skuMappings[modified] || item.newSku || modified;
      const parts = sku.split("_");

      if (parts.length >= 4) {
        const itemIds = parts[2].split("-");
        const quantity = parts[3];
        const match = quantity.match(/^(\d+)([a-zA-Z]+)$/);

        if (match) {
          const unit = parseInt(match[1]);
          const unitType = match[2];
          const matched = itemIds.map((id) =>
            products.find((p) => p.sku_id === id),
          );

          if (matched.every(Boolean)) {
            const weight = calculateWeightInGrams(
              matched.map((p) => p.quantity_per_kg),
              unit,
              unitType,
            );
            return {
              name: matched.map((p) => p.name).join(", "),
              label: matched.map((p) => p.label || p.name).join(", "),
              weight: weight.toFixed(2),
              unite: unitType,
            };
          }
        }
      }

      return DEFAULT_PRODUCT;
    },
    [products, skuMappings],
  );

  return { stateData, orders, products, resolveProduct };
};

export default useOrderData;
