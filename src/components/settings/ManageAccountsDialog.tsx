import { useEffect, useState } from "react";
import { useLanguage } from "../../lib/useLanguage";

type AccountItem = {
  id: string | number;
  name: string | null;
  username: string;
};

type ManageAccountsDialogProps = {
  open: boolean;
  accounts: AccountItem[];
  currentUsername?: string;
  onClose: () => void;
  onAddAccount: () => void;
  onSwitchAccount: (username: string) => void;
  onDisconnectAccount: (username: string) => void;
  onLogoutAll: () => void;
};

export default function ManageAccountsDialog({
  open,
  accounts,
  currentUsername,
  onClose,
  onAddAccount,
  onSwitchAccount,
  onDisconnectAccount,
  onLogoutAll,
}: ManageAccountsDialogProps) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return undefined;
    }

    setIsVisible(false);
    const timer = setTimeout(() => setShouldRender(false), 220);
    return () => clearTimeout(timer);
  }, [open]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-2147483645 flex items-center justify-center p-4 transition-all duration-200 ${
        isVisible
          ? "bg-black/40 backdrop-blur-sm opacity-100"
          : "bg-black/0 backdrop-blur-none opacity-0"
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transform transition-all duration-200 ${
          isVisible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {t("settings.accountCenter")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-xs text-gray-700 dark:text-gray-200"
          >
            {t("common.close")}
          </button>
        </div>

        <div className="space-y-2 max-h-[60svh] min-h-[min(260px,_50svh)] overflow-y-auto custom-scrollbar">
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("settings.noSavedAccounts")}
            </p>
          ) : (
            accounts.map((account) => {
              const isCurrent =
                String(account.username || "").toLowerCase() ===
                String(currentUsername || "").toLowerCase();

              return (
                <div
                  key={`${account.id}-${account.username}`}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {account.name || t("settings.unnamed")}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        @{account.username}{" "}
                        {isCurrent ? `• ${t("settings.current")}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => onSwitchAccount(account.username)}
                          className="px-2 py-1 rounded-md text-xs bg-primary text-white"
                        >
                          {t("settings.switch")}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDisconnectAccount(account.username)}
                        className="px-2 py-1 rounded-md text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                      >
                        {t("settings.disconnect")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-end mt-4">
          <button
            type="button"
            onClick={onAddAccount}
            className="px-3 py-2 rounded-lg text-sm bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
          >
            {t("settings.addAccount")}
          </button>
          <button
            type="button"
            onClick={onLogoutAll}
            className="px-3 py-2 rounded-lg text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
          >
            {t("settings.logoutAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
