import { useEffect, useState } from "react";
import {
   HomePage,
   OrdersPage,
   ResponsiveNav,
   SettingsPage,
} from "./components";
import { useAuth } from "./lib/AuthContext";

function IndexPage() {
   const { isAuthenticated, loading } = useAuth();
   const [activeTab, setActiveTab] = useState("home");

   // Clear orders state on app startup/reload
   useEffect(() => {
      // Check if this is a fresh app load (not navigation)
      const navigationFlag = sessionStorage.getItem(
         "es_orders_navigation_active"
      );

      if (!navigationFlag) {
         // This is a fresh app load/reload, clear the orders state
         console.log("Fresh app load detected - clearing orders state");
         localStorage.removeItem("es_orders_selected_state");
         // Set navigation flag for subsequent page changes
         sessionStorage.setItem("es_orders_navigation_active", "true");
      }
   }, []); // Run only once on component mount

   // Redirect to settings page if not authenticated
   useEffect(() => {
      if (!loading && !isAuthenticated) {
         handleTabChange("settings");
      }
   }, [isAuthenticated, loading]);

   // Custom tab change handler to maintain navigation state
   const handleTabChange = (newTab) => {
      // Ensure navigation flag stays active during tab switching
      sessionStorage.setItem("es_orders_navigation_active", "true");
      setActiveTab(newTab);
   };

   const renderContent = () => {
      switch (activeTab) {
         case "home":
            return (
               <HomePage onNavigateToOrders={() => handleTabChange("orders")} />
            );
         case "orders":
            // If not authenticated, redirect to settings
            if (!isAuthenticated) {
               return <SettingsPage />;
            }
            return <OrdersPage />;
         case "settings":
            return <SettingsPage />;
         default:
            return (
               <HomePage onNavigateToOrders={() => handleTabChange("orders")} />
            );
      }
   };

   // Show loading spinner while checking authentication
   if (loading) {
      return (
         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
               <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
         <ResponsiveNav activeTab={activeTab} onTabChange={handleTabChange} />
         <main className="relative h-full overflow-hidden">
            <div className="max-w-7xl pt-16 md:pt-18 pb-8 px-2 md:px-6 lg:px-8 mx-auto h-full custom-scrollbar overflow-y-auto">
               {renderContent()}
            </div>
         </main>
      </div>
   );
}

export default IndexPage;
