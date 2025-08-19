import { Package, Truck } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { getAllOrders } from "../api/ordersApi";
import { useLanguage } from "../lib/useLanguage";

const HomePage = ({ onNavigateToOrders }) => {
   const { t } = useLanguage();
   const [states, setStates] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const hasFetched = useRef(false);

   useEffect(() => {
      const fetchOrders = async () => {
         if (hasFetched.current) return;
         hasFetched.current = true;

         try {
            setLoading(true);
            const response = await getAllOrders();

            const states =
               response?.map((item) => ({
                  ...item?.order_data?.states,
                  id: item?.id,
                  timestamp: item?.order_data?.timestamp,
               })) || [];

            setStates(states);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      fetchOrders();
   }, []);

   const handleRTDClick = (e, state) => {
      e.stopPropagation();
      localStorage.setItem(
         "es_orders_selected_state",
         JSON.stringify({
            ...state,
            selectedType: "rtd",
         })
      );
      if (onNavigateToOrders) {
         onNavigateToOrders();
      }
   };

   const handleHandoverClick = (e, state) => {
      e.stopPropagation();
      localStorage.setItem(
         "es_orders_selected_state",
         JSON.stringify({
            ...state,
            selectedType: "handover",
         })
      );
      if (onNavigateToOrders) {
         onNavigateToOrders();
      }
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
         <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
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
                                 <p className="text-xs text-gray-600 dark:text-gray-400">
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
                                 <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {state.handover?.length || 0}{" "}
                                    {t("home.items")}
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default HomePage;
