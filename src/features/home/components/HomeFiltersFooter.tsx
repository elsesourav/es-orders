type HomeFiltersFooterProps = {
  t: (key: string) => string;
  fromDate: string;
  toDate: string;
  setFromDate: (value: string) => void;
  setToDate: (value: string) => void;
  loading: boolean;
  onApply: () => void;
  onClear: () => void;
  page: number;
  shown: number;
  total: number;
  hasPreviousPage: boolean;
  hasMore: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export default function HomeFiltersFooter({
  t,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  loading,
  onApply,
  onClear,
  page,
  shown,
  total,
  hasPreviousPage,
  hasMore,
  onPrevious,
  onNext,
}: HomeFiltersFooterProps) {
  return (
    <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {t("home.page")} {page} • {shown} / {total} {t("home.states")}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!hasPreviousPage || loading}
            className="h-9 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm font-semibold text-gray-700 dark:text-gray-200 disabled:opacity-40"
          >
            {t("common.previous")}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasMore || loading}
            className="h-9 rounded-md border border-primary-500 bg-primary px-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {t("common.next")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {t("home.from")}
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="h-9 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {t("home.to")}
          </span>
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="h-9 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-sm"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onApply}
          className="h-9 rounded-md border border-primary-500 bg-primary px-3 text-sm font-semibold text-white disabled:opacity-60"
          disabled={loading}
        >
          {t("home.apply")}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="h-9 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm font-semibold text-gray-700 dark:text-gray-200 disabled:opacity-60"
          disabled={loading}
        >
          {t("home.clear")}
        </button>
      </div>
    </div>
  );
}
