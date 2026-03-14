import { GoArrowRight } from "react-icons/go";
import { useSelector } from "react-redux";
import { Alert, Spin, Tag } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { IoInformationCircleOutline, IoLockClosedOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
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
  checkoutLoading?: boolean;
}

const SummaryCard = (props: SummaryCardProps) => {
  const Settings = useSelector(reduxSettings);
  const activePromo = getActiveDeliveryPromo();

  const currencySymbol =
    Settings?.currency === "NGN" ? "₦" : Settings?.currency || "₦";

  const itemCount = props.Cart?.items?.length ?? 0;

  const getTotal = () => {
    let total = 0;
    if (Array.isArray(props.Cart?.items)) {
      props.Cart.items.forEach((item: CartItem) => {
        total += Number(item?.totalPrice);
      });
    }
    return total;
  };

  const total = getTotal();

  return (
    <div className="Cart-SummaryCard">
      {/* Header */}
      <div className="Cart-row" style={{ marginBottom: 4 }}>
        <div className="Cart-txt5">Order Summary</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt6">
          {itemCount} {itemCount === 1 ? "Item" : "Items"}
        </div>
      </div>
      <div className="Cart-line" />

      {/* Promo Banner */}
      {activePromo && (
        <div className="cart-promo-banner" style={{ marginTop: 16 }}>
          <div className="cart-promo-banner__top">
            <span className="cart-promo-banner__name">🎉 {activePromo.name}</span>
            <Tag color="orange" style={{ margin: 0 }}>
              {getPromoRemainingTime(activePromo)}
            </Tag>
          </div>
          <div className="cart-promo-banner__desc">{activePromo.description}</div>
        </div>
      )}

      {/* Line items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
        <div className="Cart-row">
          <div className="Cart-txt3">Subtotal</div>
          <div style={{ flex: 1 }} />
          <div className="Cart-txt4">
            {currencySymbol} {formatCurrency(total)}
          </div>
        </div>
        <div className="Cart-row">
          <div className="Cart-txt3">Discount</div>
          <div style={{ flex: 1 }} />
          <div className="Cart-txt4" style={{ color: "#16a34a" }}>
            {currencySymbol} 0.00
          </div>
        </div>
        <div className="Cart-row">
          <div className="Cart-txt3">Delivery</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "#16a34a", textAlign: "right" }}>
            Calculated at checkout
          </div>
        </div>
      </div>

      <div className="Cart-line2" style={{ marginTop: 16 }} />

      {/* Total */}
      <div className="Cart-row" style={{ marginTop: 16 }}>
        <div className="Cart-txt3" style={{ fontSize: 15, color: "#1a1a2e" }}>Total</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt7">{currencySymbol} {formatCurrency(total)}</div>
      </div>
      <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", margin: "10px 0 18px" }}>
        + delivery charges calculated at checkout
      </p>

      {/* Error */}
      {props.error && (
        <Alert
          type="error"
          style={{ marginBottom: 16, borderRadius: 10 }}
          message={
            <div className="Cart-error" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <IoInformationCircleOutline size={18} />
              {props.error}
            </div>
          }
        />
      )}

      {/* CTA */}
      <button
        className="Cart-btn1"
        onClick={() => !props.checkoutLoading && props.checkout()}
        disabled={props.checkoutLoading}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IoLockClosedOutline size={16} style={{ opacity: 0.8 }} />
          {props.checkoutLoading ? "Processing..." : "CHECKOUT"}
        </div>
        <div className="Cart-btn1Box">
          {props.checkoutLoading ? (
            <Spin indicator={<LoadingOutlined style={{ color: "#fff", fontSize: 18 }} spin />} />
          ) : (
            <GoArrowRight size={20} />
          )}
        </div>
      </button>

      {/* Trust badges */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        marginTop: 18,
        paddingTop: 16,
        borderTop: "1px solid #f3f4f6",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af" }}>
          <IoLockClosedOutline size={13} style={{ color: "#16a34a" }} />
          SSL Secured
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af" }}>
          <IoShieldCheckmarkOutline size={14} style={{ color: "#2563eb" }} />
          Paystack Protected
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
