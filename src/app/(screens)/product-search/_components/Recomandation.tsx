'use client'
import formatPrice from "@/lib/formatPrice";
import React from "react";

const Recomandation = (props: any) => {
  return (
    <div className="search-Recomandation">
      <div>
        <img src={props?.item?.image} />
      </div>
      <div className="search-Recomandation-text1">{props?.item?.name}</div>
      {/* <div className="search-Recomandation-text2">
        {formatPrice(props?.item?.retail_rate)} {props?.currancy}
      </div> */}
    </div>
  );
};

export default Recomandation;
