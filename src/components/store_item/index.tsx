// import { useNavigate } from "react-router-dom";
"use client";
import { useRouter } from "next/navigation";
import "./style.scss";
import React from "react";
import { FaStar } from "react-icons/fa6";
import { IoIosMore } from "react-icons/io";
function StoreItem(props: any) {

  const router = useRouter();
  function formatDistance(distance: number) {

    if (distance < 0.1) {
      return "10 mtr";
    } else if (distance < 1) {
      return Math.round(distance * 1000) + " mtr";
    } else if (distance == null) {
      return "";
    } else {
      return distance?.toFixed(2) + " Kms";
    }
  }
  return (
    <div
      className="StoreItem"
      onClick={() => router.push(`store/${props?.item?.slug}`)}
    >
      <div>
        <img src={props?.item?.logo_upload} className="StoreItem-img" />
      </div>
      <div className="StoreItem-box1">
        <div>
          <div className="StoreItem-txt1">{props?.item?.store_name}</div>
          <div className="w-100">
            <p className="StoreItem-txt2 mb-0">
              {Array.isArray(props?.item?.business_types)
                ? props?.item?.business_types?.map(
                    (item: string) => `${item}, `
                  )
                : ""}
            </p>
          </div>
        </div>

        <div className="StoreItem-txt3 d-flex gap-2">
          <div>
            <FaStar color="#f5da42" /> &nbsp;
            {isNaN(Number(props?.item?.averageRating)) == false
              ? Number(props?.item?.averageRating)?.toFixed(1)
              : 0}
          </div>
          {/* ({props?.item?.ratings ?? 0}){" "} */}
          <span className="text-success">
            {formatDistance(props?.item?.distance)}
          </span>
        </div>
      </div>
      <div>
        <div className="StoreItem-txt4">
          <IoIosMore />
        </div>
      </div>
    </div>
  );
}

export default StoreItem;
