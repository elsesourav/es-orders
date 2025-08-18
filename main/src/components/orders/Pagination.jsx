import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
   selectedOrderIndex,
   totalOrders,
   onPrevious,
   onNext,
   onShowPopup,
}) => {
   if (totalOrders === 0) return null;

   return (
      <div className="flex justify-center items-center gap-3 pt-1 pb-5">
         {/* Previous Button */}
         <button
            onClick={onPrevious}
            disabled={selectedOrderIndex === null || selectedOrderIndex === 0}
            className={`grid grid-cols-[40px_1fr] place-items-center w-30 h-10 rounded-lg border transition-all duration-200 backdrop-blur-sm ${
               selectedOrderIndex === null || selectedOrderIndex === 0
                  ? "bg-gray-100/60 dark:bg-gray-800/60 text-gray-400 dark:text-gray-600 border-gray-300/40 dark:border-gray-700/40 cursor-not-allowed"
                  : "bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-200 border-gray-300/50 dark:border-gray-600/50 hover:bg-white/90 dark:hover:bg-gray-700/90 hover:border-primary-300/60 dark:hover:border-primary-600/60 hover:text-primary-700 dark:hover:text-primary-300 shadow-app-sm"
            }`}
         >
            <ChevronLeft className="w-4 h-4" />
            <span className="relative w-full text-left font-medium text-sm">
               Previous
            </span>
         </button>

         {/* Current Order Number - Clickable */}
         <button
            onClick={onShowPopup}
            className="relative w-16 h-10 bg-white/70 dark:bg-gray-700/70 text-primary-700 dark:text-primary-300 rounded-lg font-bold transition-all duration-200 hover:bg-white/90 dark:hover:bg-gray-700/90 hover:border-primary-300/60 dark:hover:border-primary-600/60 active:scale-95 shadow-app-sm border border-primary-300/50 dark:border-primary-600/50 backdrop-blur-sm"
         >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent rounded-lg"></div>
            <span className="relative text-lg">
               {selectedOrderIndex !== null ? selectedOrderIndex + 1 : "?"}
            </span>
         </button>

         {/* Next Button */}
         <button
            onClick={onNext}
            disabled={
               selectedOrderIndex === null ||
               selectedOrderIndex === totalOrders - 1
            }
            className={`grid grid-cols-[1fr_40px] place-items-center gap-2 w-30 h-10 rounded-lg border transition-all duration-200 backdrop-blur-sm ${
               selectedOrderIndex === null ||
               selectedOrderIndex === totalOrders - 1
                  ? "bg-gray-100/60 dark:bg-gray-800/60 text-gray-400 dark:text-gray-600 border-gray-300/40 dark:border-gray-700/40 cursor-not-allowed"
                  : "bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-200 border-gray-300/50 dark:border-gray-600/50 hover:bg-white/90 dark:hover:bg-gray-700/90 hover:border-primary-300/60 dark:hover:border-primary-600/60 hover:text-primary-700 dark:hover:text-primary-300 shadow-app-sm"
            }`}
         >
            <span className="relative w-full text-right font-medium text-sm">
               Next
            </span>
            <ChevronRight className="w-4 h-4" />
         </button>
      </div>
   );
};

export default Pagination;
