/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendGAEvent } from "@next/third-parties/google";

type GAEcommerceItem = {
  item_id: string;
  item_name: string;
  affiliation?: string;
  coupon?: string;
  currency?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;
  quantity?: number;
};

type GAEcommerceParams = {
  currency?: string;
  value?: number;
  coupon?: string;
  items?: GAEcommerceItem[];
  transaction_id?: string;
  shipping?: number;
  tax?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const trackEvent = (eventName: string, params?: GAEcommerceParams) => {
  try {
    if (params) {
      sendGAEvent("event", eventName, params);
    } else {
      sendGAEvent("event", eventName);
    }
  } catch (error) {
    console.error("Failed to track GA event:", error);
  }
};

export const trackViewItem = (item: GAEcommerceItem, value?: number, currency = "NGN") => {
  trackEvent("view_item", {
    currency,
    value: value ?? item.price,
    items: [item],
  });
};

export const trackAddToCart = (item: GAEcommerceItem, value?: number, currency = "NGN") => {
  trackEvent("add_to_cart", {
    currency,
    value: value ?? item.price,
    items: [item],
  });
};

export const trackBeginCheckout = (items: GAEcommerceItem[], value: number, currency = "NGN") => {
  trackEvent("begin_checkout", {
    currency,
    value,
    items,
  });
};

export const trackPurchase = (
  transactionId: string,
  items: GAEcommerceItem[],
  value: number,
  currency = "NGN",
  shipping = 0,
  tax = 0
) => {
  trackEvent("purchase", {
    transaction_id: transactionId,
    value,
    currency,
    shipping,
    tax,
    items,
  });
};

// Helper to format product data for GA
export const formatGAItem = (product: any, variant?: any, quantity = 1): GAEcommerceItem => {
  return {
    item_id: product?.pid || product?._id || product?.id,
    item_name: product?.name,
    item_brand: product?.brand || product?.storeDetails?.store_name,
    item_category: product?.categoryName?.name,
    item_category2: product?.subCategoryName?.name,
    item_variant: variant?.combination?.map((c: any) => c.value).join("-"),
    price: Number(variant?.price ?? product?.retail_rate ?? product?.price ?? 0),
    quantity,
  };
};
