"use client";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { notification, Form, Input, Select } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus, AiOutlineMessage, AiOutlinePhone, AiOutlineMail, AiOutlineUser, AiOutlineTags, AiOutlineShoppingCart } from "react-icons/ai";
import { FaHeart } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import API from "../../../../config/API";
import { GET, POST } from "../../../../util/apicall";
import { useSession } from "next-auth/react";
import { formatGAItem, trackAddToCart } from "@/utils/analytics";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

type EnquiryFormValues = {
  subject: string;
  name: string;
  email: string;
  phone: string;
  message: string;
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
  pid?: string;
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
  const [form] = Form.useForm<EnquiryFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      // Use the pid passed from page.tsx (the exact value used to fetch the product)
      const shareUrl = props?.pid
        ? `${window.location.origin}${window.location.pathname}?pid=${props.pid}`
        : `${window.location.origin}${window.location.pathname}`;
      if (navigator?.share) {
        await navigator.share({
          title: document?.title,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        api.success({ message: "Link copied to clipboard" });
      }
    } catch {
      api.error({ message: `Failed to share link` });
    }
  };

  const onFinishSendMessage = async (values: EnquiryFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await POST(API.ENQUIRY_CREATE, {
        ...values,
        productName: props?.data?.name ?? "",
        storeName: props?.data?.storeDetails?.store_name ?? "",
      });
      if (response?.status) {
        api.success({
          message: "Message submitted successfully",
          description: "We'll get back to you within 24 hours.",
        });
        form.resetFields();
      } else {
        api.error({ message: response?.message || "Failed to send message" });
      }
    } catch (err) {
      api.error({
        message: "Failed to send message",
        description:
          err instanceof Error ? err.message : "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        api.success({ message: newCart?.message });
        setTimeout(() => {
          router.push("/cart");
        }, 1000);
      } else {
        api.error({ message: newCart?.message });
      }
    } catch {
      api.error({ message: "Something went wrong!" });
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
        api.success({ message });
      } else {
        api.error({ message: response?.message });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      api.error({
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  return (
    <div className="pd-description">
      {contextHolder}

      {/* Category breadcrumb */}
      {(props?.data?.categoryName?.name ||
        props?.data?.subCategoryName?.name) && (
        <div className="pd-category-breadcrumb">
          {props?.data?.categoryName?.name && (
            <span className="pd-category-chip">
              {props?.data?.categoryName?.name}
            </span>
          )}
          {props?.data?.subCategoryName?.name && (
            <>
              <span className="pd-category-sep">›</span>
              <span className="pd-category-chip">
                {props?.data?.subCategoryName?.name}
              </span>
            </>
          )}
        </div>
      )}

      {/* Stock status */}
      {availableQuantity === 0 ? (
        <div className="pd-stock-badge pd-stock-badge--out">
          <span>✕</span> Out of Stock
        </div>
      ) : availableQuantity <= 5 ? (
        <div className="pd-stock-badge pd-stock-badge--low">
          <span>⚡</span> Only {availableQuantity} left
        </div>
      ) : (
        <div className="pd-stock-badge pd-stock-badge--in">
          <span>✓</span> In Stock
        </div>
      )}

      {/* Price block */}
      <div className="pd-price-block">
        <div className="pd-price-label">Total Price</div>
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

      {/* Quantity + action buttons */}
      <div className="pd-purchase-section">
        <div className="pd-qty-row">
          <span className="pd-qty-label">Quantity</span>
          <div className="pd-qty-control">
            <button
              className="pd-qty-btn"
              disabled={quantity === 1}
              onClick={() => updateQuantity("decrement")}
            >
              <AiOutlineMinus />
            </button>
            <span className="pd-qty-value">{quantity}</span>
            <button
              className="pd-qty-btn"
              disabled={availableQuantity <= quantity}
              onClick={() => updateQuantity("increment")}
            >
              <AiOutlinePlus />
            </button>
          </div>
          {availableQuantity > 0 && availableQuantity <= 10 && (
            <span className="pd-qty-hint">Only {availableQuantity} left</span>
          )}
        </div>
        <button
          className={`pd-cart-cta${isProductInCart ? " pd-cart-cta--in-cart" : ""}`}
          disabled={availableQuantity === 0}
          onClick={() => {
            if (isProductInCart) {
              router.push("/cart");
            } else {
              addToCart();
            }
          }}
        >
          <AiOutlineShoppingCart size={20} />
          {isProductInCart
            ? "Go to Cart →"
            : availableQuantity === 0
              ? "Out of Stock"
              : "Add to Cart"}
        </button>
      </div>

      {/* PROMOTIONS + ENQUIRY Section */}
      <div className="promo-enquiry-section">
        {/* Promotions Card */}
        <div className="promo-card">
          <div className="promo-card__header">
            <div className="promo-card__badge">
              <AiOutlineTags size={13} />
              PROMOTIONS
            </div>
            <div className="promo-card__title">Special Offers</div>
            <div className="promo-card__subtitle">
              Exclusive deals for our customers
            </div>
          </div>
          <div className="promo-card__body">
            <div className="promo-card__cta">
              <div className="promo-card__cta-label">
                Wholesale Prices Available
              </div>
              <a href="tel:09117356897" className="promo-card__phone">
                0911 735 6897
              </a>
              <div className="promo-card__cta-hint">
                Call to place your order
              </div>
            </div>
            <div className="promo-card__shipping">
              <span className="promo-card__shipping-emoji">🚚</span>
              <div>
                <div className="promo-card__shipping-title">
                  Free Nationwide Shipping
                </div>
                <div className="promo-card__shipping-date">
                  Valid till <strong>April 30th</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message to Seller Card */}
        <div className="enquiry-card">
          <div className="enquiry-card__header">
            <div className="enquiry-card__title">
              <AiOutlineMessage size={18} />
              Message the Seller
            </div>
            <div className="enquiry-card__subtitle">
              <span className="enquiry-card__dot" />
              Usually responds within 24 hours
            </div>
          </div>
          <div className="enquiry-card__form">
            <Form form={form} onFinish={onFinishSendMessage} layout="vertical">
              <Form.Item
                name="subject"
                label="Subject"
                rules={[
                  { required: true, message: "Please select a subject" },
                ]}
              >
                <Select placeholder="What is this about?">
                  <Select.Option value="orders">Orders</Select.Option>
                  <Select.Option value="services">Services</Select.Option>
                  <Select.Option value="others">Others</Select.Option>
                </Select>
              </Form.Item>
              <div className="enquiry-form__row">
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input
                    prefix={
                      <AiOutlineUser className="enquiry-form__icon" />
                    }
                    placeholder="Your name"
                  />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input
                    prefix={
                      <AiOutlinePhone className="enquiry-form__icon" />
                    }
                    type="tel"
                    placeholder="Phone number"
                  />
                </Form.Item>
              </div>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Valid email required",
                  },
                ]}
              >
                <Input
                  prefix={<AiOutlineMail className="enquiry-form__icon" />}
                  placeholder="your@email.com"
                />
              </Form.Item>
              <Form.Item
                name="message"
                label="Message"
                rules={[{ required: true, message: "Please write a message" }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Type your message here..."
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <button
                  type="submit"
                  className="enquiry-form__submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="enquiry-form__spinner" />
                      Sending…
                    </>
                  ) : (
                    "Send Message →"
                  )}
                </button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
      {/* Secondary actions */}
      <div className="pd-secondary-actions">
        <button
          className={`pd-wishlist-btn${favourited ? " pd-wishlist-btn--active" : ""}`}
          onClick={() => {
            if (user) {
              AddWishlist();
            } else {
              router.push("/login");
            }
          }}
        >
          <FaHeart size={15} />
          {favourited ? "Saved" : "Save"}
        </button>
        <button className="pd-share-btn" onClick={shareLink}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
export default Description;
