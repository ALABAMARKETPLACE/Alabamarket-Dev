"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";

interface UseOrdersFiltersArgs {
  initialStatus?: string;
}

const useOrdersFilters = ({ initialStatus = "" }: UseOrdersFiltersArgs = {}) => {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [debouncedOrderId, orderId, setOrderId] = useDebounceQuery("", 300);
  const [status, setStatus] = useState(initialStatus);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setOrderId(value);
      setPage(1);
    },
    [setOrderId]
  );

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleDateRangeChange = useCallback(
    (from: string | null, to: string | null) => {
      setDateRange([from || null, to || null]);
      setPage(1);
    },
    []
  );

  const orderQueryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      take,
    };

    if (debouncedOrderId?.trim()) {
      params.orderId = debouncedOrderId.trim();
    }

    if (status) {
      params.status = status;
    }

    const [from, to] = dateRange;
    if (from) {
      params.from = from;
    }
    if (to) {
      params.to = to;
    }

    return params;
  }, [dateRange, debouncedOrderId, page, status, take]);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  return {
    pagination: {
      page,
      take,
      setPage,
      setTake,
    },
    filters: {
      orderId: {
        value: orderId,
        onChange: handleSearchChange,
      },
      status: {
        value: status,
        onChange: handleStatusChange,
      },
      dateRange: {
        value: dateRange,
        onChange: handleDateRangeChange,
      },
    },
    orderQueryParams,
  };
};

export default useOrdersFilters;

