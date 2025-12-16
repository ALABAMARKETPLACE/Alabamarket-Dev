"use client";

import { useCallback, useMemo, useState } from "react";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";

const useBannersFilters = () => {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [debouncedSearch, searchValue, setSearchValue] = useDebounceQuery(
    "",
    300
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      setPage(1);
    },
    [setSearchValue]
  );

  const bannerQueryParams = useMemo(() => {
    const params: Record<string, any> = {
      order: "DESC",
      page,
      take,
    };

    if (debouncedSearch?.trim()) {
      params.search = debouncedSearch.trim();
    }

    return params;
  }, [debouncedSearch, page, take]);

  return {
    pagination: {
      page,
      take,
      setPage,
      setTake,
    },
    search: {
      value: searchValue,
      onChange: handleSearchChange,
    },
    bannerQueryParams,
  };
};

export default useBannersFilters;

