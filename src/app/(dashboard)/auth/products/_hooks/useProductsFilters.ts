"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import convertInput from "../_components/functions";

type StoreOption = {
  value: string | number;
  label: string;
};

interface UseProductsFiltersArgs {
  categories: any[];
  isAdmin: boolean;
  sessionStoreId: string | number | null;
}

const mapCategoriesToTreeData = (categories?: any[]) => {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.map((category: any) => ({
    title: category?.name ?? "Unnamed Category",
    value: category?.id ? String(category?.id) : "",
    children: Array.isArray(category?.sub_categories)
      ? category.sub_categories.map((sub: any) => ({
          title: sub?.name ?? "Unnamed Sub-category",
          value: `${category?.id}|${sub?._id}`,
        }))
      : [],
  }));
};

const useProductsFilters = ({
  categories,
  isAdmin,
  sessionStoreId,
}: UseProductsFiltersArgs) => {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [debouncedSearch, searchValue, setSearchValue] = useDebounceQuery(
    "",
    300
  );
  const [status, setStatus] = useState("all");
  const [categoryValue, setCategoryValue] = useState("");
  const [adminStoreId, setAdminStoreId] = useState<
    string | number | "all" | null
  >(isAdmin ? "all" : null);

  useEffect(() => {
    if (isAdmin) {
      setAdminStoreId((prev) => (prev === null ? "all" : prev));
    } else {
      setAdminStoreId(null);
    }
    setPage(1);
  }, [isAdmin]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      setPage(1);
    },
    [setSearchValue]
  );

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback(
    (value?: string | number | null) => {
      setCategoryValue(value ? String(value) : "");
      setPage(1);
    },
    []
  );

  const handleStoreChange = useCallback((value: string | number | "all") => {
    const nextValue = (value ?? "all") as string | number | "all";
    setAdminStoreId(nextValue);
    setPage(1);
  }, []);

  const statusFilters = useMemo(() => {
    switch (status) {
      case "active":
        return { status: true };
      case "inactive":
        return { status: false };
      case "instock":
        return { stock_status: "instock" as const };
      case "out_of_stock":
        return { stock_status: "out_of_stock" as const };
      default:
        return {};
    }
  }, [status]);

  const parsedCategory = useMemo(
    () => convertInput(categoryValue),
    [categoryValue]
  );

  const productQueryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      take,
      order: "DESC",
    };

    if (debouncedSearch?.trim()) {
      params.search = debouncedSearch.trim();
    }

    const categoryId = Number(parsedCategory?.category);
    if (!Number.isNaN(categoryId) && categoryId > 0) {
      params.category = categoryId;
    }

    const subCategoryId = Number(parsedCategory?.subCategory);
    if (!Number.isNaN(subCategoryId) && subCategoryId > 0) {
      params.subCategory = subCategoryId;
    }

    const storeFilter = isAdmin ? adminStoreId : sessionStoreId;
    if (storeFilter && storeFilter !== "all") {
      const numericStoreId = Number(storeFilter);
      params.store_id = Number.isNaN(numericStoreId)
        ? storeFilter
        : numericStoreId;
    }

    Object.assign(params, statusFilters);

    return params;
  }, [
    adminStoreId,
    debouncedSearch,
    isAdmin,
    parsedCategory,
    page,
    sessionStoreId,
    statusFilters,
    take,
  ]);

  const treeData = useMemo(
    () => mapCategoriesToTreeData(categories),
    [categories]
  );

  const {
    data: stores,
    isLoading: isStoresLoading,
    isError: isStoresError,
    error: storesError,
  } = useQuery({
    queryKey: ["admin_products_store_list"],
    enabled: isAdmin,
    queryFn: async ({ signal }) => {
      const [corporateRes, individualRes] = await Promise.all([
        GET(API_ADMIN.CORPORATE_STORE_GETALL + "approved", { page: 1, take: 10 }, signal),
        GET(
          API_ADMIN.INDIVIDUAL_STORE_GETALL,
          { page: 1, take: 10, order: "DESC" },
          signal
        ),
      ]);

      const corporate = Array.isArray(corporateRes?.data)
        ? corporateRes.data
        : [];
      const individual = Array.isArray(individualRes?.data)
        ? individualRes.data.filter(
            (store: any) => store?.status === "approved"
          )
        : [];

      return [...corporate, ...individual];
    },
  });

  const storeOptions = useMemo(() => {
    if (!Array.isArray(stores)) return [];
    return stores
      .map((store: any) => {
        const value = store?.id ?? store?._id ?? store?.store_id ?? null;
        if (value === null || value === undefined) return null;
        return {
          value,
          label:
            store?.store_name ??
            store?.name ??
            `Store ${store?.id ?? store?._id}`,
        };
      })
      .filter(Boolean) as StoreOption[];
  }, [stores]);

  return {
    pagination: {
      page,
      take,
      setPage,
      setTake,
    },
    productQueryParams,
    search: {
      value: searchValue,
      onChange: handleSearchChange,
    },
    status: {
      value: status,
      onChange: handleStatusChange,
    },
    category: {
      value: categoryValue,
      onChange: handleCategoryChange,
      treeData,
    },
    stores: {
      selected: adminStoreId,
      onChange: handleStoreChange,
      options: storeOptions,
      isLoading: isStoresLoading,
      isError: isStoresError,
      error: storesError,
    },
  };
};

export default useProductsFilters;

