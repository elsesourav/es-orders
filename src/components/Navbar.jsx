import { useEffect, useState } from "react";
import {
   HomeIcon,
   ListingIcon,
   MappingIcon,
   SetupIcon,
   UpdateIcon,
   UserIcon,
} from "./icons/EcommerceIcons";

function Navbar({ activeTab, setActiveTab }) {
   const [showingTooltip, setShowingTooltip] = useState(null);
   const [timeoutId, setTimeoutId] = useState(null);

   const navItems = [
      { id: "home", label: "Home", icon: HomeIcon },
      { id: "mapping", label: "Product Mapping", icon: MappingIcon },
      { id: "listing", label: "Create Listing", icon: ListingIcon },
      { id: "update", label: "Update Products", icon: UpdateIcon },
      { id: "setup", label: "Setup & Config", icon: SetupIcon },
      { id: "account", label: "User Profile", icon: UserIcon },
   ];

   const hideTooltip = () => {
      setShowingTooltip(null);
      setTimeoutId(null);
   };

   const startHideTimer = (itemId) => {
      if (timeoutId) clearTimeout(timeoutId);

      const newTimeout = setTimeout(hideTooltip, 1000);
      setTimeoutId(newTimeout);
      setShowingTooltip(itemId);
   };

   const handleTabClick = (tabId) => {
      setActiveTab(tabId);
      startHideTimer(tabId);
   };

   const handleHover = (tabId) => {
      if (showingTooltip === tabId) {
         startHideTimer(tabId);
      }
   };

   useEffect(() => {
      return () => {
         if (timeoutId) clearTimeout(timeoutId);
      };
   }, [timeoutId]);

   return (
      <nav className="fixed top-1/2 left-4 transform -translate-y-1/2 z-50">
         <div className="bg-gray-800/95 backdrop-blur-md shadow-2xl rounded-2xl p-2 border border-gray-700/50">
            <div className="flex flex-col space-y-2">
               {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                     <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        onMouseEnter={() => handleHover(item.id)}
                        className={`group relative flex items-center justify-center w-12 h-12 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out transform hover:scale-110 cursor-pointer ${
                           isActive
                              ? "text-white shadow-lg shadow-blue-500/25"
                              : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                        }`}
                     >
                        {/* Gradient background with smooth transition and rounded corners */}
                        <div
                           className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 transition-opacity duration-300 ease-in-out rounded-xl ${
                              isActive ? "opacity-100" : "opacity-0"
                           }`}
                        />

                        {/* Icon with relative positioning to stay above gradient */}
                        <Icon
                           className={`w-6 h-6 transition-all duration-300 relative z-10 ${
                              isActive ? "scale-110" : "group-hover:scale-110"
                           }`}
                        />

                        {/* Tooltip */}
                        <div
                           className={`absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg transition-all duration-300 whitespace-nowrap pointer-events-none ${
                              showingTooltip === item.id
                                 ? "opacity-100"
                                 : "opacity-0 group-hover:opacity-100"
                           }`}
                        >
                           {item.label}
                           <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                        </div>
                     </button>
                  );
               })}
            </div>
         </div>
      </nav>
   );
}

export default Navbar;
