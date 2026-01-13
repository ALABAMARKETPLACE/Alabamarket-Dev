"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import "./categoryNav.scss";
import { reduxCategoryItems } from "@/redux/slice/categorySlice";
import { setSideMenuOpen } from "@/redux/slice/layoutSlice";
import dynamic from "next/dynamic";

const HamburgerIcon = dynamic(() => import("./HamburgerIcon"), { ssr: false });

function CategoryNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const categories = useSelector(reduxCategoryItems);
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

  const handleCategoryClick = (category: any) => {
    // Use 'id' field instead of '_id'
    const categoryId = category?.id || category?._id;

    if (!category || !categoryId) {
      console.warn("[CategoryNav] Category missing id:", category);
      return;
    }

    // Remove " Line" suffix from category name if present
    const cleanCategoryName = category.name.replace(/\s*line\s*$/i, "");

    console.log(
      `[CategoryNav] Navigating to category: ${cleanCategoryName} (id: ${categoryId})`
    );

    const encodedId =
      typeof window !== "undefined" ? window.btoa(categoryId) : categoryId;

    // Pass both the category ID and the clean name
    const navUrl = `/category/${categoryId}?id=${encodedId}&type=${encodeURIComponent(
      cleanCategoryName
    )}&categoryId=${encodeURIComponent(categoryId)}`;

    router.push(navUrl);
  };

  if (!categories || categories.length === 0) {
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
            {categories.map((category: any, index: number) => (
              <div
                key={index}
                className={"category-line-item beautiful small-card"}
                onClick={() => handleCategoryClick(category)}
                style={{ cursor: "pointer", position: "relative" }}
                title={category.name}
              >
                <div className="category-line-label">{category.name}</div>
                <div className="category-line-decor" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryNav;
