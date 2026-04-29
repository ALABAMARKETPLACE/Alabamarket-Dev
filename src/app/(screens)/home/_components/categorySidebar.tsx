"use client";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { reduxCategoryItems } from "@/redux/slice/categorySlice";
import { IoChevronForward } from "react-icons/io5";
import "./categorySidebar.scss";

type FlyoutState = {
  cat: any;
  top: number;
  left: number;
  maxH: number;
} | null;

export default function CategorySidebar() {
  const categories = useSelector(reduxCategoryItems) as any[];
  const router = useRouter();
  const sidebarRef = useRef<HTMLElement>(null);
  const [flyout, setFlyout] = useState<FlyoutState>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelLeave = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  };

  const onRowEnter = (e: React.MouseEvent<HTMLDivElement>, cat: any) => {
    cancelLeave();
    const hasSubs = Array.isArray(cat.sub_categories) && cat.sub_categories.length > 0;
    if (!hasSubs) { setFlyout(null); return; }

    const row = e.currentTarget.getBoundingClientRect();
    const sbRight = sidebarRef.current?.getBoundingClientRect().right ?? row.right;

    const MARGIN = 12;
    const MAX_H = 400;
    const maxH = Math.min(MAX_H, window.innerHeight - MARGIN * 2);

    // Start aligned to the hovered row, then nudge up if it would overflow the bottom
    let top = row.top;
    if (top + maxH > window.innerHeight - MARGIN) {
      top = window.innerHeight - MARGIN - maxH;
    }
    if (top < MARGIN) top = MARGIN;

    setFlyout({ cat, top, left: sbRight + 6, maxH });
  };

  const onRowLeave = () => {
    leaveTimer.current = setTimeout(() => setFlyout(null), 140);
  };

  const go = (path: string) => {
    setFlyout(null);
    router.push(path);
  };

  const catPath = (cat: any) => {
    const id = String(cat._id ?? cat.id ?? "");
    const name = (cat.name ?? "").replace(/\s*line\s*$/i, "");
    const enc = typeof window !== "undefined" ? window.btoa(id) : id;
    return `/category/${id}?id=${enc}&type=${encodeURIComponent(name)}&categoryId=${encodeURIComponent(id)}`;
  };

  const subPath = (sub: any) => {
    const id = String(sub._id ?? sub.id ?? "");
    const enc = typeof window !== "undefined" ? window.btoa(id) : id;
    return `/category/${sub.slug ?? id}?id=${enc}&type=${encodeURIComponent(sub.name ?? "")}`;
  };

  if (!categories?.length) return null;

  const flyoutEl = flyout && typeof document !== "undefined"
    ? createPortal(
        <div
          className="cat-sidebar-flyout"
          style={{ top: flyout.top, left: flyout.left, maxHeight: flyout.maxH }}
          onMouseEnter={cancelLeave}
          onMouseLeave={onRowLeave}
        >
          <div className="cat-flyout-title">
            {(flyout.cat.name ?? "").replace(/\s*line\s*$/i, "")}
          </div>
          <div className="cat-flyout-grid">
            {flyout.cat.sub_categories.map((sub: any) => (
              <div
                key={String(sub._id ?? sub.id ?? sub.name)}
                className="cat-flyout-item"
                onClick={() => go(subPath(sub))}
              >
                {sub.name}
              </div>
            ))}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <aside className="cat-sidebar" ref={sidebarRef}>
        <div className="cat-sidebar-heading">All Categories</div>
        <ul className="cat-sidebar-list">
          {categories.map((cat: any) => {
            const id = String(cat._id ?? cat.id ?? "");
            const name = (cat.name ?? "").replace(/\s*line\s*$/i, "");
            const hasSubs = Array.isArray(cat.sub_categories) && cat.sub_categories.length > 0;
            const isOpen = flyout?.cat === cat;

            return (
              <li key={id} className={`cat-sidebar-item${isOpen ? " is-open" : ""}`}>
                <div
                  className="cat-sidebar-row"
                  onMouseEnter={(e) => onRowEnter(e, cat)}
                  onMouseLeave={onRowLeave}
                  onClick={() => go(catPath(cat))}
                >
                  {cat.image ? (
                    <img src={cat.image} alt={name} className="cat-sidebar-img" loading="lazy" />
                  ) : (
                    <div className="cat-sidebar-img-fallback">
                      {name[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <span className="cat-sidebar-name">{name}</span>
                  {hasSubs && <IoChevronForward size={13} className="cat-sidebar-arrow" />}
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      {flyoutEl}
    </>
  );
}
