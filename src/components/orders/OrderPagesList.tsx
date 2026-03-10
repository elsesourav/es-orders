import { useEffect, useMemo, useRef, useState } from "react";
import OrderCard from "./OrderCard";
import type { OrderPagesListProps } from "./types";

const HOTZONE_DEBUG_MODE = false;
const SWIPE_DEBUG_LOG = false;

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
  const SWIPE_NEXT_THRESHOLD = 0.03;
  const RELEASE_SETTLE_DELAY_MS = 95;
  const IDLE_SETTLE_DELAY_MS = 120;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gestureStartLeftRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);
  const isTouchActiveRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const lastDragLogAtRef = useRef(0);
  const lastScrollProgressRef = useRef(0);
  const [isOrderPickerOpen, setIsOrderPickerOpen] = useState(false);
  const [isOrderPickerVisible, setIsOrderPickerVisible] = useState(false);
  const [orderJumpValue, setOrderJumpValue] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<-1 | 0 | 1>(0);

  const logSwipe = (phase: string, payload: Record<string, unknown>) => {
    if (!SWIPE_DEBUG_LOG) return;
    console.log("[OrdersSwipe]", { phase, ...payload });
  };

  const logDragProgress = (
    source: "scroll" | "pointermove" | "touchmove",
    force = false,
  ) => {
    const container = containerRef.current;
    if (!container || !SWIPE_DEBUG_LOG) return;

    const now = Date.now();
    if (!force && now - lastDragLogAtRef.current < 120) return;
    lastDragLogAtRef.current = now;

    const width = container.clientWidth || 1;
    const startLeft =
      gestureStartLeftRef.current ??
      (selectedOrderIndex !== null
        ? selectedOrderIndex * width
        : container.scrollLeft);
    const startIndex = Math.round(startLeft / width);
    const rawIndex = container.scrollLeft / width;
    const deltaPages = (container.scrollLeft - startLeft) / width;

    logSwipe("drag", {
      source,
      startIndex,
      rawIndex: Number(rawIndex.toFixed(3)),
      deltaPages: Number(deltaPages.toFixed(3)),
      scrollLeft: Math.round(container.scrollLeft),
    });
  };

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

    gestureStartLeftRef.current = null;

    return undefined;
  }, [pageRefs, selectedOrderIndex]);

  const settleToNearest = () => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 1;
    const rawIndex = container.scrollLeft / width;
    const gestureStartLeft = gestureStartLeftRef.current;

    let nextIndex = Math.round(rawIndex);

    if (gestureStartLeft !== null) {
      const gestureStartIndex = Math.round(gestureStartLeft / width);
      const gestureDeltaPages =
        (container.scrollLeft - gestureStartLeft) / width;
      const absGestureDeltaPages = Math.abs(gestureDeltaPages);
      const roundedRawIndex = Math.round(rawIndex);

      if (absGestureDeltaPages < SWIPE_NEXT_THRESHOLD) {
        nextIndex = gestureStartIndex;
      } else {
        const directionalStep = gestureDeltaPages > 0 ? 1 : -1;

        // If raw position has crossed one or more page boundaries, respect it.
        // Otherwise still move at least one page in drag direction.
        nextIndex =
          roundedRawIndex === gestureStartIndex
            ? gestureStartIndex + directionalStep
            : roundedRawIndex;
      }

      if (SWIPE_DEBUG_LOG) {
        const action =
          nextIndex > gestureStartIndex
            ? "next"
            : nextIndex < gestureStartIndex
              ? "prev"
              : "stay";

        logSwipe("settle", {
          startIndex: gestureStartIndex,
          rawIndex: Number(rawIndex.toFixed(3)),
          deltaPages: Number(gestureDeltaPages.toFixed(3)),
          roundedRawIndex,
          threshold: SWIPE_NEXT_THRESHOLD,
          action,
        });
      }
    }

    const clamped = Math.max(0, Math.min(orders.length - 1, nextIndex));
    const targetLeft = clamped * width;

    if (SWIPE_DEBUG_LOG && gestureStartLeft !== null) {
      logSwipe("commit", {
        from: selectedOrderIndex,
        to: clamped,
      });
    }

    container.scrollTo({ left: targetLeft, behavior: "smooth" });

    if (clamped !== selectedOrderIndex) {
      onSelectOrder(clamped);
    }

    gestureStartLeftRef.current = null;
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

      if (isPointerDownRef.current || isTouchActiveRef.current) {
        logDragProgress("scroll");
      }

      if (!isPointerDownRef.current && !isTouchActiveRef.current) {
        scheduleSettle(IDLE_SETTLE_DELAY_MS);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      isPointerDownRef.current = true;
      activePointerIdRef.current = event.pointerId;
      gestureStartLeftRef.current = container.scrollLeft;
      lastDragLogAtRef.current = 0;
      logSwipe("pointerdown", {
        pointerType: event.pointerType,
        pointerId: event.pointerId,
        startIndex: Math.round(
          container.scrollLeft / (container.clientWidth || 1),
        ),
      });
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (
        !isPointerDownRef.current ||
        (activePointerIdRef.current !== null &&
          event.pointerId !== activePointerIdRef.current)
      ) {
        return;
      }

      logDragProgress("pointermove");
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (
        activePointerIdRef.current !== null &&
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }
      logDragProgress("pointermove", true);
      logSwipe("pointerup", {
        pointerType: event.pointerType,
        pointerId: event.pointerId,
      });
      isPointerDownRef.current = false;
      activePointerIdRef.current = null;
      scheduleSettle(RELEASE_SETTLE_DELAY_MS);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (
        activePointerIdRef.current !== null &&
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }
      logSwipe("pointercancel", {
        pointerType: event.pointerType,
        pointerId: event.pointerId,
        touchActive: isTouchActiveRef.current,
      });
      isPointerDownRef.current = false;
      activePointerIdRef.current = null;

      // On touch devices, pointer events often cancel while touch events continue.
      // Keep gesture start so touchmove/touchend keep correct delta calculations.
      if (event.pointerType !== "touch") {
        gestureStartLeftRef.current = null;
        scheduleSettle(IDLE_SETTLE_DELAY_MS);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      isTouchActiveRef.current = true;
      gestureStartLeftRef.current = container.scrollLeft;
      lastDragLogAtRef.current = 0;
      logSwipe("touchstart", {
        touches: event.touches.length,
        startIndex: Math.round(
          container.scrollLeft / (container.clientWidth || 1),
        ),
      });
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };

    const handleTouchMove = () => {
      if (!isTouchActiveRef.current) return;
      logDragProgress("touchmove");
    };

    const handleTouchEnd = (event: TouchEvent) => {
      logDragProgress("touchmove", true);
      logSwipe("touchend", {
        touches: event.touches.length,
        changedTouches: event.changedTouches.length,
      });
      isTouchActiveRef.current = false;
      scheduleSettle(RELEASE_SETTLE_DELAY_MS);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerCancel);
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
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
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerCancel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };
  }, [
    IDLE_SETTLE_DELAY_MS,
    RELEASE_SETTLE_DELAY_MS,
    onSelectOrder,
    orders.length,
    selectedOrderIndex,
    SWIPE_NEXT_THRESHOLD,
  ]);

  if (!orders.length || selectedOrderIndex === null) return null;

  return (
    <div className="h-full py-1 md:py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20 relative overflow-hidden">
      <div
        ref={containerRef}
        className="h-full flex items-start overflow-x-auto no-scrollbar snap-x snap-mandatory overscroll-x-contain"
        style={{
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
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
              className={`relative flex-none w-full h-full p-1 snap-start rounded-xl ${
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

      <div className="absolute inset-y-0 left-0 right-0 z-40 pointer-events-none">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (selectedOrderIndex > 0) {
              onSelectOrder(selectedOrderIndex - 1);
            }
          }}
          disabled={selectedOrderIndex <= 0}
          className={`absolute left-0 top-0 bottom-0 w-[5%] min-w-4 max-w-7 border-r pointer-events-auto transition-colors ${
            HOTZONE_DEBUG_MODE
              ? "bg-green-500/20 border-green-500/40"
              : "bg-transparent border-transparent"
          } ${selectedOrderIndex > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
          aria-label="Previous order"
          title="Previous order"
        >
          {HOTZONE_DEBUG_MODE && (
            <span className="text-[10px] font-semibold text-green-900 dark:text-green-100">
              PREV
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (selectedOrderIndex < orders.length - 1) {
              onSelectOrder(selectedOrderIndex + 1);
            }
          }}
          disabled={selectedOrderIndex >= orders.length - 1}
          className={`absolute right-0 top-0 bottom-0 w-[5%] min-w-4 max-w-7 border-l pointer-events-auto transition-colors ${
            HOTZONE_DEBUG_MODE
              ? "bg-green-500/20 border-green-500/40"
              : "bg-transparent border-transparent"
          } ${selectedOrderIndex < orders.length - 1 ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
          aria-label="Next order"
          title="Next order"
        >
          {HOTZONE_DEBUG_MODE && (
            <span className="text-[10px] font-semibold text-green-900 dark:text-green-100">
              NEXT
            </span>
          )}
        </button>
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
