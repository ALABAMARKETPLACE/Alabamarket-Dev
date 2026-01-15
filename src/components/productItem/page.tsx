"use client";
import React from "react";
import "./styles.scss";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { FaStar } from "react-icons/fa6";
import { IoCartOutline, IoHeartOutline, IoEyeOutline } from "react-icons/io5";
import { Popover, Rate, App } from "antd";
import { reduxSettings } from "@/redux/slice/settingsSlice";

function ProductItem(props: any) {
  const navigate = useRouter();
  const { message } = App.useApp();
  const Settings = useSelector(reduxSettings);
  const givenDate: any = new Date(props?.item?.createdAt); // Parse given date string
  const currentDate: any = new Date(); // Get current date
  const differenceInMilliseconds = currentDate - givenDate; // Calculate difference in milliseconds
  const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000)
    ? Math.floor(differenceInMilliseconds / 1000)
    : null;

  const openDetails = () => {
    navigate.push(`/${props?.item?.slug}/?pid=${props?.item?.pid}&review=2`);
  };
  const content = (
    <div>
      <p>{props?.item?.totalReviews} total ratings</p>
      <hr />
      <p
        className="ProductItem-txt5"
        style={{ cursor: "pointer" }}
        onClick={() => openDetails()}
      >{`See customer reviews >`}</p>
    </div>
  );
  const title = (
    <div className="d-flex align-items-center gap-2">
      <Rate
        disabled
        allowHalf
        value={Number(props?.item?.averageRating)}
        className=""
        style={{ fontSize: "12px" }}
      />
      <h6 className="my-0 fw-bold">{`${Number(
        props?.item?.averageRating
      )?.toFixed(1)} out of 5`}</h6>
    </div>
  );
  return (
    <div className={`ProductItem position-relative`}>
      <div className="ProductItem-Box1">
        <img
          src={props?.item?.image}
          className="ProductItem-img"
          alt="ProductItem-img"
          onClick={() => openDetails()}
        />
        <div className="action-overlay">
          <div
            className="action-btn"
            title="Add to Cart"
            onClick={(e) => {
              e.stopPropagation();
              message.success("Added to Cart");
            }}
          >
            <IoCartOutline />
          </div>
          <div
            className="action-btn"
            title="Quick View"
            onClick={(e) => {
              e.stopPropagation();
              openDetails();
            }}
          >
            <IoEyeOutline />
          </div>
          <div
            className="action-btn"
            title="Add to Wishlist"
            onClick={(e) => {
              e.stopPropagation();
              message.success("Added to Wishlist");
            }}
          >
            <IoHeartOutline />
          </div>
        </div>
        {props?.item?.unit <= 0 ? (
          <div className="product_status_tag position-absolute">
            <div className="badge2 grey">Soldout</div>
          </div>
        ) : props?.item?.status == false ? (
          <div className="product_status_tag position-absolute">
            <div className="badge2 red">not available</div>
          </div>
        ) : props?.item?.unit <= 5 ? (
          <div className="product_status_tag position-absolute">
            <div className="badge2 orange">
              {` only ${props?.item?.unit} left`}
            </div>
          </div>
        ) : typeof differenceInMilliseconds == "number" ? (
          differenceInMilliseconds < 604800000 ? (
            <div className="product_status_tag position-absolute">
              <div className="badge2 blue">New</div>
            </div>
          ) : null
        ) : null}
      </div>

      <div className="ProductItem-Box2">
        <div className="ProductItem-txt1 " onClick={() => openDetails()}>
          {props?.item?.name}
        </div>
        <Popover content={content} title={title}>
          {props?.item?.averageRating ? (
            <div className="d-flex gap-2">
              <div className="ProductItem-txt5">
                <FaStar color="#f5da42" /> &nbsp;
                {isNaN(Number(props?.item?.averageRating)) == false
                  ? Number(props?.item?.averageRating)?.toFixed(1)
                  : 0}
              </div>
              <span className="ProductItem-txt5 text-dark">
                {props?.item?.totalReviews
                  ? ` (${props?.item?.totalReviews})`
                  : ""}
              </span>
            </div>
          ) : null}
        </Popover>

        <div className="ProductItem-txt3" onClick={() => openDetails()}>
          {(() => {
            const currencyCode =
              typeof Settings?.currency === "string" &&
              Settings.currency.length === 3
                ? Settings.currency
                : "NGN";
            const formatted = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: currencyCode,
            }).format(props?.item?.retail_rate);
            // Replace NGN with naira symbol ₦
            return formatted.replace(/NGN\s?/, "₦");
          })()}
          <span className="text-secondary"></span>
        </div>
      </div>
    </div>
  );
}
export default ProductItem;
