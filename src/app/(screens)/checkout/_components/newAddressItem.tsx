"use client";
import React from "react";
import { IoIosRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";

function NewAddressItem(props: any) {
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
          <div className="Cart-txt9">{props?.item?.address_type}</div>

          <div className="Cart-txt8" style={{ color: "gray" }}>
            {props?.item?.full_address}
          </div>

          <div className="Cart-txt5 mt-1">
            <strong>Pincode:</strong> {props?.item?.pincode}
          </div>

          {props?.item?.countryDetails && (
            <div className="Cart-txt8 text-muted">
              <i className="bi bi-geo-alt"></i>{" "}
              {props?.item?.countryDetails?.country_name}
            </div>
          )}

          {props?.item?.stateDetails && (
            <div className="Cart-txt8 text-muted">
              <i className="bi bi-geo-alt"></i>{" "}
              {props?.item?.stateDetails?.name}
            </div>
          )}

          <div className="Cart-txt3 mt-1">{props?.item?.phone_no}</div>
        </div>
      </div>
    </div>
  );
}
export default NewAddressItem;
