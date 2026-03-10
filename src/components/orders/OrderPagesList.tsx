import { useEffect, useMemo, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import { A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import OrderCard from "./OrderCard";
import type { OrderPagesListProps } from "./types";

const HOTZONE_DEBUG_MODE = false;
const SWIPE_TRANSITION_MS = 220;
const EDGE_RESISTANCE_RATIO = 0.28;
// Swiper touch ratio. Example: 5px finger move -> 10px swipe movement.
const TOUCH_SCROLL_MULTIPLIER = 2;

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

  const swiperRef = useRef<SwiperInstance | null>(null);
  const previousSelectedIndexRef = useRef<number | null>(null);
  const [isOrderPickerOpen, setIsOrderPickerOpen] = useState(false);
  const [isOrderPickerVisible, setIsOrderPickerVisible] = useState(false);
  const [orderJumpValue, setOrderJumpValue] = useState("");
  const [scrollDirection, setScrollDirection] = useState<-1 | 0 | 1>(0);

  useEffect(() => {
    if (selectedOrderIndex === null) return;

    const previous = previousSelectedIndexRef.current;
    if (previous !== null && previous !== selectedOrderIndex) {
      setScrollDirection(selectedOrderIndex > previous ? 1 : -1);
    }
    previousSelectedIndexRef.current = selectedOrderIndex;

    return undefined;
  }, [selectedOrderIndex]);

  useEffect(() => {
    if (selectedOrderIndex === null) return;

    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;

    if (swiper.activeIndex !== selectedOrderIndex) {
      swiper.slideTo(selectedOrderIndex, SWIPE_TRANSITION_MS);
    }
  }, [selectedOrderIndex]);

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

  const handleSlideChange = (swiper: SwiperInstance) => {
    const nextIndex = swiper.activeIndex;
    const currentIndex = selectedOrderIndex ?? nextIndex;

    if (nextIndex !== currentIndex) {
      setScrollDirection(nextIndex > currentIndex ? 1 : -1);
      onSelectOrder(nextIndex);
    }
  };

  if (!orders.length || selectedOrderIndex === null) return null;

  return (
    <div className="h-full py-1 md:py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20 relative overflow-hidden">
      <Swiper
        modules={[A11y]}
        className="h-full"
        slidesPerView={1}
        speed={SWIPE_TRANSITION_MS}
        resistance
        resistanceRatio={EDGE_RESISTANCE_RATIO}
        threshold={4}
        touchRatio={TOUCH_SCROLL_MULTIPLIER}
        touchAngle={35}
        followFinger
        allowTouchMove={orders.length > 1}
        noSwiping
        noSwipingSelector="button, input, textarea, select, a, [role='button']"
        touchStartPreventDefault={false}
        preventClicks={false}
        preventClicksPropagation={false}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;

          if (swiper.activeIndex !== selectedOrderIndex) {
            swiper.slideTo(selectedOrderIndex, 0, false);
          }
        }}
        onSlideChange={handleSlideChange}
      >
        {orders.map((order, index) => {
          const isActive = index === selectedOrderIndex;
          const isOddPage = index % 2 === 1;
          const isEvenNumberedCard = (index + 1) % 2 === 0;
          const distance = Math.abs(selectedOrderIndex - index);
          const scale = Math.max(0.92, 1 - distance * 0.08);
          const opacity = Math.max(0.72, 1 - distance * 0.2);
          const referenceIndex = selectedOrderIndex;
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
            <SwiperSlide
              key={`${order.orderId || order.order_id || index}-${index}`}
              className="h-full!"
            >
              <div
                className={`relative w-full h-full p-1 rounded-xl ${
                  isOddPage
                    ? "bg-indigo-50/70 dark:bg-indigo-950/30"
                    : "bg-transparent"
                }`}
                style={{
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
                    isEvenNumberedCard={isEvenNumberedCard}
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
            </SwiperSlide>
          );
        })}
      </Swiper>

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
