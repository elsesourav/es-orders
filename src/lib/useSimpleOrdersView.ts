import { useCallback, useEffect, useState } from "react";

const SIMPLE_ORDERS_VIEW_KEY = "es_orders_simple_orders_view";
const SIMPLE_ORDERS_VIEW_EVENT = "es_orders_simple_orders_view_change";

function readSimpleOrdersView(): boolean {
  const raw = localStorage.getItem(SIMPLE_ORDERS_VIEW_KEY);
  if (raw === null) return true;
  return raw === "true";
}

export const useSimpleOrdersView = () => {
  const [isSimpleOrdersViewEnabled, setIsSimpleOrdersViewEnabled] =
    useState<boolean>(() => readSimpleOrdersView());

  useEffect(() => {
    const syncFromStorage = () => {
      setIsSimpleOrdersViewEnabled(readSimpleOrdersView());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== SIMPLE_ORDERS_VIEW_KEY) return;
      syncFromStorage();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(SIMPLE_ORDERS_VIEW_EVENT, syncFromStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(SIMPLE_ORDERS_VIEW_EVENT, syncFromStorage);
    };
  }, []);

  const setSimpleOrdersViewEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(SIMPLE_ORDERS_VIEW_KEY, String(enabled));
    setIsSimpleOrdersViewEnabled(enabled);
    window.dispatchEvent(new Event(SIMPLE_ORDERS_VIEW_EVENT));
  }, []);

  const toggleSimpleOrdersView = useCallback(() => {
    setSimpleOrdersViewEnabled(!isSimpleOrdersViewEnabled);
  }, [isSimpleOrdersViewEnabled, setSimpleOrdersViewEnabled]);

  return {
    isSimpleOrdersViewEnabled,
    setSimpleOrdersViewEnabled,
    toggleSimpleOrdersView,
  };
};
