"use client";
import React from "react";
import { Col, Row } from "react-bootstrap";
import ProductItem from "@/components/productItem/page";

type Props = {
  data: any;
};

function RelatedProducts({ data }: Props) {
  const relatedProducts = Array.isArray(data?.relatedProducts)
    ? data.relatedProducts
    : [];

  if (!relatedProducts.length) {
    return null;
  }

  return (
    <div>
      <h4>You might also like...</h4>
      <Row>
        {relatedProducts.map((item: any) => (
          <Col
            sm="4"
            md="3"
            className="px-2 py-2 col-6 lg-25"
            key={item?._id ?? item?.id ?? item?.slug}
          >
            <ProductItem item={item} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default RelatedProducts;
