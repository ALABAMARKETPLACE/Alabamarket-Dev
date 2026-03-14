"use client";
import { notification, Popconfirm, Skeleton } from "antd";
import { useCallback, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { IoCartOutline, IoCloseCircleOutline } from "react-icons/io5";
import { DELETE, GET, PUT } from "../../../util/apicall";
import { useDispatch, useSelector } from "react-redux";
import API from "../../../config/API";
import {
  storeCart,
  loadGuestCart,
  clearCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
} from "../../../redux/slice/cartSlice";
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
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
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
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useRouter();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cartItems: any = await GET(API.CART_GET_ALL);
        if (cartItems.status) {
          dispatch(storeCart(cartItems.data));
        } else {
          notificationApi.error({ message: cartItems.message ?? "" });
        }
      } else {
        dispatch(loadGuestCart());
      }
    } catch {
      if (isAuthenticated) {
        notificationApi.error({ message: "Something went wrong. Please try again." });
      } else {
        dispatch(loadGuestCart());
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, dispatch, notificationApi]);

  const getRecommendations = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await GET(API.USER_HISTORY);
      if (response.status) {
        setProducts(response.data);
      }
    } catch {
      // recommendations are non-critical
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
    if (isAuthenticated) {
      getRecommendations();
    }
  }, [loadData, getRecommendations, isAuthenticated]);

  const clear = async () => {
    if (!isAuthenticated) {
      dispatch(clearCart());
      notificationApi.success({ message: "Cart cleared" });
      return;
    }
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
      notificationApi.error({ message: "Something went wrong." });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateQuantity = async (action: string, item: any) => {
    try {
      if (item?.unit <= item?.quantity && action === "add") {
        notificationApi.error({
          message:
            item?.unit === 0
              ? "Product is out of stock"
              : `Only ${item?.unit} unit left`,
        });
        return;
      }

      if (!isAuthenticated || Cart.isGuestCart) {
        const newQuantity =
          action === "add" ? item.quantity + 1 : item.quantity - 1;
        if (newQuantity > 0) {
          dispatch(
            updateGuestCartQuantity({
              productId: item.productId,
              variantId: item.variantId,
              quantity: newQuantity,
            }),
          );
        }
        return;
      }

      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cartItems: any = await PUT(
        API.CART + item?.id + `?action=${action}`,
        {},
      );
      if (cartItems.status) {
        loadData();
      } else {
        notificationApi.error({ message: cartItems?.message ?? "" });
      }
    } catch {
      notificationApi.error({ message: "Failed to update cart" });
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const removeItem = async (id: string, item: any) => {
    if (!isAuthenticated || Cart.isGuestCart) {
      dispatch(removeFromGuestCart({ productId: item.productId, variantId: item.variantId }));
      notificationApi.success({ message: "Item removed from cart" });
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cartItems: any = await DELETE(API.CART + id);
      if (cartItems.status) {
        loadData();
        notificationApi.success({ message: "Item removed from cart" });
      }
    } catch {
      notificationApi.error({ message: "Failed to remove item" });
    }
  };

  const goCheckout = async () => {
    try {
      setError(null);
      setCheckoutLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await checkoutCartItems(Cart.items);
      if (data?.eligibleItems?.length) {
        dispatch(storeCheckout(data?.eligibleItems));
        navigate.push("/checkout");
      } else {
        setError("Your cart contains items that are currently out of stock.");
      }
    } catch (err) {
      console.log("checkout error", err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="Screen-box" style={{ background: "#f8f9fb" }}>
      {contextHolder}
      <br />
      <Container fluid style={{ minHeight: "80vh" }}>
        {loading ? (
          <div className="Cart-box">
            <Row className="g-3 g-md-4">
              <Col lg={7} md={12}>
                <Skeleton active paragraph={{ rows: 4 }} />
                <br />
                <Skeleton active paragraph={{ rows: 4 }} />
                <br />
                <Skeleton active paragraph={{ rows: 4 }} />
              </Col>
              <Col lg={5} md={12}>
                <Skeleton active paragraph={{ rows: 6 }} />
              </Col>
            </Row>
          </div>
        ) : Cart.items.length ? (
          <div className="Cart-box">
            <Row className="g-3 g-md-4">
              <Col lg={7} md={12} className="cart-items-col">
                <div className="Cart-row" style={{ padding: "10px 0", paddingBottom: 0 }}>
                  <div className="Cart-txt1">
                    <span className="Cart-txt1Icon">
                      <IoCartOutline />
                    </span>
                    MY CART ({Cart.items.length})
                  </div>
                  <div style={{ flex: 1 }} />
                  <Popconfirm
                    placement="bottomRight"
                    title="Clear all items from your cart?"
                    okText="Clear"
                    cancelText="Cancel"
                    onConfirm={async () => clear()}
                  >
                    <div className="Cart-txt2">
                      Clear Cart <IoCloseCircleOutline />
                    </div>
                  </Popconfirm>
                </div>
                <div className="Cart-line" />
                <div style={{ marginTop: 16 }}>
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
                <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                  <button
                    className="cart-continue-btn"
                    onClick={() => navigate.push("/")}
                  >
                    ← Continue Shopping
                  </button>
                </div>
                <br />
              </Col>
              <Col lg={5} md={12} className="cart-summary-col">
                <div className="Cart-box2">
                  <SummaryCard
                    Cart={Cart}
                    checkout={() => goCheckout()}
                    error={error}
                    checkoutLoading={checkoutLoading}
                  />
                </div>
                <br />
              </Col>
            </Row>
          </div>
        ) : (
          <NoData
            icon={<IoCartOutline size={70} color="#e6e6e6" />}
            header="Your cart is empty"
            text1={`Browse ${API.NAME} and add items you love to your cart`}
            button="START SHOPPING"
            onclick={() => navigate.push("/")}
          />
        )}
        {products?.length ? (
          <RecomendedItems
            title="Products You've Recently Visited"
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
