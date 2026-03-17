import { useEffect, useState } from "react";
import {
  HomePage,
  OrdersPage,
  ResponsiveNav,
  SettingsPage,
} from "./components";
import { useAuth } from "./lib/AuthContext";
import type { SelectedOrdersState } from "./types/orders";

function IndexPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedOrdersState, setSelectedOrdersState] =
    useState<SelectedOrdersState | null>(null);

  useEffect(() => {
    setSelectedOrdersState(null);
  }, [user?.id]);

  // Redirect to settings page if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      handleTabChange("settings");
    }
  }, [isAuthenticated, loading]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  const handleNavigateToOrders = (state: SelectedOrdersState) => {
    setSelectedOrdersState(state);
    handleTabChange("orders");
  };

  const selectedOrdersStateForCurrentUser =
    user?.id && selectedOrdersState?.userId === user.id
      ? selectedOrdersState
      : null;

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onNavigateToOrders={handleNavigateToOrders} />;
      case "orders":
        // If not authenticated, redirect to settings
        if (!isAuthenticated) {
          return <SettingsPage />;
        }
        return (
          <OrdersPage selectedOrdersState={selectedOrdersStateForCurrentUser} />
        );
      case "settings":
        return <SettingsPage />;
      default:
        return <HomePage onNavigateToOrders={handleNavigateToOrders} />;
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-svh bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-svh bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <ResponsiveNav activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="relative h-full overflow-hidden">
        {activeTab === "orders" ? (
          <div className="pt-16 md:pt-18 h-full overflow-hidden">
            {renderContent()}
          </div>
        ) : (
          <div className="max-w-7xl pt-16 md:pt-18 pb-6 px-2 md:px-6 lg:px-8 mx-auto h-full custom-scrollbar overflow-y-auto overscroll-y-contain">
            {renderContent()}
          </div>
        )}
      </main>
    </div>
  );
}

export default IndexPage;
