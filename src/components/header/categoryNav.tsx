"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import "./categoryNav.scss";
import { reduxCategoryItems } from "@/redux/slice/categorySlice";
import { setSideMenuOpen } from "@/redux/slice/layoutSlice";
import dynamic from "next/dynamic";

const HamburgerIcon = dynamic(() => import("./HamburgerIcon"), { ssr: false });

type Category = {
  id?: string | number;
  _id?: string | number;
  name?: string;
};

function CategoryNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const categories = useSelector(reduxCategoryItems) as Category[];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Auto-scroll functionality
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isAutoScrolling) return;

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        if (container && isAutoScrolling) {
          // Check if we've reached the end
          if (
            container.scrollLeft >=
            container.scrollWidth - container.clientWidth - 10
          ) {
            // Reset to beginning
            container.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            // Scroll right
            container.scrollBy({ left: 150, behavior: "smooth" });
          }
        }
      }, 3000); // Scroll every 3 seconds
    };

    startAutoScroll();

    // Pause on hover
    const onMouseEnter = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      setIsAutoScrolling(false);
    };

    const onMouseLeave = () => {
      setIsAutoScrolling(true);
    };

    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [isAutoScrolling, categories]);

  const normalizedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories
      .map((category) => {
        const categoryIdRaw = category?.id ?? category?._id;
        const categoryId =
          categoryIdRaw === undefined || categoryIdRaw === null
            ? null
            : String(categoryIdRaw);
        const name = typeof category?.name === "string" ? category.name : "";
        return { categoryId, name };
      })
      .filter((item) => Boolean(item.categoryId && item.name));
  }, [categories]);

  const handleCategoryClick = (categoryId: string, name: string) => {
    if (!categoryId) return;

    const encodedId =
      typeof window !== "undefined" ? window.btoa(categoryId) : categoryId;

    const cleanCategoryName = name.replace(/\s*line\s*$/i, "");

    router.push(
      `/category/${categoryId}?id=${encodedId}&type=${encodeURIComponent(
        cleanCategoryName,
      )}&categoryId=${encodeURIComponent(categoryId)}`,
    );
  };

  if (!normalizedCategories.length) {
    return null;
  }

  return (
    <div className="category-nav-wrapper">
      <div className="category-nav-container">
        <div style={{ marginRight: 8 }}>
          <HamburgerIcon
            onClick={onOpenMenu || (() => dispatch(setSideMenuOpen(true)))}
          />
        </div>

        <div className="category-lines-scroll" ref={containerRef}>
          <div className="category-lines-container">
            {normalizedCategories.map(({ categoryId, name }) => {
              const cleanCategoryName = name.replace(/\s*line\s*$/i, "");
              return (
                <div
                  key={String(categoryId)}
                  className="category-line-item beautiful small-card"
                  onClick={() =>
                    handleCategoryClick(String(categoryId), cleanCategoryName)
                  }
                  style={{ cursor: "pointer", position: "relative" }}
                  title={cleanCategoryName}
                >
                  <div className="category-line-label">{cleanCategoryName}</div>
                  <div className="category-line-decor" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryNav;
