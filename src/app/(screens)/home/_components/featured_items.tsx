import React, { useEffect, useRef, useState } from "react";
import FeaturedItem from "../../../../components/featured_item";
import { Col, Container, Row } from "react-bootstrap";
import { MdArrowBack, MdOutlineArrowForward } from "react-icons/md";
import API from "../../../../config/API";
import { GET } from "../../../../util/apicall";
// import offers from './offers.json';

function FeaturedItems() {
  const [hasScrollBar, setHasScrollBar] = useState(true);
  const [rightButtonClicked, setRightButtonClicked] = useState(false);
  const [categories, setCategories] = useState([]);
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
  //   useEffect(() => {
  //     function updateState() {
  //       const el = ref.current;
  //       el &&
  //         setHasScrollBar(el.scrollWidth > el.getBoundingClientRect().width + 50);
  //     }
  //     updateState();
  //     window.addEventListener("resize", updateState);
  //     return () => window.removeEventListener("resize", updateState);
  //   }, []);
  const getFeatured = async () => {
    const url = API.CATEGORY_FEATURED;
    try {
      const categories: any = await GET(url);
      if (categories?.status) {
        setCategories(categories?.data);
      } else {
      }
    } catch (err) {}
  };
  useEffect(() => {
    getFeatured();
  }, []);
  // --- OUR TOP OFFERS SECTION (commented out) ---
  /*
  return (
    <Container fluid className="home-full-width">
      {categories?.length ? (
        <div>
          <div className="Horizontal-Heading1 mt-3">Our Top Offers</div>
          <div className="Horizontal-Pscroll position-relative">
            <Row
              className="flex-parent mx-0 ps-2 ps-md-0"
              style={{
                flexWrap: "nowrap",
                overflowX: "auto",
                scrollBehavior: "smooth",
                scrollbarWidth: "none",
              }}
              ref={ref}
            >
              {Array.isArray(categories)
                ? categories?.map((prod: any, index: number) => {
                    return (
                      <div
                        className="col-12 col-xsm-6 col-sm-4 col-md-3 banner ps-0"
                        key={index}
                      >
                        <FeaturedItem data={prod} />
                      </div>
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
      ) : null}
    </Container>
  );
  */
  return null;
}

export default FeaturedItems;
