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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isProductInCart = cartItems?.some(
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
  const [Notifications, contextHolder] = notification.useNotification();
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
        Notifications.error({ message: `Failed to share link` });
      }
    } catch {
      Notifications.error({ message: `Failed to share link` });
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

    // Track Add to Cart for analytics
    const gaItem = formatGAItem(props.data, props.currentVariant, quantity);
    trackAddToCart(gaItem);

    // Check if user is logged in
    if (!user?.user) {
      // Guest user - add to local cart
      const { addToGuestCart } = await import("@/redux/slice/cartSlice");

      const guestCartItem = {
        productId: props?.data?.pid,
        name: props?.data?.name,
        price: props?.currentVariant?.price ?? props?.data?.retail_rate,
        quantity: quantity,
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
      Notifications.success({ message: "Added to cart successfully!" });
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
              if (user) {
                props?.handleBuyNow(quantity);
                buyNow();
              } else {
                router.push("/login");
              }
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
              if (user) {
                addToCart();
              } else {
                router.push("/login");
              }
            }
          }}
        >
          {isProductInCart ? "View Cart" : "Add to Cart"}
        </Button>
      </div>
      <br />
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
