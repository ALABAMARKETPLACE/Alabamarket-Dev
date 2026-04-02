"use client";
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import "./categoryNav.scss";
import { reduxCategoryItems } from "@/redux/slice/categorySlice";
import { setSideMenuOpen } from "@/redux/slice/layoutSlice";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import dynamic from "next/dynamic";

const HamburgerIcon = dynamic(() => import("./HamburgerIcon"), { ssr: false });

type SubCategory = {
  id?: string | number;
  _id?: string | number;
  name?: string;
};

type Category = {
  id?: string | number;
  _id?: string | number;
  name?: string;
  sub_categories?: SubCategory[];
};

function CategoryNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const categories = useSelector(reduxCategoryItems) as Category[];
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update scroll arrow visibility
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, categories]);

  // Clear active highlight when leaving the category page
  useEffect(() => {
    if (!pathname?.startsWith("/category")) {
      setActiveId(null);
    }
  }, [pathname]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  const normalizedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories
      .map((cat) => {
        const idRaw = cat?.id ?? cat?._id;
        const categoryId = idRaw == null ? null : String(idRaw);
        const name = typeof cat?.name === "string" ? cat.name : "";
        const subs: SubCategory[] = Array.isArray(cat?.sub_categories) ? cat.sub_categories : [];
        return { categoryId, name, subs };
      })
      .filter((item) => Boolean(item.categoryId && item.name));
  }, [categories]);

  const handleCategoryClick = (categoryId: string, name: string) => {
    if (!categoryId) return;
    setActiveId(categoryId);
    setHoveredId(null);
    const encodedId = typeof window !== "undefined" ? window.btoa(categoryId) : categoryId;
    const cleanName = name.replace(/\s*line\s*$/i, "");
    router.push(
      `/category/${categoryId}?id=${encodedId}&type=${encodeURIComponent(cleanName)}&categoryId=${encodeURIComponent(categoryId)}`
    );
  };

  const handleSubCategoryClick = (
    e: React.MouseEvent,
    subId: string,
    subName: string,
    parentId: string,
    parentName: string
  ) => {
    e.stopPropagation();
    setActiveId(parentId);
    setHoveredId(null);
    const encodedSub = typeof window !== "undefined" ? window.btoa(subId) : subId;
    const cleanParent = parentName.replace(/\s*line\s*$/i, "");
    router.push(
      `/category/${subId}?id=${encodedSub}&type=${encodeURIComponent(subName)}&categoryId=${encodeURIComponent(parentId)}&ogCategory=${encodeURIComponent(parentId)}`
    );
  };

  const handleMouseEnter = (categoryId: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredId(categoryId);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredId(null), 120);
  };

  if (!normalizedCategories.length) return null;

  return (
    <div className="catnav-wrapper">
      <div className="catnav-inner">

        {/* All Categories trigger */}
        <button
          className="catnav-all-btn"
          onClick={onOpenMenu || (() => dispatch(setSideMenuOpen(true)))}
          aria-label="All categories"
        >
          <HamburgerIcon onClick={() => {}} />
          <span className="catnav-all-label">All</span>
        </button>

        <div className="catnav-divider" />

        {/* Left scroll arrow */}
        <button
          className={`catnav-arrow catnav-arrow--left ${canScrollLeft ? "catnav-arrow--visible" : ""}`}
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          tabIndex={-1}
        >
          <HiChevronLeft size={18} />
        </button>

        {/* Scrollable category list */}
        <div className="catnav-scroll-track" ref={scrollRef}>
          {normalizedCategories.map(({ categoryId, name, subs }) => {
            const cleanName = name.replace(/\s*line\s*$/i, "");
            const isActive = activeId === categoryId;
            const isHovered = hoveredId === categoryId;
            const hasSubs = subs.length > 0;

            return (
              <div
                key={String(categoryId)}
                className={`catnav-item ${isActive ? "catnav-item--active" : ""}`}
                onClick={() => handleCategoryClick(String(categoryId), cleanName)}
                onMouseEnter={() => hasSubs && handleMouseEnter(String(categoryId))}
                onMouseLeave={hasSubs ? handleMouseLeave : undefined}
              >
                <span className="catnav-item-label">{cleanName}</span>
                {hasSubs && <span className="catnav-item-chevron">›</span>}

                {/* Subcategory dropdown */}
                {hasSubs && isHovered && (
                  <div
                    className="catnav-dropdown"
                    onMouseEnter={() => handleMouseEnter(String(categoryId))}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="catnav-dropdown-heading">{cleanName}</div>
                    {subs.map((sub) => {
                      const subId = String(sub?.id ?? sub?._id ?? "");
                      const subName = typeof sub?.name === "string" ? sub.name : "";
                      if (!subId || !subName) return null;
                      return (
                        <div
                          key={subId}
                          className="catnav-dropdown-item"
                          onClick={(e) =>
                            handleSubCategoryClick(e, subId, subName, String(categoryId), cleanName)
                          }
                        >
                          {subName}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right scroll arrow */}
        <button
          className={`catnav-arrow catnav-arrow--right ${canScrollRight ? "catnav-arrow--visible" : ""}`}
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          tabIndex={-1}
        >
          <HiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default CategoryNav;
