import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";

export default function CustomAlert({
   type = "info",
   message,
   onClose,
   duration = 5000,
}) {
   const alertConfig = {
      info: {
         icon: Info,
         bgColor: "bg-blue-50 dark:bg-blue-900/20",
         borderColor: "border-blue-200 dark:border-blue-700",
         iconColor: "text-blue-600 dark:text-blue-400",
         textColor: "text-blue-800 dark:text-blue-200",
      },
      success: {
         icon: CheckCircle,
         bgColor: "bg-green-50 dark:bg-green-900/20",
         borderColor: "border-green-200 dark:border-green-700",
         iconColor: "text-green-600 dark:text-green-400",
         textColor: "text-green-800 dark:text-green-200",
      },
      error: {
         icon: XCircle,
         bgColor: "bg-red-50 dark:bg-red-900/20",
         borderColor: "border-red-200 dark:border-red-700",
         iconColor: "text-red-600 dark:text-red-400",
         textColor: "text-red-800 dark:text-red-200",
      },
      warning: {
         icon: AlertTriangle,
         bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
         borderColor: "border-yellow-200 dark:border-yellow-700",
         iconColor: "text-yellow-600 dark:text-yellow-400",
         textColor: "text-yellow-800 dark:text-yellow-200",
      },
   };

   const config = alertConfig[type];
   const IconComponent = config.icon;

   useEffect(() => {
      if (!onClose) return;
      const timer = setTimeout(() => {
         onClose();
      }, duration);
      return () => clearTimeout(timer);
   }, [onClose, duration]);

   return (
      <>
         <div className="fixed inset-x-4 bottom-4 z-50 flex justify-center pointer-events-none">
            <div
               className={`${config.bgColor} ${config.borderColor} ${config.textColor} max-w-md w-full border rounded-xl shadow-lg backdrop-blur-sm p-4 pointer-events-auto animate-slide-up`}
            >
               <div className="flex items-start gap-3">
                  <IconComponent
                     className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`}
                  />
                  <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium leading-relaxed">
                        {message}
                     </p>
                  </div>
                  {onClose && (
                     <button
                        onClick={onClose}
                        className={`${config.iconColor} hover:bg-black/5 dark:hover:bg-white/5 rounded-lg p-1 transition-colors duration-200 flex-shrink-0`}
                     >
                        <X className="w-4 h-4" />
                     </button>
                  )}
               </div>
            </div>
         </div>
         <style>{`
            @keyframes slideUp {
               0% {
                  opacity: 0;
                  transform: translateY(100%) scale(0.95);
               }
               100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
               }
            }
            .animate-slide-up {
               animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
         `}</style>
      </>
   );
}
