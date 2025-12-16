import { useEffect, useRef, useState } from "react";
import ProductItem from "../../../../components/productItem/page";
import { MdArrowBack, MdOutlineArrowForward } from "react-icons/md";
import React from "react";
import { useRouter } from "next/navigation";
// import { useNavigate } from "react-router-dom";
function PopularItems(props: any) {
  const [Recent, setRecent] = useState([]);
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
  }, [Recent]);

  function updateState() {
    const el = ref.current;
    el && setHasScrollBar(el.scrollWidth > el.getBoundingClientRect().width);
  }

  return (
    <div className="container-fluid home-full-width">
      <div className="Horizontal-row">
        <div className="Horizontal-Heading1 mt-3">{props?.title}</div>
        <div className="Horizontal-row">
          <div
            className="Horizontal-viewButton"
            onClick={() =>
              navigation.push(
                `/products/view?${props?.type ? `type=${props?.type}` : ""}`
              )
            }
          >
            See More
          </div>
        </div>
      </div>
      <div style={{ margin: 5 }} />
      <div className="Horizontal-Pscroll position-relative">
        <div className="popularItems-row flex-parent" ref={ref}>
          {Array.isArray(props?.data)
            ? props?.data?.map((prod: any, index: number) => {
                return (
                  <div className="popularItems-card" key={index}>
                    <ProductItem item={prod} />
                  </div>
                );
              })
            : null}
        </div>
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
export default PopularItems;
