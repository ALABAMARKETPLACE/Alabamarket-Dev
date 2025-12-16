import React from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { GoArrowRight } from "react-icons/go";
import { useSelector } from "react-redux";
import { Alert } from "antd";
import { reduxSettings } from "../../../../redux/slice/settingsSlice";
const SummaryCard = (props: any) => {
  const Settings = useSelector(reduxSettings);

  const getTotalPrice = (cartt: any) => {
    let total = 0;
    if (Array.isArray(cartt?.items) == true) {
      cartt?.items?.forEach((item: any) => {
        total += Number(item?.totalPrice);
      });
    }
    return Number(total).toFixed(2);
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
          {Settings?.currency} {getTotalPrice(props?.Cart)}
        </div>
      </div>
      <br />
      <div className="Cart-row">
        <div className="Cart-txt3">Discount</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4">{Settings?.currency} 0.00</div>
      </div>
      <br />
      <div className="Cart-row">
        <div className="Cart-txt3">Tax</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4">{Settings?.currency} 0.00</div>
      </div>
      <br />
      <div className="Cart-row">
        <div className="Cart-txt3">Delivery Charges</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4">{Settings?.currency} 0.00</div>
      </div>
      <div className="Cart-line2" />
      <br />
      <div className="Cart-row">
        <div className="Cart-txt3">Total :</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt7">
          {Settings?.currency} {getTotalPrice(props?.Cart)}
        </div>
      </div>
      <div className="Cart-line2" />
      <p className="text-small-summarycard my-0 text-center">
        <span className="fw-medium">NB:</span> Delivery charge will be
        calculated in the next step
      </p>
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
