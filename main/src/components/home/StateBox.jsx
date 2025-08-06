import { Package, X } from "lucide-react";

const StateBox = ({ states, isVisible, onClose, onStateSelect }) => {
   const selectState = (type, index) => {
      const state = states[index];
      const stateData = state[type];

      // Pass the selected state data to parent component
      onStateSelect(stateData, type, state.timestamp);

      // Close the state box
      onClose();
   };

   const removeEntry = (index) => {
      // For now, just log - you can implement delete functionality later
      console.log(`Delete state at index ${index}`);
   };

   if (!isVisible) return null;

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
               <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Saved States
               </h2>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
               >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
               </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
               {states.length === 0 ? (
                  <div className="text-center py-12">
                     <Package
                        size={64}
                        className="mx-auto text-gray-400 mb-4"
                     />
                     <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No saved states found
                     </h3>
                     <p className="text-gray-600 dark:text-gray-400">
                        Save a state first to view it here
                     </p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {states.map((state, index) => (
                        <div
                           key={index}
                           className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                        >
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {state.timestamp}
                                 </h3>
                              </div>
                              <button
                                 onClick={() => removeEntry(index)}
                                 className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                 <X size={16} />
                              </button>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* RTD Card */}
                              <div
                                 onClick={() => selectState("rtd", index)}
                                 className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                       <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                       <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                          RTD
                                       </h4>
                                       <p className="text-xs text-gray-600 dark:text-gray-400">
                                          {state.rtd?.length || 0} items
                                       </p>
                                    </div>
                                 </div>
                              </div>

                              {/* Handover Card */}
                              <div
                                 onClick={() => selectState("handover", index)}
                                 className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                       <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                       <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                          Handover
                                       </h4>
                                       <p className="text-xs text-gray-600 dark:text-gray-400">
                                          {state.handover?.length || 0} items
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
         </div>
      </div>
   );
};

export default StateBox;
