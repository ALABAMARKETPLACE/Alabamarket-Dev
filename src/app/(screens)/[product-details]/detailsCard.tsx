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

  console.log("lllnggthh", props);
  return (
    <div className="page-Box pt-3">
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
            <h1>
              {props?.data?.name} {getVariantCurrentName()}
            </h1>
            <div> {props?.data?.brand?.toUpperCase() ?? ""}</div>
            <div> {props?.data?.description}</div>
            <div className="d-flex justify-content-start gap-2">
              {" "}
              {props?.data?.averageRating ? (
                <div>{Number(props?.data?.averageRating).toFixed(1)}</div>
              ) : null}
              <Rate
                disabled
                allowHalf
                value={Number(props?.data?.averageRating)}
              />
              <div>{`${props?.data?.averageRating || "No"} Ratings`}</div>
            </div>
            <div> Seller: {props?.data?.storeDetails?.store_name}</div>
            <hr />
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
              <>
                <hr />

                <div className="fs-5">More Details</div>
                <p>
                  {showFullText
                    ? stripTags(props?.data?.specifications)
                    : `${stripTags(props?.data?.specifications).substring(
                        0,
                        100
                      )}...`}
                </p>
                <button
                  className="btn btn-link p-0"
                  onClick={toggleText}
                  style={{ textDecoration: "none" }}
                >
                  {showFullText ? "Read Less" : "Read More"}
                </button>
              </>
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
