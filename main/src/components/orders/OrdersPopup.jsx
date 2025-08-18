import { ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";

const OrdersPopup = ({
   isOpen,
   onClose,
   orders,
   selectedOrderIndex,
   onSelectOrder,
}) => {
   const [isVisible, setIsVisible] = useState(false);
   const [isAnimating, setIsAnimating] = useState(false);

   useEffect(() => {
      if (isOpen) {
         setIsVisible(true);
         // Small delay to trigger animation
         setTimeout(() => setIsAnimating(true), 10);
      } else {
         setIsAnimating(false);
         // Wait for animation to complete before hiding
         setTimeout(() => setIsVisible(false), 150);
      }
   }, [isOpen]);

   if (!isVisible) return null;

   return (
      <div
         className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-150 ease-out"
         style={{
            backgroundColor: `rgba(0, 0, 0, ${isAnimating ? 0.6 : 0})`,
         }}
         onClick={onClose}
      >
         <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full h-[min(80svh,800px)] overflow-hidden border border-gray-200 dark:border-gray-700 transform transition-all duration-150 ease-out"
            style={{
               transform: isAnimating
                  ? "scale(1) translateY(0)"
                  : "scale(0.9) translateY(-20px)",
               opacity: isAnimating ? 1 : 0,
            }}
            onClick={(e) => e.stopPropagation()}
         >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                     <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Select Order
                     </h2>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        {orders.length} total orders available
                     </p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  className="p-2 text-gray-500 dark:text-gray-400 rounded-lg active:bg-gray-100 dark:active:bg-gray-700 transition-all duration-200"
               >
                  <X className="w-6 h-6" />
               </button>
            </div>

            {/* Content */}
            <div className="py-6">
               {/* Orders Grid */}
               <div className="grid px-6 grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1 max-h-96 overflow-y-auto custom-scrollbar">
                  {orders.map((order, orderIndex) => (
                     <button
                        key={orderIndex}
                        onClick={() => onSelectOrder(orderIndex)}
                        className={`relative m-1 p-2 rounded-lg border-2 transition-all duration-200 ${
                           selectedOrderIndex === orderIndex
                              ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-500 shadow-lg scale-105"
                              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 active:bg-blue-50 dark:active:bg-gray-600 active:border-blue-300 dark:active:border-blue-500 active:scale-95 shadow-sm"
                        }`}
                     >
                        {/* Selection indicator */}
                        {selectedOrderIndex === orderIndex && (
                           <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           </div>
                        )}

                        <div className="text-center">
                           {/* Order Number */}
                           <div
                              className={`text-lg font-bold ${
                                 selectedOrderIndex === orderIndex
                                    ? "text-white"
                                    : "text-blue-600 dark:text-blue-400"
                              }`}
                           >
                              {orderIndex + 1}
                           </div>
                        </div>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

export default OrdersPopup;
