import { LogOut, Moon, Sun, User } from "lucide-react";
import { useState } from "react";
import iconImage from "../assets/icon.png";
import { useAuth } from "../lib/AuthContext";
import { ConfirmDialog, CustomAlert } from "./index";
import { SignIn, SignUp } from "./login";

const SettingsPage = () => {
   const { user, isAuthenticated, login, register, logout } = useAuth();
   const [showLogoutDialog, setShowLogoutDialog] = useState(false);
   const [alert, setAlert] = useState(null);
   const [currentView, setCurrentView] = useState("signin"); // "signin" or "signup"
   const [isDarkMode, setIsDarkMode] = useState(
      document.documentElement.classList.contains("dark")
   );

   // Theme toggle function
   const toggleTheme = () => {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);

      if (newMode) {
         document.documentElement.classList.add("dark");
         localStorage.setItem("theme", "dark");
      } else {
         document.documentElement.classList.remove("dark");
         localStorage.setItem("theme", "light");
      }
   };

   // Handle logout
   const handleLogout = () => {
      logout();
      setAlert({ type: "success", message: "Successfully logged out" });
      setShowLogoutDialog(false);
   };

   return (
      <div className="space-y-6 max-w-2xl mx-auto">
         {/* App Info Section */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               App Information
            </h2>
            <div className="flex items-center space-x-4">
               <img
                  src={iconImage}
                  alt="ES Orders"
                  className="w-16 h-16 rounded-lg"
               />
               <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                     ES Orders
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                     Order Management System
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                     Version 1.0.0
                  </p>
               </div>
            </div>
         </div>

         {/* Theme Settings */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               Appearance
            </h2>
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                  <div>
                     <p className="font-medium text-gray-900 dark:text-white">
                        Dark Mode
                     </p>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        Toggle between light and dark theme
                     </p>
                  </div>
               </div>
               <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none shadow-inner ${
                     isDarkMode
                        ? "bg-gray-600 hover:bg-gray-700"
                        : "bg-gray-200 hover:bg-gray-300"
                  }`}
               >
                  <span
                     className={`inline-flex size-5 items-center justify-center transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                        isDarkMode ? "translate-x-7" : "translate-x-0"
                     }`}
                  >
                     {isDarkMode ? (
                        <Moon className="w-3 h-3 text-primary-600" />
                     ) : (
                        <Sun className="w-3 h-3 text-yellow-500" />
                     )}
                  </span>
               </button>
            </div>
         </div>

         {/* Authentication Section */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               Authentication
            </h2>

            {!isAuthenticated ? (
               <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                     Sign in to access your orders and sync data
                  </p>
                  {currentView === "signin" ? (
                     <SignIn
                        onSignIn={login}
                        onSwitchToSignUp={() => setCurrentView("signup")}
                     />
                  ) : (
                     <SignUp
                        onSignUp={register}
                        onSwitchToSignIn={() => setCurrentView("signin")}
                     />
                  )}
               </div>
            ) : (
               <div>
                  <div className="flex items-center space-x-4 mb-4">
                     <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                     </div>
                     <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                           {user.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                           @{user.username}
                        </p>
                     </div>
                  </div>

                  <button
                     onClick={() => setShowLogoutDialog(true)}
                     className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg transition-colors duration-200"
                  >
                     <LogOut size={16} />
                     <span>Sign Out</span>
                  </button>
               </div>
            )}
         </div>

         {/* Logout Confirmation Dialog */}
         <ConfirmDialog
            open={showLogoutDialog}
            title="Confirm Sign Out"
            message="Are you sure you want to sign out? You'll need to sign in again to access your orders."
            onConfirm={handleLogout}
            onCancel={() => setShowLogoutDialog(false)}
         />

         {/* Alert */}
         {alert && (
            <CustomAlert
               type={alert.type}
               message={alert.message}
               onClose={() => setAlert(null)}
            />
         )}
      </div>
   );
};

export default SettingsPage;
