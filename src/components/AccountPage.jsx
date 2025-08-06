import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { ConfirmDialog, CustomAlert } from "./index";
import { SignIn, SignUp } from "./login";

const AccountPage = () => {
   const { user, isAuthenticated, login, register, logout } = useAuth();
   const [showLogoutDialog, setShowLogoutDialog] = useState(false);
   const [alert, setAlert] = useState(null);
   const [currentView, setCurrentView] = useState("signin"); // "signin" or "signup"

   // If not authenticated, show login forms directly
   if (!isAuthenticated) {
      return (
         <div>
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
      );
   }

   // User is authenticated, show user profile
   const handleLogout = () => {
      logout();
      setAlert({ type: "success", message: "Successfully logged out" });
      setShowLogoutDialog(false);
   };

   return (
      <div className="space-y-6">
         <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
               Your account information
            </p>
         </div>

         {/* Simple User Information */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-4">
               <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
               </div>

               <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                     {user.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                     @{user.username}
                  </p>
               </div>
            </div>
         </div>

         {/* Logout Button - Bottom Center */}
         <div className="flex justify-center pt-4">
            <button
               onClick={() => setShowLogoutDialog(true)}
               className="flex items-center space-x-2 px-6 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg transition-colors duration-200"
            >
               <LogOut size={18} />
               <span>Logout</span>
            </button>
         </div>

         {/* Logout Confirmation Dialog */}
         <ConfirmDialog
            open={showLogoutDialog}
            title="Confirm Logout"
            message="Are you sure you want to logout? You'll need to sign in again to access your account."
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

export default AccountPage;
