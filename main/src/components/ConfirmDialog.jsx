import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

export default function ConfirmDialog({
   open,
   title,
   message,
   onConfirm,
   onCancel,
}) {
   // Handle escape key
   useEffect(() => {
      if (!open) return;

      const handleEscape = (e) => {
         if (e.key === "Escape") {
            onCancel();
         }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
   }, [open, onCancel]);

   if (!open) return null;

   // Handle click outside
   const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
         onCancel();
      }
   };

   return (
      <>
         <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
         >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4 animate-scale-in">
               {/* Header */}
               <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                     </h3>
                  </div>
                  <button
                     onClick={onCancel}
                     className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                     <X className="w-4 h-4" />
                  </button>
               </div>

               {/* Content */}
               <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                     {message}
                  </p>
               </div>

               {/* Actions */}
               <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                  <button
                     onClick={onCancel}
                     className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={onConfirm}
                     className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 active:scale-95"
                  >
                     Confirm
                  </button>
               </div>
            </div>
         </div>
         <style>{`
            @keyframes fadeIn {
               0% { opacity: 0; }
               100% { opacity: 1; }
            }
            @keyframes scaleIn {
               0% {
                  opacity: 0;
                  transform: scale(0.95) translateY(-10px);
               }
               100% {
                  opacity: 1;
                  transform: scale(1) translateY(0);
               }
            }
            .animate-fade-in {
               animation: fadeIn 0.2s ease-out;
            }
            .animate-scale-in {
               animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
         `}</style>
      </>
   );
}
