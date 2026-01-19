import React from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { GoArrowRight } from "react-icons/go";
import { useSelector } from "react-redux";
import { Alert } from "antd";
import { reduxSettings } from "../../../../redux/slice/settingsSlice";
import { formatCurrency } from "@/utils/formatNumber";

const SummaryCard = (props: any) => {
  const Settings = useSelector(reduxSettings);

  const getCurrencySymbol = () => {
    if (Settings?.currency === "NGN") {
      return "₦";
    }
    return Settings?.currency || "₦";
  };

  const getTotalPrice = (cartt: any) => {
    let total = 0;
    if (Array.isArray(cartt?.items) == true) {
      cartt?.items?.forEach((item: any) => {
        total += Number(item?.totalPrice);
      });
    }
    return formatCurrency(total);
  };

  const getDeliveryCharge = () => {
    if (props?.calculatingDelivery) return "Calculating...";
    return formatCurrency(props?.deliveryCharge || 0);
  };

  const getDiscount = () => {
    return formatCurrency(props?.discount || 0);
  };

  const getGrandTotal = (cartt: any) => {
    let total = 0;
    if (Array.isArray(cartt?.items) == true) {
      cartt?.items?.forEach((item: any) => {
        total += Number(item?.totalPrice);
      });
    }
    // Add delivery charge if available
    if (props?.deliveryCharge) {
      total += Number(props.deliveryCharge);
    }
    // Subtract discount
    if (props?.discount) {
      total -= Number(props.discount);
    }
    return formatCurrency(total);
  };

  return (
    <div className="Cart-SummaryCard">
      <div className="Cart-row">
        <div className="Cart-txt5">Cart Summary</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt6">{props?.Cart?.items?.length} Item</div>
      </div>
      <div className="Cart-line" />
      <br />
      <div className="Cart-row">
        <div className="Cart-txt3">Total Product Price</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4">
          {getCurrencySymbol()} {getTotalPrice(props?.Cart)}
        </div>
      </div>
      <br />
      <div className="Cart-row">
        <div className="Cart-txt3">Discount</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4">
          {getCurrencySymbol()} {getDiscount()}
        </div>
      </div>
      <br />
      <div className="Cart-row">
        <div className="Cart-txt3">Tax</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4">{getCurrencySymbol()} 0.00</div>
      </div>
      <br />
      <div className="Cart-row">
        <div className="Cart-txt3">Delivery Charges</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4">
          {getCurrencySymbol()} {getDeliveryCharge()}
        </div>
      </div>
      <div className="Cart-line2" />
      <br />
      <div className="Cart-row">
        <div className="Cart-txt3">Total :</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt7">
          {getCurrencySymbol()} {getGrandTotal(props?.Cart)}
        </div>
      </div>
      <div className="Cart-line2" />
      {props?.deliveryCharge > 0 ? null : (
        <p className="text-small-summarycard my-0 text-center">
          <span className="fw-medium">NB:</span> Delivery charge will be
          calculated in the next step
        </p>
      )}
      <br />
      {props?.error ? (
        <>
          <Alert
            type="error"
            message={
              <div className="Cart-error">
                <IoInformationCircleOutline size={30} /> &nbsp;{props?.error}
              </div>
            }
          />
          <br />
        </>
      ) : null}
      <div
        className="Cart-btn1"
        style={{ cursor: "pointer" }}
        onClick={() => props?.checkout()}
      >
        <div>CHECKOUT</div>
        <div className="Cart-btn1Box">
          <GoArrowRight />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
