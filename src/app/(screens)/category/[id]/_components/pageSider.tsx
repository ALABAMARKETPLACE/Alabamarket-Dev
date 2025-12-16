"use client";
import { useSearchParams, useRouter } from "next/navigation";
import React from "react";
import { useSelector } from "react-redux";

const PageSider = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const Category = useSelector((state: any) => state.Category.categries);
  const CategoryLink = (
    categoryId: string,
    categoryName: string,

    slug: string
  ) => {
    const encodedCategoryId = window.btoa(categoryId);
    const path = `/category/${slug}?id=${encodedCategoryId}&type=${encodeURIComponent(
      categoryName
    )}`;
    router.push(path);
  };

  return (
    <div>
      {Category?.map((item: any, idx: number) => {
        return (
          <div key={idx}>
            {item?.sub_categories?.map((subCat: any, i: number) => {
              return (
                <div
                  key={i}
                  onClick={() =>
                    CategoryLink(subCat._id, subCat.name, subCat?.slug)
                  }
                  className={`productByCat-PageSiderItem ${
                    window.atob(searchParams.get("id") ?? "") == subCat?._id
                      ? "active"
                      : ""
                  }`}
                >
                  <div>
                    <img src={subCat?.image} className="productByCat-img" />
                  </div>
                  <div
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {subCat?.name}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
export default PageSider;
