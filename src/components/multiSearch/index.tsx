import { useEffect, useRef, useState } from "react";
import ProductItem from "../productItem/page";
import { MdArrowBack, MdOutlineArrowForward } from "react-icons/md";
import React from "react";
import { Col, Row } from "react-bootstrap";
import "./style.scss";
// import { useNavigate } from "react-router-dom";
import { IoSpeedometerOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
function MultiSearchProductList(props: any) {
  const navigate = useRouter();
  const [hasScrollBar, setHasScrollBar] = useState(false);
  //   const navigate = useNavigate();
  const ref: any = useRef(null);
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
    el &&
      setHasScrollBar(el.scrollWidth > el.getBoundingClientRect().width + 50);
  }
  return (
    <div className="MultiSearchProductList">
      <div className="MultiSearchProductList-Header">
        <Row className="gy-2">
          <Col
            sm={5}
            xs={9}
            className="d-flex col-12"
            onClick={() =>
              navigate.push(
                props?.type === "search"
                  ? `/store/${props?.data?.slug}/search?qs=${props?.search}`
                  : `/store/${props?.data?.slug}/categories?cid=${props?.cid}&type=${props?.cname}`
              )
            }
          >
            <div>
              <img
                src={props?.data?.logo_upload}
                className="MultiSearchProductList-img"
                alt=""
              />
            </div>
            <div className="MultiSearchProductList-box">
              <div>
                <h6 className="MultiSearchProductList-txt1">
                  {props?.data?.store_name}
                </h6>
                <div className="MultiSearchProductList-txt3">
                  {props?.data?.business_type} &nbsp;
                  <span className="MultiSearchProductList-txt4">
                    <IoSpeedometerOutline /> &nbsp;Delivery By 9AM
                  </span>
                </div>
              </div>
            </div>
          </Col>
          <Col sm={1} xs={3}></Col>
          <Col sm={6} xs={9}>
            <div className="MultiSearchProductList-box2 mt-md-0">
              <div
                className="MultiSearchProductList-txt2"
                onClick={() =>
                  navigate.push(
                    props?.type === "search"
                      ? `/store/${props?.data?.slug}/search?qs=${props?.search}`
                      : `/store/${props?.data?.slug}/categories?type=${props?.cname} ${
                          props?.cid ? `&cid=${props?.cid}` : ""
                        }${
                          props?.ogcategory
                            ? `&ogCategory=${props?.ogcategory}`
                            : ""
                        }`
                  )
                }
              >
                View all{" "}
                {props?.data?.productList?.length > 10
                  ? "10+ "
                  : props?.data?.productList?.length}{" "}
                items
              </div>
              {hasScrollBar ? (
                <div className="MultiSearchProductList-box">
                  <div onClick={() => scroll(-800)}>
                    <MdArrowBack size={20} color="grey" />
                  </div>
                  <div style={{ marginLeft: 10 }} />
                  <div onClick={() => scroll(800)}>
                    <MdOutlineArrowForward size={20} color="grey" />
                  </div>
                </div>
              ) : null}
            </div>
          </Col>
        </Row>
      </div>
      <div className="MultiSearchProductList-box3">
        <div className="Horizontal-Pscroll position-relative">
          {/* <div className="Horizontal-PscrollBox" ref={ref}>
            {Array.isArray(props?.data?.productList)
              ? props?.data?.productList
                  ?.slice(0, 10)
                  .map((prod: any, index: number) => {
                    return (
                      <div key={index} className="Horizontal-item">
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
            {Array.isArray(props?.data?.productList)
              ? props?.data?.productList?.map((prod: any, index: number) => {
                  return (
                    <Col
                      sm="4"
                      md={props?.count ? props?.count : 2}
                      className="pe-0 col-6 lg-25"
                      key={index}
                    >
                      <ProductItem item={prod} />
                    </Col>
                  );
                })
              : null}
          </Row>
        </div>
      </div>
    </div>
  );
}
export default MultiSearchProductList;
