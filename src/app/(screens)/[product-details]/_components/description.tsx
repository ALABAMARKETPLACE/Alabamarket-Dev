// "use client";
// import { useAppSelector } from "@/redux/hooks";
// import { reduxSettings } from "@/redux/slice/settingsSlice";
// import { Button, notification } from "antd";
// import React, { useState } from "react";
// import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
// import { FaHeart } from "react-icons/fa6";
// import { RiFlag2Fill } from "react-icons/ri";
// import { storeCheckout } from "../../../../redux/slice/checkoutSlice";
// import { useDispatch } from "react-redux";
// import { useRouter } from "next/navigation";
// import API from "../../../../config/API";
// import { POST } from "../../../../util/apicall";
// type Props = {
//   data: any;
//   currentVariant: any;
//   handleBuyNow: (val: any) => void;
// };
// function Description(props: Props) {
//   //const values
//   const router = useRouter();
//   // const availableQuantity = props?.currentVariant?.units || props?.data?.unit;
//   const availableQuantity = props?.currentVariant?.units ?? props?.data?.unit ?? 0;
//   const settings = useAppSelector(reduxSettings);
//   const [Notifications, contextHolder] = notification.useNotification();
//   const dispatch = useDispatch();
//   const navigate = useRouter();
//   //state
//   const [quantity, setQuantity] = useState<number>(1);
//   const [favourited, setFavourited] = useState(props?.data ?? false);
//   const [isWobbling, setIsWobbling] = useState(false);

//   const updateQuantity = (type: "increment" | "decrement") => {
//     if (type === "increment") {
//       setQuantity((prev) => prev + 1);
//     } else if (type === "decrement") {
//       setQuantity((prev) => prev - 1);
//     }
//   };
//   const shareLink = async () => {
//     try {
//       if (navigator?.share) {
//         await navigator.share({
//           title: document?.title,
//           url: window?.location?.href,
//         });
//       } else {
//         Notifications.error({ message: `Failed to share link` });
//       }
//     } catch (err) {
//       Notifications.error({ message: `Failed to share link` });
//     }
//   };

//   const buyNow = () => {
//     if (props?.data?.status != true) {
//       notification.error({ message: `Product is Temporarily not Available` });
//       return;
//     // } else if (props?.data?.unit == 0) {
//     //   notification.error({ message: `Product is Out of Stock!!` });
//     //   return;
//     }else if (availableQuantity === 0) {
//       notification.error({ message: `Product is Out of Stock!!` });
//       return;
//     } else if (quantity > props?.data?.unit) {
//       notification.error({ message: `Selected Quantity is Not Available.` });
//       return;
//     }
//     // if (activeVariant?.variant?.id) {
//     //   if (activeVariant?.variant?.units == 0) {
//     //     notification.error({ message: `This Variant is out of stock` });
//     //     return;
//     //   } else if (quantity > activeVariant?.variant?.units) {
//     //     notification.error({
//     //       message: `Selected Quantity is Not Available for this Variant`,
//     //     });
//     //     return;
//     //   }
//     // }

//     const obj = {
//       name: props?.data?.name,
//       buyPrice: props?.currentVariant?.price ?? props?.data?.retail_rate,
//       productId: props?.data?._id,
//       quantity: quantity,
//       storeId: props?.data?.store_id,
//       totalPrice: Number(
//         (props?.currentVariant?.price
//           ? props?.currentVariant?.price
//           : props?.data?.retail_rate) * quantity
//       ),
//       variantId: props?.currentVariant?.id ?? null,
//       image: props?.currentVariant?.id
//         ? props?.currentVariant?.image
//         : props?.data?.image,
//       combination: props?.currentVariant?.combination,
//       storeName: props?.data?.storeDetails?.store_name,
//     };
//     dispatch(storeCheckout([obj]));
//     navigate.push("/checkout");
//   };

//   const addToCart = async (item: any, quantity: number) => {
//     //if there is an active variant it's price will be added to cart.
//     const obj = {
//       productId: props?.data?.pid,
//       quantity: quantity,
//       variantId: props?.currentVariant?.id ?? null,
//     };
//     const url = API.CART;
//     try {
//       // setLoadingCart(true);
//       const newCart: any = await POST(url, obj);
//       if (newCart.status) {
//         Notifications.success({ message: newCart?.message });
//         // loadCartItems();
//         setTimeout(() => {
//           router.push("/cart");
//         }, 1000);
//       } else {
//         Notifications.error({ message: newCart?.message });
//       }
//     } catch (err: any) {
//       Notifications.error({ message: "Something went wrong!" });
//     } finally {
//       // setLoadingCart(false);
//     }
//   };
//   const AddWishlist = async () => {
//     const obj = {
//       productId: props?.data?.pid,
//       variantId: props?.currentVariant?.id ?? null,
//     };
//     const url = API.WISHLIST;

//     try {
//       const response = await POST(url, obj);

//       if (response?.status) {
//         setFavourited(!favourited);
//         const message = favourited
//           ? "Item removed from wishlist."
//           : "Successfully added to Wishlist";
//         Notifications.success({ message });
//       } else {
//         Notifications.error({ message: response?.message });
//       }
//     } catch (error) {
//       console.error("Error toggling wishlist:", error);
//       Notifications.error({
//         message: "Something went wrong. Please try again later.",
//       });
//     }
//   };
//   return (
//     <div>
//       {contextHolder}
//       <div>category:{props?.data?.categoryName?.name}</div>
//       <div>subCategory:{props?.data?.subCategoryName?.name}</div>
//       {/* {!availableQuantity ? (
//         <h5 className="text-danger">Currently Out of Stock</h5>
//       ) : availableQuantity <= quantity ? (
//         <h5 className="text-danger">{`Only ${availableQuantity} units left`}</h5>
//       ) : null} */}
//       {availableQuantity === 0 ? (
//         <h5 className="text-danger">Currently Out of Stock</h5>
//       ) : availableQuantity < quantity ? (
//         <h5 className="text-danger">{`Only ${availableQuantity} units left`}</h5>
//       ) : null}
//       <br />
//       {new Intl.NumberFormat("en-US", {
//         style: "currency",
//         currency: settings.currency ?? "INR",
//       }).format(props?.currentVariant?.price ?? props?.data?.retail_rate)}
//       <br />
//       <div className="d-flex gap-2 align-items-center">
//         <Button
//           shape="circle"
//           icon={<AiOutlineMinus />}
//           disabled={quantity === 0}
//           onClick={() => updateQuantity("decrement")}
//         />
//         <div>{quantity}</div>
//         <Button
//           shape="circle"
//           icon={<AiOutlinePlus />}
//           disabled={availableQuantity <= quantity}
//           onClick={() => updateQuantity("increment")}
//         />
//       </div>
//       <br />
//       <div className="d-flex gap-2 align-items-center">
//         <Button
//           type="primary"
//           onClick={() => {
//             props?.handleBuyNow(quantity);
//             buyNow();
//           }}
//         >
//           Buy Now
//         </Button>
//         <Button
//           onClick={() => {
//             if (props?.data?.status != true) {
//               notification.error({
//                 message: `Product is Temporarily not Available`,
//               });
//               return;
//             } else if (props?.data?.unit == 0) {
//               notification.error({
//                 message: `Product is Out of Stock!!`,
//               });
//               return;
//             } else if (quantity > props?.data?.unit) {
//               notification.error({
//                 message: `Selected Quantity is Not Available.`,
//               });
//               return;
//             }
//             // if (activeVariant?.variant?.id) {
//             //   if (activeVariant?.variant?.units == 0) {
//             //     notification.error({
//             //       message: `This Variant is out of stock`,
//             //     });
//             //     return;
//             //   } else if (quantity > activeVariant?.variant?.units) {
//             //     notification.error({
//             //       message: `Selected Quantity is Not Available for this Variant`,
//             //     });
//             //     return;
//             //   }
//             // }
//             addToCart(props?.data, quantity);
//           }}
//         >
//           Add to Cart
//         </Button>
//       </div>
//       <br />
//       <div className="d-flex gap-2 align-items-center">
//           <Button
//           type="text"
//           className="productDetails-text-btn1 ps-md-0"
//           onClick={AddWishlist}
//           icon={
//             favourited ? (
//               <FaHeart color="#ff006a" className={isWobbling ? "wobble" : ""} size={20} />
//             ) : (
//               <FaHeart color="#dbdbdb" size={20} />
//             )
//           }
//         >
//           {/* Optional: Add button text */}
//         </Button>
//         <Button onClick={shareLink}>Share</Button>
//         <div> Any Problem with Product?</div>
//         <Button type="text" icon={<RiFlag2Fill />}>
//           Report
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default Description;

"use client";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { Button, notification } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { FaHeart } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import API from "../../../../config/API";
import { storeCheckout } from "../../../../redux/slice/checkoutSlice";
import { GET, POST } from "../../../../util/apicall";
import { useSession } from "next-auth/react";
type Props = {
  data: any;
  currentVariant: any;
  handleBuyNow: (val: any) => void;
};
function Description(props: Props) {
  const cartItems = useSelector((state: any) => state.Cart.items);
  const isProductInCart = cartItems?.some(
    (item: any) => item.productId === props?.data?._id
  );
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: user }: any = useSession();
  const checkWishlistStatus = async () => {
    try {
      const res = await GET(API.WISHLIST_GETALL);
      const isInWishlist = res?.data?.some(
        (item: any) => {
          return item.pid == props.data.pid;
        }
        // (!props.currentVariant?.id
        //   || item.variantId === props.currentVariant.id)
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
  const [totalPrice, setTotalPrice] = useState<number>(0);
  // const [favourited, setFavourited] = useState(props?.data ?? false);
  const [isWobbling, setIsWobbling] = useState(false);
  const [favourited, setFavourited] = useState(false);
  useEffect(() => {
    const basePrice =
      props?.currentVariant?.price ?? props?.data?.retail_rate ?? 0;
    setTotalPrice(basePrice * quantity);
  }, [quantity, props?.currentVariant, props?.data]);

  useEffect(() => {
    if (props?.data?.pid) {
      checkWishlistStatus();
    }
  }, [props?.data?.pid]);

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
    } catch (err) {
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

  const addToCart = async (item: any, quantity: number) => {
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
    const obj = {
      productId: props?.data?.pid,
      quantity: quantity,
      variantId: props?.currentVariant?.id ?? null,
    };
    const url = API.CART;
    try {
      const newCart: any = await POST(url, obj);
      if (newCart.status) {
        Notifications.success({ message: newCart?.message });
        setTimeout(() => {
          router.push("/cart");
        }, 1000);
      } else {
        Notifications.error({ message: newCart?.message });
      }
    } catch (err: any) {
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
      <div className="d-flex align-items-center ">
        Total Price:{" "}
        <div className="fs-5 fw-bold pl-3 ms-3">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: settings.currency ?? "INR",
          }).format(totalPrice)}
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
        {/* <Button
            type="primary"
            onClick={() => {
              props?.handleBuyNow(quantity);
              buyNow();
            }}
          >
            Buy Now
          </Button> */}
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
                addToCart(props?.data, quantity);
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
                className={isWobbling ? "wobble" : ""}
                size={20}
              />
            ) : (
              <FaHeart color="#DBDBDB" size={20} />
            )
          }
        />
        <Button onClick={shareLink}>Share</Button>
        {/* <div>Any Problem with Product?</div> */}
        {/* <Button type="text" icon={<RiFlag2Fill />}>
            Report
          </Button> */}
      </div>
    </div>
  );
}
export default Description;
