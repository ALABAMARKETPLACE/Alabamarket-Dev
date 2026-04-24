import { RiDeleteBinLine } from "react-icons/ri";
import { Popconfirm } from "antd";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatNumber";

interface CartItemData {
  unit: number | string;
  status: boolean;
  quantity: number;
  slug: string;
  pid: string;
  variantId?: string;
  image: string;
  name: string;
  storeName: string;
  storeSlug?: string;
  storeId?: string | number;
  price: number;
  totalPrice: number;
  id: string;
  combination?: { value: string }[];
}

interface Settings {
  currency: string;
}

interface CartItemProps {
  data: CartItemData;
  Settings: Settings;
  loading: boolean;
  updateQuantity: (action: "add" | "reduce", data: CartItemData) => void;
  removeItem: (id: string, data: CartItemData) => void;
}

const CartItem = (props: CartItemProps) => {
  const router = useRouter();

  const isOutOfStock =
    Number(props.data.unit) === 0 || props.data.status === false;
  const isLowStock =
    !isOutOfStock && Number(props.data.unit) < props.data.quantity;

  let stockLabel = "In Stock";
  let stockClass = "green";
  if (isOutOfStock) {
    stockLabel = "Out of Stock";
    stockClass = "red";
  } else if (isLowStock) {
    stockLabel = `Only ${props.data.unit} left`;
    stockClass = "orange";
  }

  const currencySymbol =
    props.Settings?.currency === "NGN" ? "₦" : props.Settings?.currency || "₦";

  const variantInfo = Array.isArray(props.data.combination)
    ? props.data.combination
        .map((c) => c.value.charAt(0).toUpperCase() + c.value.slice(1))
        .join(" · ")
    : "";

  const handleNavigate = () => {
    router.push(`/${props.data.slug}/`);
  };

  return (
    <div className="cart-item">
      {/* Image */}
      <div className="cart-item__image-wrap" onClick={handleNavigate}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={props.data.image}
          className="cart-item__image"
          alt={props.data.name || "Product Image"}
        />
      </div>

      {/* Details */}
      <div className="cart-item__details">
        {/* Top: name + delete */}
        <div className="cart-item__top-row">
          <div
            className="cart-item__name"
            onClick={handleNavigate}
            role="button"
          >
            {props.data.name}
            {variantInfo && (
              <span className="cart-item__variant"> — {variantInfo}</span>
            )}
          </div>
          <Popconfirm
            placement="bottomRight"
            title="Remove this item from cart?"
            okText="Remove"
            cancelText="Cancel"
            onConfirm={() => props.removeItem(props.data.id, props.data)}
          >
            <button className="cart-item__delete-btn" aria-label="Remove item">
              <RiDeleteBinLine size={17} />
            </button>
          </Popconfirm>
        </div>

        {/* Seller */}
        <div className="cart-item__seller">
          Sold by{" "}
          {(props.data.storeSlug || props.data.storeId) ? (
            <Link href={`/product_search/store/${props.data.storeSlug || props.data.storeId}?storeName=${encodeURIComponent(props.data.storeName ?? "")}`}>
              {props.data.storeName}
            </Link>
          ) : (
            <span>{props.data.storeName}</span>
          )}
        </div>

        {/* Unit price + stock */}
        <div className="cart-item__meta-row">
          <span className="cart-item__unit-price">
            {currencySymbol} {formatCurrency(props.data.price)} / unit
          </span>
          <span className={`cart-item__stock ${stockClass}`}>{stockLabel}</span>
        </div>

        {/* Bottom: qty controls + total */}
        <div className="cart-item__bottom-row">
          <div className="qty-controls">
            <button
              className="qty-btn"
              disabled={props.data.quantity === 1 || props.loading}
              onClick={() => props.updateQuantity("reduce", props.data)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="qty-count">{props.data.quantity}</span>
            <button
              className="qty-btn"
              disabled={props.loading}
              onClick={() => props.updateQuantity("add", props.data)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div className="cart-item__total">
            <span className="cart-item__total-label">{currencySymbol}</span>
            {formatCurrency(props.data.totalPrice)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
