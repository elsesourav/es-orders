import { Boxes, Copy, Tag, Weight } from "lucide-react";
import { useEffect, useState } from "react";
import { FaShopify } from "react-icons/fa";
import { SiFlipkart } from "react-icons/si";
import { useLanguage } from "../../lib/useLanguage";
import type { OrderCardProps } from "./types";
import { getMarketplaceInfo } from "./utils";

/**
 * Full-page order card: product badges, image, SKU row, title and buyer details.
 *
 * @param {object}  props
 * @param {object}  props.order              The order object.
 * @param {object}  props.productDetails     Resolved { name, label, weight, unite }.
 * @param {number}  props.selectedItemIndex  Active item index (only for the active card).
 * @param {boolean} props.isActive           Whether this is the centre/active card.
 * @param {boolean} props.isImageLoading     Show spinner overlay.
 * @param {(url: string) => void} props.onImageLoad   Image loaded callback.
 * @param {() => void}            props.onImageError  Image error callback.
 * @param {(index: number) => void} props.onSelectItem Select a different item.
 * @param {(sku: string) => void}   props.onCopySku   Copy SKU to clipboard.
 * @param {boolean} props.copiedSku          Flash state after copy.
 */
const OrderCard = ({
  order,
  productDetails,
  selectedItemIndex,
  isActive,
  orderNumber = undefined,
  onOrderBadgeClick = undefined,
  isImageLoading,
  onImageLoad = undefined,
  onImageError = undefined,
  onSelectItem = undefined,
  onCopySku = undefined,
  copiedSku,
}: OrderCardProps) => {
  const { t } = useLanguage();
  const itemIndex = isActive ? selectedItemIndex : 0;
  const item = order?.orderItems?.[itemIndex] ?? order?.orderItems?.[0];
  const [isQuantityBlinkOn, setIsQuantityBlinkOn] = useState(false);
  const [isItemsBlinkOn, setIsItemsBlinkOn] = useState(false);

  if (!item) return null;

  const marketplaceInfo = getMarketplaceInfo(item);
  const orderItemsCount = order?.orderItems?.length || 0;
  const hasMultipleItems = isActive && orderItemsCount > 1;
  const shouldBlinkQuantity = isActive && Number(item?.quantity || 0) > 1;
  const shouldBlinkItems = isActive && orderItemsCount > 1;
  const orderIdentity = String(order?.orderId || order?.order_id || "");

  useEffect(() => {
    setIsQuantityBlinkOn(false);

    if (!shouldBlinkQuantity) return undefined;

    let pulseInterval: ReturnType<typeof setInterval> | null = null;
    let loopInterval: ReturnType<typeof setInterval> | null = null;

    const runPulse = () => {
      let toggleCount = 0;

      if (pulseInterval) {
        clearInterval(pulseInterval);
        pulseInterval = null;
      }

      pulseInterval = setInterval(() => {
        toggleCount += 1;
        setIsQuantityBlinkOn((prev) => !prev);

        if (toggleCount >= 6 && pulseInterval) {
          clearInterval(pulseInterval);
          pulseInterval = null;
          setIsQuantityBlinkOn(false);
        }
      }, 180);
    };

    // First blink starts quickly after entering a new page.
    const firstPulseTimeout = setTimeout(() => {
      runPulse();
      loopInterval = setInterval(() => {
        runPulse();
      }, 5000);
    }, 2000);

    return () => {
      clearTimeout(firstPulseTimeout);
      if (loopInterval) {
        clearInterval(loopInterval);
      }
      if (pulseInterval) {
        clearInterval(pulseInterval);
      }
      setIsQuantityBlinkOn(false);
    };
  }, [shouldBlinkQuantity, orderIdentity, itemIndex, isActive]);

  useEffect(() => {
    setIsItemsBlinkOn(false);

    if (!shouldBlinkItems) return undefined;

    let pulseInterval: ReturnType<typeof setInterval> | null = null;
    let loopInterval: ReturnType<typeof setInterval> | null = null;

    const runPulse = () => {
      let toggleCount = 0;

      if (pulseInterval) {
        clearInterval(pulseInterval);
        pulseInterval = null;
      }

      pulseInterval = setInterval(() => {
        toggleCount += 1;
        setIsItemsBlinkOn((prev) => !prev);

        if (toggleCount >= 6 && pulseInterval) {
          clearInterval(pulseInterval);
          pulseInterval = null;
          setIsItemsBlinkOn(false);
        }
      }, 180);
    };

    const firstPulseTimeout = setTimeout(() => {
      runPulse();
      loopInterval = setInterval(() => {
        runPulse();
      }, 5000);
    }, 2000);

    return () => {
      clearTimeout(firstPulseTimeout);
      if (loopInterval) {
        clearInterval(loopInterval);
      }
      if (pulseInterval) {
        clearInterval(pulseInterval);
      }
      setIsItemsBlinkOn(false);
    };
  }, [shouldBlinkItems, orderIdentity, isActive]);

  return (
    <div
      className="relative h-full flex flex-col gap-3 overflow-y-auto pr-0.5 no-scrollbar"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {/* ── Product section ───────────────────────────────────────────── */}
      <div className="w-full relative bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
        {/* Badges row */}
        <div className="grid gap-2 items-center">
          <div className="grid w-full grid-cols-[1fr_60px_100px] items-center gap-2">
            {/* Weight */}
            <Badge
              gradient="from-success-light to-green-50 dark:from-green-900/30 dark:to-emerald-900/20"
              border="border-success/20 dark:border-green-700/50"
              iconBg="bg-success"
              icon={<Weight className="w-3 h-3 text-white" />}
            >
              <p className="text-lg font-bold text-success dark:text-green-300 truncate">
                {parseFloat(productDetails.weight)} {t("orders.grams")}
              </p>
            </Badge>

            <button
              type="button"
              onClick={() => onOrderBadgeClick?.()}
              className="h-10 px-3 rounded-md border border-primary-300 dark:border-primary-700 bg-primary-50/80 dark:bg-primary-900/40 text-primary-700 dark:text-primary-200 text-md font-bold whitespace-nowrap"
              title="Open order list"
            >
              #{orderNumber ? orderNumber : "?"}
            </button>

            {/* Quantity */}
            <Badge
              gradient={
                isQuantityBlinkOn
                  ? "from-red-600 to-rose-800 dark:from-red-700 dark:to-red-900"
                  : item.quantity > 1
                    ? "from-amber-200 to-orange-400 dark:from-orange-400/50 dark:to-red-500/50"
                    : "from-warning/10 to-orange-400/10 dark:from-orange-900/10 dark:to-red-900/10"
              }
              border={
                isQuantityBlinkOn
                  ? "outline-4 outline-red-600 dark:outline-red-500"
                  : item.quantity > 1
                    ? "outline-warning dark:outline-orange-500"
                    : "outline-warning/20 dark:outline-orange-600/20"
              }
              iconBg={
                isQuantityBlinkOn
                  ? "bg-red-700"
                  : item.quantity > 1
                    ? "bg-orange-500"
                    : "bg-warning"
              }
              iconClass={item.quantity > 1 ? "scale-110" : "opacity-60"}
              className={
                isQuantityBlinkOn
                  ? "animate-pulse ring-2 ring-red-500/90 shadow-lg shadow-red-500/40"
                  : item.quantity > 1
                    ? "ring-1 ring-orange-400/90 shadow-md shadow-orange-400/30"
                    : ""
              }
              icon={<Boxes className="w-3 h-3 text-white" />}
            >
              <p
                className={`text-lg font-bold truncate transition-colors duration-150 ${
                  isQuantityBlinkOn
                    ? "opacity-100 text-white drop-shadow-[0_0_6px_rgba(127,29,29,0.8)]"
                    : item.quantity > 1
                      ? "opacity-100 text-orange-950 dark:text-orange-100"
                      : "opacity-60 text-warning dark:text-orange-300"
                }`}
              >
                {item.quantity}
                {t("orders.times")}
              </p>
            </Badge>
          </div>

          {/* Product name */}
          <Badge
            gradient="from-info-light to-blue-50 dark:from-blue-900/30 dark:to-cyan-900/20"
            border="border-info/20 dark:border-blue-700/50"
            iconBg="bg-info"
            icon={<Tag className="w-3 h-3 text-white" />}
          >
            <p className="text-lg font-bold text-info dark:text-blue-300 line-clamp-1 wrap-break-word">
              {productDetails.name} • {productDetails.label}
            </p>
          </Badge>
        </div>

        {/* Image + item selector */}
        <div
          className={`relative w-full my-2 gap-1 grid grid-cols-1 ${
            hasMultipleItems ? "grid-cols-[1fr_50px] px-10" : ""
          }`}
        >
          <div className="my-1 flex justify-center">
            <div className="relative w-full max-w-[min(45vw,45vh)] min-h-[min(30vw,30vh)] max-h-[min(45vw,45vh)]">
              {isActive && isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                </div>
              )}
              <img
                key={item.primaryImageUrl}
                src={item.primaryImageUrl}
                alt={item.title}
                className="w-full h-full object-contain bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                onLoad={() => isActive && onImageLoad?.(item.primaryImageUrl)}
                onError={() => isActive && onImageError?.()}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/5 via-transparent to-transparent rounded-md" />
            </div>
          </div>

          {hasMultipleItems && (
            <div
              className={`relative p-1 flex flex-col justify-center items-center gap-2 w-full overflow-y-auto no-scrollbar rounded-md border transition-all duration-200 ${
                isItemsBlinkOn
                  ? "border-red-400 bg-red-50/70 dark:bg-red-900/20"
                  : "border-transparent"
              }`}
            >
              {order.orderItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onSelectItem?.(index)}
                  className={`shrink-0 size-9 rounded-md border transition-all duration-300 transform text-xs font-medium ${
                    selectedItemIndex === index
                      ? isItemsBlinkOn
                        ? "bg-red-500 text-white border-red-400 scale-105 font-bold"
                        : "bg-primary dark:bg-primary-600 text-white border-primary-600 dark:border-primary-400 scale-105 font-bold"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:border-primary-300 dark:hover:border-primary-600 hover:scale-105"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SKU row */}
        <SkuRow
          sku={item.sku}
          marketplaceInfo={marketplaceInfo}
          onCopy={onCopySku}
          copied={copiedSku}
        />

        {/* Product title */}
        <div className="p-2 bg-gray-50 dark:bg-primary-900/20 rounded-md border border-primary-200 dark:border-primary-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-4 leading-relaxed">
            {item.title}
          </p>
        </div>
      </div>

      {/* ── Buyer details ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full" />
          {t("orders.buyerDetails")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <InfoCell label={t("orders.name")} value={order.buyerDetails?.name} />
          <InfoCell
            label={t("orders.state")}
            value={order.buyerDetails?.address?.state}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;

/* ━━━━━━━━━━━━━━━━━━ Internal tiny sub-components ━━━━━━━━━━━━━━━━━━━━━━━ */

/** Coloured icon + value badge used for weight / qty / name. */
const Badge = ({
  children,
  gradient,
  border,
  iconBg,
  icon,
  iconClass = "",
  className = "",
}) => (
  <div
    className={`flex items-center gap-2 px-2 py-1 bg-linear-to-br ${gradient} ${border} rounded-md border ${className}`}
  >
    <div className={`p-1 ${iconBg} rounded-md shrink-0 ${iconClass}`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);

/** SKU display + copy button row. */
const SkuRow = ({ sku, marketplaceInfo, onCopy, copied }) => (
  <div className="w-[86%] mx-auto mb-2 py-0 px-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs flex items-center gap-1 text-gray-600 dark:text-gray-400 flex-1 min-w-0">
        <span className="font-semibold text-gray-900 dark:text-gray-200">
          SKU:
        </span>{" "}
        <span className="font-mono text-xs break-all max-w-3xs truncate">
          {sku}
        </span>
        {marketplaceInfo && (
          <span
            className={`ml-1 inline-flex items-center text-[10px]`}
            title={marketplaceInfo.label}
          >
            {marketplaceInfo.label === "Flipkart" ? (
              <SiFlipkart className="size-5 text-yellow-300" />
            ) : (
              <FaShopify className="size-6 text-[#81BF37]" />
            )}
          </span>
        )}
      </p>
      <button
        onClick={() => onCopy?.(sku)}
        className="shrink-0 p-1.5 rounded-md transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95"
        title="Copy SKU"
      >
        {copied ? (
          <svg
            className="w-4 h-4 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>
    </div>
  </div>
);

/** Simple label/value cell used in buyer details. */
const InfoCell = ({ label, value }) => (
  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
      {label}
    </p>
    <p className="text-xs font-semibold text-gray-900 dark:text-white">
      {value || "N/A"}
    </p>
  </div>
);
