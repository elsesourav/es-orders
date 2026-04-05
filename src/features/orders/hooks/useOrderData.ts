import { listItems } from "@/api/itemsApi";
import { getMapSkusObject } from "@/api/mapSkusApi";
import { listOrderStates } from "@/api/ordersStatesApi";
import { useAuth } from "@/lib/AuthContext";
import type { Order, SelectedOrdersState } from "@/types/orders";
import { shopsyModifySkuId } from "@/utils/idAndSkuUtils";
import { useCallback, useEffect, useState } from "react";
import {
  calculateWeightInGrams,
  DEFAULT_PRODUCT,
  LOADING_PRODUCT,
} from "../utils/utils";

const QUANTITY_PART_REGEX = /^(\d+)([a-zA-Z]+)$/;

type ParsedCompositeSku = {
  itemIds: string[];
  unit: number;
  unitType: string;
  quantityPart: string;
  itemIdsPart: string;
  format: "ids-then-qty" | "qty-then-ids";
};

function parseCompositeSku(value: unknown): ParsedCompositeSku | null {
  const parts = String(value || "")
    .split("_")
    .filter(Boolean);

  if (parts.length < 4) return null;

  const directMatch = parts[3].match(QUANTITY_PART_REGEX);
  if (directMatch) {
    return {
      itemIds: parts[2].split("-").filter(Boolean),
      unit: parseInt(directMatch[1], 10),
      unitType: directMatch[2],
      quantityPart: parts[3],
      itemIdsPart: parts[2],
      format: "ids-then-qty",
    };
  }

  // Newer shared states are often in this format: PREFIX_PREFIX_10000P_abc
  const swappedMatch = parts[2].match(QUANTITY_PART_REGEX);
  if (swappedMatch) {
    return {
      itemIds: parts[3].split("-").filter(Boolean),
      unit: parseInt(swappedMatch[1], 10),
      unitType: swappedMatch[2],
      quantityPart: parts[2],
      itemIdsPart: parts[3],
      format: "qty-then-ids",
    };
  }

  return null;
}

function parseItemTokens(value: unknown): string[] {
  const raw = String(value || "").trim();
  if (!raw) return [];

  const bracketMatch = raw.match(/^\[(.+)\]$/);
  const tokenSource = bracketMatch ? bracketMatch[1] : raw;

  return tokenSource
    .split("-")
    .map((token) => token.trim())
    .filter(Boolean);
}

function normalizeText(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function toNonNegativeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function calculateWeightBasedCost(pricePerKg: unknown, weightInGrams: number) {
  const safePricePerKg = toNonNegativeNumber(pricePerKg);
  if (safePricePerKg === null) return null;
  if (!Number.isFinite(weightInGrams) || weightInGrams <= 0) return null;
  return (safePricePerKg * weightInGrams) / 1000;
}

/**
 * Hook that owns all data-fetching and product-resolution logic for orders.
 */
const useOrderData = (selectedState: SelectedOrdersState | null = null) => {
  const { user } = useAuth();
  const [stateData, setStateData] = useState<SelectedOrdersState | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState([]);
  const [skuMappings, setSkuMappings] = useState({});
  const [isStateLoading, setIsStateLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

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
        setIsStateLoading(true);
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
      } finally {
        if (!isCancelled) {
          setIsStateLoading(false);
        }
      }
    };

    if (!user?.id) {
      setIsStateLoading(false);
      applySelectedState(null);
    } else {
      const selectedStateMatchesUser =
        !!selectedState && selectedState.userId === user.id;

      if (selectedStateMatchesUser && selectedState) {
        setIsStateLoading(false);
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

  // ── Fetch products from API (refresh on account switch) ─────────────
  useEffect(() => {
    let isCancelled = false;

    const fetchProducts = async () => {
      if (!user?.id) {
        setProducts([]);
        setIsProductsLoading(false);
        return;
      }

      // Prevent stale previous-account products while new account data loads.
      setProducts([]);
      setIsProductsLoading(true);

      try {
        const data = await listItems();
        if (isCancelled) return;

        const normalizedProducts = (data || []).map((item) => ({
          ...item,
          sku_id: item.sku_id || item.item_sku,
        }));

        setProducts(normalizedProducts);
      } catch (error) {
        if (isCancelled) return;
        console.error("Error fetching products:", error);
      } finally {
        if (!isCancelled) {
          setIsProductsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  // ── Fetch SKU mappings for all orders ───────────────────────────────
  useEffect(() => {
    if (!user?.id) {
      setSkuMappings({});
      return;
    }

    const sourceOrders = [
      ...(Array.isArray(stateData?.rtd) ? stateData.rtd : []),
      ...(Array.isArray(stateData?.handover) ? stateData.handover : []),
    ];
    const mappingOrders = sourceOrders.length ? sourceOrders : orders;

    if (mappingOrders.length === 0) {
      setSkuMappings({});
      return;
    }

    const fetchMappings = async () => {
      try {
        const fullMap = await getMapSkusObject();
        const allSkus = new Set<string>();

        mappingOrders.forEach((order) => {
          order.orderItems?.forEach((item) => {
            const key = String(item?.sku || "").trim();
            if (key) allSkus.add(key);
          });
        });

        const mappings: Record<string, string> = {};
        allSkus.forEach((sku) => {
          if (Object.prototype.hasOwnProperty.call(fullMap || {}, sku)) {
            mappings[sku] = String(fullMap[sku] || "");
          }
        });

        setSkuMappings(mappings);
      } catch (error) {
        console.error("Error fetching SKU mappings:", error);
      }
    };

    fetchMappings();
  }, [orders, stateData, user?.id]);

  // ── Resolve product details from an order item ──────────────────────
  const resolveProduct = useCallback(
    (item) => {
      if (!products.length) {
        return LOADING_PRODUCT;
      }

      const originalSku = item.sku;
      const modified = shopsyModifySkuId(originalSku);
      const sku = skuMappings[modified] || item.newSku || modified;

      const parsedSku = parseCompositeSku(sku);

      if (parsedSku) {
        const parsedItemIds = parsedSku.itemIds.flatMap((token) =>
          parseItemTokens(token),
        );

        const matched = parsedItemIds.map((id) =>
          products.find(
            (p) =>
              normalizeText(p.sku_id) === normalizeText(id) ||
              normalizeText(p.item_sku) === normalizeText(id),
          ),
        );

        if (matched.every(Boolean)) {
          const matchedProducts = matched as Array<Record<string, unknown>>;
          const weight = calculateWeightInGrams(
            matchedProducts.map((p) => p.quantity_per_kg),
            parsedSku.unit,
            parsedSku.unitType,
          );

          const computedCost = matchedProducts.reduce<number | null>(
            (acc, product) => {
              if (acc === null) return null;

              const componentWeight = calculateWeightInGrams(
                [product.quantity_per_kg],
                parsedSku.unit,
                parsedSku.unitType,
              );
              const componentCost = calculateWeightBasedCost(
                product.price,
                componentWeight,
              );

              return componentCost === null ? null : acc + componentCost;
            },
            0,
          );

          const itemSku = matchedProducts
            .map((p) => String(p.item_sku || p.sku_id || "").trim())
            .filter(Boolean)
            .join(", ");

          return {
            name: matchedProducts.map((p) => p.name).join(", "),
            label: matchedProducts.map((p) => p.label || p.name).join(", "),
            weight: weight.toFixed(2),
            unite: parsedSku.unitType,
            ...(itemSku ? { itemSku } : {}),
            ...(computedCost === null ? {} : { computedCost }),
          };
        }

        // Fallback: match by order item title when SKU token ids are not present in items table.
        const normalizedTitle = normalizeText(item?.title);
        if (normalizedTitle) {
          const titleMatch = products.find((p) => {
            const productName = normalizeText(p?.name);
            const productLabel = normalizeText(p?.label);

            return (
              productName === normalizedTitle ||
              productLabel === normalizedTitle ||
              normalizedTitle.includes(productName) ||
              productName.includes(normalizedTitle) ||
              (productLabel && normalizedTitle.includes(productLabel)) ||
              (productLabel && productLabel.includes(normalizedTitle))
            );
          });

          if (titleMatch) {
            const qtyPerKgValue = Number(titleMatch.quantity_per_kg);
            const isPieceMode = parsedSku.unitType.toLowerCase() === "p";
            const canComputePieceWeight = !isPieceMode || qtyPerKgValue > 0;

            if (canComputePieceWeight) {
              const weight = calculateWeightInGrams(
                [titleMatch.quantity_per_kg],
                parsedSku.unit,
                parsedSku.unitType,
              );
              const computedCost = calculateWeightBasedCost(
                titleMatch.price,
                weight,
              );

              return {
                name: titleMatch.name || item?.title || DEFAULT_PRODUCT.name,
                label:
                  titleMatch.label || titleMatch.name || DEFAULT_PRODUCT.label,
                weight: weight.toFixed(2),
                unite: parsedSku.unitType,
                ...(titleMatch.item_sku
                  ? { itemSku: String(titleMatch.item_sku).trim() }
                  : {}),
                ...(computedCost === null ? {} : { computedCost }),
              };
            }
          }
        }
      }

      return DEFAULT_PRODUCT;
    },
    [products, skuMappings],
  );

  return {
    stateData,
    orders,
    products,
    resolveProduct,
    isOrdersLoading: isStateLoading || isProductsLoading,
  };
};

export default useOrderData;
