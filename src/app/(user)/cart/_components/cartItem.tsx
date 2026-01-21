import { RiDeleteBinLine } from "react-icons/ri";
import { Row, Col } from "react-bootstrap";
import { Button, Popconfirm, Space } from "antd";

import { useRouter } from "next/navigation";
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
  let stock = "In Stock";
  if (Number(props?.data?.unit) == 0 || props?.data?.status == false) {
    stock = "Out of Stock";
  } else if (Number(props?.data?.unit) < props?.data?.quantity) {
    stock = `Only ${props?.data?.unit} left`;
  }

  const getCurrencySymbol = () => {
    if (props?.Settings?.currency === "NGN") {
      return "₦";
    }
    return props?.Settings?.currency || "₦";
  };

  function capitalizeFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  const getActiveVariant = (data: CartItemData): string => {
    let variantInfo = "";
    if (Array.isArray(data?.combination) == true) {
      data?.combination?.forEach((item) => {
        variantInfo += ` ${capitalizeFirstLetter(item.value)}`;
      });
    }

    return variantInfo;
  };
  return (
    <div className="Cart-CartItem">
      <div
        onClick={() => {
          router.push(
            `/${props?.data?.slug}/?pid=${props?.data?.pid}&review=2`,
          );
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={props?.data?.image}
          className="Cart-CartItem-img"
          alt={props?.data?.name || "Product Image"}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Row>
          <Col sm={6} xs={12}>
            <div className="Cart-CartItem-txt1">
              {props?.data?.name} {getActiveVariant(props?.data)}
            </div>
            <div className="Cart-CartItem-txt55">
              Seller : <span>{props?.data?.storeName}</span>
            </div>
            <div className="Cart-CartItem-txt2">
              Unit Price :{" "}
              <span style={{ color: "#000" }}>
                {getCurrencySymbol()} {formatCurrency(props?.data?.price)}
              </span>
            </div>
            <div
              className={`Cart-CartItem-txt4 ${
                stock === "In Stock" ? "green" : "red"
              }`}
            >
              {stock}
            </div>
          </Col>
          <Col sm={6} xs={12}>
            <div
              className="Cart-row"
              style={{ alignItems: "center", height: "100%" }}
            >
              <div>
                <Space.Compact block>
                  <Button
                    disabled={props.data.quantity === 1}
                    onClick={() => {
                      if (props?.loading == false) {
                        props?.updateQuantity("reduce", props?.data);
                      }
                    }}
                  >
                    -
                  </Button>
                  <Button>{props?.data?.quantity}</Button>
                  <Button
                    onClick={() => {
                      if (props?.loading == false) {
                        props?.updateQuantity("add", props?.data);
                      }
                    }}
                  >
                    +
                  </Button>
                </Space.Compact>
              </div>
              <div style={{ flex: 1 }}></div>
              <div className="Cart-CartItem-txt3">
                <span style={{ color: "grey", fontSize: 14 }}>
                  {getCurrencySymbol()}{" "}
                </span>
                {formatCurrency(props?.data?.totalPrice)}
              </div>
              <div>
                <Popconfirm
                  placement="bottomRight"
                  title={"Are you sure to remove item from cart?"}
                  okText="Yes"
                  cancelText="No"
                  className="ms-auto align-self-center"
                  onConfirm={() =>
                    props?.removeItem(props?.data?.id, props?.data)
                  }
                >
                  <RiDeleteBinLine size={20} />
                </Popconfirm>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CartItem;
