import { FileText, Package, Search } from "lucide-react";
import { useState } from "react";
import { StateBox } from "./home";

const OrdersPage = () => {
   const [selectedStateData, setSelectedStateData] = useState("");
   const [selectedStateType, setSelectedStateType] = useState("");
   const [selectedStateTimestamp, setSelectedStateTimestamp] = useState("");
   const [showStateBox, setShowStateBox] = useState(false);

   // Sample saved states data - replace with actual API call
   const savedStates = [
      {
         id: "1",
         timestamp: "2025-08-06 10:30",
         rtd: [
            {
               shippingId: "RTD001",
               productName: "Wireless Headphones",
               status: "ready",
            },
            {
               shippingId: "RTD002",
               productName: "Smartphone Case",
               status: "ready",
            },
         ],
         handover: [
            {
               shippingId: "HO001",
               productName: "Bluetooth Speaker",
               status: "pending",
            },
            {
               shippingId: "HO002",
               productName: "Laptop Stand",
               status: "pending",
            },
         ],
      },
      {
         id: "2",
         timestamp: "2025-08-05 15:45",
         rtd: [
            { shippingId: "RTD003", productName: "USB Cable", status: "ready" },
         ],
         handover: [
            {
               shippingId: "HO003",
               productName: "Phone Charger",
               status: "pending",
            },
            {
               shippingId: "HO004",
               productName: "Screen Protector",
               status: "pending",
            },
            {
               shippingId: "HO005",
               productName: "Power Bank",
               status: "pending",
            },
         ],
      },
   ];

   const handleStateSelect = (stateData, type, timestamp) => {
      setSelectedStateData(JSON.stringify(stateData, null, 2));
      setSelectedStateType(type.toUpperCase());
      setSelectedStateTimestamp(timestamp);
   };

   const clearStateData = () => {
      setSelectedStateData("");
      setSelectedStateType("");
      setSelectedStateTimestamp("");
   };

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Orders
               </h1>
               <p className="text-gray-600 dark:text-gray-400">
                  Manage your order states and data
               </p>
            </div>
            <div className="flex gap-3">
               <button
                  onClick={() => setShowStateBox(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
               >
                  <FileText size={20} />
                  Load Saved States
               </button>
               <div className="relative">
                  <Search
                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                     size={20}
                  />
                  <input
                     type="text"
                     placeholder="Search orders..."
                     className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
               </div>
            </div>
         </div>

         {/* State Data Display */}
         {selectedStateData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
               <div className="flex justify-between items-center mb-4">
                  <div>
                     <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedStateType} State Data
                     </h2>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        Loaded from: {selectedStateTimestamp}
                     </p>
                  </div>
                  <button
                     onClick={clearStateData}
                     className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded transition-colors"
                  >
                     Clear
                  </button>
               </div>
               <textarea
                  value={selectedStateData}
                  onChange={(e) => setSelectedStateData(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="State data will appear here when you select a saved state..."
               />
            </div>
         )}

         {/* Empty State when no data selected */}
         {!selectedStateData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
               <div className="text-center">
                  <Package size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                     No State Data Loaded
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                     Click "Load Saved States" to view and select your saved
                     order states
                  </p>
                  <button
                     onClick={() => setShowStateBox(true)}
                     className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                     <FileText size={18} />
                     Load Saved States
                  </button>
               </div>
            </div>
         )}

         {/* State Box Modal */}
         <StateBox
            states={savedStates}
            isVisible={showStateBox}
            onClose={() => setShowStateBox(false)}
            onStateSelect={handleStateSelect}
         />
      </div>
   );
};

export default OrdersPage;
