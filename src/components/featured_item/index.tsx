import React from "react";
import styles from "./style.module.scss";
import { useRouter } from "next/navigation";

function FeaturedItem(props: any) {
  const navigation = useRouter();
  return (
    <div
      className={`${styles["card"]} rounded position-relative `}
      onClick={() => {
        navigation.push(
          `/category/${props?.data?.slug}?id=${window.btoa(
            props?.data?._id
          )}&type=${encodeURIComponent(props?.data?.name)}`
        );
      }}
    >
      <h6 className={`fw-bold position-absolute text-light ${styles["text"]}`}>
        Save more on <br />
        <span className="text-warning fw-medium">{props?.data?.name}</span>
      </h6>
      <img
        className={`${styles["img"]} rounded`}
        src={props?.data?.bannerImg ?? ""}
        alt="Image"
      />
    </div>
  );
}

export default FeaturedItem;
