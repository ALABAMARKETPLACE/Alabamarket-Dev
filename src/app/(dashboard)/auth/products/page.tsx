"use client";
import React, { useEffect, useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Button } from "antd";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./_components/dataTable";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import { useAppSelector } from "@/redux/hooks";
import { reduxCategoryItems } from "@/redux/slice/categorySlice";
import Error from "@/app/(dashboard)/_components/error";
import { useRouter } from "next/navigation";
import ImageUploadModal from "./[id]/_components/image_uploader";
import FilePickerModal from "./[id]/_components/file_uploader_modal";
import { useSession } from "next-auth/react";
import ProductsFilterBar from "./_components/ProductsFilterBar";
import useProductsFilters from "./_hooks/useProductsFilters";

function Products() {
  const router = useRouter();
  const categories = useAppSelector(reduxCategoryItems);
  const [uploadImage, setUploadImage] = useState(false);
  const [uploadFile, setUploadFile] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const sessionData = session as any;
  const sessionRole: string | null = sessionData?.role ?? null;
  const sessionStoreId = sessionData?.user?.store_id ?? null;
  const isAdmin = sessionRole === "admin";
  const [isMobile, setIsMobile] = useState(false);
  const [isCompactFilters, setIsCompactFilters] = useState(false);
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false);
  const {
    pagination: { page, take, setPage, setTake },
    productQueryParams,
    search,
    status: statusState,
    category,
    stores,
  } = useProductsFilters({
    categories,
    isAdmin,
    sessionStoreId,
  });
  const { value: searchValue, onChange: handleSearchChange } = search;
  const { value: status, onChange: handleStatusChange } = statusState;
  const {
    value: categoryValue,
    onChange: handleCategoryChange,
    treeData,
  } = category;
  const {
    selected: adminStoreId,
    onChange: handleStoreChange,
    options: storeOptions,
    isLoading: isStoresLoading,
    isError: isStoresError,
    error: storesError,
  } = stores;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsCompactFilters(width <= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setFiltersDropdownOpen(false);
    }
  }, [isMobile]);

  const {
    data: products,
    isLoading,
    refetch,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey, signal }) => {
      const [, params] = queryKey as [string, Record<string, any>];
      return GET(API.FEATURED_ALL_PRODUCTS, params, signal);
    },
    queryKey: ["admin_products", productQueryParams],
    enabled: sessionStatus === "authenticated",
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: false,
  });

  const renderContent = () => {
    if (isAdmin && isStoresLoading) {
      return <Loading />;
    }

    if (isAdmin && isStoresError) {
      return <Error description={storesError?.message} />;
    }

    if (isLoading) {
      return <Loading />;
    }

    if (isError) {
      return <Error description={error?.message} />;
    }

    return (
      <DataTable
        data={Array.isArray(products?.data) ? products?.data : []}
        count={products?.meta?.itemCount}
        setPage={setPage}
        setTake={setTake}
        pageSize={take}
        page={page}
        onDeleted={() => refetch()}
      />
    );
  };

  return (
    <>
      <div className="products-pageHeaderWrap">
        <PageHeader title={"Products"} bredcume={"Dashboard / Products"}>
          <div className="products-headerActions">
            <div
              className="products-headerPrimary"
              style={{ marginRight: "20px" }}
            >
              {" "}
              <Button
                type="primary"
                onClick={() => router.push("/auth/products/create")}
              >
                New +{" "}
              </Button>
            </div>
            <div className="products-headerFilters">
              <ProductsFilterBar
                isAdmin={isAdmin}
                isCompactFilters={isCompactFilters}
                filtersDropdownOpen={filtersDropdownOpen}
                onFiltersDropdownChange={setFiltersDropdownOpen}
                onUploadImage={() => setUploadImage(true)}
                onUploadFile={() => setUploadFile(true)}
                onSearchChange={handleSearchChange}
                searchValue={searchValue}
                statusValue={status}
                onStatusChange={handleStatusChange}
                onCategoryChange={handleCategoryChange}
                categoryValue={categoryValue}
                treeData={treeData}
                storeSelect={{
                  value: adminStoreId,
                  onChange: handleStoreChange,
                  options: storeOptions,
                  loading: isStoresLoading,
                }}
              />
            </div>
          </div>
        </PageHeader>
      </div>
      {renderContent()}
      <FilePickerModal
        open={uploadFile}
        close={setUploadFile.bind(false)}
        getProducts={() => {
          refetch();
        }}
      />
      <ImageUploadModal open={uploadImage} close={setUploadImage.bind(false)} />
    </>
  );
}

export default Products;
