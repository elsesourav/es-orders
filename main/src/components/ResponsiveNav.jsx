import { Home, Package, Settings } from "lucide-react";
import iconImage from "../assets/icon.png";

const ResponsiveNav = ({ activeTab, onTabChange }) => {
   const navItems = [
      { id: "home", label: "Home", icon: Home },
      { id: "orders", label: "Orders", icon: Package },
      { id: "settings", label: "Settings", icon: Settings },
   ];

   const handleNavClick = (tabId) => {
      onTabChange(tabId);
   };

   return (
      <>
         {/* Desktop Navigation */}
         <nav className="hidden md:flex bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
               <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-8">
                     <div className="flex items-center space-x-3 text-xl font-bold text-gray-900 dark:text-white">
                        <img
                           src={iconImage}
                           alt="ES Orders"
                           className="w-8 h-8"
                        />
                        <span>ES Orders</span>
                     </div>
                     <div className="flex space-x-4">
                        {navItems.map((item) => {
                           const Icon = item.icon;
                           return (
                              <button
                                 key={item.id}
                                 onClick={() => handleNavClick(item.id)}
                                 className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                    activeTab === item.id
                                       ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shadow-sm"
                                       : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                                 }`}
                              >
                                 <Icon size={18} />
                                 <span>{item.label}</span>
                              </button>
                           );
                        })}
                     </div>
                  </div>
               </div>
            </div>
         </nav>

         {/* Mobile Navigation - Top Bar */}
         <div className="md:hidden">
            {/* Mobile Header with Navigation */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
               <div className="px-4 h-14">
                  {/* Mobile Navigation Tabs */}
                  <div className="relative grid grid-cols-3 place-items-center h-full p-1">
                     {/* Active tab indicator - sliding background with custom transition */}
                     <div
                        className="absolute top-1 bottom-1 w-1/3 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-lg shadow-lg ring-1 ring-primary-200 dark:ring-primary-700"
                        style={{
                           left: `${
                              navItems.findIndex(
                                 (item) => item.id === activeTab
                              ) * 33.333
                           }%`,
                           transform: "translateX(0.25rem)",
                           transition:
                              "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)", // Custom bouncy easing
                           boxShadow:
                              "0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
                        }}
                     >
                        {/* Inner glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 dark:via-white/10 dark:to-white/20 rounded-lg" />
                     </div>

                     {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                           <button
                              key={item.id}
                              onClick={() => handleNavClick(item.id)}
                              className={`relative z-10 m-2 flex gap-1 items-center justify-center size-full rounded-lg transition-all duration-500 transform ${
                                 activeTab === item.id
                                    ? "text-primary-700 dark:text-primary-300 scale-105 font-semibold"
                                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:scale-110 hover:rotate-1"
                              }`}
                              style={{
                                 transition:
                                    "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                              }}
                           >
                              <Icon
                                 size={18}
                                 className={`transition-all duration-300 ${
                                    activeTab === item.id
                                       ? "drop-shadow-sm"
                                       : ""
                                 }`}
                              />
                              <span
                                 className={`text-md font-medium transition-all duration-300 ${
                                    activeTab === item.id
                                       ? "drop-shadow-sm"
                                       : ""
                                 }`}
                              >
                                 {item.label}
                              </span>
                           </button>
                        );
                     })}
                  </div>
               </div>
            </header>
         </div>
      </>
   );
};

export default ResponsiveNav;
