import OrdersProductDetailsCard from "@/features/orders/components/OrdersProductDetailsCard";
import useOrderData from "@/features/orders/hooks/useOrderData";
import type { Order, SelectedOrdersState } from "@/types/orders";
import { useEffect, useMemo, useState } from "react";

type SavedStateProductDetailsModalProps = {
  open: boolean;
  state: SelectedOrdersState | null;
  onClose: () => void;
};

function getAllOrders(state: SelectedOrdersState | null): Order[] {
  if (!state) return [];

  const rtd = Array.isArray(state.rtd) ? state.rtd : [];
  const handover = Array.isArray(state.handover) ? state.handover : [];
  return [...rtd, ...handover];
}

export default function SavedStateProductDetailsModal({
  open,
  state,
  onClose,
}: SavedStateProductDetailsModalProps) {
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return undefined;
    }

    setIsVisible(false);
    const timer = window.setTimeout(() => {
      setIsMounted(false);
    }, 220);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!isMounted) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMounted, onClose]);

  const resolverState = useMemo<SelectedOrdersState | null>(() => {
    if (!state) return null;
    return {
      ...state,
      selectedType: "rtd",
    };
  }, [state]);

  const allOrders = useMemo(() => getAllOrders(state), [state]);

  const { resolveProduct, isOrdersLoading } = useOrderData(resolverState);

  if (!isMounted || !state) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-60 flex items-center justify-center p-2 md:p-3 transition-all duration-200 ${
        isVisible
          ? "bg-black/40 dark:bg-black/60 opacity-100"
          : "bg-black/0 opacity-0"
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-3xl h-[min(90svh,760px)] rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900 shadow-xl p-2 transition-all duration-200 ${
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
        }`}
      >
        <div className="h-full flex flex-col gap-2">
          <header className="flex items-start justify-between gap-2 px-1 py-0.5 border-b border-gray-200/70 dark:border-gray-700/70">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Product Details
              </h3>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 wrap-break-word">
                {state.timestamp || "No timestamp"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 text-xs px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors duration-200"
            >
              Close
            </button>
          </header>

          <main className="flex-1 min-h-0 px-0.5 pb-0.5">
            {isOrdersLoading ? (
              <p className="h-full flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                Loading product details...
              </p>
            ) : (
              <OrdersProductDetailsCard
                orders={allOrders}
                resolveProduct={resolveProduct}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
