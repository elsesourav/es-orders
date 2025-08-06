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
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
         onClick={handleBackdropClick}
      >
         <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-sm w-full p-6 relative flex flex-col items-center">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <div className="text-gray-300 mb-6 text-center">{message}</div>
            <div className="flex gap-4 w-full justify-center">
               <button onClick={onCancel} className="btn-neutral">
                  Cancel
               </button>
               <button onClick={onConfirm} className="btn-danger">
                  Confirm
               </button>
            </div>
         </div>
      </div>
   );
}
