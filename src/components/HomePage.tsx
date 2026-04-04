import { ChevronRight, Package, Truck } from "lucide-react";

import { useEffect, useState } from "react";
import { listOrderStates } from "../api/ordersStatesApi";
import { useAuth } from "../lib/AuthContext";
import { useLanguage } from "../lib/useLanguage";
import type { SelectedOrdersState } from "../types/orders";
import CustomAlert from "./ui/CustomAlert";

interface HomePageProps {
  onNavigateToOrders?: (state: SelectedOrdersState) => void;
}

const HomePage = ({ onNavigateToOrders }: HomePageProps) => {
  const { user, savedAccounts, switchAccount } = useAuth();
  const { t } = useLanguage();
  const [states, setStates] = useState<SelectedOrdersState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSwitchPopup, setShowSwitchPopup] = useState(false);
  const [switchPopupVisible, setSwitchPopupVisible] = useState(false);
  const [switchingUsername, setSwitchingUsername] = useState<string | null>(
    null,
  );
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const openSwitchPopup = () => {
    setShowSwitchPopup(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSwitchPopupVisible(true));
    });
  };

  const closeSwitchPopup = () => {
    setSwitchPopupVisible(false);
    setTimeout(() => setShowSwitchPopup(false), 180);
  };

  const handleQuickSwitch = async (username: string) => {
    if (
      String(username).toLowerCase() === String(user?.username).toLowerCase()
    ) {
      return;
    }

    setSwitchingUsername(username);
    const result = await switchAccount(username);
    setSwitchingUsername(null);

    if (!result.success) {
      setAlert({
        type: "error",
        message: result.error || t("settings.switchFailed"),
      });
      return;
    }

    setAlert({
      type: "success",
      message: `${t("settings.switchedTo")} @${username}`,
    });
    closeSwitchPopup();
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await listOrderStates();
        const currentUserId = String(user?.id || "");
        const ownStates = (response || []).filter(
          (item) =>
            String(item?.user_id ?? item?.created_by ?? "") === currentUserId,
        );

        const nextStates: SelectedOrdersState[] =
          ownStates?.map((item) => ({
            ...item?.order_data?.states,
            id: item?.id,
            timestamp: item?.order_data?.timestamp,
            userId: String(item?.user_id ?? item?.created_by ?? ""),
          })) || [];

        setStates(nextStates);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  const handleRTDClick = (e, state: SelectedOrdersState) => {
    e.stopPropagation();
    onNavigateToOrders?.({
      ...state,
      selectedType: "rtd",
      userId: user?.id ?? state.userId,
    });
  };

  const handleHandoverClick = (e, state: SelectedOrdersState) => {
    e.stopPropagation();

    onNavigateToOrders?.({
      ...state,
      selectedType: "handover",
      userId: user?.id ?? state.userId,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {t("home.loadingStates")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700 dark:text-red-400">
            {t("common.error")}: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        {user && (
          <div className="mx-auto inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <span className="text-md font-semibold text-gray-900 dark:text-white">
              <span className="font-normal text-gray-500 dark:text-gray-400">
                {t("orders.name")}:{" "}
              </span>
              {user.name || "User"}
            </span>
            <button
              type="button"
              onClick={openSwitchPopup}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {t("settings.switch")}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("home.savedStates")}
        </h1>
      </div>

      {states.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("home.noSavedStatesFound")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t("home.noStatesCreated")}
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col gap-4">
          {states.map((state, index) => (
            <div
              key={state.id || index}
              className="relative w-full grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-2 bg-white dark:bg-gray-800 rounded-lg px-2 py-2 shadow-sm border border-gray-200 dark:border-gray-700 active:shadow-lg active:border-primary-300 dark:active:border-primary-600 transition-all duration-300 active:-translate-y-1"
            >
              <div className="relative w-full h-full flex items-center text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                {state.timestamp || "No timestamp"}
              </div>

              <div className="relative w-full grid grid-cols-2 gap-2">
                {/* RTD Card */}
                <div
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 border border-blue-200 dark:border-blue-800 active:bg-blue-100 dark:active:bg-blue-900/30 transition-colors duration-200 cursor-pointer"
                  onClick={(e) => handleRTDClick(e, state)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center active:bg-blue-200 dark:active:bg-blue-900/50 transition-colors duration-200">
                      <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t("home.rtd")}
                      </h4>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {state.rtd?.length || 0} {t("home.items")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Handover Card */}
                <div
                  className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 border border-purple-200 dark:border-purple-800 active:bg-purple-100 dark:active:bg-purple-900/30 transition-colors duration-200 cursor-pointer"
                  onClick={(e) => handleHandoverClick(e, state)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center active:bg-purple-200 dark:active:bg-purple-900/50 transition-colors duration-200">
                      <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t("home.handover")}
                      </h4>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {state.handover?.length || 0} {t("home.items")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSwitchPopup && (
        <div
          className={`fixed inset-0 z-2147483645 flex items-end sm:items-center justify-center p-4 transition-all duration-200 ${
            switchPopupVisible
              ? "bg-black/30 backdrop-blur-sm opacity-100"
              : "bg-black/0 backdrop-blur-none opacity-0"
          }`}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeSwitchPopup();
            }
          }}
        >
          <div
            className={`w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transform transition-all duration-200 ${
              switchPopupVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-3 scale-95"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t("settings.switchAccount")}
              </h3>
              <button
                type="button"
                className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600"
                onClick={closeSwitchPopup}
              >
                {t("common.close")}
              </button>
            </div>

            <div className="space-y-2 max-h-[50svh] overflow-y-auto custom-scrollbar">
              {savedAccounts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("settings.noSavedAccounts")}
                </p>
              ) : (
                savedAccounts.map((account) => {
                  const isCurrent =
                    String(account.username || "").toLowerCase() ===
                    String(user?.username || "").toLowerCase();
                  const isSwitching = switchingUsername === account.username;

                  return (
                    <button
                      key={account.username}
                      type="button"
                      disabled={isCurrent || isSwitching}
                      onClick={() => handleQuickSwitch(account.username)}
                      className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                        isCurrent
                          ? "border-primary-400 bg-primary-50 dark:bg-primary-900/30"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      } ${isSwitching ? "opacity-70" : ""}`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {account.name || t("settings.unnamed")}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                          @{account.username}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {isCurrent
                          ? t("settings.current")
                          : isSwitching
                            ? t("common.loading")
                            : t("settings.switch")}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {alert && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
