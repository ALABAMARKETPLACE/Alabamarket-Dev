import { IoInformationCircleOutline } from "react-icons/io5";
import { GoArrowRight } from "react-icons/go";
import { useSelector } from "react-redux";
import { Alert, Tag } from "antd";
import { reduxSettings } from "../../../../redux/slice/settingsSlice";
import { formatCurrency } from "@/utils/formatNumber";
import {
  getActiveDeliveryPromo,
  getPromoRemainingTime,
} from "@/config/promoConfig";

interface CartItem {
  totalPrice: number | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface CartState {
  items?: CartItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface SummaryCardProps {
  Cart: CartState;
  checkout: () => void;
  error?: string | null;
}

const SummaryCard = (props: SummaryCardProps) => {
  const Settings = useSelector(reduxSettings);
  const activePromo = getActiveDeliveryPromo();

  const getCurrencySymbol = () => {
    if (Settings?.currency === "NGN") {
      return "₦";
    }
    return Settings?.currency || "₦";
  };

  const getTotalPrice = (cartt: CartState) => {
    let total = 0;
    if (Array.isArray(cartt?.items) === true) {
      cartt?.items?.forEach((item: CartItem) => {
        total += Number(item?.totalPrice);
      });
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
        <div className="Cart-txt4">{getCurrencySymbol()} 0.00</div>
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
        <div className="Cart-txt4">{getCurrencySymbol()} 0.00</div>
      </div>
      <div className="Cart-line2" />
      <br />
      <div className="Cart-row">
        <div className="Cart-txt3">Total :</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt7">
          {getCurrencySymbol()} {getTotalPrice(props?.Cart)}
        </div>
      </div>
      <div className="Cart-line2" />

      {/* Promo Banner */}
      {activePromo && (
        <div
          style={{
            backgroundColor: "#fff3e0",
            padding: "12px",
            borderRadius: "8px",
            marginTop: "15px",
            marginBottom: "10px",
            border: "1px dashed #ff9800",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <span
              style={{ fontSize: "14px", color: "#e65100", fontWeight: 600 }}
            >
              🎉 {activePromo.name}
            </span>
            <Tag color="orange" style={{ margin: 0 }}>
              {getPromoRemainingTime(activePromo)}
            </Tag>
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {activePromo.description}
          </div>
        </div>
      )}

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
