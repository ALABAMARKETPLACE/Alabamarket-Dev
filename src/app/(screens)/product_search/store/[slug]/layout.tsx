"use client";
import API from "@/config/API";
import "./style.scss";
import useDidUpdateEffect from "@/shared/hook/useDidUpdate";
import { GET } from "@/util/apicall";
import { Avatar, Card, Skeleton, Tag } from "antd";
import Meta from "antd/es/card/Meta";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { FaStar } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";

function StoreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loadingStore, setLoadingStore] = useState(true);
  const [store, setStore] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);

  const selectedCid = searchParams.get("cid") || "";
  const price = searchParams.get("price") || "RAND";
  const order = searchParams.get("order") || "ASC";
  const storeNameParam = searchParams.get("storeName") || "";

  const slug = params?.slug as string;

  const initialTags = [
    {
      title: "New",
      // "New" means order=DESC
      active: searchParams.get("order") === "DESC",
    },
    {
      title: "Price: High to Low",
      // price=DESC, order=ASC
      active:
        searchParams.get("price") === "DESC" &&
        searchParams.get("order") !== "DESC",
    },
    {
      title: "Price: Low to High",
      // price=ASC, order=ASC
      active:
        searchParams.get("price") === "ASC" &&
        searchParams.get("order") !== "DESC",
    },
  ];
  const [selectedTags, setSelectedTags] = useState(initialTags);

  const getStoreDetails = async () => {
    // store_search/info only accepts text slugs; derive one from storeName when slug is numeric
    const textSlug = /^\d+$/.test(slug)
      ? storeNameParam.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : slug;
    try {
      const response: any = await GET(`${API.STORE_SEARCH_GETINFO}${textSlug}`);
      if (response?.status) {
        setStore(response.data?.store ?? { store_name: storeNameParam });
        const cats = (response.data?.category ?? []).map((cat: any) => ({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
        }));
        setCategories(cats);
        return;
      }
    } catch {
      // fall back silently
    } finally {
      setLoadingStore(false);
    }
    if (storeNameParam) {
      setStore({ store_name: storeNameParam });
    }
  };

  useEffect(() => {
    getStoreDetails();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep tag active states in sync when URL changes externally
  useDidUpdateEffect(() => {
    setSelectedTags([
      { title: "New", active: order === "DESC" },
      {
        title: "Price: High to Low",
        active: price === "DESC" && order !== "DESC",
      },
      {
        title: "Price: Low to High",
        active: price === "ASC" && order !== "DESC",
      },
    ]);
  }, [price, order]);

  // Navigate to the same page keeping existing params, toggling the clicked filter
  const handleFilterChange = (index: number) => {
    const next = selectedTags.map((t, i) => ({
      ...t,
      active: i === index ? !t.active : false,
    }));
    setSelectedTags(next);

    const newOrder = next[0].active ? "DESC" : "ASC";
    const newPrice = next[1].active ? "DESC" : next[2].active ? "ASC" : "RAND";

    const qs = new URLSearchParams(searchParams.toString());
    qs.set("order", newOrder);
    qs.set("price", newPrice);
    // preserve cid if one is selected
    router.push(`/product_search/store/${slug}?${qs.toString()}`);
  };

  // Select a category: stay on the same page, just update ?cid=
  const handleCategoryClick = (categoryId: string) => {
    const qs = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      qs.set("cid", categoryId);
    } else {
      qs.delete("cid");
    }
    router.push(`/product_search/store/${slug}?${qs.toString()}`);
  };

  return (
    <div className="Screen-box py-2">
      <button
        onClick={() => router.back()}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px", color: "#555", fontSize: "14px" }}
      >
        <IoArrowBack size={18} /> Back
      </button>
      <Card bordered={false} className="card-store-full">
        {loadingStore ? (
          <Skeleton avatar paragraph={{ rows: 1 }} />
        ) : (
          <Row className="mx-0">
            <Col md="3">
              <Meta
                className="mb-md-0 mb-1"
                avatar={<Avatar src={store?.logo_upload} size={75} />}
                title={
                  <div className="StoreItem-txt3 d-flex gap-2">
                    <h6 className="fw-bold">{store?.store_name}</h6>
                    <div className="text-success fw-light d-flex align-items-center">
                      {isNaN(Number(store?.averageRating))
                        ? 0
                        : Number(store?.averageRating).toFixed(1)}
                      <FaStar
                        color="#f5da42"
                        className="ms-1"
                        style={{ verticalAlign: "middle" }}
                      />
                    </div>
                  </div>
                }
                description={<div>Everyday Store prices</div>}
              />
            </Col>

            <Col md="9" className="px-0 d-flex flex-column">
              {/* Category tabs */}
              <div className="d-flex gap-2 search-store-subcategories my-auto">
                <div
                  className={`search-store-tags px-3 align-self-center text-bold ${
                    !selectedCid ? "active" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCategoryClick("")}
                >
                  All
                </div>
                {categories.map((item: any, index: number) => (
                  <div
                    key={index}
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                    className={`search-store-tags px-3 align-self-center text-bold ${
                      String(item._id) === selectedCid ? "active" : ""
                    }`}
                    onClick={() => handleCategoryClick(String(item._id))}
                  >
                    {item?.name}
                  </div>
                ))}
              </div>

              {/* Sort / filter tags */}
              <div className="col-12 mt-2 d-flex justify-content-end mt-auto">
                <div className="pt-2 d-flex gap-2">
                  Filter:
                  {selectedTags.map((tag, i) => (
                    <Tag
                      key={i}
                      className="align-self-center me-0"
                      color={tag.active ? API.COLOR : ""}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleFilterChange(i)}
                    >
                      {tag.title}
                    </Tag>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Card>

      <main>{children}</main>
    </div>
  );
}

export default StoreLayout;
