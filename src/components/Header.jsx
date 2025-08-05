const Header = ({
   tabs = [],
   activeTab,
   setActiveTab,
   className = "",
   variant = "default", // "default", "compact", "pills"
}) => {
   const getVariantClasses = () => {
      switch (variant) {
         case "compact":
            return {
               container:
                  "flex bg-gray-800/70 rounded-lg shadow border border-gray-700/50 p-0.5 gap-1",
               button: "px-3 py-2 rounded-md text-sm",
               icon: "w-4 h-4",
            };
         case "pills":
            return {
               container: "flex gap-2",
               button: "px-4 py-2 rounded-full text-sm",
               icon: "w-4 h-4",
            };
         default:
            return {
               container:
                  "flex bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700/60 p-1 gap-4",
               button: "px-5 py-3 rounded-xl text-base",
               icon: "w-5 h-5",
            };
      }
   };

   const variantClasses = getVariantClasses();

   return (
      <div className={`w-full flex justify-center mb-8 ${className}`}>
         <div className={variantClasses.container}>
            {tabs.map((tab) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-2 ${
                        variantClasses.button
                     } font-semibold transition-all duration-300 focus:outline-none cursor-pointer relative overflow-hidden
                ${
                   isActive
                      ? "text-white shadow-md"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/60"
                }
              `}
                  >
                     {/* Gradient background with smooth transition */}
                     <div
                        className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 transition-opacity duration-300 ease-in-out ${
                           isActive ? "opacity-100" : "opacity-0"
                        }`}
                     />

                     {/* Content wrapper to ensure it's above the gradient */}
                     <div className="relative z-10 flex items-center gap-2">
                        {Icon && (
                           <Icon
                              className={`${variantClasses.icon} ${
                                 isActive ? "scale-110" : ""
                              }`}
                           />
                        )}
                        <span>{tab.label}</span>
                     </div>
                  </button>
               );
            })}
         </div>
      </div>
   );
};

export default Header;
