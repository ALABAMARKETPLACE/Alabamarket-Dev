"use client";
import React from "react";
import { IoCheckmarkCircle, IoHomeOutline, IoBriefcaseOutline, IoLocationOutline } from "react-icons/io5";

function NewAddressItem(props: any) {
  const isSelected = props?.selected === props?.item?.id;
  const addressType = props?.item?.address_type || "Home";

  const TypeIcon = () => {
    const lower = addressType.toLowerCase();
    if (lower === "work" || lower === "office") return <IoBriefcaseOutline size={11} />;
    if (lower === "home") return <IoHomeOutline size={11} />;
    return <IoLocationOutline size={11} />;
  };

  return (
    <div
      className={`addr-item ${isSelected ? "addr-item--selected" : ""}`}
      onClick={() => props?.onSelect(props?.item)}
    >
      <div className="addr-item__radio">
        {isSelected
          ? <IoCheckmarkCircle size={22} color="#ff5f15" />
          : <div className="addr-item__radio-off" />
        }
      </div>
      <div className="addr-item__content">
        <div className="addr-item__top">
          <span className="addr-item__type-badge">
            <TypeIcon />
            {addressType}
          </span>
          {props?.item?.full_name && (
            <span className="addr-item__name">{props.item.full_name}</span>
          )}
        </div>
        {(props?.item?.full_address || props?.item?.address) && (
          <div className="addr-item__address">
            {props?.item?.full_address || props?.item?.address}
          </div>
        )}
        <div className="addr-item__meta">
          {(props?.item?.stateDetails?.name || props?.item?.state) && (
            <span>{props?.item?.stateDetails?.name || props?.item?.state}</span>
          )}
          {props?.item?.phone_no && (
            <span className="addr-item__phone">{props.item.phone_no}</span>
          )}
        </div>
      </div>
    </div>
  );
}
export default NewAddressItem;
