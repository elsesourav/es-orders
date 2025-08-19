import {
   ExternalLink,
   Facebook,
   Github,
   Instagram,
   Linkedin,
   LogOut,
   Mail,
   Mic,
   Moon,
   Sun,
   Twitter,
   User,
   Volume2,
} from "lucide-react";
import { useState } from "react";
import iconImage from "../assets/icon.png";
import { useAuth } from "../lib/AuthContext";
import { useLanguage } from "../lib/useLanguage";
import { useVoiceSettings } from "../lib/useVoiceSettings";
import { ConfirmDialog, CustomAlert } from "./index";
import { SignIn, SignUp } from "./login";

const SettingsPage = () => {
   const { user, isAuthenticated, login, register, logout } = useAuth();
   const { currentLanguage, changeLanguage, t } = useLanguage();
   const {
      actionTalkEnabled,
      showMicButton,
      toggleActionTalk,
      toggleShowMicButton,
   } = useVoiceSettings();
   const [showLogoutDialog, setShowLogoutDialog] = useState(false);
   const [alert, setAlert] = useState(null);
   const [currentView, setCurrentView] = useState("signin"); // "signin" or "signup"
   const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated);
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
      setAlert({ type: "success", message: t("auth.successfullyLoggedOut") });
      setShowLogoutDialog(false);
      setShowAuthModal(true);
   };

   // Handle successful authentication
   const handleAuthSuccess = (result) => {
      if (result.success) {
         setShowAuthModal(false);
         setAlert({ type: "success", message: "Successfully logged in!" });
      }
      return result;
   };

   // Show auth modal if not authenticated
   if (!isAuthenticated && showAuthModal) {
      return (
         <>
            {currentView === "signin" ? (
               <SignIn
                  onSignIn={(data) => handleAuthSuccess(login(data))}
                  onSwitchToSignUp={() => setCurrentView("signup")}
                  onClose={() => setShowAuthModal(false)}
               />
            ) : (
               <SignUp
                  onSignUp={(data) => handleAuthSuccess(register(data))}
                  onSwitchToSignIn={() => setCurrentView("signin")}
                  onClose={() => setShowAuthModal(false)}
               />
            )}
         </>
      );
   }

   // Show sign-in prompt if not authenticated and modal is closed
   if (!isAuthenticated && !showAuthModal) {
      return (
         <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md mx-auto text-center">
               <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Authentication Required
               </h2>
               <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t("auth.signInToAccess")}
               </p>
               <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
               >
                  {t("auth.signIn")}
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6 max-w-2xl mx-auto">
         {/* App Info Section */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               {t("settings.appInformation")}
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
                     {t("settings.orderManagementSystem")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                     {t("settings.version")}
                  </p>
               </div>
            </div>
         </div>

         {/* Theme Settings */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               {t("settings.appearance")}
            </h2>
            <div className="relative place-items-center w-full grid grid-cols-[auto_60px]">
               <div className="relative w-full flex items-center space-x-3">
                  <div>
                     <p className="font-medium text-gray-900 dark:text-white">
                        {t("settings.darkMode")}
                     </p>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("settings.toggleTheme")}
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

         {/* Language Settings */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               {t("settings.language")}
            </h2>
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                  <div>
                     <p className="font-medium text-gray-900 dark:text-white">
                        {t("settings.selectLanguage")}
                     </p>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currentLanguage === "en"
                           ? t("settings.english")
                           : t("settings.bengali")}
                     </p>
                  </div>
               </div>
               <div className="flex space-x-2">
                  <button
                     onClick={() => changeLanguage("en")}
                     className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentLanguage === "en"
                           ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-2 border-primary-300 dark:border-primary-600"
                           : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
                     }`}
                  >
                     English
                  </button>
                  <button
                     onClick={() => changeLanguage("bn")}
                     className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentLanguage === "bn"
                           ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-2 border-primary-300 dark:border-primary-600"
                           : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
                     }`}
                  >
                     বাংলা
                  </button>
               </div>
            </div>
         </div>

         {/* Voice Settings */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               {t("settings.voiceSettings")}
            </h2>

            <div className="space-y-4">
               {/* Action Talk Setting */}
               <div className="relative place-items-center w-full grid grid-cols-[auto_60px]">
                  <div className="relative w-full flex items-center space-x-3">
                     <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                           {t("settings.actionTalk")}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                           {t("settings.actionTalkDescription")}
                        </p>
                     </div>
                  </div>

                  <button
                     onClick={toggleActionTalk}
                     className={`relative inline-flex h-7 w-14 items-center rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none shadow-inner ${
                        actionTalkEnabled
                           ? "bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600"
                           : "bg-gray-300 dark:bg-gray-600"
                     }`}
                  >
                     <span
                        className={`inline-flex size-5 items-center justify-center transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                           actionTalkEnabled ? "translate-x-7" : "translate-x-0"
                        }`}
                     >
                        <Volume2
                           className={`w-3 h-3 ${
                              actionTalkEnabled
                                 ? "text-blue-600"
                                 : "text-gray-400"
                           }`}
                        />
                     </span>
                  </button>
               </div>

               {/* Show Mic Button Setting */}
               <div className="relative place-items-center w-full grid grid-cols-[auto_60px]">
                  <div className="relative w-full flex items-center space-x-3">
                     <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                           {t("settings.showMicButton")}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                           {t("settings.showMicButtonDescription")}
                        </p>
                     </div>
                  </div>

                  <button
                     onClick={toggleShowMicButton}
                     className={`relative inline-flex h-7 w-14 items-center rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none shadow-inner ${
                        showMicButton
                           ? "bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600"
                           : "bg-gray-300 dark:bg-gray-600"
                     }`}
                  >
                     <span
                        className={`inline-flex size-5 items-center justify-center transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                           showMicButton ? "translate-x-7" : "translate-x-0"
                        }`}
                     >
                        <Mic
                           className={`w-3 h-3 ${
                              showMicButton ? "text-green-600" : "text-gray-400"
                           }`}
                        />
                     </span>
                  </button>
               </div>
            </div>
         </div>

         {/* Authentication Section */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               {t("settings.authentication")}
            </h2>

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
                  <span>{t("auth.signOut")}</span>
               </button>
            </div>
         </div>

         {/* Copyright & Contact Section */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center space-y-4">
               {/* Copyright */}
               <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                     © {new Date().getFullYear()} elsesourav. All rights
                     reserved.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                     Built with ❤️ for order management
                  </p>
               </div>

               {/* Contact Links */}
               <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                     Connect with Developer
                  </h3>

                  <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                     {/* Email */}
                     <a
                        href="mailto:elsesourav@gmail.com"
                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 group"
                     >
                        <Mail className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                           Email
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                     </a>

                     {/* GitHub */}
                     <a
                        href="https://github.com/elsesourav"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 group"
                     >
                        <Github className="w-4 h-4 text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                           GitHub
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                     </a>

                     {/* Facebook */}
                     <a
                        href="https://facebook.com/elsesourav"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 group"
                     >
                        <Facebook className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                           Facebook
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                     </a>

                     {/* Twitter/X */}
                     <a
                        href="https://x.com/elsesourav"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 group"
                     >
                        <Twitter className="w-4 h-4 text-sky-500 group-hover:text-sky-600" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                           Twitter
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                     </a>

                     {/* Instagram */}
                     <a
                        href="https://instagram.com/elsesourav"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 group"
                     >
                        <Instagram className="w-4 h-4 text-pink-500 group-hover:text-pink-600" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                           Instagram
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                     </a>

                     {/* LinkedIn */}
                     <a
                        href="https://linkedin.com/in/elsesourav"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 group"
                     >
                        <Linkedin className="w-4 h-4 text-blue-700 group-hover:text-blue-800" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                           LinkedIn
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                     </a>
                  </div>
               </div>
            </div>
         </div>

         {/* Logout Confirmation Dialog */}
         <ConfirmDialog
            open={showLogoutDialog}
            title={t("auth.confirmSignOut")}
            message={t("auth.confirmSignOutMessage")}
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
