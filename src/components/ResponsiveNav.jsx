import { Home, Menu, Package, Settings, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import iconImage from "../assets/icon.png";
import ThemeToggle from "./ThemeToggle";

const ResponsiveNav = ({ activeTab, onTabChange }) => {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

   const navItems = [
      { id: "home", label: "Home", icon: Home },
      { id: "orders", label: "Orders", icon: Package },
      { id: "settings", label: "Settings", icon: Settings },
      { id: "account", label: "Account", icon: User },
   ];

   // Get current page name
   const getCurrentPageName = () => {
      const currentItem = navItems.find((item) => item.id === activeTab);
      return currentItem ? currentItem.label : "Home";
   };

   // Lock/unlock body scroll when mobile menu is open/closed
   useEffect(() => {
      if (isMobileMenuOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "unset";
      }

      // Cleanup on unmount
      return () => {
         document.body.style.overflow = "unset";
      };
   }, [isMobileMenuOpen]);

   const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
   };

   const handleNavClick = (tabId) => {
      onTabChange(tabId);
      setIsMobileMenuOpen(false); // Close mobile menu on selection
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
                  <ThemeToggle />
               </div>
            </div>
         </nav>

         {/* Mobile Navigation */}
         <div className="md:hidden">
            {/* Mobile Header - Centered App Name */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
               <div className="px-4 h-14 flex items-center justify-between relative">
                  <button
                     onClick={toggleMobileMenu}
                     className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                     <div className="relative w-6 h-6">
                        <Menu
                           size={24}
                           className={`absolute inset-0 transition-all duration-300 ${
                              isMobileMenuOpen
                                 ? "opacity-0 rotate-90 scale-75"
                                 : "opacity-100 rotate-0 scale-100"
                           }`}
                        />
                        <X
                           size={24}
                           className={`absolute inset-0 transition-all duration-300 ${
                              isMobileMenuOpen
                                 ? "opacity-100 rotate-0 scale-100"
                                 : "opacity-0 -rotate-90 scale-75"
                           }`}
                        />
                     </div>
                  </button>

                  <div className="absolute left-1/2 transform -translate-x-1/2">
                     <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {getCurrentPageName()}
                     </div>
                  </div>

                  <ThemeToggle />
               </div>
            </header>

            {/* Mobile Side Navigation - Positioned below header */}
            <div
               className={`fixed top-14 left-0 right-0 bottom-0 z-40 transition-opacity duration-300 ${
                  isMobileMenuOpen
                     ? "opacity-100"
                     : "opacity-0 pointer-events-none"
               }`}
            >
               {/* Backdrop */}
               <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setIsMobileMenuOpen(false)}
               />

               {/* Side Panel */}
               <div
                  className={`absolute top-0 left-0 h-full w-[200px] max-w-[75vw] bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
                     isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                  }`}
               >
                  <div className="p-4 flex flex-col h-full">
                     <div>
                        <div className="flex items-center space-x-3 text-lg font-bold text-gray-900 dark:text-white mb-1">
                           <img
                              src={iconImage}
                              alt="ES Orders"
                              className="w-6 h-6"
                           />
                           <span>ES Orders</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                           Navigation
                        </div>
                        <nav className="space-y-1">
                           {navItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                 <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                                       activeTab === item.id
                                          ? "bg-primary-600 text-white shadow-md transform scale-[1.02]"
                                          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:transform hover:scale-[1.01]"
                                    }`}
                                 >
                                    <Icon size={18} />
                                    <span className="font-medium text-sm">
                                       {item.label}
                                    </span>
                                 </button>
                              );
                           })}
                        </nav>
                     </div>

                     {/* Copyright Footer */}
                     <div className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                           <p className="text-xs text-gray-400 dark:text-gray-600">
                              © <span className="text-sm">elsesourav</span>{" "}
                              {new Date().getFullYear()}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

export default ResponsiveNav;
