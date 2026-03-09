"use client";
import React, { useEffect, useState } from "react";
import { notification, Pagination } from "antd";
import ProductItem from "../../../../components/productItem/page";
import MultiSearchProductList from "../../../../components/multiSearch";
import { GET } from "../../../../util/apicall";
import { useParams, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { reduxSettings } from "../../../../redux/slice/settingsSlice";
import { reduxLatLong } from "../../../../redux/slice/locationSlice";
import API from "../../../../config/API";
import useDidUpdateEffect from "../../../../shared/hook/useDidUpdate";
import { TbSortAscending, TbSortDescending, TbSparkles } from "react-icons/tb";
import { FiSearch } from "react-icons/fi";
import "./styles.scss";

const SORT_OPTIONS = [
  { title: "Newest",           icon: <TbSparkles size={13} /> },
  { title: "Price: High → Low", icon: <TbSortDescending size={13} /> },
  { title: "Price: Low → High", icon: <TbSortAscending size={13} /> },
];

const SKELETON_COUNT = 12;

function SkeletonGrid() {
  return (
    <div className="search-page__skeleton-grid">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div key={i} className="search-page__skeleton-card">
          <div className="search-page__skeleton-img" />
          <div className="search-page__skeleton-line" />
          <div className="search-page__skeleton-line search-page__skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="search-page__empty">
      <div className="search-page__empty-icon">
        <FiSearch />
      </div>
      <p className="search-page__empty-title">No results for &ldquo;{query}&rdquo;</p>
      <p className="search-page__empty-sub">
        We couldn&apos;t find any products matching your search.
      </p>
      <div className="search-page__empty-tips">
        <span>Check your spelling</span>
        <span>Try more general keywords</span>
        <span>Search by category or brand</span>
      </div>
    </div>
  );
}

function Page() {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Notifications, contextHolder] = notification.useNotification();
  const searchParams = useSearchParams();
  const Settings = useSelector(reduxSettings);
  const Location = useSelector(reduxLatLong);
  const params = useParams();

  const currentPage =
    Number(searchParams.get("page")) > 0 ? Number(searchParams.get("page")) : 1;

  const initialValues = [
    {
      status: searchParams.get("order") === "DESC",
      value:
        searchParams.get("order") === "ASC" || searchParams.get("order") === "DESC"
          ? searchParams.get("order")
          : "ASC",
      title: "Newest",
    },
    {
      status:
        searchParams.get("price") === "DESC" && searchParams.get("order") === "ASC",
      value: "ASC",
      title: "Price: High → Low",
    },
    {
      status:
        searchParams.get("price") === "ASC" && searchParams.get("order") === "ASC",
      value: "ASC",
      title: "Price: Low → High",
    },
  ];

  const [page, setPage] = useState(currentPage);
  const pageSize = 12;
  const [meta, setMeta] = useState<any>({});
  const [initial, setInitial] = useState(true);
  const [selectedTags, setSelectedTags] = useState<any>(initialValues);

  const serchInput = params.query;
  const lattitude =
    Settings.isLocation === true && Location.latitude ? Location.latitude : 0;
  const longitude =
    Settings.isLocation === true && Location.longitude ? Location.longitude : 0;

  const getProducts = async (pg: number) => {
    const price =
      selectedTags[1].status === true
        ? "DESC"
        : selectedTags[2].status === true
        ? "ASC"
        : "RAND";
    const order = selectedTags[0].value;
    const searchType =
      Settings?.type === "multi"
        ? API.PRODUCT_SEARCH_NEW_MULTI
        : API.PRODUCT_SEARCH_NEW_SINGLE;

    const url =
      searchType +
      `?query=${serchInput}&order=${order}&price=${price}&page=${pg}&take=${pageSize}` +
      `&lattitude=${lattitude}&longitude=${longitude}&radius=${Settings.radius}`;

    setLoading(true);
    try {
      if (serchInput) {
        const response: any = await GET(url);
        if (response?.status) {
          setProduct(response?.data);
          setMeta(response?.meta);
        }
      }
    } catch (err: any) {
      Notifications["error"]({
        message: "Search failed",
        description: err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setInitial(false);
      setLoading(false);
    }
  };

  const changePage = async (pg: number, take: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    await getProducts(pg);
    setPage(pg);
  };

  const handleChange = (index: number) => {
    const array = [...selectedTags];
    const findex = array.findIndex((item: any) => item.status === true);
    if (findex !== -1 && findex !== index) {
      array[findex].status = false;
      array[findex].value = "ASC";
    }
    array[index].status = !array[index].status;
    array[index].value = array[index].status ? "DESC" : "ASC";
    setSelectedTags(array);
  };

  useDidUpdateEffect(() => {
    getProducts(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setPage(1);
  }, [serchInput, Location]);

  useEffect(() => {
    getProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedTags]);

  const totalItems = meta?.itemCount || 0;
  const isMulti = Settings?.type === "multi";
  const hasResults = product.length > 0;

  const resultLabel = !initial
    ? `${totalItems.toLocaleString()} ${isMulti ? "store" : "product"}${totalItems !== 1 ? "s" : ""} found`
    : "";

  return (
    <div className="Screen-box search-page mb-4 mt-4">
      {contextHolder}

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="search-page__header">
        <div className="search-page__title-block">
          <h1 className="search-page__title">
            Results for &ldquo;<span>{decodeURIComponent(String(serchInput))}</span>&rdquo;
          </h1>
          {resultLabel ? (
            <span className="search-page__count">{resultLabel}</span>
          ) : null}
        </div>

        <div className="search-page__filters">
          <span className="search-page__filter-label">Sort:</span>
          {selectedTags.map((tag: any, i: number) => (
            <button
              key={i}
              className={`search-page__chip${selectedTags[i].status ? " search-page__chip--active" : ""}`}
              onClick={() => handleChange(i)}
            >
              {SORT_OPTIONS[i]?.icon}
              {tag.title}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      {loading ? (
        <SkeletonGrid />
      ) : !hasResults ? (
        initial ? (
          <SkeletonGrid />
        ) : (
          <EmptyState query={decodeURIComponent(String(serchInput))} />
        )
      ) : isMulti ? (
        <div className="search-page__multi-wrapper">
          {product.map((item: any, i: number) => (
            <MultiSearchProductList
              key={i}
              data={item}
              search={serchInput}
              type="search"
            />
          ))}
        </div>
      ) : (
        <div className="search-page__grid">
          {product.map((item: any, index: number) => (
            <div key={index} className="search-page__card">
              <ProductItem item={item} />
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────── */}
      {hasResults && !loading && (
        <div className="search-page__pagination">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={totalItems}
            defaultCurrent={1}
            responsive
            defaultPageSize={pageSize}
            hideOnSinglePage
            onChange={changePage}
          />
        </div>
      )}
    </div>
  );
}

export default Page;
