import { useEffect, useMemo, useRef, useState } from "react";
import OrderCard from "./OrderCard";
import type { OrderPagesListProps } from "./types";

const OrderPagesList = ({
  orders,
  selectedOrderIndex,
  onSelectOrder,
  selectedItemIndex,
  product,
  isImageLoading,
  onImageLoad,
  onImageError,
  onSelectItem,
  onCopySku,
  copiedSku,
  resolveProduct,
}: OrderPagesListProps) => {
  const PICKER_WINDOW_RADIUS = 25;
  const FORWARD_RENDER_WINDOW = 5;
  const BACKWARD_RENDER_WINDOW = 2;
  const EDGE_PRELOAD_EXTRA = 2;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPointerDownRef = useRef(false);
  const isTouchActiveRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const lastScrollProgressRef = useRef(0);
  const [isOrderPickerOpen, setIsOrderPickerOpen] = useState(false);
  const [isOrderPickerVisible, setIsOrderPickerVisible] = useState(false);
  const [orderJumpValue, setOrderJumpValue] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<-1 | 0 | 1>(0);

  const pageRefs = useMemo<(HTMLDivElement | null)[]>(
    () => Array.from({ length: orders.length }, () => null),
    [orders.length],
  );

  useEffect(() => {
    if (selectedOrderIndex === null) return undefined;
    const pageNode = pageRefs[selectedOrderIndex];
    if (!pageNode) return undefined;

    lastScrollProgressRef.current = selectedOrderIndex;
    setScrollProgress(selectedOrderIndex);

    pageNode.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });

    return undefined;
  }, [pageRefs, selectedOrderIndex]);

  const settleToNearest = () => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 1;
    const nextIndex = Math.round(container.scrollLeft / width);
    const clamped = Math.max(0, Math.min(orders.length - 1, nextIndex));
    const targetLeft = clamped * width;

    container.scrollTo({ left: targetLeft, behavior: "smooth" });

    if (clamped !== selectedOrderIndex) {
      onSelectOrder(clamped);
    }
  };

  const scheduleSettle = (delay = 140) => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
    }
    settleTimerRef.current = setTimeout(() => {
      if (isPointerDownRef.current || isTouchActiveRef.current) {
        return;
      }
      settleToNearest();
    }, delay);
  };

  const openOrderPicker = () => {
    const startValue =
      selectedOrderIndex === null ? "" : String(selectedOrderIndex + 1);
    setOrderJumpValue(startValue);
    setIsOrderPickerOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsOrderPickerVisible(true));
    });
  };

  const closeOrderPicker = () => {
    setIsOrderPickerVisible(false);
    setTimeout(() => {
      setIsOrderPickerOpen(false);
    }, 180);
  };

  const pickerIndexes = useMemo(() => {
    const total = orders.length;
    if (total === 0) return [] as number[];

    if (total <= 120 || selectedOrderIndex === null) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const start = Math.max(0, selectedOrderIndex - PICKER_WINDOW_RADIUS);
    const end = Math.min(total - 1, selectedOrderIndex + PICKER_WINDOW_RADIUS);

    const indexSet = new Set<number>([0, total - 1]);
    for (let index = start; index <= end; index += 1) {
      indexSet.add(index);
    }

    return Array.from(indexSet).sort((a, b) => a - b);
  }, [orders.length, selectedOrderIndex]);

  const handleJumpToOrder = () => {
    const parsed = Number.parseInt(orderJumpValue, 10);
    if (Number.isNaN(parsed) || parsed < 1) return;

    const targetIndex = Math.min(Math.max(parsed - 1, 0), orders.length - 1);
    onSelectOrder(targetIndex);
    closeOrderPicker();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const handleScroll = () => {
      const width = container.clientWidth || 1;
      const nextProgress = container.scrollLeft / width;
      const delta = nextProgress - lastScrollProgressRef.current;

      if (Math.abs(delta) >= 0.01) {
        const nextDirection: -1 | 1 = delta > 0 ? 1 : -1;
        setScrollDirection((prev) =>
          prev === nextDirection ? prev : nextDirection,
        );
      }

      lastScrollProgressRef.current = nextProgress;
      setScrollProgress(nextProgress);

      if (!isPointerDownRef.current && !isTouchActiveRef.current) {
        scheduleSettle(140);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      isPointerDownRef.current = true;
      activePointerIdRef.current = event.pointerId;
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (
        activePointerIdRef.current !== null &&
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }
      isPointerDownRef.current = false;
      activePointerIdRef.current = null;
      scheduleSettle(80);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (
        activePointerIdRef.current !== null &&
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }
      isPointerDownRef.current = false;
      activePointerIdRef.current = null;
      scheduleSettle(180);
    };

    const handleTouchStart = () => {
      isTouchActiveRef.current = true;
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };

    const handleTouchEnd = () => {
      isTouchActiveRef.current = false;
      scheduleSettle(80);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerCancel);
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });
    container.addEventListener("touchcancel", handleTouchEnd, {
      passive: true,
    });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerCancel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };
  }, [onSelectOrder, orders.length, selectedOrderIndex]);

  if (!orders.length || selectedOrderIndex === null) return null;

  return (
    <div className="h-full p-1 md:p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20 relative overflow-hidden">
      <div
        ref={containerRef}
        className="h-full flex items-start overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth overscroll-x-contain"
        style={{
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {orders.map((order, index) => {
          const isActive = index === selectedOrderIndex;
          const isOddPage = index % 2 === 1;
          const distance = Math.abs(scrollProgress - index);
          const scale = Math.max(0.92, 1 - distance * 0.08);
          const opacity = Math.max(0.72, 1 - distance * 0.2);
          const referenceIndex = Math.round(scrollProgress);
          const remainingRight = orders.length - 1 - referenceIndex;
          const remainingLeft = referenceIndex;

          const renderBehind =
            scrollDirection > 0
              ? BACKWARD_RENDER_WINDOW
              : FORWARD_RENDER_WINDOW;
          const renderAhead =
            scrollDirection < 0
              ? BACKWARD_RENDER_WINDOW
              : FORWARD_RENDER_WINDOW;

          const edgeLeftBoost =
            scrollDirection < 0 && remainingLeft <= 2 ? EDGE_PRELOAD_EXTRA : 0;
          const edgeRightBoost =
            scrollDirection > 0 && remainingRight <= 2 ? EDGE_PRELOAD_EXTRA : 0;

          const renderStart = Math.max(
            0,
            referenceIndex - renderBehind - edgeLeftBoost,
          );
          const renderEnd = Math.min(
            orders.length - 1,
            referenceIndex + renderAhead + edgeRightBoost,
          );

          const shouldRenderCard =
            (index >= renderStart && index <= renderEnd) || isActive;

          return (
            <div
              key={`${order.orderId || order.order_id || index}-${index}`}
              ref={(element) => {
                pageRefs[index] = element;
              }}
              className={`flex-none w-full h-full p-1 snap-start rounded-xl ${
                isOddPage
                  ? "bg-indigo-50/70 dark:bg-indigo-950/30"
                  : "bg-transparent"
              }`}
              style={{
                scrollSnapAlign: "start",
                transform: `scale(${scale})`,
                opacity,
                transition: "transform 220ms ease, opacity 220ms ease",
              }}
            >
              {shouldRenderCard ? (
                <OrderCard
                  order={order}
                  productDetails={
                    isActive ? product : resolveProduct(order.orderItems?.[0])
                  }
                  selectedItemIndex={isActive ? selectedItemIndex : 0}
                  isActive={isActive}
                  orderNumber={index + 1}
                  onOrderBadgeClick={isActive ? openOrderPicker : undefined}
                  isImageLoading={isActive ? isImageLoading : false}
                  onImageLoad={onImageLoad}
                  onImageError={onImageError}
                  onSelectItem={isActive ? onSelectItem : undefined}
                  onCopySku={onCopySku}
                  copiedSku={copiedSku}
                />
              ) : (
                <div className="h-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/50" />
              )}
            </div>
          );
        })}
      </div>

      {isOrderPickerOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
            isOrderPickerVisible
              ? "bg-black/30 dark:bg-black/50 opacity-100"
              : "bg-black/0 opacity-0"
          }`}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeOrderPicker();
            }
          }}
        >
          <div
            className={`w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all duration-200 ${
              isOrderPickerVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-3 scale-95"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Select Order
              </h3>
              <button
                type="button"
                className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600"
                onClick={closeOrderPicker}
              >
                Close
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="number"
                min={1}
                max={orders.length}
                value={orderJumpValue}
                onChange={(event) => setOrderJumpValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleJumpToOrder();
                  }
                }}
                placeholder={`1 - ${orders.length}`}
                className="flex-1 h-9 px-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              />
              <button
                type="button"
                onClick={handleJumpToOrder}
                className="h-9 px-3 rounded-md border border-primary-500 bg-primary text-white text-xs font-semibold"
              >
                Go
              </button>
            </div>
            <div className="max-h-[50svh] overflow-y-auto no-scrollbar grid grid-cols-5 gap-2">
              {pickerIndexes.map((index) => {
                const isCurrent = index === selectedOrderIndex;
                return (
                  <button
                    key={`picker-${index}`}
                    type="button"
                    onClick={() => {
                      onSelectOrder(index);
                      closeOrderPicker();
                    }}
                    className={`h-9 rounded-md border text-xs font-semibold ${
                      isCurrent
                        ? "bg-primary text-white border-primary-600"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPagesList;
