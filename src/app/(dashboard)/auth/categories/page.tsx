"use client";
import React, { useReducer, useEffect, useRef, Suspense } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Button, Input, Tooltip } from "antd";
import {
  IoSearchOutline,
  IoAddCircleOutline,
  IoRefresh,
} from "react-icons/io5";
import { FiGrid } from "react-icons/fi";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./_components/dataTable";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import AddCategoryModal from "./_components/addCategoryModal";
import { reducer, Category } from "./_components/types_and_interfaces";
import Error from "@/app/(dashboard)/_components/error";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";

function CategoryContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial values from URL — preserved across browser back/forward
  const urlPage   = Number(searchParams.get("page") ?? 1);
  const urlTake   = Number(searchParams.get("take") ?? 10);
  const urlSearch = searchParams.get("search") ?? "";

  // Debounce only the input; the committed debounced value writes to URL
  const [debouncedSearch, , handleChange] = useDebounceQuery(urlSearch, 300);

  const [state, dispatch] = useReducer(reducer, { status: false, type: "add" });

  // Sync debounced search + pagination back to URL so history works
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("page", String(urlPage));
    params.set("take", String(urlTake));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const updatePagination = (page: number, take: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("take", String(take));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Build query params — omit search entirely when empty to avoid API returning null
  const queryParams: Record<string, unknown> = {
    page: urlPage,
    take: urlTake,
    order: "DESC",
    ...(urlSearch ? { search: urlSearch } : {}),
  };

  const {
    data: category,
    isLoading,
    refetch,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey, signal }) =>
      GET(API.CATEGORY_LIST, queryKey[1] as Record<string, unknown>, signal),
    queryKey: ["admin_category", queryParams],
  });

  return (
    <>
      <PageHeader
        title="Categories"
        bredcume="Dashboard / Categories"
        icon={<FiGrid size={24} />}
      >
        <Input
          suffix={<IoSearchOutline />}
          placeholder="Search categories..."
          className="header-search-input"
          allowClear
          defaultValue={urlSearch}
          onChange={(e) => {
            handleChange(e?.target?.value);
            // reset page to 1 on new search
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", "1");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
          }}
        />
        <Tooltip title="Add New Category">
          <Button
            type="primary"
            icon={<IoAddCircleOutline size={18} />}
            onClick={() => dispatch({ type: "add" })}
          >
            <span className="btn-text">Add Category</span>
          </Button>
        </Tooltip>
        <Tooltip title="Refresh Data">
          <Button
            type="primary"
            ghost
            icon={
              <IoRefresh
                size={18}
                className={isFetching && !isLoading ? "spin-animation" : ""}
              />
            }
            onClick={() => refetch()}
            loading={isFetching && !isLoading}
          >
            <span className="btn-text">Refresh</span>
          </Button>
        </Tooltip>
      </PageHeader>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error?.message} />
      ) : (
        <DataTable
          data={Array.isArray(category?.data) ? category?.data : []}
          count={category?.meta?.itemCount}
          setPage={(p: number) => updatePagination(p, urlTake)}
          setTake={(t: number) => updatePagination(1, t)}
          pageSize={urlTake}
          page={urlPage}
          edit={(item: Category) => dispatch({ type: "edit", item })}
        />
      )}
      <AddCategoryModal
        open={state.status}
        close={() => dispatch({ type: "close" })}
        type={state.type}
        data={state.item}
      />
    </>
  );
}

// useSearchParams requires Suspense when used in a page component
function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CategoryContent />
    </Suspense>
  );
}

export default Page;
