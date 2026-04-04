import { ChevronRight } from "lucide-react";

type HomeHeaderProps = {
  user: any;
  t: (key: string) => string;
  onOpenSwitchPopup: () => void;
};

export default function HomeHeader({
  user,
  t,
  onOpenSwitchPopup,
}: HomeHeaderProps) {
  return (
    <div className="text-center space-y-3">
      {user && (
        <div className="mx-auto inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <span className="text-md font-semibold text-gray-900 dark:text-white">
            <span className="font-normal text-gray-500 dark:text-gray-400">
              {t("orders.name")}:
            </span>
            {user.name || "User"}
          </span>
          <button
            type="button"
            onClick={onOpenSwitchPopup}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {t("settings.switch")}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {t("home.savedStates")}
      </h1>
    </div>
  );
}
