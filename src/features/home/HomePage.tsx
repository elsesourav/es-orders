import { Package } from "lucide-react";
import { useState } from "react";
import CustomAlert from "../../components/ui/CustomAlert";
import LoadingWindow from "../../components/ui/feedback/LoadingWindow";
import { useAuth } from "../../lib/AuthContext";
import { useLanguage } from "../../lib/useLanguage";
import type { SelectedOrdersState } from "../../types/orders";
import HomeFiltersFooter from "./components/HomeFiltersFooter";
import HomeHeader from "./components/HomeHeader";
import SavedStateCard from "./components/SavedStateCard";
import SavedStateProductDetailsModal from "./components/SavedStateProductDetailsModal";
import SwitchAccountPopup from "./components/SwitchAccountPopup";
import useAccountSwitch from "./hooks/useAccountSwitch";
import useHomeOrderStates from "./hooks/useHomeOrderStates";

interface HomePageProps {
  onNavigateToOrders?: (state: SelectedOrdersState) => void;
}

const HomePage = ({ onNavigateToOrders }: HomePageProps) => {
  const { user, savedAccounts, switchAccount } = useAuth();
  const { t } = useLanguage();
  const {
    states,
    loading,
    error,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    paginationLabel,
    hasPreviousPage,
    hasMore,
    handleApplyDateFilter,
    handleClearDateFilter,
    goPrevious,
    goNext,
  } = useHomeOrderStates(user?.id);

  const {
    showSwitchPopup,
    switchPopupVisible,
    switchingUsername,
    alert,
    setAlert,
    openSwitchPopup,
    closeSwitchPopup,
    handleQuickSwitch,
  } = useAccountSwitch({ user, switchAccount, t });

  const [selectedStateForDetails, setSelectedStateForDetails] =
    useState<SelectedOrdersState | null>(null);

  const openState = (
    state: SelectedOrdersState,
    selectedType: "rtd" | "handover",
  ) => {
    onNavigateToOrders?.({
      ...state,
      selectedType,
      userId: user?.id ?? state.userId,
    });
  };

  return (
    <div className="space-y-6">
      <LoadingWindow
        open={loading}
        title={t("home.loadingStates")}
        message="Please wait while we sync saved order states"
      />

      <HomeHeader user={user} t={t} onOpenSwitchPopup={openSwitchPopup} />

      {!loading && error && (
        <div className="text-center py-12">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-700 dark:text-red-400">
              {t("common.error")}: {error}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && states.length === 0 && (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("home.noSavedStatesFound")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t("home.noStatesCreated")}
          </p>
        </div>
      )}

      {!loading && !error && states.length > 0 && (
        <div className="relative flex flex-col gap-4">
          {states.map((state, index) => (
            <SavedStateCard
              key={String(state.id || index)}
              state={state}
              index={index}
              onOpenDetails={(nextState) =>
                setSelectedStateForDetails(nextState)
              }
              onOpenRtd={(nextState) => openState(nextState, "rtd")}
              onOpenHandover={(nextState) => openState(nextState, "handover")}
              t={t}
            />
          ))}
        </div>
      )}

      {!loading && (
        <HomeFiltersFooter
          t={t}
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          loading={loading}
          onApply={handleApplyDateFilter}
          onClear={handleClearDateFilter}
          page={paginationLabel.page}
          shown={paginationLabel.shown}
          total={paginationLabel.total}
          hasPreviousPage={hasPreviousPage}
          hasMore={hasMore}
          onPrevious={goPrevious}
          onNext={goNext}
        />
      )}

      <SwitchAccountPopup
        open={showSwitchPopup}
        visible={switchPopupVisible}
        savedAccounts={savedAccounts}
        user={user}
        switchingUsername={switchingUsername}
        t={t}
        onClose={closeSwitchPopup}
        onSwitch={handleQuickSwitch}
      />

      <SavedStateProductDetailsModal
        open={!!selectedStateForDetails}
        state={selectedStateForDetails}
        onClose={() => setSelectedStateForDetails(null)}
      />

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
