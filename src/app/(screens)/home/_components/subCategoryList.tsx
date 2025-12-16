import React from "react";
import "../style.scss";
// import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import {
  IoArrowBackCircleOutline,
  IoArrowForwardCircleOutline,
} from "react-icons/io5";
import { MdArrowBack, MdOutlineArrowForward } from "react-icons/md";
import { useRouter } from "next/navigation";
function SubCategoryList(props: any) {
  const router = useRouter();
  const [hasScrollBar, setHasScrollBar] = useState(false);
  const [rightButtonClicked, setRightButtonClicked] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const scroll = (ratio: number) => {
    if (ref.current) {
      const currentScrollLeft = ref.current.scrollLeft;
      ref.current.scrollLeft += ratio;

      if (ratio > 0 && !rightButtonClicked) {
        setRightButtonClicked(true);
      }

      if (ratio < 0 && rightButtonClicked && ref.current.scrollLeft <= 0) {
        setRightButtonClicked(false);
      }
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
  }, []);

  function updateState() {
    const el = ref.current;
    el && setHasScrollBar(el.scrollWidth > el.getBoundingClientRect().width);
  }

  return (
    <div className="category-strip-wrapper">
      <div className=" position-relative">
        <div className="category-strip position-relative" ref={ref}>
          {props?.data?.map((item: any, index: number) => (
            <div
              key={index}
              className="category-strip-item"
              onClick={() => {
                router.push(
                  `/category/${item?.slug}?id=${window.btoa(
                    item._id
                  )}&type=${encodeURIComponent(item?.name)}`
                );
              }}
            >
              <div className="category-strip-thumb">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="category-strip-label" title={item.name}>
                {item.name}
              </div>
            </div>
          ))}
        </div>
        <>
          {rightButtonClicked && (
            <button
              className="Horizontal-btn1 position-absolute slider-btn-left"
              style={{ marginTop: 10 }}
              onClick={() => scroll(-500)}
            >
              <MdArrowBack />
            </button>
          )}
          <button
            className="Horizontal-btn2 slider-btn-right position-absolute"
            style={{ marginTop: 10 }}
            onClick={() => scroll(500)}
          >
            <MdOutlineArrowForward />
          </button>
        </>
      </div>
    </div>
  );
}

export default SubCategoryList;
