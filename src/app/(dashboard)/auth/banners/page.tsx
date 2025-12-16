"use client";
import Error from "@/app/(dashboard)/_components/error";
import Loading from "@/app/(dashboard)/_components/loading";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import API from "@/config/API_ADMIN";
import { GET } from "@/util/apicall";
import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { useEffect, useState } from "react";
import DataTable from "./_components/dataTable";
import FormModal from "./_components/formModal";
import BannersFilterBar from "./_components/BannersFilterBar";
import useBannersFilters from "./_hooks/useBannersFilters";
import "./styles.scss";
function Banners() {
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

  // Check if user has permission (seller or admin with backend fix)
  const {
    data: banners,
    isLoading,
    isFetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryFn: async () => await GET(API.BANNERS_LIST, bannerQueryParams),
    queryKey: ["admin_banners", bannerQueryParams],
    retry: false, // Don't retry on error
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
    if (isLoading) {
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
        {/* <div className="banners-headerActions"> */}
        <div className="banners-headerPrimary">
          <Button type="primary" onClick={handleCreate} size="large">
            New +
          </Button>
        </div>
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
          {/* </div> */}
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
