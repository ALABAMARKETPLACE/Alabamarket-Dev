"use client";
import React from "react";
import { IoIosRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";
function AddressItem(props: any) {
  return (
    <div
      className={`Cart-AddressItem ${
        props?.selected === props?.item?.id ? "active" : ""
      }`}
      onClick={() => props?.onSelect(props?.item)}
    >
      <div className="Cart-row" style={{ alignItems: "flex-start" }}>
        <div>
          {props?.selected === props?.item?.id ? (
            <IoMdRadioButtonOn size={25} />
          ) : (
            <IoIosRadioButtonOff size={25} />
          )}
        </div>
        <div style={{ flex: 1, marginLeft: 10 }}>
          <div className="Cart-txt9">{props?.item?.type}</div>
          <div className="Cart-txt5">{props?.item?.flat}</div>
          <div className="Cart-txt8" style={{color:"gray"}}>
            {props?.item?.fullAddress}, {props?.item?.street},{" "}
            {props?.item?.city},{props?.item?.pin_code}, {props?.item?.state}
          </div>
          <div className="Cart-txt3">{props?.item?.code} {props?.item?.alt_phone}</div>
        </div>
      </div>
    </div>
  );
}
export default AddressItem;
