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
      <div className="flex justify-center items-center gap-3 pt-3 pb-5">
         {/* Previous Button */}
         <button
            onClick={onPrevious}
            disabled={selectedOrderIndex === null || selectedOrderIndex === 0}
            className={`grid grid-cols-[40px_1fr] place-items-center w-30 h-12 rounded-xl border-2 transition-all duration-200 ${
               selectedOrderIndex === null || selectedOrderIndex === 0
                  ? "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 active:bg-blue-50 dark:active:bg-gray-600 active:border-blue-300 dark:active:border-blue-500 active:text-blue-700 dark:active:text-blue-300 shadow-sm"
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
            className="relative w-20 h-12 bg-primary text-white rounded-xl font-semibold transition-all duration-200 active:from-blue-700 active:to-indigo-800 active:scale-95 shadow-lg border-2 border-blue-500"
         >
            <span className="text-lg">
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
            className={`grid grid-cols-[1fr_40px] place-items-center gap-2 w-30 h-12 rounded-xl border-2 transition-all duration-200 ${
               selectedOrderIndex === null ||
               selectedOrderIndex === totalOrders - 1
                  ? "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 active:bg-blue-50 dark:active:bg-gray-600 active:border-blue-300 dark:active:border-blue-500 active:text-blue-700 dark:active:text-blue-300 shadow-sm"
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
