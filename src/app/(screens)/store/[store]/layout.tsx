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

function StoreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const [loadingStore, setLoadingStore] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<any[]>([]);
  const [category, setCategory] = useState<any>("");

  const [store, setStore] = useState<any>({});
  const selectedCategory = searchParams.get("cid");
  const price = searchParams.get("price") || "RAND";
  const order = searchParams.get("order") || "ASC";
  const initialValues = [
    {
      status: searchParams.get("order") === "DESC" ? true : false,
      value:
        searchParams.get("order") === "ASC" ||
        searchParams.get("order") === "DESC"
          ? searchParams.get("order")
          : "ASC",
      title: "New",
    },
    {
      status:
        searchParams.get("price") === "DESC" &&
        searchParams.get("order") === "ASC"
          ? true
          : false,
      value: "ASC",
      title: "Price: High to Low",
    },
    {
      status:
        searchParams.get("price") === "ASC" &&
        searchParams.get("order") === "ASC"
          ? true
          : false,
      value: "ASC",
      title: "Price: Low to High",
    },
  ];
  const [selectedTags, setSelectedTags] = useState<any>(initialValues);

  const getStoreDetails = async () => {
    const url = API.STORE_SEARCH_GETINFO + params?.store;
    try {
      const response: any = await GET(url);
      if (response.status) {
        setStore(response.data?.store);
        setCategories(response.data?.category);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
    } finally {
      setLoadingStore(false);
    }
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

    const price =
      array[1].status === true
        ? "DESC"
        : array[2].status === true
        ? "ASC"
        : "RAND";

    // Create URLSearchParams object for Next.js
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("order", array[0].value);
    newSearchParams.set("price", price);

    // Use Next.js router to update URL
    router.push(`${window.location.pathname}?${newSearchParams.toString()}`);
  };
  useDidUpdateEffect(() => {
    setSelectedTags(() => initialValues);
  }, [price, order]);
  useEffect(() => {
    getStoreDetails();
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (selectedCategory != null) {
      setCategory(selectedCategory);
    } else if (params?.store === "") {
      setCategory("");
    } else if (params?.store === "search") {
      setCategory("");
    } else {
      setCategory("");
    }
  }, [selectedCategory, params?.store]);
  return (
    <>
      <div className="Screen-box py-2">
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
                        {isNaN(Number(store?.averageRating)) == false
                          ? Number(store?.averageRating)?.toFixed(1)
                          : 0}
                        <FaStar
                          color="#f5da42"
                          className="ms-1"
                          style={{ verticalAlign: "middle" }}
                        />{" "}
                        &nbsp;
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      <div>Everyday Store prices</div>
                      {/* <a
                        href={`/str/${params.store}/main`}
                        className="searchstore-website-link"
                      >
                        Go to Website
                      </a> */}
                    </div>
                  }
                />
              </Col>
              <Col md="9" className="px-0 d-flex flex-column">
                <div className="d-flex gap-2 search-store-subcategories my-auto">
                  <div
                    className={`search-store-tags px-3 align-self-center text-bold ${
                      category == "" ? "active" : ""
                    }`}
                    onClick={() => {
                      setCategory("all");
                      router.push(`/store/${params?.store}`);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    All
                  </div>
                  {categories?.map((item: any, index: number) => (
                    <div
                      style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                      className={`search-store-tags px-3 align-self-center text-bold ${
                        item._id == category ? "active" : ""
                      }`}
                      key={index}
                      onClick={() => {
                        router.push(
                          `/store/${params.store}/${item?.slug}?cid=${
                            item?._id
                          }&type=${encodeURIComponent(item?.name)}`
                        );
                      }}
                    >
                      {item?.name}
                    </div>
                  ))}
                </div>
                <div className="col-12 mt-2 d-flex justify-content-end d-block mt-auto">
                  <div className="pt-2 d-flex gap-2">
                    Filter:
                    {selectedTags.map((tag: any, i: number) => (
                      <Tag
                        className="align-self-center me-0"
                        color={selectedTags[i].status ? API.COLOR : ""}
                        style={{ cursor: "pointer" }}
                        key={i}
                        onClick={() => handleChange(i)}
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
    </>
  );
}

export default StoreLayout;
