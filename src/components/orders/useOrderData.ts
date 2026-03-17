import { useCallback, useEffect, useState } from "react";
import { listItems } from "../../api/itemsApi";
import { getMapSkuByOldSku } from "../../api/mapSkusApi";
import { listOrderStates } from "../../api/ordersStatesApi";
import { useAuth } from "../../lib/AuthContext";
import type { Order, SelectedOrdersState } from "../../types/orders";
import { shopsyModifySkuId } from "../../utils/idAndSkuUtils";
import {
  calculateWeightInGrams,
  DEFAULT_PRODUCT,
  LOADING_PRODUCT,
} from "./utils";

/**
 * Hook that owns all data-fetching and product-resolution logic for orders.
 */
const useOrderData = (selectedState: SelectedOrdersState | null = null) => {
  const { user } = useAuth();
  const [stateData, setStateData] = useState<SelectedOrdersState | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState([]);
  const [skuMappings, setSkuMappings] = useState({});

  // ── Resolve selected orders state from memory or API ─────────────────
  useEffect(() => {
    let isCancelled = false;
    const currentUserId = String(user?.id || "");

    const applySelectedState = (nextState: SelectedOrdersState | null) => {
      if (isCancelled) return;

      setStateData(nextState);

      const ordersArray =
        nextState?.selectedType === "handover"
          ? nextState.handover
          : nextState?.rtd;

      setOrders(Array.isArray(ordersArray) ? ordersArray : []);
    };

    const fetchLatestState = async () => {
      try {
        const savedStates = await listOrderStates();
        const ownStates = (savedStates || []).filter(
          (item) =>
            String(item?.user_id ?? item?.created_by ?? "") === currentUserId,
        );
        const latestState = ownStates?.[0];

        if (!latestState) {
          applySelectedState(null);
          return;
        }

        const rawSelectedType = latestState?.order_data?.states?.selectedType;
        const selectedType =
          rawSelectedType === "handover" || rawSelectedType === "rtd"
            ? rawSelectedType
            : "rtd";

        applySelectedState({
          ...latestState?.order_data?.states,
          id: latestState?.id,
          timestamp: latestState?.order_data?.timestamp,
          userId: String(latestState?.user_id ?? latestState?.created_by ?? ""),
          selectedType,
        });
      } catch (error) {
        console.error("Error fetching latest order state:", error);
        applySelectedState(null);
      }
    };

    if (!user?.id) {
      applySelectedState(null);
    } else {
      const selectedStateMatchesUser =
        !!selectedState && selectedState.userId === user.id;

      if (selectedStateMatchesUser && selectedState) {
        applySelectedState(selectedState);
      } else {
        // Clear previous account state immediately to avoid stale UI while fetching.
        applySelectedState(null);
        fetchLatestState();
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedState, user?.id]);

  // ── Fetch products from API ──────────────────────────────────────────
  useEffect(() => {
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
    if (orders.length === 0) {
      setSkuMappings({});
      return;
    }

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
