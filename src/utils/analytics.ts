/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendGAEvent } from "@next/third-parties/google";

import {
  DEFAULT_CURRENCY,
  newEventId,
  pixelAddPaymentInfo,
  pixelAddToCart,
  pixelAddToWishlist,
  pixelCompleteRegistration,
  pixelContact,
  pixelInitiateCheckout,
  pixelPurchase,
  pixelSearch,
  pixelSubmitApplication,
  pixelViewContent,
  getContentId,
  type PixelContent,
} from "./metaPixel";

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

/* ────────────────────────────────────────────────────────────────────────── */
/* GA item → Meta Pixel content                                               */
/* ────────────────────────────────────────────────────────────────────────── */

const toPixelContents = (items: GAEcommerceItem[] = []): PixelContent[] =>
  items
    .filter((item) => item?.item_id)
    .map((item) => ({
      id: String(item.item_id),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      item_price: Number(item.price) || 0,
    }));

const lineValue = (item: GAEcommerceItem): number =>
  (Number(item?.price) || 0) * (Number(item?.quantity) || 1);

/* ────────────────────────────────────────────────────────────────────────── */
/* Ecommerce funnel — each helper fires GA4 and the Meta Pixel together        */
/* ────────────────────────────────────────────────────────────────────────── */

/** Product detail view → GA `view_item` + Meta `ViewContent`. */
export const trackViewItem = (
  item: GAEcommerceItem,
  value?: number,
  currency = DEFAULT_CURRENCY,
) => {
  trackEvent("view_item", {
    currency,
    value: value ?? item.price,
    items: [item],
  });

  const [content] = toPixelContents([item]);
  if (content) {
    pixelViewContent(
      { ...content, quantity: 1, item_price: value ?? item.price ?? 0 },
      { name: item.item_name, category: item.item_category, currency },
    );
  }
};

/** Add to cart → GA `add_to_cart` + Meta `AddToCart`. */
export const trackAddToCart = (
  item: GAEcommerceItem,
  value?: number,
  currency = DEFAULT_CURRENCY,
) => {
  trackEvent("add_to_cart", {
    currency,
    value: value ?? lineValue(item),
    items: [item],
  });

  const [content] = toPixelContents([item]);
  if (content) {
    pixelAddToCart(content, {
      name: item.item_name,
      category: item.item_category,
      currency,
    });
  }
};

/** Wishlist save → GA `add_to_wishlist` + Meta `AddToWishlist`. */
export const trackAddToWishlist = (
  item: GAEcommerceItem,
  currency = DEFAULT_CURRENCY,
) => {
  trackEvent("add_to_wishlist", {
    currency,
    value: item.price,
    items: [item],
  });

  const [content] = toPixelContents([item]);
  if (content) {
    pixelAddToWishlist(content, {
      name: item.item_name,
      category: item.item_category,
      currency,
    });
  }
};

/** Search results shown → GA `search` + Meta `Search`. */
export const trackSearch = (
  searchTerm: string,
  items: GAEcommerceItem[] = [],
  currency = DEFAULT_CURRENCY,
) => {
  const term = String(searchTerm ?? "").trim();
  if (!term) return;

  trackEvent("search", { search_term: term, items });
  pixelSearch(term, toPixelContents(items), currency);
};

/** Checkout opened → GA `begin_checkout` + Meta `InitiateCheckout`. */
export const trackBeginCheckout = (
  items: GAEcommerceItem[],
  value: number,
  currency = DEFAULT_CURRENCY,
) => {
  trackEvent("begin_checkout", { currency, value, items });
  pixelInitiateCheckout(toPixelContents(items), value, currency);
};

/** Payment method chosen → GA `add_payment_info` + Meta `AddPaymentInfo`. */
export const trackAddPaymentInfo = (
  items: GAEcommerceItem[],
  value: number,
  paymentProvider?: string,
  currency = DEFAULT_CURRENCY,
) => {
  trackEvent("add_payment_info", {
    currency,
    value,
    items,
    payment_type: paymentProvider,
  });
  pixelAddPaymentInfo(toPixelContents(items), value, currency, paymentProvider);
};

/** Order confirmed → GA `purchase` + Meta `Purchase`. */
export const trackPurchase = (
  transactionId: string,
  items: GAEcommerceItem[],
  value: number,
  currency = DEFAULT_CURRENCY,
  shipping = 0,
  tax = 0,
  eventId?: string,
) => {
  trackEvent("purchase", {
    transaction_id: transactionId,
    value,
    currency,
    shipping,
    tax,
    items,
  });

  pixelPurchase(toPixelContents(items), value, currency, {
    orderId: transactionId,
    eventId,
  });
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Non-ecommerce conversions                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

/** Seller / driver / delivery-company application submitted. */
export const trackSubmitApplication = (applicationType: string) => {
  trackEvent("submit_application", { application_type: applicationType });
  pixelSubmitApplication(applicationType);
};

/** Shopper account created. */
export const trackSignUp = (method = "email") => {
  trackEvent("sign_up", { method });
  pixelCompleteRegistration(method);
};

/** Contact / product-enquiry form submitted. */
export const trackContact = (source: string) => {
  trackEvent("generate_lead", { source });
  pixelContact(source);
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Purchase hand-off across the payment redirect                              */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * The gateway takes the shopper off-site with a full page load, so the cart is
 * gone by the time we land on /checkoutsuccess. Stash everything Purchase needs
 * before redirecting, then fire it once on return.
 */
const PENDING_PURCHASE_KEY = "pending_purchase_analytics";

type PendingPurchase = {
  eventId: string;
  items: GAEcommerceItem[];
  value: number;
  currency: string;
  shipping: number;
  tax: number;
};

export const stashPendingPurchase = (
  items: GAEcommerceItem[],
  value: number,
  currency = DEFAULT_CURRENCY,
  shipping = 0,
  tax = 0,
) => {
  if (typeof window === "undefined") return;
  try {
    const pending: PendingPurchase = {
      eventId: newEventId(),
      items,
      value: Number(value) || 0,
      currency,
      shipping: Number(shipping) || 0,
      tax: Number(tax) || 0,
    };
    localStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(pending));
  } catch {
    /* storage unavailable — Purchase falls back to the order total below */
  }
};

export const clearPendingPurchase = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PENDING_PURCHASE_KEY);
  } catch {
    /* ignore */
  }
};

/**
 * Fire the stashed Purchase. Removes the stash first so a page refresh on the
 * confirmation screen cannot double-count the conversion. `fallbackValue` is
 * used when the stash is missing (private mode, storage cleared).
 */
export const flushPendingPurchase = (
  transactionId: string,
  fallbackValue?: number,
  fallbackCurrency = DEFAULT_CURRENCY,
) => {
  if (typeof window === "undefined") return;

  let pending: PendingPurchase | null = null;
  try {
    const raw = localStorage.getItem(PENDING_PURCHASE_KEY);
    localStorage.removeItem(PENDING_PURCHASE_KEY);
    pending = raw ? (JSON.parse(raw) as PendingPurchase) : null;
  } catch {
    pending = null;
  }

  if (pending?.items?.length) {
    trackPurchase(
      transactionId,
      pending.items,
      pending.value,
      pending.currency,
      pending.shipping,
      pending.tax,
      pending.eventId,
    );
    return;
  }

  if (fallbackValue !== undefined && Number.isFinite(Number(fallbackValue))) {
    trackPurchase(transactionId, [], Number(fallbackValue), fallbackCurrency);
  }
};

/* ────────────────────────────────────────────────────────────────────────── */

// Helper to format product data for GA (and, via toPixelContents, for Meta)
export const formatGAItem = (product: any, variant?: any, quantity = 1): GAEcommerceItem => {
  return {
    // getContentId is the single source of truth for catalogue IDs, so GA and
    // the Meta Pixel always report the same identifier for a product.
    item_id: getContentId(product),
    item_name: product?.name,
    item_brand: product?.brand || product?.storeDetails?.store_name,
    item_category: product?.categoryName?.name,
    item_category2: product?.subCategoryName?.name,
    item_variant: variant?.combination?.map((c: any) => c.value).join("-"),
    price: Number(variant?.price ?? product?.buyPrice ?? product?.retail_rate ?? product?.price ?? 0),
    quantity,
  };
};

export type { GAEcommerceItem };
