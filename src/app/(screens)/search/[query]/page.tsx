"use client";
import React, { useEffect, useState } from "react";
import { notification, Pagination, Space, Tag } from "antd";
import ProductItem from "../../../../components/productItem/page";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import MultiSearchProductList from "../../../../components/multiSearch";
import { GET } from "../../../../util/apicall";
import { useParams, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { reduxSettings } from "../../../../redux/slice/settingsSlice";
import { reduxLatLong } from "../../../../redux/slice/locationSlice";
import API from "../../../../config/API";
import useDidUpdateEffect from "../../../../shared/hook/useDidUpdate";
import { Col, Row } from "react-bootstrap";
import NoData from "../../../../components/noData";

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
  const [page, setPage] = useState(currentPage);
  const pageSize = 12;
  const [meta, setMeta] = useState<any>({});
  const [initial, setInitial] = useState(true);
  const [selectedTags, setSelectedTags] = useState<any>(initialValues);
  const serchInput = params.query;
  const lattitude = Settings.isLocation == true ? Location.latitude : "";
  const longitude = Settings.isLocation == true ? Location.longitude : "";
  const getProducts = async (page: number) => {
    const price =
      selectedTags[1].status == true
        ? "DESC"
        : selectedTags[2].status == true
        ? "ASC"
        : "RAND";
    const order = selectedTags[0].value;
    const searchType =
      Settings?.type === "multi"
        ? API.PRODUCT_SEARCH_NEW_MULTI
        : API.PRODUCT_SEARCH_NEW_SINGLE;

    const url =
      searchType +
      `?query=${serchInput}&order=${order}&price=${price}&page=${page}&take=${pageSize}&lattitude=${lattitude}&longitude=${longitude}&radius=${Settings.radius}`;
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
        message: "Failed to Get Categories",
        description: err.message,
      });
    } finally {
      setInitial(false);
      setLoading(false);
    }
  };
  const changePage = async (page: number, take: number) => {
    await getProducts(page);
    setPage(page);
    // setSearchParams((searchparams) => {
    //   searchparams.set("page", String(page));
    //   return searchparams;
    // });
    // window.scrollTo(0, 0);
  };
  const handleChange = (index: number) => {
    const array = [...selectedTags];
    const findex = array.findIndex((item: any) => item.status == true);
    if (findex != -1 && findex != index) {
      array[findex].status = false;
      array[findex].value = "ASC";
    }
    array[index].status = !array[index].status;
    array[index].value = array[index].status ? "DESC" : "ASC";
    setSelectedTags(array);
    const price =
      array[1].status == true
        ? "DESC"
        : array[2].status == true
        ? "ASC"
        : "RAND";
    // setSearchParams((searchParams) => {
    //   searchParams.set("order", array[0].value);
    //   searchParams.set("price", price);
    //   return searchParams;
    // });
  };
  useDidUpdateEffect(() => {
    getProducts(1);
    window.scrollTo(0, 0);
    setPage(1);
  }, [serchInput, Location]);
  useEffect(() => {
    getProducts(page);
    window.scrollTo(0, 0);
  }, [selectedTags]);
  return (
    <div className="Screen-box mb-4 mt-4">
      <PageHeader
        title={`${serchInput}`}
        page={page}
        pageSize={pageSize}
        meta={meta}
        initial={initial}
        type={Settings?.type}
        count={product?.length}
      >
        <Space size={[0, 8]} wrap>
          {selectedTags.map((tag: any, i: number) => (
            <Tag
              key={i}
              color={selectedTags[i].status ? "red" : ""}
              onClick={(checked) => handleChange(i)}
              style={{ cursor: "pointer" }}
            >
              {tag.title}
            </Tag>
          ))}
        </Space>
      </PageHeader>
      {contextHolder}
      <Row className="mx-0 gy-3 py-3">
        {loading ? null : product.length && Settings?.type === "multi" ? ( //   <Loading />
          product.map((item: any) => {
            return (
              <MultiSearchProductList
                data={item}
                search={serchInput}
                type="search"
              />
            );
          })
        ) : product.length && Settings?.type === "single" ? (
          product.map((item: any, index: number) => (
            <Col md="2" key={index}>
              <ProductItem item={item} />
            </Col>
          ))
        ) : (
          <NoData header={`No Products for "${serchInput}"`} />
        )}
        <div className="d-flex justify-content-center mt-3">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={meta?.itemCount || 0}
            defaultCurrent={1}
            responsive={true}
            defaultPageSize={pageSize}
            disabled={false}
            hideOnSinglePage={true}
            onChange={(current: any, size: any) => {
              changePage(current, size);
            }}
          />
        </div>
      </Row>
    </div>
  );
}

export default Page;
