"use client";
import { useEffect, useRef, useState } from "react";
import ProductItem from "../../../../components/productItem/page";
import { MdArrowBack, MdOutlineArrowForward } from "react-icons/md";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { useRouter } from "next/navigation";

interface FeaturedPositionProps {
  position: 1 | 2 | 3 | 4;
  title: string;
  products: any[];
}

function FeaturedPosition({ position, title, products }: FeaturedPositionProps) {
  const [hasScrollBar, setHasScrollBar] = useState(false);
  const [rightButtonClicked, setRightButtonClicked] = useState(false);
  const navigation = useRouter();
  const ref: any = useRef(null);

  const scroll = (ratio: any) => {
    const currentScrollLeft = ref.current.scrollLeft;
    ref.current.scrollLeft += ratio;

    if (ratio > 0 && !rightButtonClicked) {
      setRightButtonClicked(true);
    }

    if (ratio < 0 && rightButtonClicked && ref.current.scrollLeft <= 0) {
      setRightButtonClicked(false);
    }
  };

  useEffect(() => {
    function updateState() {
      const el = ref.current;
      el &&
        setHasScrollBar(el.scrollWidth > el.getBoundingClientRect().width + 50);
    }
    updateState();
    window.addEventListener("resize", updateState);
    return () => window.removeEventListener("resize", updateState);
  }, [products]);

  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  return (
    <div className="container-fluid home-full-width">
      <div className="Horizontal-row">
        <div className="Horizontal-Heading1 mt-3">{title}</div>
        <div className="Horizontal-row">
          <div
            className="Horizontal-viewButton"
            onClick={() =>
              navigation.push(
                `/products/view?type=featured&position=${position}`
              )
            }
          >
            See More
          </div>
        </div>
      </div>
      <div style={{ margin: 5 }} />
      <div className="Horizontal-Pscroll position-relative">
        <Row
          className="flex-parent mx-0 gap-2 gap-md-3 ps-2 ps-md-0"
          style={{
            flexWrap: "nowrap",
            overflowX: "auto",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
          }}
          ref={ref}
        >
          {Array.isArray(products)
            ? products?.map((prod: any, index: number) => {
                return (
                  <Col sm="4" md="3" className="col-6 px-0 lg-25" key={index}>
                    <ProductItem item={prod} />
                  </Col>
                );
              })
            : null}
        </Row>
        {hasScrollBar ? (
          <>
            {rightButtonClicked && (
              <button
                className="Horizontal-btn1 position-absolute slider-btn-left"
                onClick={() => scroll(-800)}
              >
                <MdArrowBack />
              </button>
            )}
            <button
              className="Horizontal-btn2 slider-btn-right position-absolute"
              onClick={() => scroll(800)}
            >
              <MdOutlineArrowForward />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default FeaturedPosition;

