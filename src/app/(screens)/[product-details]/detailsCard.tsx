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
import { formatGAItem, trackViewItem } from "@/utils/analytics";

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
          pid={props?.params?.pid}
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
      params.delete("pid");
      params.delete("review");
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
    <div className="page-Box pt-3 pb-5">
      <Container>
        <Row>
          <Col sm={6} md={6} xs={12} lg={5}>
            <Images
              coverImage={defaultImage}
              images={props?.data?.productImages}
              product_video={props?.data?.product_video}
            />
          </Col>
          <Col md={6} xs={12} lg={7}>
            <h1 className="pd-title">
              {props?.data?.name} {getVariantCurrentName()}
            </h1>
            {props?.data?.brand && (
              <div className="pd-brand">{props?.data?.brand?.toUpperCase()}</div>
            )}
            {props?.data?.description && (
              <p className="pd-short-desc">{props?.data?.description}</p>
            )}
            <div className="pd-rating-row">
              {props?.data?.averageRating ? (
                <span className="pd-rating-score">
                  {Number(props?.data?.averageRating).toFixed(1)}
                </span>
              ) : null}
              <Rate
                disabled
                allowHalf
                value={Number(props?.data?.averageRating)}
                style={{ fontSize: 14 }}
              />
              <span className="pd-rating-count">
                {props?.data?.averageRating
                  ? `${props?.data?.averageRating} Ratings`
                  : "No Ratings"}
              </span>
            </div>
            {props?.data?.storeDetails?.store_name && (
              <div className="pd-seller">
                Sold by&nbsp;
                <span className="pd-seller-name">
                  {props?.data?.storeDetails?.store_name}
                </span>
              </div>
            )}
            <hr className="pd-divider" />
            {/* <Description
              data={props?.data}
              currentVariant={currentVariant}
              handleBuyNow={handleBuyNow}
            /> */}
            <Tabs
              defaultActiveKey={"1"}
              // defaultActiveKey={searchParams?.get("review") ?? "1"}
              items={items}
              onChange={onChange}
              className="ps-0"
            />
            {props?.data?.productVariant?.length > 0 && (
              <>
                <Variants
                  productVariant={props?.data?.productVariant}
                  currentVariant={currentVariant}
                  changeVaraintId={onChangeVariantId}
                />
                <hr />
              </>
            )}
            {stripTags(props?.data?.specifications)?.trim().length > 0 ? (
              <div className="pd-specs-section">
                <div className="pd-specs-header">More Details</div>
                <p className="pd-specs-text">
                  {showFullText
                    ? stripTags(props?.data?.specifications)
                    : `${stripTags(props?.data?.specifications).substring(0, 150)}…`}
                </p>
                <button className="pd-specs-toggle" onClick={toggleText}>
                  {showFullText ? "Read Less ↑" : "Read More ↓"}
                </button>
              </div>
            ) : null}

            {/* <div
              style={{
                fontSize: "8px !important",
                backgroundColor: "red",
              }}
            >
              <div
                style={{
                  fontSize: "inherit",
                }}
                dangerouslySetInnerHTML={{
                  __html: props?.data?.specifications,
                }}
              />
            </div> */}
            {/* <hr /> */}
            {/* <Reviews data={props?.data} /> */}
          </Col>
        </Row>
        <RelatedProducts data={props?.data} />
      </Container>
    </div>
  );
}
export default DetailsCard;
