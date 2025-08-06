import { useEffect } from "react";

export default function CustomAlert({
   type = "info",
   message,
   onClose,
   duration = 5000,
}) {
   const colorMap = {
      info: "from-blue-500 to-purple-600",
      success: "from-green-500 to-emerald-600",
      error: "from-red-500 to-pink-600",
      warning: "from-yellow-500 to-orange-600",
   };

   useEffect(() => {
      if (!onClose) return;
      const timer = setTimeout(() => {
         onClose();
      }, duration);
      return () => clearTimeout(timer);
   }, [onClose, duration]);

   return (
      <>
         <div
            className={`fixed left-1/2 bottom-8 z-50 flex items-center justify-between min-w-[280px] max-w-xs px-4 py-3 rounded-lg shadow-2xl bg-gradient-to-r ${colorMap[type]} text-white animate-fade-in-up`}
            style={{ animation: "fadeInUp 0.3s" }}
         >
            <span className="font-medium">{message}</span>
            {onClose && (
               <button
                  onClick={onClose}
                  className="ml-4 px-2 py-1 rounded bg-gray-900/30 hover:bg-gray-900/60 transition-all duration-200 cursor-pointer hover:scale-105"
               >
                  ✕
               </button>
            )}
         </div>
         <style>{`
            @keyframes fadeInUp {
               0% {
                  opacity: 0;
                  transform: translate(-50%, 40px) scale(0.95);
               }
               100% {
                  opacity: 1;
                  transform: translate(-50%, 0) scale(1);
               }
            }
            .animate-fade-in-up {
               left: 50%;
               transform: translate(-50%, 0);
               animation: fadeInUp 0.3s;
            }
         `}</style>
      </>
   );
}
