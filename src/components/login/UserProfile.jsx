import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog, CustomAlert } from "../index";

const UserProfile = ({ user, onLogout }) => {
   const [showLogoutDialog, setShowLogoutDialog] = useState(false);
   const [alert, setAlert] = useState(null);

   const handleLogout = () => {
      onLogout();
      setAlert({ type: "success", message: "Successfully logged out" });
      setShowLogoutDialog(false);
   };

   return (
      <div className="min-h-[500px] flex items-center justify-center">
         <div className="w-full max-w-md space-y-8">
            <div className="text-center">
               <div className="mx-auto w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
               </div>
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome Back!
               </h2>
               <p className="mt-2 text-gray-600 dark:text-gray-400">
                  You are successfully logged in
               </p>
            </div>

            {/* User Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
               <div className="text-center space-y-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                     {user.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                     @{user.username}
                  </p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                     ● Online
                  </div>
               </div>
            </div>

            {/* Logout Button */}
            <button
               onClick={() => setShowLogoutDialog(true)}
               className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-xl transition-colors duration-200 font-medium"
            >
               <LogOut size={20} />
               <span>Logout</span>
            </button>

            {/* Quick Actions */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
               <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Quick Actions
               </h4>
               <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                     View Profile Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                     Manage Orders
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                     Account Settings
                  </button>
               </div>
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
      </div>
   );
};

export default UserProfile;
