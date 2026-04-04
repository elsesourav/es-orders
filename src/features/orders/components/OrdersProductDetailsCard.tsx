import { formatIndianNumber } from "@/lib/utils";
import type { Order, OrderItem, ProductDetails } from "@/types/orders";
import { useMemo } from "react";

type ProductTotalsRow = {
  key: string;
  sku: string;
  name: string;
  imageUrl: string;
  shipmentCount: number;
  itemQuantity: number;
  totalWeight: number;
  totalPrice: number;
  avgUnitWeight: number;
  avgUnitPrice: number;
};

type ProductTotalsSummary = {
  productCount: number;
  shipmentCount: number;
  itemQuantity: number;
  totalWeight: number;
  totalPrice: number;
};

type OrdersProductDetailsCardProps = {
  orders: Order[];
  resolveProduct: (item: OrderItem) => ProductDetails;
};

function toSafeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSku(item: OrderItem) {
  return String(item?.newSku || item?.sku || "-").trim() || "-";
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
  return String(details?.label || details?.name || item?.title || "NA").trim();
}

function getUnitWeight(details: ProductDetails) {
  return toSafeNumber(Number.parseFloat(String(details?.weight || 0)));
}

export default function OrdersProductDetailsCard({
  orders,
  resolveProduct,
}: OrdersProductDetailsCardProps) {
  const { rows, summary } = useMemo(() => {
    const productMap = new Map<string, ProductTotalsRow>();

    for (const order of orders) {
      const items = Array.isArray(order?.orderItems) ? order.orderItems : [];
      const shipmentSeenKeys = new Set<string>();

      for (const item of items) {
        const details = resolveProduct(item);
        const sku = getSku(item);
        const displayName = getProductName(item, details);
        const groupKey = normalizeGroupKey(displayName || sku) || sku;
        const quantity = Math.max(1, toSafeNumber(item?.quantity));
        const totalPrice = toSafeNumber(item?.price);
        const unitWeight = getUnitWeight(details);
        const totalWeight = unitWeight * quantity;

        const current = productMap.get(groupKey) || {
          key: groupKey,
          sku,
          name: displayName,
          imageUrl: getImageUrl(item),
          shipmentCount: 0,
          itemQuantity: 0,
          totalWeight: 0,
          totalPrice: 0,
          avgUnitWeight: 0,
          avgUnitPrice: 0,
        };

        current.itemQuantity += quantity;
        current.totalWeight += totalWeight;
        current.totalPrice += totalPrice;

        if (!shipmentSeenKeys.has(groupKey)) {
          current.shipmentCount += 1;
          shipmentSeenKeys.add(groupKey);
        }

        if (!current.imageUrl) {
          current.imageUrl = getImageUrl(item);
        }

        productMap.set(groupKey, current);
      }
    }

    const nextRows = Array.from(productMap.values()).sort(
      (a, b) => b.totalPrice - a.totalPrice,
    );

    for (const row of nextRows) {
      const qty = Math.max(1, row.itemQuantity);
      row.avgUnitWeight = row.totalWeight / qty;
      row.avgUnitPrice = row.totalPrice / qty;
    }

    const nextSummary = nextRows.reduce<ProductTotalsSummary>(
      (acc, row) => {
        acc.itemQuantity += row.itemQuantity;
        acc.totalWeight += row.totalWeight;
        acc.totalPrice += row.totalPrice;
        return acc;
      },
      {
        productCount: nextRows.length,
        shipmentCount: orders.length,
        itemQuantity: 0,
        totalWeight: 0,
        totalPrice: 0,
      },
    );

    return {
      rows: nextRows,
      summary: nextSummary,
    };
  }, [orders, resolveProduct]);

  if (!rows.length) {
    return null;
  }

  return (
    <section className="h-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 p-2 space-y-2 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Product Details Totals
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {summary.productCount} products • {summary.shipmentCount} shipments
        </p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        <InfoTile
          label="Quantity"
          value={String(formatIndianNumber(summary.itemQuantity))}
        />
        <InfoTile
          label="Products"
          value={String(formatIndianNumber(summary.productCount))}
        />
        <InfoTile
          label="Weight"
          value={`${formatIndianNumber(summary.totalWeight.toFixed(2))} g`}
        />
        <InfoTile
          label="Total Cost"
          value={`₹${formatIndianNumber(summary.totalPrice.toFixed(2))}`}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-2 space-y-2">
        {rows.map((row, index) => (
          <article
            key={`${row.key}-${index}`}
            className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 p-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-5 shrink-0">
                  {index + 1}
                </div>
                <div className="size-10 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden shrink-0">
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
                  <p className="text-xs font-semibold text-gray-900 dark:text-white wrap-break-word">
                    {row.name}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 wrap-break-word">
                    {row.sku}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Qty
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatIndianNumber(row.itemQuantity)}
                </p>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-1.5">
              <MetricCell
                label="Shipments"
                value={String(formatIndianNumber(row.shipmentCount))}
              />
              <MetricCell
                label="Total Weight"
                value={`${formatIndianNumber(row.totalWeight.toFixed(2))} g`}
              />
              <MetricCell
                label="Unit Weight"
                value={`${formatIndianNumber(row.avgUnitWeight.toFixed(2))} g`}
              />
              <MetricCell
                label="Unit Price"
                value={`₹${formatIndianNumber(row.avgUnitPrice.toFixed(2))}`}
              />
            </div>

            <div className="mt-1.5 flex items-center justify-end">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                Total: ₹{formatIndianNumber(row.totalPrice.toFixed(2))}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-2 py-1">
      <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/60 px-1.5 py-1">
      <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
