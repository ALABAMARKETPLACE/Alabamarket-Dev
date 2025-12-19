"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Images from "./_components/images";
import { Rate, Tabs } from "antd";
import Description from "./_components/description";
import Variants from "./_components/variants";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { findVariantWithId } from "./_components/functions";
import { useSession } from "next-auth/react";
import Reviews from "./_components/reviews";
import RelatedProducts from "./_components/relatedProducts";
import "./style.scss";

function DetailsCard(props: any) {
  //to-do
  //functionality of cart,buy now,favourite
  //functionality of react slick in image
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session }: any = useSession();
  const [showFullText, setShowFullText] = useState(false);

  //constant values
  const vid = searchParams.get("vid");
  //states
  const [currentVariant, setCurrentVariant] = useState<any>({});
  const [defaultImage, setDefaultImage] = useState<string>(props?.data?.image);
  //functions
  useEffect(() => {
    if (props?.data && props?.data?.productVariant?.length) {
      const variantData = findVariantWithId(props?.data?.productVariant, vid);
      if (!variantData) {
        setDefaultImage(props?.data?.image);
      } else {
        setCurrentVariant(variantData);
        setDefaultImage(variantData?.image || props?.data?.image);
      }
    }
  }, [props?.data, vid]);
  const onChange = (key: string) => {};
  const handleBuyNow = (val: any) => {
    if (session?.token) {
    } else {
      router?.push("/login");
    }
  };
  const toggleText = () => {
    setShowFullText(!showFullText);
  };
  const items = [
    {
      key: "1",
      label: "About the product",
      children: (
        <Description
          data={props?.data}
          currentVariant={currentVariant}
          handleBuyNow={handleBuyNow}
        />
      ),
    },
    {
      key: "2",
      label: "Reviews",
      children: <Reviews data={props?.data} />,
    },
  ];
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );
  const onChangeVariantId = (val: any) => {
    router.replace(pathname + "?" + createQueryString("vid", String(val)), {
      scroll: false,
    });
  };

  const getVariantCurrentName = () => {
    if (!currentVariant || !currentVariant.combination) return "";
    return currentVariant.combination.map((item: any) => item.value).join(" ");
  };
  const stripTags = (html: string) => {
    if (typeof window === "undefined") {
      return html?.replace(/<[^>]*>/g, "") || "";
    }

    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  return (
    <div className="product-details-page">
      <Container>
        <Row className="product-details-container g-4">
          {/* Product Images Section */}
          <Col sm={6} md={6} xs={12} lg={5}>
            <div className="product-images-wrapper">
              <Images
                coverImage={defaultImage}
                images={props?.data?.productImages}
                product_video={props?.data?.product_video}
              />
            </div>
          </Col>

          {/* Product Information Section */}
          <Col md={6} xs={12} lg={7}>
            <div className="product-info-wrapper">
              {/* Brand Badge */}
              {props?.data?.brand && (
                <div className="product-brand-badge">
                  {props?.data?.brand?.toUpperCase()}
                </div>
              )}

              {/* Product Title */}
              <h1 className="product-title">
                {props?.data?.name} {getVariantCurrentName()}
              </h1>

              {/* Rating Section */}
              <div className="product-rating-section">
                <div className="rating-display">
                  {props?.data?.averageRating ? (
                    <span className="rating-value">
                      {Number(props?.data?.averageRating).toFixed(1)}
                    </span>
                  ) : null}
                  <Rate
                    disabled
                    allowHalf
                    value={Number(props?.data?.averageRating)}
                    className="rating-stars"
                  />
                  <span className="rating-count">
                    ({props?.data?.averageRating || "No"} ratings)
                  </span>
                </div>
              </div>

              {/* Short Description */}
              {props?.data?.description && (
                <div className="product-short-desc">
                  {props?.data?.description}
                </div>
              )}

              {/* Seller Information */}
              <div className="product-seller-info">
                <span className="seller-label">Sold by:</span>
                <span className="seller-name">
                  {props?.data?.storeDetails?.store_name || "Alabamarket"}
                </span>
              </div>

              {/* Variants Section */}
              {props?.data?.productVariant?.length > 0 && (
                <div className="product-variants-section">
                  <div className="variants-title">Choose Options:</div>
                  <Variants
                    productVariant={props?.data?.productVariant}
                    currentVariant={currentVariant}
                    changeVaraintId={onChangeVariantId}
                  />
                </div>
              )}

              {/* Description Component with CTA */}
              <div className="product-description-component">
                <Description
                  data={props?.data}
                  currentVariant={currentVariant}
                  handleBuyNow={handleBuyNow}
                />
              </div>

              {/* Details Tabs */}
              <div className="product-details-tabs">
                <Tabs
                  defaultActiveKey={"1"}
                  items={items}
                  onChange={onChange}
                  className="product-tabs"
                />
              </div>

              {/* Extended Specifications */}
              {stripTags(props?.data?.specifications)?.trim().length > 0 ? (
                <div className="product-specifications-section">
                  <div className="specifications-title">Key Specifications</div>
                  <p className="specifications-content">
                    {showFullText
                      ? stripTags(props?.data?.specifications)
                      : `${stripTags(props?.data?.specifications).substring(
                          0,
                          150
                        )}...`}
                  </p>
                  <button
                    className="btn-read-more"
                    onClick={toggleText}
                  >
                    {showFullText ? "Show Less ↑" : "Show More ↓"}
                  </button>
                </div>
              ) : null}
            </div>
          </Col>
        </Row>

        {/* Related Products Section */}
        <div className="product-related-section">
          <RelatedProducts data={props?.data} />
        </div>
      </Container>
    </div>
  );
}
export default DetailsCard;
