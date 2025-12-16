"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import Loading from "../../../../_components/loading";
import Error from "../../../../_components/error";
import { Button, Collapse, Image, Tag } from "antd";
import { Col, Row } from "react-bootstrap";

type UpdateReviewProps = {
  onBack?: () => void;
};

const UpdateReview = ({ onBack }: UpdateReviewProps) => {
  const params = useParams();
  const router = useRouter();
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<any>({
    queryKey: [API.PRODUCTS_GETONE_STORE + params.id],
    select: (res) => {
      if (res?.status) return res?.data;
      return null;
    },
  });

  if (isLoading) return <Loading />;
  if (isError) return <Error title={error?.message} />;

  return (
    <div className="product-update-section">
      <Collapse defaultActiveKey={["1"]} bordered={false}>
        <Collapse.Panel header="Product Information" key="1">
          <Row>
            {product &&
              Object.keys(product).map((key) => {
                if (
                  ["productImages", "productVariant", "image", "specifications"].includes(
                    key
                  )
                ) {
                  return null;
                }
                return (
                  <React.Fragment key={key}>
                    <Col className="col-5 py-1 text-capitalize">{key}</Col>
                    <Col className="col-7 py-1">
                      : {String(product[key] ?? "--")}
                    </Col>
                  </React.Fragment>
                );
              })}
          </Row>
        </Collapse.Panel>

        <Collapse.Panel header="Images" key="2">
          <Row>
            <Col md={3} className="mb-3">
              <Image width={"100%"} src={product?.image} />
            </Col>
            {Array.isArray(product?.productImages)
              ? product?.productImages.map((img: any) => (
                  <Col md={3} key={img?.id} className="mb-3">
                    <Image width={"100%"} src={img?.url} />
                  </Col>
                ))
              : null}
          </Row>
        </Collapse.Panel>

        <Collapse.Panel header="Variants" key="3">
          {Array.isArray(product?.productVariant) && product?.productVariant.length ? (
            <Row>
              {product.productVariant.map((variant: any) => (
                <Col md={3} key={variant?.id} className="mb-3">
                  <div className="product-update-variantCard">
                    <Image
                      width={"100%"}
                      height={160}
                      style={{ objectFit: "cover" }}
                      src={variant?.image}
                    />
                    <div className="pt-2 fw-semibold">{variant?.price}</div>
                    <div className="text-muted small">SKU: {variant?.sku}</div>
                    <div className="text-muted small">Units: {variant?.units}</div>
                    <div className="mt-2">
                      {variant?.combination?.map((combo: any) => (
                        <Tag bordered={false} key={`${variant?.id}-${combo?.value}`}>
                          {combo?.variant}: {combo?.value}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-muted">No variants available</div>
          )}
        </Collapse.Panel>
      </Collapse>

      <div className="product-update-actions mt-4">
        <Button
          size="large"
          block
          onClick={() => onBack?.()}
          className="product-update-actions__btn"
        >
          Back
        </Button>
        <Button
          size="large"
          block
          onClick={() => refetch()}
          className="product-update-actions__btn"
        >
          Refresh
        </Button>
        <Button
          type="primary"
          size="large"
          block
          onClick={() => router.replace("/auth/products")}
          className="product-update-actions__btn"
        >
          Finish
        </Button>
      </div>
    </div>
  );
};

export default UpdateReview;

