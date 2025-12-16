"use client";
import { useEffect, useRef, useState } from "react";
import { MdArrowBack, MdOutlineArrowForward } from "react-icons/md";
import React from "react";
import "./style.scss";
import { Col, Row } from "react-bootstrap";
import { useParams, useRouter } from "next/navigation";
import ProductItem from "../productItem/page";
function StoreAllProducts(props: any) {
  const [hasScrollBar, setHasScrollBar] = useState(false);
  const router = useRouter();
  const ref: any = useRef(null);
  const params = useParams();
  const scroll = (ratio: any) => {
    ref.current.scrollLeft += ratio;
  };
  useEffect(() => {
    updateState();
    window.addEventListener("resize", updateState);
    return () => window.removeEventListener("resize", updateState);
  }, []);

  function updateState() {
    const el = ref.current;
    el && setHasScrollBar(el.scrollWidth > el.getBoundingClientRect().width);
  }

  console.log(params,"params");
  return (
    <div className="store-All-Horizontal-Pscroll ">
      <div className="mx-0">
        <div>
          <div className="d-flex gap-2">
            <div className="align-self-center">
              <h4 className="mb-0 card-subtitle-text">
                {props?.data?.name}
              </h4>
            </div>
          </div>
        </div>
      </div>
      <>
        <div className="store-All-Horizontal-Heading1"></div>
        <div
          className="d-flex justify-content-end mb-md-2"
        >
          <div
            className="store-All-Horizontal-viewButton"
            style={{ cursor: "pointer" }}
            onClick={() =>
              router.push(
                `/store/${params.store}/categories?cid=${props?.data?._id}&type=${props?.data?.name}`
              )
            }
          >
            View all{" "}
            {props?.data?.products?.length > 10
              ? "10+ "
              : props?.data?.products?.length}{" "}
            items
          </div>
        </div>
      </>
      <div style={{ margin: 5 }} />
      <div className="store-All-Horizontal-Pscroll position-relative">
        {/* <div className="store-All-Horizontal-PscrollBox" ref={ref}>
          {props?.data?.products
            ? props?.data?.products?.map((prod: any, index: number) => {
                return (
                  <div key={index} className="store-All-Horizontal-item">
                    <ProductItem item={prod} />
                  </div>
                );
              })
            : null}
        </div> */}
        <Row
          className="flex-parent mx-0"
          style={{
            flexWrap: "nowrap",
            overflowX: "auto",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
          }}
          ref={ref}
        >
          {Array.isArray(props?.data?.products)
            ? props?.data?.products?.map((prod: any, index: number) => {
                return (
                  <Col sm="4" md="3" className="ps-0 col-6 lg-25" key={index}>
                    <ProductItem item={prod} />
                  </Col>
                );
              })
            : null}
        </Row>
        {hasScrollBar ? (
          <>
            <button
              className="store-All-Horizontal-btn1 position-absolute store-All-slider-btn-left"
              onClick={() => {
                scroll(-800);
              }}
            >
              <MdArrowBack />
            </button>
            <button
              className="store-All-Horizontal-btn1 store-All-slider-btn-right position-absolute"
              onClick={() => {
                scroll(800);
              }}
            >
              <MdOutlineArrowForward />
            </button>{" "}
          </>
        ) : null}
      </div>
    </div>
  );
}
export default StoreAllProducts;
