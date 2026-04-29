"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Images from "./_components/images";
import { Rate, Tabs } from "antd";
import Description from "./_components/description";
import Variants from "./_components/variants";
import Reviews from "./_components/reviews";
import RelatedProducts from "./_components/relatedProducts";
import { IoHomeOutline, IoChevronForward } from "react-icons/io5";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";
import { findVariantWithId } from "./_components/functions";
import { useSession } from "next-auth/react";
import "./style.scss";
import { formatGAItem, trackViewItem } from "@/utils/analytics";
import { getRatingInfo } from "@/util/ratingUtils";

function DetailsCard(props: any) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const { data: session }: any = useSession();
  const [showFullText, setShowFullText] = useState(false);

  const vid = searchParams.get("vid");
  const [currentVariant, setCurrentVariant] = useState<any>({});
  const [defaultImage,   setDefaultImage]   = useState<string>(props?.data?.image);

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

  useEffect(() => {
    const slug = props?.data?.slug;
    if (!slug) return;
    const url = vid ? `/${slug}?vid=${vid}` : `/${slug}`;
    window.history.replaceState(null, "", url);
  }, [props?.data?.slug, vid]);

  const productId  = props?.data?.pid || props?.params?.pid || "";
  const ratingInfo = (() => {
    const apiRating  = props?.data?.averageRating;
    const apiReviews = props?.data?.totalReviews;
    if (apiRating) return { rating: Number(apiRating), reviews: Number(apiReviews ?? 0) };
    return getRatingInfo(productId);
  })();

  const handleBuyNow = (val: any) => {
    if (!session?.token) router?.push("/login");
  };

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
    router.replace(pathname + "?" + createQueryString("vid", String(val)), { scroll: false });
  };

  const getVariantCurrentName = () => {
    if (!currentVariant || !currentVariant.combination) return "";
    return currentVariant.combination.map((item: any) => item.value).join(" ");
  };

  const stripTags = (html: string) => {
    if (typeof window === "undefined") return html?.replace(/<[^>]*>/g, "") || "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const storeSlug =
    props?.data?.storeDetails?.slug ||
    props?.data?.storeDetails?.store_slug ||
    props?.data?.storeDetails?.storeSlug ||
    props?.data?.store_slug ||
    props?.data?.storeSlug ||
    props?.data?.store_id ||
    null;

  const hasSpecs = stripTags(props?.data?.specifications)?.trim().length > 0;

  const tabItems = [
    ...(hasSpecs ? [{
      key: "specs",
      label: "Specifications",
      children: (
        <div className="pd-specs-section" style={{ margin: 0, border: "none", background: "transparent", padding: 0 }}>
          <p className="pd-specs-text">
            {showFullText
              ? stripTags(props?.data?.specifications)
              : `${stripTags(props?.data?.specifications).substring(0, 300)}…`}
          </p>
          {stripTags(props?.data?.specifications).length > 300 && (
            <button className="pd-specs-toggle" onClick={() => setShowFullText(!showFullText)}>
              {showFullText ? "Read Less ↑" : "Read More ↓"}
            </button>
          )}
        </div>
      ),
    }] : []),
    {
      key: "reviews",
      label: `Reviews${ratingInfo.reviews > 0 ? ` (${ratingInfo.reviews})` : ""}`,
      children: <Reviews data={props?.data} />,
    },
  ];

  return (
    <div className="pd-page">
      <Container>

        {/* ── Breadcrumb ── */}
        <div className="pd-breadcrumb">
          <span className="pd-bc-item" onClick={() => router.push("/")}>
            <IoHomeOutline size={13} /> Home
          </span>
          {props?.data?.categoryName?.name && (
            <>
              <IoChevronForward size={11} className="pd-bc-sep" />
              <span className="pd-bc-item">{props.data.categoryName.name}</span>
            </>
          )}
          {props?.data?.subCategoryName?.name && (
            <>
              <IoChevronForward size={11} className="pd-bc-sep" />
              <span className="pd-bc-item">{props.data.subCategoryName.name}</span>
            </>
          )}
          {props?.data?.name && (
            <>
              <IoChevronForward size={11} className="pd-bc-sep" />
              <span className="pd-bc-item pd-bc-active">
                {(props.data.name as string).length > 40
                  ? `${(props.data.name as string).substring(0, 40)}…`
                  : props.data.name}
              </span>
            </>
          )}
        </div>

        {/* ── Main 2-col ── */}
        <Row className="pd-main-row">

          {/* Left: Images */}
          <Col xs={12} sm={12} md={6} lg={5} className="pd-images-col">
            <div className="pd-images-sticky">
              <Images
                coverImage={defaultImage}
                images={props?.data?.productImages}
                product_video={props?.data?.product_video}
              />
            </div>
          </Col>

          {/* Right: Info + Purchase */}
          <Col xs={12} sm={12} md={6} lg={7} className="pd-info-col">

            {/* Title */}
            <h1 className="pd-title">
              {props?.data?.name} {getVariantCurrentName()}
            </h1>

            {/* Brand */}
            {props?.data?.brand && (
              <div className="pd-brand">{props?.data?.brand?.toUpperCase()}</div>
            )}

            {/* Rating */}
            <div className="pd-rating-row">
              <Rate disabled allowHalf value={ratingInfo.rating} style={{ fontSize: 14, color: "#f59e0b" }} />
              <span className="pd-rating-score">{ratingInfo.rating.toFixed(1)}</span>
              <span className="pd-rating-sep">·</span>
              <span className="pd-rating-count">{ratingInfo.reviews.toLocaleString()} ratings</span>
            </div>

            {/* Seller */}
            {props?.data?.storeDetails?.store_name && (
              <div className="pd-seller">
                <span className="pd-seller-label">Sold by</span>
                {storeSlug ? (
                  <Link
                    href={`/product_search/store/${storeSlug}?storeName=${encodeURIComponent(props?.data?.storeDetails?.store_name ?? "")}`}
                    className="pd-seller-name pd-seller-link"
                  >
                    {props?.data?.storeDetails?.store_name}
                  </Link>
                ) : (
                  <span className="pd-seller-name">{props?.data?.storeDetails?.store_name}</span>
                )}
              </div>
            )}

            {/* Short description */}
            {props?.data?.description && (
              <p className="pd-short-desc">{props?.data?.description}</p>
            )}

            <hr className="pd-divider" />

            {/* Purchase panel — price, qty, cart (always visible) */}
            <Description
              data={props?.data}
              currentVariant={currentVariant}
              handleBuyNow={handleBuyNow}
              pid={props?.params?.pid}
            />

            {/* Variants */}
            {props?.data?.productVariant?.length > 0 && (
              <div className="pd-variants-wrap">
                <Variants
                  productVariant={props?.data?.productVariant}
                  currentVariant={currentVariant}
                  changeVaraintId={onChangeVariantId}
                />
              </div>
            )}

          </Col>
        </Row>

        {/* ── Tabs: Specs + Reviews ── */}
        {tabItems.length > 0 && (
          <div className="pd-tabs-section">
            <Tabs items={tabItems} className="pd-tabs" />
          </div>
        )}

        {/* ── Related ── */}
        <RelatedProducts data={props?.data} />

      </Container>
    </div>
  );
}

export default DetailsCard;
