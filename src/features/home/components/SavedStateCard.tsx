import { Package, Truck } from "lucide-react";
import type { SelectedOrdersState } from "../../../types/orders";

type SavedStateCardProps = {
  state: SelectedOrdersState;
  index: number;
  onOpenRtd: (state: SelectedOrdersState) => void;
  onOpenHandover: (state: SelectedOrdersState) => void;
  t: (key: string) => string;
};

export default function SavedStateCard({
  state,
  index,
  onOpenRtd,
  onOpenHandover,
  t,
}: SavedStateCardProps) {
  return (
    <div
      key={state.id || index}
      className="relative w-full grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-2 bg-white dark:bg-gray-800 rounded-lg px-2 py-2 shadow-sm border border-gray-200 dark:border-gray-700 active:shadow-lg active:border-primary-300 dark:active:border-primary-600 transition-all duration-300 active:-translate-y-1"
    >
      <div className="relative w-full h-full flex items-center text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-200">
        {state.timestamp || "No timestamp"}
      </div>

      <div className="relative w-full grid grid-cols-2 gap-2">
        <button
          type="button"
          className="text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 border border-blue-200 dark:border-blue-800 active:bg-blue-100 dark:active:bg-blue-900/30 transition-colors duration-200 cursor-pointer"
          onClick={() => onOpenRtd(state)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center active:bg-blue-200 dark:active:bg-blue-900/50 transition-colors duration-200">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("home.rtd")}
              </h4>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {state.rtd?.length || 0} {t("home.items")}
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          className="text-left bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 border border-purple-200 dark:border-purple-800 active:bg-purple-100 dark:active:bg-purple-900/30 transition-colors duration-200 cursor-pointer"
          onClick={() => onOpenHandover(state)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center active:bg-purple-200 dark:active:bg-purple-900/50 transition-colors duration-200">
              <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("home.handover")}
              </h4>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {state.handover?.length || 0} {t("home.items")}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
