import { useEffect, useMemo, useState } from "react";
import {
  listOwnOrderStatesPaged,
  ORDERS_STATES_PAGE_SIZE,
} from "../../../api/ordersStatesApi";
import type { SelectedOrdersState } from "../../../types/orders";

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
    userId: String(item?.user_id ?? item?.created_by ?? ""),
  }));
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

        const dateRange = buildDateRangeIso(appliedFromDate, appliedToDate);
        const response = await listOwnOrderStatesPaged({
          page,
          limit: ORDERS_STATES_PAGE_SIZE,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });

        setStates(mapStateRows(response?.rows || []));
        setTotalStates(Number(response?.total || 0));
        setHasMore(Boolean(response?.hasMore));
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
