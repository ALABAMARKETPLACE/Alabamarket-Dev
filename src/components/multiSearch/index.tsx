import { useEffect, useRef, useState } from "react";
import ProductItem from "../productItem/page";
import { MdArrowBack, MdOutlineArrowForward } from "react-icons/md";
import React from "react";
import "./style.scss";
import { IoSpeedometerOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

function MultiSearchProductList(props: any) {
  const navigate = useRouter();
  const [hasScrollBar, setHasScrollBar] = useState(false);
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
    el && setHasScrollBar(el.scrollWidth > el.getBoundingClientRect().width + 50);
  }

  const viewAllUrl =
    props?.type === "search"
      ? `/store/${props?.data?.slug}/search?qs=${props?.search}`
      : `/store/${props?.data?.slug}/categories?cid=${props?.cid}&type=${props?.cname}`;

  const viewAllCount =
    props?.data?.productList?.length > 10
      ? "10+"
      : props?.data?.productList?.length;

  return (
    <div className="msp-card">
      {/* Store header */}
      <div className="msp-header" onClick={() => navigate.push(viewAllUrl)}>
        <div className="msp-store-info">
          <img
            src={props?.data?.logo_upload}
            className="msp-store-logo"
            alt={props?.data?.store_name}
          />
          <div className="msp-store-meta">
            <span className="msp-store-name">{props?.data?.store_name}</span>
            <span className="msp-store-sub">
              {props?.data?.business_type}
              <span className="msp-delivery">
                <IoSpeedometerOutline size={13} /> Delivery By 9AM
              </span>
            </span>
          </div>
        </div>

        <div className="msp-actions">
          <span className="msp-viewall">View all {viewAllCount} items</span>
          {hasScrollBar && (
            <div className="msp-scroll-btns" onClick={(e) => e.stopPropagation()}>
              <button className="msp-scroll-btn" onClick={() => scroll(-600)}>
                <MdArrowBack size={16} />
              </button>
              <button className="msp-scroll-btn" onClick={() => scroll(600)}>
                <MdOutlineArrowForward size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product horizontal scroll */}
      <div className="msp-products" ref={ref}>
        {Array.isArray(props?.data?.productList)
          ? props?.data?.productList.map((prod: any, index: number) => (
              <div key={index} className="msp-product-item">
                <ProductItem item={prod} />
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

export default MultiSearchProductList;
