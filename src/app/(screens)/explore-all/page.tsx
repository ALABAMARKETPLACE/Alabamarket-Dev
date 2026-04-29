"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { IoHomeOutline, IoChevronForward, IoSearchOutline } from "react-icons/io5";
import { reduxCategoryItems } from "@/redux/slice/categorySlice";
import "./style.scss";

function ExploreAll() {
  const router   = useRouter();
  const rawCats  = useSelector(reduxCategoryItems) as any[];
  const [query,  setQuery] = useState("");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const categories = useMemo(() => {
    if (!Array.isArray(rawCats)) return [];
    return rawCats.map((cat: any) => ({
      id:   String(cat._id ?? cat.id ?? ""),
      name: (cat.name ?? "").replace(/\s*line\s*$/i, ""),
      image: cat.image ?? null,
      slug: cat.slug ?? null,
      subs: Array.isArray(cat.sub_categories)
        ? cat.sub_categories.map((s: any) => ({
            id:   String(s._id ?? s.id ?? ""),
            name: s.name ?? "",
            slug: s.slug ?? null,
          }))
        : [],
    }));
  }, [rawCats]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map(cat => ({
        ...cat,
        subs: cat.subs.filter((s: any) => s.name.toLowerCase().includes(q)),
      }))
      .filter(cat => cat.name.toLowerCase().includes(q) || cat.subs.length > 0);
  }, [categories, query]);

  const goCat = (cat: any) => {
    const enc = window.btoa(cat.id);
    router.push(`/category/${cat.id}?id=${enc}&type=${encodeURIComponent(cat.name)}&categoryId=${encodeURIComponent(cat.id)}`);
  };

  const goSub = (sub: any) => {
    const enc = window.btoa(sub.id);
    router.push(`/category/${sub.slug ?? sub.id}?id=${enc}&type=${encodeURIComponent(sub.name)}`);
  };

  const totalSubs = categories.reduce((n, c) => n + c.subs.length, 0);

  return (
    <div className="ea-page">

      {/* ── Header ── */}
      <div className="ea-header">
        <div className="ea-header-inner">
          <div className="ea-breadcrumb">
            <span className="ea-bc-item" onClick={() => router.push("/")}>
              <IoHomeOutline size={13} /> Home
            </span>
            <IoChevronForward size={11} className="ea-bc-sep" />
            <span className="ea-bc-item ea-bc-active">All Categories</span>
          </div>
          <div className="ea-title-row">
            <div>
              <h1 className="ea-title">All Categories</h1>
              <p className="ea-subtitle">
                {categories.length} categories · {totalSubs} subcategories
              </p>
            </div>
            <div className="ea-search-wrap">
              <IoSearchOutline size={16} className="ea-search-icon" />
              <input
                className="ea-search"
                type="text"
                placeholder="Search categories…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="ea-body">
        {filtered.length === 0 ? (
          <div className="ea-empty">
            <p>No categories match "<strong>{query}</strong>"</p>
          </div>
        ) : (
          <div className="ea-sections">
            {filtered.map(cat => (
              <div key={cat.id} className="ea-section">

                {/* Category row */}
                <div className="ea-cat-row" onClick={() => goCat(cat)}>
                  <div className="ea-cat-thumb">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="ea-cat-img" loading="lazy" />
                    ) : (
                      <div className="ea-cat-fallback">{cat.name[0]?.toUpperCase() ?? "?"}</div>
                    )}
                  </div>
                  <div className="ea-cat-info">
                    <span className="ea-cat-name">{cat.name}</span>
                    {cat.subs.length > 0 && (
                      <span className="ea-cat-count">{cat.subs.length} subcategories</span>
                    )}
                  </div>
                  <IoChevronForward size={15} className="ea-cat-arrow" />
                </div>

                {/* Subcategory chips */}
                {cat.subs.length > 0 && (
                  <div className="ea-subs">
                    {cat.subs.map((sub: any) => (
                      <button
                        key={sub.id}
                        className="ea-sub-chip"
                        onClick={() => goSub(sub)}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExploreAll;
