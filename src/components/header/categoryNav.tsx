"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { MdArrowBack, MdOutlineArrowForward } from "react-icons/md";
import "./categoryNav.scss";
import { reduxCategoryItems } from "@/redux/slice/categorySlice";

function CategoryNav() {
  const router = useRouter();
  const categories = useSelector(reduxCategoryItems);
  const [hasLeftScroll, setHasLeftScroll] = useState(false);
  const [hasRightScroll, setHasRightScroll] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setTimeout(() => checkScroll(), 100);
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setHasLeftScroll(scrollLeft > 0);
      setHasRightScroll(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 300;
      containerRef.current.scrollLeft +=
        direction === "left" ? -scrollAmount : scrollAmount;
      setTimeout(checkScroll, 100);
    }
  };

  const handleCategoryClick = (category: any) => {
    if (!category || !category._id) {
      console.warn("[CategoryNav] Category missing _id:", category);
      return;
    }
    // Always use _id for the dynamic route and query for reliability
    const encodedId =
      typeof window !== "undefined" ? window.btoa(category._id) : category._id;
    const navUrl = `/category/${
      category._id
    }?id=${encodedId}&type=${encodeURIComponent(
      category.name
    )}&ogCategory=${encodeURIComponent(category.name)}`;
    router.push(navUrl);
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="category-nav-wrapper">
      <div className="category-nav-container">
        {/* Removed arrow outside scroll area */}

        <div className="category-lines-scroll position-relative">
          {/* Only one set of arrows will be shown below */}
          <div
            className="category-lines-container"
            ref={containerRef}
            onScroll={checkScroll}
          >
            {categories.map((category: any, index: number) => (
              <div
                key={index}
                className={"category-line-item beautiful small-card"}
                onClick={() => handleCategoryClick(category)}
                style={{ cursor: "pointer" }}
                title={category.name.replace(/\s*line$/i, "")}
              >
                <div className="category-line-label">
                  {category.name.replace(/\s*line$/i, "")}
                </div>
                <div className="category-line-decor" />
              </div>
            ))}
          </div>
          {isMounted && hasLeftScroll && (
            <button
              className="Horizontal-btn1 position-absolute slider-btn-left"
              style={{ top: 58, left: 0, zIndex: 2 }}
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              <MdArrowBack size={10} />
            </button>
          )}
          {isMounted && hasRightScroll && (
            <button
              className="Horizontal-btn2 slider-btn-right position-absolute"
              style={{ top: 58, right: 0, zIndex: 2 }}
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              <MdOutlineArrowForward size={10} />
            </button>
          )}
        </div>

        {/* Removed duplicate arrow set */}
      </div>
    </div>
  );
}

export default CategoryNav;
