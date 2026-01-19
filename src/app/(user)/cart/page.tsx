"use client";
import { notification, Popconfirm } from "antd";
import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { IoCartOutline, IoCloseCircleOutline } from "react-icons/io5";
import { DELETE, GET, PUT, POST } from "../../../util/apicall";
import { useDispatch, useSelector } from "react-redux";
import API from "../../../config/API";
import { storeCart } from "../../../redux/slice/cartSlice";
import { useSession } from "next-auth/react";
import "./styles.scss";
import CartItem from "./_components/cartItem";
import SummaryCard from "./_components/summaryCard";
import NoData from "../../../components/noData";
import RecomendedItems from "./_components/recommended";
import { useRouter } from "next/navigation";
import { storeCheckout } from "../../../redux/slice/checkoutSlice";
import { checkoutCartItems } from "./_components/checkoutFunction";

function CartPage() {
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const User = useSession();
  const Cart = useSelector((state: any) => state.Cart);
  const Settings = useSelector((state: any) => state.Settings.Settings);
  const [notificationApi, contextHolder] = notification.useNotification();
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);
  const navigate = useRouter();
  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
    getRecommendations();
    // dispatch(clearCheckout());
  }, []);

  const calculateDelivery = async (cartItems: any[]) => {
    try {
      setCalculatingDelivery(true);
      // 1. Fetch user addresses
      const addressRes: any = await GET(API.NEW_ADDRESS_ALL);
      if (addressRes?.status && addressRes?.data?.length > 0) {
        // Use the first address or default one
        const defaultAddress =
          addressRes.data.find((a: any) => a.is_default) || addressRes.data[0];

        if (defaultAddress) {
          // 2. Prepare payload for calculation
          // Sending a clean payload with only necessary fields to avoid issues with large payloads or circular references
          const cartWithWeight = cartItems.map((item: any) => ({
            product_id:
              item?.pid || item?.productId || item?.product_id || item?.id,
            store_id:
              item?.storeId ||
              item?.store_id ||
              item?.store?.id ||
              item?.product?.store_id,
            weight: Number(item?.weight || item?.product?.weight) || 0.1, // Default to 0.1kg to avoid overweight errors if missing
            quantity: Number(item?.quantity) || 1,
            length: Number(item?.length) || 0,
            width: Number(item?.width) || 0,
            height: Number(item?.height) || 0,
            price: Number(item?.price) || 0,
          }));

          const addressData = {
            id: defaultAddress.id,
            country_id: defaultAddress.country_id || null,
            state_id: defaultAddress.state_id || null,
            state: defaultAddress.state,
            country: defaultAddress.country,
            city: defaultAddress.city,
          };

          const obj = {
            cart: cartWithWeight,
            address: addressData,
          };

          // 3. Call calculation API
          const response: any = await POST(
            API.NEW_CALCULATE_DELIVERY_CHARGE,
            obj,
          );
          if (response?.status) {
            setDeliveryCharge(Number(response?.details?.totalCharge || 0));
            setDiscount(Number(response?.data?.discount || 0));
          }
        }
      }
    } catch (err) {
      console.log("Delivery calculation failed", err);
    } finally {
      setCalculatingDelivery(false);
    }
  };

  const getRecommendations = async () => {
    try {
      const url = API.USER_HISTORY;
      const response: any = await GET(url);
      if (response.status) {
        setProducts(response.data);
      }
    } catch (err) {
      console.log("no recommandations", err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      if (User) {
        const cartItems: any = await GET(API.CART_GET_ALL);
        if (cartItems.status) {
          dispatch(storeCart(cartItems.data));
          calculateDelivery(cartItems.data);
          return;
        } else {
          notificationApi.error({ message: cartItems.message ?? "" });
        }
      }
    } catch (err) {
      notificationApi.error({
        message: `Something went wrong. please try again`,
      });
      return;
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    try {
      const response: any = await DELETE(API.CART_CLEAR_ALL);
      if (response?.status) {
        notificationApi.success({ message: response?.message });
        loadData();
      } else {
        notificationApi.error({ message: response?.message });
      }
    } catch (err) {
      notificationApi.error({ message: `Something went wrong.` });
    }
  };

  const updateQuantity = async (action: string, item: any) => {
    try {
      if (item?.unit <= item?.quantity && action == "add") {
        notificationApi.error({
          message:
            item?.unit == 0
              ? "Product is Out of Stock"
              : `Only ${item?.unit} unit Left`,
        });
        return;
      }
      setLoading(true);
      const cartItems: any = await PUT(
        API.CART + item?.id + `?action=${action}`,
        {},
      );
      if (cartItems.status) {
        // Optimistically update or fetch fresh data
        loadData();
        notificationApi.success({
          message: cartItems?.message,
        });
      } else {
        notificationApi.error({ message: cartItems?.message ?? "" });
      }
    } catch (err) {
      notificationApi.error({ message: "Failed to Update cart" });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: number, item: any) => {
    try {
      const url = API.CART + id;
      const cartItems: any = await DELETE(url);
      if (cartItems.status) {
        loadData();
        notificationApi.success({
          message: `You have removed Product from cart`,
        });
      }
    } catch (err) {
      notificationApi.error({ message: "Failed to Update cart" });
    }
  };

  const goCheckout = async () => {
    try {
      setError(null);
      var data: any = await checkoutCartItems(Cart.items);
      if (data?.eligibleItems?.length) {
        dispatch(storeCheckout(data?.eligibleItems));
        navigate.push("/checkout");
      } else {
        setError(
          "Out of stock: Your cart contains items that are currently unavailable.",
        );
      }
    } catch (err) {
      console.log("err", err);
    }
  };
  return (
    <div className="Screen-box">
      {contextHolder}
      <br />
      <Container fluid style={{ minHeight: "80vh" }}>
        {Cart.items.length ? (
          <div className="Cart-box">
            <Row>
              <Col sm={7}>
                <div
                  className="Cart-row"
                  style={{
                    padding: 10,
                    paddingBottom: 0,
                    paddingRight: 0,
                    paddingLeft: 0,
                  }}
                >
                  <div className="Cart-txt1">
                    <span className="Cart-txt1Icon">
                      <IoCartOutline />
                    </span>
                    CART - ( {Cart.items.length} )
                  </div>
                  <div style={{ flex: 1 }} />
                  <div>
                    <Popconfirm
                      placement="bottomRight"
                      title={"Are you sure to clear all items in your cart?"}
                      okText="Yes"
                      cancelText="No"
                      onConfirm={async () => clear()}
                    >
                      <div className="Cart-txt2" style={{ cursor: "pointer" }}>
                        Remove All Products <IoCloseCircleOutline />
                      </div>
                    </Popconfirm>
                  </div>
                </div>
                <div className="Cart-line" />
                <div>
                  {Cart.items.map((item: any, index: number) => (
                    <CartItem
                      key={index}
                      data={item}
                      Settings={Settings}
                      updateQuantity={updateQuantity}
                      removeItem={removeItem}
                      loading={loading}
                    />
                  ))}
                </div>
                <br />
                <div className="Cart-txt8">
                  The price and availability of items at Alaba Marketplace are
                  subject to change. The Cart is a temporary place to store a
                  list of your items and reflects each item's most recent price.
                  Shopping Cart Learn more. Do you have a gift card or
                  promotional code? We'll ask you to enter your claim code when
                  it's time to pay.
                </div>
                <br />
              </Col>
              <Col sm={5}>
                <div className="Cart-box2">
                  <SummaryCard
                    Cart={Cart}
                    checkout={() => goCheckout()}
                    error={error}
                    deliveryCharge={deliveryCharge}
                    discount={discount}
                    calculatingDelivery={calculatingDelivery}
                  />
                </div>
                <br />
              </Col>
            </Row>
          </div>
        ) : (
          <NoData
            icon={<IoCartOutline size={70} color="#e6e6e6" />}
            header="Cart is empty"
            text1={`Your Cart is empty. Please start shopping at ${API.NAME} and place orders`}
            button={"START SHOPPING NOW"}
            onclick={() => {
              navigate.push("/");
            }}
          />
        )}
        {products?.length ? (
          <RecomendedItems
            title={"Products You've Recently Visited"}
            data={products}
            type="visited"
          />
        ) : null}
        <br />
      </Container>
    </div>
  );
}

export default CartPage;
