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

   // Redirect to settings page if not authenticated
   useEffect(() => {
      if (!loading && !isAuthenticated) {
         setActiveTab("settings");
      }
   }, [isAuthenticated, loading]);

   const renderContent = () => {
      switch (activeTab) {
         case "home":
            return (
               <HomePage onNavigateToOrders={() => setActiveTab("orders")} />
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
               <HomePage onNavigateToOrders={() => setActiveTab("orders")} />
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
         <ResponsiveNav activeTab={activeTab} onTabChange={setActiveTab} />
         <main className="relative h-full overflow-hidden">
            <div className="max-w-7xl pt-16 md:pt-18 pb-8 px-2 md:px-6 lg:px-8 mx-auto h-full custom-scrollbar overflow-y-auto">
               {renderContent()}
            </div>
         </main>
      </div>
   );
}

export default IndexPage;
