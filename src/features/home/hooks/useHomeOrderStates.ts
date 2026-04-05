import { useEffect, useMemo, useState } from "react";
import {
  listOwnOrderStatesPaged,
  ORDERS_STATES_PAGE_SIZE,
} from "../../../api/ordersStatesApi";
import type { SelectedOrdersState } from "../../../types/orders";

const FILTERED_ORDERS_STATES_PAGE_SIZE = 12;

function buildDateRangeIso(fromDate: string, toDate: string) {
  return {
    startDate: fromDate ? `${fromDate}T00:00:00.000Z` : null,
    endDate: toDate ? `${toDate}T23:59:59.999Z` : null,
  };
}

function mapStateRows(rows = []): SelectedOrdersState[] {
  return rows.map((item) => ({
    ...item?.order_data?.states,
    id: item?.id,
    timestamp: item?.order_data?.timestamp,
    createdAt: item?.created_at,
    userId: String(item?.user_id ?? item?.created_by ?? ""),
  }));
}

function toDateOnly(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getPageDateBounds(rows: SelectedOrdersState[]) {
  const dates = rows
    .map((row) => toDateOnly(row?.createdAt || row?.timestamp))
    .filter(Boolean)
    .sort();

  if (!dates.length) {
    return { from: "", to: "" };
  }

  return {
    from: dates[0],
    to: dates[dates.length - 1],
  };
}

export default function useHomeOrderStates(userId?: string) {
  const [states, setStates] = useState<SelectedOrdersState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalStates, setTotalStates] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  const hasPreviousPage = page > 1;

  useEffect(() => {
    const fetchStates = async () => {
      if (!userId) {
        setStates([]);
        setTotalStates(0);
        setHasMore(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const isCustomDateApplied = !!(appliedFromDate || appliedToDate);
        const pageLimit = isCustomDateApplied
          ? FILTERED_ORDERS_STATES_PAGE_SIZE
          : ORDERS_STATES_PAGE_SIZE;
        const dateRange = buildDateRangeIso(appliedFromDate, appliedToDate);
        const response = await listOwnOrderStatesPaged({
          page,
          limit: pageLimit,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });

        const mappedRows = mapStateRows(response?.rows || []);
        setStates(mappedRows);
        setTotalStates(Number(response?.total || 0));
        setHasMore(Boolean(response?.hasMore));

        const { from, to } = getPageDateBounds(mappedRows);
        setFromDate(from);
        setToDate(to);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load states");
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, [appliedFromDate, appliedToDate, page, userId]);

  const paginationLabel = useMemo(
    () => ({
      page,
      shown: states.length,
      total: totalStates,
    }),
    [page, states.length, totalStates],
  );

  const handleApplyDateFilter = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setPage(1);
  };

  const handleClearDateFilter = () => {
    setFromDate("");
    setToDate("");
    setAppliedFromDate("");
    setAppliedToDate("");
    setPage(1);
  };

  const goPrevious = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const goNext = () => {
    setPage((current) => current + 1);
  };

  return {
    states,
    loading,
    error,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    paginationLabel,
    hasPreviousPage,
    hasMore,
    handleApplyDateFilter,
    handleClearDateFilter,
    goPrevious,
    goNext,
  };
}
