type SwitchAccountPopupProps = {
  open: boolean;
  visible: boolean;
  savedAccounts: any[];
  user: any;
  switchingUsername: string | null;
  t: (key: string) => string;
  onClose: () => void;
  onSwitch: (username: string) => void;
};

export default function SwitchAccountPopup({
  open,
  visible,
  savedAccounts,
  user,
  switchingUsername,
  t,
  onClose,
  onSwitch,
}: SwitchAccountPopupProps) {
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-2147483645 flex items-end sm:items-center justify-center p-4 transition-all duration-200 ${
        visible
          ? "bg-black/30 backdrop-blur-sm opacity-100"
          : "bg-black/0 backdrop-blur-none opacity-0"
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transform transition-all duration-200 ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-3 scale-95"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("settings.switchAccount")}
          </h3>
          <button
            type="button"
            className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600"
            onClick={onClose}
          >
            {t("common.close")}
          </button>
        </div>

        <div className="space-y-2 max-h-[50svh] overflow-y-auto custom-scrollbar">
          {savedAccounts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("settings.noSavedAccounts")}
            </p>
          ) : (
            savedAccounts.map((account) => {
              const isCurrent =
                String(account.username || "").toLowerCase() ===
                String(user?.username || "").toLowerCase();
              const isSwitching = switchingUsername === account.username;

              return (
                <button
                  key={account.username}
                  type="button"
                  disabled={isCurrent || isSwitching}
                  onClick={() => onSwitch(account.username)}
                  className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                    isCurrent
                      ? "border-primary-400 bg-primary-50 dark:bg-primary-900/30"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } ${isSwitching ? "opacity-70" : ""}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {account.name || t("settings.unnamed")}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                      @{account.username}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {isCurrent
                      ? t("settings.current")
                      : isSwitching
                        ? t("common.loading")
                        : t("settings.switch")}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
