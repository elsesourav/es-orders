import {
  ExternalLink,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Moon,
  Sun,
  Twitter,
  Type,
  User,
} from "lucide-react";
import { useState } from "react";
import iconImage from "../assets/esIcon.png";
import { useAuth } from "../lib/AuthContext";
import { useFontSize } from "../lib/useFontSize";
import { useLanguage } from "../lib/useLanguage";
import { useSimpleOrdersView } from "../lib/useSimpleOrdersView";
import { SignIn, SignUp } from "./login";
import AddAccountDialog from "./settings/AddAccountDialog";
import ManageAccountsDialog from "./settings/ManageAccountsDialog";
import SkuMappingSection from "./settings/SkuMappingSection";
import ConfirmDialog from "./ui/ConfirmDialog";
import CustomAlert from "./ui/CustomAlert";

const SettingsPage = () => {
  const {
    user,
    savedAccounts,
    isAuthenticated,
    login,
    addAccount,
    register,
    logout,
    switchAccount,
    disconnectAccount,
  } = useAuth();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { fontSize, changeFontSize } = useFontSize();
  const { isSimpleOrdersViewEnabled, toggleSimpleOrdersView } =
    useSimpleOrdersView();
  const [alert, setAlert] = useState(null);
  const [currentView, setCurrentView] = useState("signin"); // "signin" or "signup"
  const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated);
  const [showManageAccounts, setShowManageAccounts] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    | null
    | { type: "switch"; username: string }
    | { type: "disconnect"; username: string }
    | { type: "logout-all" }
  >(null);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );

  // Theme toggle function
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light-theme");
      localStorage.setItem("theme", "light");
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setAlert({ type: "success", message: t("auth.successfullyLoggedOut") });
    setShowAuthModal(true);
  };

  // Handle successful authentication
  const handleAuthSuccess = (result) => {
    if (result.success) {
      setShowAuthModal(false);
      setAlert({ type: "success", message: t("settings.accountLoginSuccess") });
    }
    return result;
  };

  const handleSwitchAccount = async (username) => {
    const result = await switchAccount(username);
    if (!result.success) {
      setAlert({
        type: "error",
        message: result.error || t("settings.switchFailed"),
      });
      return;
    }

    setAlert({
      type: "success",
      message: `${t("settings.switchedTo")} @${username}`,
    });
  };

  const handleDisconnectAccount = (username) => {
    const result = disconnectAccount(username);
    if (!result.success) {
      setAlert({
        type: "error",
        message: result.error || t("settings.disconnectFailed"),
      });
      return;
    }

    setAlert({
      type: "success",
      message: `${t("settings.disconnected")} @${username}`,
    });
    if (result.disconnectedCurrent) {
      setShowAuthModal(true);
    }
  };

  const handleAddAccount = async ({ username, password }) => {
    const result = await addAccount({ username, password });
    if (!result.success) {
      setAlert({
        type: "error",
        message: result.error || t("settings.accountUnableToAdd"),
      });
      return result;
    }

    setAlert({
      type: "success",
      message: `${t("settings.accountAdded")} @${result.user.username}`,
    });
    setShowAddAccount(false);
    return result;
  };

  const openSwitchConfirm = (username) => {
    setPendingAction({ type: "switch", username });
  };

  const openDisconnectConfirm = (username) => {
    setPendingAction({ type: "disconnect", username });
  };

  const openLogoutAllConfirm = () => {
    setPendingAction({ type: "logout-all" });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    if (pendingAction.type === "switch") {
      await handleSwitchAccount(pendingAction.username);
    }

    if (pendingAction.type === "disconnect") {
      handleDisconnectAccount(pendingAction.username);
    }

    if (pendingAction.type === "logout-all") {
      handleLogout();
    }

    setPendingAction(null);
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
            {t("settings.authenticationRequired")}
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
    <div className="space-y-4 md:space-y-5 max-w-2xl mx-auto pb-4">
      {/* Account Switch Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5 mt-2 md:mt-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t("settings.switchAccount")}
        </h2>
        <div className="space-y-2">
          {savedAccounts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("settings.noSavedAccounts")}
            </p>
          ) : (
            savedAccounts.map((account) => {
              const isCurrent =
                String(account.username || "").toLowerCase() ===
                String(user?.username || "").toLowerCase();

              return (
                <div
                  key={account.username}
                  className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {account.name || t("settings.unnamed")}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      @{account.username}{" "}
                      {isCurrent ? `• ${t("settings.current")}` : ""}
                    </p>
                  </div>
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => openSwitchConfirm(account.username)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium"
                    >
                      {t("settings.switch")}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Manage Accounts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t("settings.accountCenter")}
        </h2>
        <button
          type="button"
          onClick={() => setShowManageAccounts(true)}
          className="px-3 py-2 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-medium"
        >
          {t("settings.openAccountCenter")}
        </button>
      </div>

      {/* SKU Mapping Section */}
      <SkuMappingSection />

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("settings.simpleOrdersView")}
        </h2>
        <div className="relative place-items-center w-full grid grid-cols-[auto_60px]">
          <div className="relative w-full flex items-center space-x-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {t("settings.simpleOrdersView")}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("settings.simpleOrdersViewDescription")}
              </p>
            </div>
          </div>
          <button
            onClick={toggleSimpleOrdersView}
            className={`relative inline-flex h-7 w-14 items-center rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none shadow-inner ${
              isSimpleOrdersViewEnabled
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            <span
              className={`inline-flex size-5 items-center justify-center transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                isSimpleOrdersViewEnabled ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("settings.language")}
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
          <div className="flex flex-wrap gap-2">
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

      {/* Font Size Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("settings.fontSize")}
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Type className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {t("settings.selectFontSize")}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("settings.fontSizeDescription")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => changeFontSize("small")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                fontSize === "small"
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-2 border-primary-300 dark:border-primary-600"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {t("settings.fontSizeSmall")}
            </button>
            <button
              onClick={() => changeFontSize("medium")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                fontSize === "medium"
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-2 border-primary-300 dark:border-primary-600"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {t("settings.fontSizeMedium")}
            </button>
            <button
              onClick={() => changeFontSize("large")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                fontSize === "large"
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-2 border-primary-300 dark:border-primary-600"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {t("settings.fontSizeLarge")}
            </button>
          </div>
        </div>
      </div>

      {/* Copyright & Contact Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5">
        <div className="text-center space-y-4">
          {/* Copyright */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} elsesourav. All rights reserved.
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
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

      {/* App Info Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5">
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

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={!!pendingAction}
        title={
          pendingAction?.type === "switch"
            ? t("settings.switchAccount")
            : pendingAction?.type === "disconnect"
              ? t("settings.disconnectAccount")
              : t("settings.logoutAllAccounts")
        }
        message={
          pendingAction?.type === "switch"
            ? `${t("settings.switchTo")} @${pendingAction.username}?`
            : pendingAction?.type === "disconnect"
              ? `${t("settings.disconnect")} @${pendingAction.username}?`
              : t("settings.logoutAllConfirm")
        }
        confirmText={
          pendingAction?.type === "switch"
            ? t("settings.switch")
            : pendingAction?.type === "disconnect"
              ? t("settings.disconnect")
              : t("settings.logoutAll")
        }
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setPendingAction(null);
        }}
      />

      {/* Alert */}
      {alert && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <ManageAccountsDialog
        open={showManageAccounts}
        accounts={savedAccounts}
        currentUsername={user?.username}
        onClose={() => setShowManageAccounts(false)}
        onAddAccount={() => setShowAddAccount(true)}
        onSwitchAccount={openSwitchConfirm}
        onDisconnectAccount={openDisconnectConfirm}
        onLogoutAll={openLogoutAllConfirm}
      />

      <AddAccountDialog
        open={showAddAccount}
        onClose={() => setShowAddAccount(false)}
        onSubmit={handleAddAccount}
      />
    </div>
  );
};

export default SettingsPage;
