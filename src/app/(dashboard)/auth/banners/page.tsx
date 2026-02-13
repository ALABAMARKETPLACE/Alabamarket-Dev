"use client";
import Error from "@/app/(dashboard)/_components/error";
import Loading from "@/app/(dashboard)/_components/loading";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import API_ADMIN from "@/config/API_ADMIN";
import API from "@/config/API";
import { GET } from "@/util/apicall";
import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import DataTable from "./_components/dataTable";
import FormModal from "./_components/formModal";
import BannersFilterBar from "./_components/BannersFilterBar";
import useBannersFilters from "./_hooks/useBannersFilters";
import "./styles.scss";

interface StoreResponse {
  data?: {
    _id?: string | number;
    id?: string | number;
  };
}

function Banners() {
  const { data: session, status } = useSession();
  const [selectedItem, setSelectedItem] = useState<any>({});
  const [openForm, setOpenForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCompactFilters, setIsCompactFilters] = useState(false);
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false);
  const {
    pagination: { page, take, setPage, setTake },
    search,
    bannerQueryParams,
  } = useBannersFilters();
  const { value: searchValue, onChange: handleSearchChange } = search;

  // Get storeId from session (for sellers)
  const storeId =
    (session as any)?.user?.store_id ??
    (session as any)?.user?.storeId ??
    (session as any)?.store_id ??
    null;
  const userRole = (session as any)?.role;
  const userType = (session as any)?.user?.type || (session as any)?.type;
  const isSeller = userRole === "seller" || userType === "seller";

  // Fetch store info for sellers to get the resolved storeId
  const { data: storeInfo, isLoading: isStoreLoading } = useQuery({
    queryFn: () =>
      GET(API.CORPORATE_STORE_GETSELLERINFO, {}, null, {
        token: (session as any)?.token,
      }),
    queryKey: ["seller_store_details_banners"],
    enabled: status === "authenticated" && isSeller && !!(session as any)?.token,
    retry: false,
  });

  const resolvedStoreId =
    (storeInfo as StoreResponse)?.data?._id ??
    (storeInfo as StoreResponse)?.data?.id ??
    storeId;

  // Build query params with storeId for sellers
  const finalBannerQueryParams = useMemo(() => {
    const params = { ...bannerQueryParams };
    if (isSeller && resolvedStoreId) {
      params.storeId = resolvedStoreId;
    }
    return params;
  }, [bannerQueryParams, isSeller, resolvedStoreId]);

  // Check if user has permission (seller or admin with backend fix)
  const {
    data: banners,
    isLoading,
    isFetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryFn: async () => await GET(API_ADMIN.BANNERS_LIST, finalBannerQueryParams),
    queryKey: ["admin_banners", finalBannerQueryParams],
    retry: false, // Don't retry on error
    enabled: status === "authenticated" && (isSeller ? !!resolvedStoreId : true),
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsCompactFilters(width <= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setFiltersDropdownOpen(false);
    }
  }, [isMobile]);

  const handleCreate = () => {
    setSelectedItem({});
    setOpenForm(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setOpenForm(true);
  };

  const handleModalClose = () => {
    setOpenForm(false);
    setSelectedItem({});
  };

  const renderContent = () => {
    if (isLoading || (isSeller && isStoreLoading)) {
      return <Loading />;
    }

    if (isError) {
      return <Error description={error?.message} />;
    }

    return (
      <DataTable
        data={Array.isArray(banners?.data) ? banners?.data : []}
        count={banners?.meta?.itemCount}
        setPage={setPage}
        setTake={setTake}
        pageSize={take}
        page={page}
        edit={handleEdit}
      />
    );
  };

  return (
    <div>
      <PageHeader title={"Banners"} bredcume={"Dashboard / Banners"}>
        <div className="banners-headerActions">
          <div className="banners-headerFilters">
            <BannersFilterBar
              isCompactFilters={isCompactFilters}
              filtersDropdownOpen={filtersDropdownOpen}
              onFiltersDropdownChange={setFiltersDropdownOpen}
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              onRefresh={() => refetch()}
              isRefreshing={isFetching && !isLoading}
            />
          </div>
          <div className="banners-headerPrimary">
            <Button type="primary" onClick={handleCreate} size="large">
              New +
            </Button>
          </div>
        </div>
      </PageHeader>
      {renderContent()}
      <FormModal
        visible={openForm}
        data={selectedItem}
        onClose={handleModalClose}
        onChange={() => {}}
      />

      <br />
    </div>
  );
}

export default Banners;
