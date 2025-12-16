"use client";
import React, { useEffect, useMemo } from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import "./style.scss";
import { useRouter } from "next/navigation";


function ExploreAll() {
  const Category = useSelector((state: any) => state?.Category?.categries);
  const router = useRouter();
  const categories = useMemo(() => {
    if (Array.isArray(Category)) {
      return Category?.map((item: any) => ({
        id: item?.id,
        description: item?.description,
        image: item?.image,
        name: item?.name,
        slug: item?.slug,
      }));
    }
    return [];
  }, [Category]);
  const subcategories = useMemo(() => {
    const subcategory: any[] = [];
    if (Array.isArray(Category)) {
      for (const categ of Category) {
        if (Array.isArray(categ?.sub_categories)) {
          for (const subc of categ?.sub_categories) {
            subcategory.push({
              id: subc?._id,
              description: subc?.description,
              image: subc?.image,
              name: subc?.name,
              slug: subc?.slug,
            });
          }
        }
      }
    }
    return subcategory;
  }, [Category]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="Screen-box py-2">
      <div className="Horizontal-Heading1 mt-3">Explore All Categories</div>
      <Row className="gy-3 mt-md-3 mx-0">
        {categories?.map((item: any) => (
          <Col className="col-6 ps-md-0" md="3">
            <div
              className="d-flex gap-2 border rounded h-100 p-2 explore-all-card-container"
              onClick={() => {
                router.push(
                  `/category/category?ogCategory=${
                    item.id
                  }&type=${encodeURIComponent(item?.name)}`
                );
              }}
            >
              <img
                src={item?.image}
                alt={item?.name}
                className="expolore-all-image rounded-circle"
              />
              <div className="py-2">
                <h5 className="explore-all-card-title">{item?.name}</h5>
              </div>
            </div>
          </Col>
        ))}
      </Row>
      <div className="Horizontal-Heading1 mt-3">Discover More..</div>
      <Row className="gy-3 mt-md-2 mx-0">
        {subcategories?.map((item: any) => (
          <Col className="col-6 ps-0" md="3">
            <div
              className="d-flex gap-2 border rounded h-100 p-2 explore-all-card-container"
              onClick={() => {
                router.push(
                  `/category/${item?.slug}?id=${window.btoa(
                    item.id
                  )}&type=${encodeURIComponent(item?.name)}`
                );
              }}
            >
              <img
                src={item?.image}
                alt={item?.name}
                className="expolore-all-image rounded-circle"
              />
              <div className="py-2">
                <h5 className="explore-all-card-title">{item?.name}</h5>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default ExploreAll;
