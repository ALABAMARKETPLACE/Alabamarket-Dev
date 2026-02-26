"use client";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { Button, notification } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { FaHeart } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import API from "../../../../config/API";
import { storeCheckout } from "../../../../redux/slice/checkoutSlice";
import { GET, POST } from "../../../../util/apicall";
import { useSession } from "next-auth/react";
import { formatGAItem, trackAddToCart } from "@/utils/analytics";
import GuestCheckoutModal from "@/components/guestCheckoutModal";

// Helper functions for discount display (visual only - does not affect payment)
const getDiscountPercentage = (
  productId: string | undefined | null,
): number => {
  if (!productId || typeof productId !== "string") return 20; // Default discount if no valid productId
  const hash =
    productId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
  const discounts = [15, 20, 25, 30, 35, 40, 45, 50];
  return discounts[hash % discounts.length];
};

const calculateOriginalPrice = (
  actualPrice: number,
  discountPercent: number,
): number => {
  return Math.round(actualPrice / (1 - discountPercent / 100));
};

interface ProductData {
  _id: string;
  pid: string;
  name: string;
  retail_rate: number;
  unit: number;
  status: boolean;
  store_id: string;
  image: string;
  storeDetails?: {
    store_name: string;
  };
  categoryName?: {
    name: string;
  };
  subCategoryName?: {
    name: string;
  };
}

interface VariantData {
  id: string;
  price: number;
  units: number;
  image: string;
  combination: string;
}

type Props = {
  data: ProductData;
  currentVariant: VariantData | null;
  handleBuyNow: (val: number) => void;
};

function Description(props: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cartItems = useSelector((state: any) => state.Cart.items);

  // Track if component has mounted to avoid hydration mismatch
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Only check cart state after hydration to avoid mismatch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isProductInCart =
    hasMounted &&
    cartItems?.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => item.productId === props?.data?._id,
    );
  const router = useRouter();
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user }: any = useSession();
  const checkWishlistStatus = async () => {
    try {
      const res = await GET(API.WISHLIST_GETALL);
      const isInWishlist = res?.data?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => {
          return item.pid == props.data.pid;
        },
      );

      setFavourited(!!isInWishlist);
    } catch (err) {
      console.log("err", err);
      setFavourited(false);
    }
  };
  const availableQuantity =
    props?.currentVariant?.units ?? props?.data?.unit ?? 0;
  const settings = useAppSelector(reduxSettings);
  const [api, contextHolder] = notification.useNotification();
  const [quantity, setQuantity] = useState<number>(1);
  const [formattedPrice, setFormattedPrice] = useState<string>("");
  const [formattedOriginalPrice, setFormattedOriginalPrice] =
    useState<string>("");

  // Calculate totalPrice directly instead of using state and useEffect
  const basePrice =
    props?.currentVariant?.price ?? props?.data?.retail_rate ?? 0;
  const totalPrice = basePrice * quantity;

  // Calculate discount info for display (visual only - does not affect payment)
  const discountInfo = useMemo(() => {
    // Use pid to match the discount calculation in ProductItem component
    const productId = props?.data?.pid || props?.data?._id || "";
    const discountPercent = getDiscountPercentage(productId);
    const originalPrice = calculateOriginalPrice(basePrice, discountPercent);
    const originalTotalPrice = originalPrice * quantity;
    return {
      discountPercent,
      originalPrice,
      originalTotalPrice,
    };
  }, [props?.data?.pid, props?.data?._id, basePrice, quantity]);

  // const [favourited, setFavourited] = useState(props?.data ?? false);
  // const [isWobbling, setIsWobbling] = useState(false);
  const [favourited, setFavourited] = useState(false);

  // Guest checkout modal state (commented out for now)
  // const [showGuestModal, setShowGuestModal] = useState(false);
  // const [pendingAction, setPendingAction] = useState<"cart" | "buy" | null>(
  //   null,
  // );

  useEffect(() => {
    if (props?.data?.pid) {
      checkWishlistStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.data?.pid]);

  // Format price only on client to avoid hydration mismatch
  useEffect(() => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings.currency ?? "INR",
    }).format(totalPrice);
    // Replace NGN with naira symbol ₦
    const finalFormatted = formatted.replace(/NGN\s?/, "₦");
    setFormattedPrice(finalFormatted);

    // Format original price for discount display
    const formattedOriginal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings.currency ?? "INR",
    }).format(discountInfo.originalTotalPrice);
    const finalFormattedOriginal = formattedOriginal.replace(/NGN\s?/, "₦");
    setFormattedOriginalPrice(finalFormattedOriginal);
  }, [totalPrice, settings.currency, discountInfo.originalTotalPrice]);

  const updateQuantity = (type: "increment" | "decrement") => {
    if (type === "increment" && quantity < availableQuantity) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };
  const shareLink = async () => {
    try {
      if (navigator?.share) {
        await navigator.share({
          title: document?.title,
          url: window?.location?.href,
        });
      } else {
        api.error({ message: `Failed to share link` });
      }
    } catch {
      api.error({ message: `Failed to share link` });
    }
  };
  const buyNow = () => {
    if (props?.data?.status != true) {
      notification.error({ message: `Product is Temporarily not Available` });
      return;
    } else if (availableQuantity === 0) {
      notification.error({ message: `Product is Out of Stock!!` });
      return;
    } else if (quantity > props?.data?.unit) {
      notification.error({ message: `Selected Quantity is Not Available.` });
      return;
    }

    // Show modal for guest users (commented out for now)
    // if (!user?.user) {
    //   setPendingAction("buy");
    //   setShowGuestModal(true);
    //   return;
    // }

    executeBuyNow();
  };

  const executeBuyNow = () => {
    const obj = {
      name: props?.data?.name,
      buyPrice: props?.currentVariant?.price ?? props?.data?.retail_rate,
      productId: props?.data?._id,
      quantity: quantity,
      storeId: props?.data?.store_id,
      totalPrice: totalPrice,
      variantId: props?.currentVariant?.id ?? null,
      image: props?.currentVariant?.id
        ? props?.currentVariant?.image
        : props?.data?.image,
      combination: props?.currentVariant?.combination,
      storeName: props?.data?.storeDetails?.store_name,
    };
    dispatch(storeCheckout([obj]));
    router.push("/checkout");
  };

  const addToCart = async () => {
    if (props?.data?.status != true) {
      notification.error({ message: `Product is Temporarily not Available` });
      return;
    } else if (props?.data?.unit == 0) {
      notification.error({ message: `Product is Out of Stock!!` });
      return;
    } else if (quantity > props?.data?.unit) {
      notification.error({ message: `Selected Quantity is Not Available.` });
      return;
    }

    // Show modal for guest users (commented out for now)
    // if (!user?.user) {
    //   setPendingAction("cart");
    //   setShowGuestModal(true);
    //   return;
    // }

    executeAddToCart();
  };

  const executeAddToCart = async () => {
    // Track Add to Cart for analytics
    const gaItem = formatGAItem(props.data, props.currentVariant, quantity);
    trackAddToCart(gaItem);

    // Check if user is logged in
    if (!user?.user) {
      // Guest user - add to local cart
      const { addToGuestCart } = await import("@/redux/slice/cartSlice");

      const guestCartItem = {
        productId: props?.data?.pid,
        pid: props?.data?.pid, // Store numeric pid explicitly for guest order
        name: props?.data?.name,
        price: props?.currentVariant?.price ?? props?.data?.retail_rate,
        quantity: Math.floor(quantity), // Ensure integer quantity
        image: props?.currentVariant?.id
          ? props?.currentVariant?.image
          : props?.data?.image,
        storeId: props?.data?.store_id,
        storeName: props?.data?.storeDetails?.store_name,
        variantId: props?.currentVariant?.id ?? null,
        combination: props?.currentVariant?.combination,
        unit: props?.data?.unit,
        status: props?.data?.status,
      };

      dispatch(addToGuestCart(guestCartItem));
      api.success({ message: "Added to cart successfully!" });
      setTimeout(() => {
        router.push("/cart");
      }, 1000);
      return;
    }

    // Logged in user - add to backend cart
    const obj = {
      productId: props?.data?.pid,
      quantity: quantity,
      variantId: props?.currentVariant?.id ?? null,
    };
    const url = API.CART;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newCart: any = await POST(url, obj);
      if (newCart.status) {
        Notifications.success({ message: newCart?.message });
        setTimeout(() => {
          router.push("/cart");
        }, 1000);
      } else {
        Notifications.error({ message: newCart?.message });
      }
    } catch {
      Notifications.error({ message: "Something went wrong!" });
    }
  };

  // Handle guest modal actions (commented out for now)
  // const handleGuestContinue = () => {
  //   if (pendingAction === "buy") {
  //     executeBuyNow();
  //   } else if (pendingAction === "cart") {
  //     executeAddToCart();
  //   }
  //   setPendingAction(null);
  // };

  const AddWishlist = async () => {
    const obj = {
      productId: props?.data?.pid,
      variantId: props?.currentVariant?.id ?? null,
    };
    const url = API.WISHLIST;

    try {
      const response = await POST(url, obj);
      if (response?.status) {
        // Update state immediately for better UX
        const newFavoritedState = !favourited;
        setFavourited(newFavoritedState);

        const message = newFavoritedState
          ? "Successfully added to Wishlist"
          : "Item removed from wishlist.";
        Notifications.success({ message });
      } else {
        Notifications.error({ message: response?.message });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      Notifications.error({
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  return (
    <div>
      {contextHolder}

      {/* Guest Checkout Modal (commented out for now) */}
      {/**
      <GuestCheckoutModal
        open={showGuestModal}
        onClose={() => {
          setShowGuestModal(false);
          setPendingAction(null);
        }}
        onContinueAsGuest={handleGuestContinue}
        action={pendingAction || "cart"}
      />
      */}

      <div>category: {props?.data?.categoryName?.name}</div>
      <div>subCategory: {props?.data?.subCategoryName?.name}</div>
      {availableQuantity === 0 ? (
        <h5 className="text-danger">Currently Out of Stock</h5>
      ) : availableQuantity < quantity ? (
        <h5 className="text-danger">{`Only ${availableQuantity} units left`}</h5>
      ) : null}
      <br />
      <div className="d-flex align-items-center flex-wrap gap-2">
        <span style={{ color: "#666", fontSize: "14px" }}>Total Price:</span>
        <div className="productDetails-price-section">
          <span className="productDetails-current-price">{formattedPrice}</span>
          <span className="productDetails-original-price">
            {formattedOriginalPrice}
          </span>
          <span className="productDetails-discount-badge">
            -{discountInfo.discountPercent}%
          </span>
        </div>
      </div>
      <br />
      <div className="d-flex gap-2 align-items-center">
        <Button
          shape="circle"
          icon={<AiOutlineMinus />}
          disabled={quantity === 1}
          onClick={() => updateQuantity("decrement")}
        />
        <div>{quantity}</div>
        <Button
          shape="circle"
          icon={<AiOutlinePlus />}
          disabled={availableQuantity <= quantity}
          onClick={() => updateQuantity("increment")}
        />
      </div>
      <br />
      <div className="d-flex gap-2 align-items-center">
        {availableQuantity > 0 && (
          <Button
            className="buybtn btn-clr"
            // type="primary"
            onClick={() => {
              props?.handleBuyNow(quantity);
              buyNow();
            }}
          >
            Buy Now
          </Button>
        )}
        <Button
          className="buybtn"
          onClick={() => {
            if (isProductInCart) {
              router.push("/cart");
            } else {
              addToCart();
            }
          }}
        >
          {isProductInCart ? "View Cart" : "Add to Cart"}
        </Button>
      </div>
      <br />
      {/* PROMOTIONS Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "24px",
          alignItems: "stretch",
          marginBottom: "22px",
          flexWrap: "wrap",
        }}
      >
        {/* Promotions Card */}
        <div
          style={{
            background: "linear-gradient(90deg, #fff4f8 60%, #eff1f5 100%)",
            borderRadius: "14px",
            padding: "22px 24px",
            boxShadow: "0 4px 16px rgba(255,95,21,0.10)",
            border: "1.5px solid #fff4f8",
            fontFamily: "inherit",
            minWidth: 280,
            maxWidth: 480,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="12" fill="#FF5F15" />
              <path
                d="M17 9.5C17 8.11929 15.8807 7 14.5 7C13.1193 7 12 8.11929 12 9.5C12 10.8807 13.1193 12 14.5 12C15.8807 12 17 10.8807 17 9.5Z"
                fill="white"
              />
              <path
                d="M7 14.5C7 13.1193 8.11929 12 9.5 12C10.8807 12 12 13.1193 12 14.5C12 15.8807 10.8807 17 9.5 17C8.11929 17 7 15.8807 7 14.5Z"
                fill="white"
              />
            </svg>
            <span
              style={{
                fontWeight: 700,
                color: "#FF5F15",
                fontSize: 19,
                letterSpacing: 1,
              }}
            >
              PROMOTIONS
            </span>
          </div>
          <div
            style={{
              color: "#222",
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            Call{" "}
            <a
              href="tel:09117356897"
              style={{
                color: "#FF5F15",
                textDecoration: "underline dotted",
                fontWeight: 700,
              }}
            >
              0911 735 6897
            </a>{" "}
            to place your order{" "}
            <span style={{ color: "#888c99", fontWeight: 400 }}>|</span>{" "}
            <span style={{ color: "#003f4a", fontWeight: 600 }}>
              for wholesale prices
            </span>
          </div>
          <div
            style={{
              color: "#008060",
              fontSize: 16,
              fontWeight: 600,
              marginTop: 2,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="24" height="24" rx="12" fill="#003f4a" />
              <path
                d="M7 13.5L10.5 17L17 10.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                background: "#eff1f5",
                borderRadius: 8,
                padding: "3px 12px",
                fontSize: 15,
                color: "#003f4a",
              }}
            >
              Free shipping nationwide till <b>April 30th</b>
            </span>
          </div>
        </div>
        {/* Message to Seller Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "22px 24px",
            boxShadow: "0 4px 16px rgba(38,41,65,0.07)",
            border: "1.5px solid #eff1f5",
            fontFamily: "inherit",
            minWidth: 280,
            maxWidth: 380,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "#262941",
              fontSize: 17,
              marginBottom: 2,
              letterSpacing: 0.5,
            }}
          >
            Send a message to seller
          </div>
          <form
            style={{ width: "100%" }}
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem(
                "message",
              ) as HTMLInputElement;
              const message = input.value.trim();
              const nameInput = form.elements.namedItem(
                "name",
              ) as HTMLInputElement;
              const emailInput = form.elements.namedItem(
                "email",
              ) as HTMLInputElement;
              const phoneInput = form.elements.namedItem(
                "phone",
              ) as HTMLInputElement;
              const subjectInput = form.elements.namedItem(
                "subject",
              ) as HTMLInputElement;
              const name = nameInput?.value.trim() || "";
              const email = emailInput?.value.trim() || "";
              const phone = phoneInput?.value.trim() || "";
              const subject = subjectInput?.value.trim() || "";
              if (!message || !name || !email || !phone || !subject) {
                api.error({
                  message: "All fields are required",
                  description: "Please fill in all fields.",
                });
                return;
              }
              try {
                const res = await fetch("/Enquiry/post", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name,
                    email,
                    phone,
                    subject,
                    message,
                  }),
                });
                if (res.ok) {
                  api.success({
                    message: "Message sent!",
                    description: "Your enquiry has been delivered.",
                  });
                  input.value = "";
                  nameInput.value = "";
                  emailInput.value = "";
                  phoneInput.value = "";
                  subjectInput.value = "";
                } else {
                  api.error({
                    message: "Failed to send message",
                    description: "Please try again later.",
                  });
                }
              } catch {
                api.error({
                  message: "Failed to send message",
                  description: "Please try again later.",
                });
              }
            }}
          >
            <textarea
              name="name"
              placeholder="Your Name"
              style={{
                width: "100%",
                borderRadius: 8,
                border: "1px solid #d9d9d9",
                padding: "10px 12px",
                fontSize: 15,
                fontFamily: "inherit",
                marginBottom: 8,
                background: "#fafbfc",
                color: "#262941",
              }}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Your Email"
              style={{
                width: "100%",
                borderRadius: 8,
                border: "1px solid #d9d9d9",
                padding: "10px 12px",
                fontSize: 15,
                fontFamily: "inherit",
                marginBottom: 8,
                background: "#fafbfc",
                color: "#262941",
              }}
              required
            />
            <input
              name="phone"
              type="tel"
              placeholder="Your Phone Number"
              style={{
                width: "100%",
                borderRadius: 8,
                border: "1px solid #d9d9d9",
                padding: "10px 12px",
                fontSize: 15,
                fontFamily: "inherit",
                marginBottom: 8,
                background: "#fafbfc",
                color: "#262941",
              }}
              required
            />
            <select
              name="subject"
              required
              style={{
                width: "100%",
                borderRadius: 8,
                border: "1px solid #d9d9d9",
                padding: "10px 12px",
                fontSize: 15,
                fontFamily: "inherit",
                marginBottom: 8,
                background: "#fafbfc",
                color: "#262941",
                appearance: "none",
              }}
            >
              <option value="">Select Subject</option>
              <option value="Booking">Booking</option>
              <option value="Orders">Orders</option>
              <option value="Services">Services</option>
              <option value="Others">Others</option>
            </select>
            <textarea
              name="message"
              placeholder="Type your message here..."
              rows={3}
              style={{
                width: "100%",
                borderRadius: 8,
                border: "1px solid #d9d9d9",
                padding: "10px 12px",
                fontSize: 15,
                fontFamily: "inherit",
                resize: "vertical",
                marginBottom: 8,
                background: "#fafbfc",
                color: "#262941",
              }}
              required
            />
            <button
              type="submit"
              style={{
                background:
                  "linear-gradient(to bottom, #FFBF00 0%, #FF5F15 40%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(255,95,21,0.08)",
                transition: "background 0.2s",
              }}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
      {/* Additional Actions */}
      <div className="d-flex gap-2 align-items-center">
        <Button
          type="text"
          className="productDetails-text-btn1 ps-md-0"
          onClick={() => {
            if (user) {
              AddWishlist();
            } else {
              router.push("/login");
            }
          }}
          icon={
            favourited ? (
              <FaHeart
                color="#FF006A"
                // className={isWobbling ? "wobble" : ""}
                size={20}
              />
            ) : (
              <FaHeart color="#DBDBDB" size={20} />
            )
          }
        />
        <Button onClick={shareLink}>Share</Button>
      </div>
    </div>
  );
}
export default Description;
