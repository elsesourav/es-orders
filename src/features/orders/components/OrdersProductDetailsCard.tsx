import { formatIndianNumber } from "@/lib/utils";
import type { Order, OrderItem, ProductDetails } from "@/types/orders";
import { useMemo } from "react";

type ProductTotalsRow = {
  key: string;
  sku: string;
  name: string;
  label: string;
  imageUrl: string;
  shipmentCount: number;
  itemQuantity: number;
  totalWeight: number;
  productCost: number;
  packageCost: number;
  totalCost: number;
};

type ProductTotalsSummary = {
  productCount: number;
  shipmentCount: number;
  itemQuantity: number;
  totalWeight: number;
  productCost: number;
  packageCost: number;
  totalCost: number;
};

type OrdersProductDetailsCardProps = {
  orders: Order[];
  resolveProduct: (item: OrderItem) => ProductDetails;
};

const PACKAGE_COST_PER_SHIPMENT = 3;

function toSafeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toCeilDisplayValue(value: unknown) {
  return Math.ceil(Math.max(0, toSafeNumber(value)));
}

function toRoundedDisplayValue(value: unknown) {
  return Math.round(Math.max(0, toSafeNumber(value)));
}

function getSku(item: OrderItem, details: ProductDetails) {
  return (
    String(details?.itemSku || item?.newSku || item?.sku || "-").trim() || "-"
  );
}

function normalizeGroupKey(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getImageUrl(item: OrderItem) {
  return String(item?.primaryImageUrl || "").trim();
}

function getProductName(item: OrderItem, details: ProductDetails) {
  return String(details?.name || item?.title || details?.label || "NA").trim();
}

function getProductLabel(item: OrderItem, details: ProductDetails) {
  return String(details?.label || details?.name || item?.title || "NA").trim();
}

function getUnitWeight(details: ProductDetails) {
  return toSafeNumber(Number.parseFloat(String(details?.weight || 0)));
}

function getItemProductCost(item: OrderItem, details: ProductDetails) {
  const computedCost = details?.computedCost;
  if (typeof computedCost === "number" && Number.isFinite(computedCost)) {
    return computedCost;
  }

  return toSafeNumber(item?.price);
}

export default function OrdersProductDetailsCard({
  orders,
  resolveProduct,
}: OrdersProductDetailsCardProps) {
  const { rows, summary, displayProductCost, displayTotalCost } =
    useMemo(() => {
      const productMap = new Map<string, ProductTotalsRow>();

      for (const order of orders) {
        const items = Array.isArray(order?.orderItems) ? order.orderItems : [];
        const shipmentSeenKeys = new Set<string>();

        for (const item of items) {
          const details = resolveProduct(item);
          const sku = getSku(item, details);
          const displayName = getProductName(item, details);
          const displayLabel = getProductLabel(item, details);
          const groupKey =
            normalizeGroupKey(displayLabel || displayName || sku) || sku;
          const quantity = Math.max(1, toSafeNumber(item?.quantity));
          const productCost = getItemProductCost(item, details);
          const unitWeight = getUnitWeight(details);
          const totalWeight = unitWeight * quantity;

          const current = productMap.get(groupKey) || {
            key: groupKey,
            sku,
            name: displayName,
            label: displayLabel,
            imageUrl: getImageUrl(item),
            shipmentCount: 0,
            itemQuantity: 0,
            totalWeight: 0,
            productCost: 0,
            packageCost: 0,
            totalCost: 0,
          };

          current.itemQuantity += quantity;
          current.totalWeight += totalWeight;
          current.productCost += productCost;

          if (!shipmentSeenKeys.has(groupKey)) {
            current.shipmentCount += 1;
            shipmentSeenKeys.add(groupKey);
          }

          if (!current.imageUrl) {
            current.imageUrl = getImageUrl(item);
          }

          if (!current.label) {
            current.label = displayLabel;
          }

          productMap.set(groupKey, current);
        }
      }

      for (const row of productMap.values()) {
        row.packageCost = row.shipmentCount * PACKAGE_COST_PER_SHIPMENT;
        row.totalCost = row.productCost + row.packageCost;
      }

      const nextRows = Array.from(productMap.values()).sort(
        (a, b) => b.totalCost - a.totalCost,
      );

      const nextSummary = nextRows.reduce<ProductTotalsSummary>(
        (acc, row) => {
          acc.itemQuantity += row.itemQuantity;
          acc.totalWeight += row.totalWeight;
          acc.productCost += row.productCost;
          acc.packageCost += row.packageCost;
          acc.totalCost += row.totalCost;
          return acc;
        },
        {
          productCount: nextRows.length,
          shipmentCount: orders.length,
          itemQuantity: 0,
          totalWeight: 0,
          productCost: 0,
          packageCost: 0,
          totalCost: 0,
        },
      );

      const nextDisplayProductCost = nextRows.reduce(
        (acc, row) => acc + toCeilDisplayValue(row.productCost),
        0,
      );

      const nextDisplayTotalCost = nextRows.reduce(
        (acc, row) => acc + toCeilDisplayValue(row.totalCost),
        0,
      );

      return {
        rows: nextRows,
        summary: nextSummary,
        displayProductCost: nextDisplayProductCost,
        displayTotalCost: nextDisplayTotalCost,
      };
    }, [orders, resolveProduct]);

  if (!rows.length) {
    return null;
  }

  return (
    <section className="h-full rounded-sm bg-linear-to-b from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-900/80 space-y-2 overflow-hidden flex flex-col">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 p-1 rounded-sm bg-green-500/10">
        <InfoTile
          label="Products"
          value={String(formatIndianNumber(summary.productCount))}
        />
        <InfoTile
          label="Shipments"
          value={String(formatIndianNumber(summary.shipmentCount))}
        />
        <InfoTile
          label="Quantity"
          value={String(formatIndianNumber(summary.itemQuantity))}
        />
        <InfoTile
          label="Product Cost"
          value={`₹${formatIndianNumber(displayProductCost)}`}
        />
        <InfoTile
          label="PKG Cost"
          value={`₹${formatIndianNumber(toRoundedDisplayValue(summary.packageCost))}`}
        />
        <InfoTile
          label="Total Cost"
          value={`₹${formatIndianNumber(displayTotalCost)}`}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
        {rows.map((row, index) => (
          <article
            key={`${row.key}-${index}`}
            className="rounded-lg border border-gray-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/70 px-2 py-1.5 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-5 shrink-0">
                  {index + 1}
                </div>
                <div className="size-10 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 ring-1 ring-gray-200 dark:ring-gray-700">
                  {row.imageUrl ? (
                    <img
                      src={row.imageUrl}
                      alt={row.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                      IMG
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white wrap-break-word leading-[1.3]">
                    {row.name}
                  </p>
                  {row.label && row.label !== row.name && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 wrap-break-word leading-[1.3]">
                      {row.label}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 wrap-break-word">
                    {row.sku}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 space-y-0.5">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Qty:{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatIndianNumber(toCeilDisplayValue(row.itemQuantity))}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Shipments:{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatIndianNumber(toCeilDisplayValue(row.shipmentCount))}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-1 text-xs">
              <MetricInline
                label="Total Grams"
                value={`${formatIndianNumber(row.totalWeight.toFixed(2))} g`}
              />
              <MetricInline
                label="Product"
                value={`₹${formatIndianNumber(row.productCost.toFixed(2))}`}
              />
              <MetricInline
                label="Package"
                value={`₹${formatIndianNumber(row.packageCost.toFixed(2))}`}
              />
              <MetricInline
                label="Total"
                value={`₹${formatIndianNumber(toCeilDisplayValue(row.totalCost))}`}
                emphasized
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-200/70 dark:border-gray-700/70 bg-white/70 dark:bg-gray-800/40 px-2 py-1">
      <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function MetricInline({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/60 px-1.5 py-1">
      <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`text-xs ${emphasized ? "font-bold text-gray-900 dark:text-white" : "font-semibold text-gray-800 dark:text-gray-200"}`}
      >
        {value}
      </p>
    </div>
  );
}
