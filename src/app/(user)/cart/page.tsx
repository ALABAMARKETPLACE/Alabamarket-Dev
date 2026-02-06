"use client";
import { notification, Popconfirm } from "antd";
import { useCallback, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { IoCartOutline, IoCloseCircleOutline } from "react-icons/io5";
import { DELETE, GET, PUT } from "../../../util/apicall";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Cart = useSelector((state: any) => state.Cart);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Settings = useSelector((state: any) => state.Settings.Settings);
  const [notificationApi, contextHolder] = notification.useNotification();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useRouter();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (User) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cartItems: any = await GET(API.CART_GET_ALL);
        if (cartItems.status) {
          dispatch(storeCart(cartItems.data));
          return;
        } else {
          notificationApi.error({ message: cartItems.message ?? "" });
        }
      }
    } catch {
      notificationApi.error({
        message: `Something went wrong. please try again`,
      });
      return;
    } finally {
      setLoading(false);
    }
  }, [User, dispatch, notificationApi]);

  const getRecommendations = useCallback(async () => {
    try {
      const url = API.USER_HISTORY;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await GET(url);
      if (response.status) {
        setProducts(response.data);
      }
    } catch (err) {
      console.log("no recommandations", err);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
    getRecommendations();
    // dispatch(clearCheckout());
  }, [loadData, getRecommendations]);

  const clear = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await DELETE(API.CART_CLEAR_ALL);
      if (response?.status) {
        notificationApi.success({ message: response?.message });
        loadData();
      } else {
        notificationApi.error({ message: response?.message });
      }
    } catch {
      notificationApi.error({ message: `Something went wrong.` });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    } catch {
      notificationApi.error({ message: "Failed to Update cart" });
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const removeItem = async (id: string, _item: any) => {
    try {
      const url = API.CART + id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cartItems: any = await DELETE(url);
      if (cartItems.status) {
        loadData();
        notificationApi.success({
          message: `You have removed Product from cart`,
        });
      }
    } catch {
      notificationApi.error({ message: "Failed to Update cart" });
    }
  };

  const goCheckout = async () => {
    try {
      setError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await checkoutCartItems(Cart.items);
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
            <Row className="g-3 g-md-4">
              <Col lg={7} md={12} className="cart-items-col">
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
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
                  list of your items and reflects each item&apos;s most recent
                  price. Shopping Cart Learn more. Do you have a gift card or
                  promotional code? We&apos;ll ask you to enter your claim code
                  when it&apos;s time to pay.
                </div>
                <br />
              </Col>
              <Col lg={5} md={12} className="cart-summary-col">
                <div className="Cart-box2">
                  <SummaryCard
                    Cart={Cart}
                    checkout={() => goCheckout()}
                    error={error}
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
