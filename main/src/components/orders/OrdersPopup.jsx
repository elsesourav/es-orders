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
         className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-150 ease-out"
         style={{
            backgroundColor: `rgba(0, 0, 0, ${isAnimating ? 0.4 : 0})`,
         }}
         onClick={onClose}
      >
         <div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-app-lg max-w-5xl w-full h-[min(80svh,800px)] overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-150 ease-out"
            style={{
               transform: isAnimating
                  ? "scale(1) translateY(0)"
                  : "scale(0.9) translateY(-20px)",
               opacity: isAnimating ? 1 : 0,
            }}
            onClick={(e) => e.stopPropagation()}
         >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-50/80 to-blue-50/80 dark:from-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/90 dark:bg-primary-600/90 rounded-lg backdrop-blur-sm border border-primary-300/30 dark:border-primary-500/30">
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
                  className="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200 backdrop-blur-sm"
               >
                  <X className="w-6 h-6" />
               </button>
            </div>

            {/* Content */}
            <div className="">
               {/* Orders Grid */}
               <div className="grid p-6 grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1 max-h-96 overflow-y-auto custom-scrollbar">
                  {orders.map((order, orderIndex) => (
                     <button
                        key={orderIndex}
                        onClick={() => onSelectOrder(orderIndex)}
                        className={`relative m-1 p-2 rounded-lg border transition-all duration-200 backdrop-blur-sm ${
                           selectedOrderIndex === orderIndex
                              ? "bg-gradient-to-br from-success/90 to-emerald-600/90 text-white border-success/50 shadow-app-md scale-105"
                              : "bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white border-gray-200/50 dark:border-gray-600/50 hover:bg-white/90 dark:hover:bg-gray-700/90 hover:border-primary-300/60 dark:hover:border-primary-500/60 active:scale-95 shadow-app-sm"
                        }`}
                     >
                        {/* Selection indicator */}
                        {selectedOrderIndex === orderIndex && (
                           <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/90 backdrop-blur-sm rounded-full shadow-app-sm flex items-center justify-center border border-white/30">
                              <div className="w-2 h-2 bg-success rounded-full"></div>
                           </div>
                        )}

                        <div className="text-center">
                           {/* Order Number */}
                           <div
                              className={`text-lg font-bold ${
                                 selectedOrderIndex === orderIndex
                                    ? "text-white"
                                    : "text-primary-600 dark:text-primary-400"
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
