import { Home, Package, Settings } from "lucide-react";
import iconImage from "../assets/icon.png";
import { useLanguage } from "../lib/useLanguage";

const ResponsiveNav = ({ activeTab, onTabChange }) => {
   const { t } = useLanguage();

   const navItems = [
      { id: "home", label: t("navigation.home"), icon: Home },
      { id: "orders", label: t("navigation.orders"), icon: Package },
      { id: "settings", label: t("navigation.settings"), icon: Settings },
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
                  <div className="relative grid grid-cols-3 place-items-center h-full">
                     <div
                        className="absolute top-1 bottom-1 w-1/3 rounded-lg backdrop-blur-sm bg-gray-200/60 dark:bg-gray-700/60 border border-gray-300/40 dark:border-gray-600/40"
                        style={{
                           left: `${
                              navItems.findIndex(
                                 (item) => item.id === activeTab
                              ) * 33.333
                           }%`,
                           transition:
                              "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                     >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent dark:from-white/20 rounded-lg" />
                     </div>

                     {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                           <button
                              key={item.id}
                              onClick={() => handleNavClick(item.id)}
                              className={`relative z-10 m-2 flex gap-1 items-center justify-center size-full rounded-lg transition-all duration-300 transform ${
                                 activeTab === item.id
                                    ? "text-primary-700 dark:text-primary-500 scale-105 font-semibold"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-105"
                              }`}
                           >
                              <Icon
                                 size={18}
                                 className="transition-colors duration-300"
                              />
                              <span className="text-sm font-medium transition-colors duration-300">
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
