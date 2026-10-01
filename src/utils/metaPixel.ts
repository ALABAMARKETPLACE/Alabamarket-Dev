/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Meta Pixel (fbq) wrapper.
 *
 * The base pixel snippet is injected in `src/app/layout.tsx` and only loads on
 * the production hostname, so every helper here is a no-op when `fbq` is absent
 * (local dev, preview builds, ad blockers). Call sites never need to guard.
 *
 * Parameter names follow Meta's standard-event reference. `content_ids` must
 * match the product IDs in the Meta catalogue for dynamic/catalogue ads — that
 * mapping lives in `getContentId()` alone, so it is a one-line change if the
 * catalogue is ever keyed on something other than `pid`.
 */

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "2200490810890736";

export const DEFAULT_CURRENCY = "NGN";

/** Standard events we emit. Anything outside this list must go through `trackCustomEvent`. */
export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "AddToWishlist"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration"
  | "SubmitApplication"
  | "Contact";

export type PixelContent = {
  id: string;
  quantity?: number;
  item_price?: number;
};

export type PixelParams = {
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
  content_type?: "product" | "product_group";
  contents?: PixelContent[];
  currency?: string;
  value?: number;
  num_items?: number;
  search_string?: string;
  status?: string | boolean;
  [key: string]: any;
};

type Fbq = (...args: any[]) => void;

const getFbq = (): Fbq | null => {
  if (typeof window === "undefined") return null;
  const fbq = (window as any).fbq;
  return typeof fbq === "function" ? fbq : null;
};

/** True once the base snippet has loaded (production hostname, no blocker). */
export const isPixelReady = (): boolean => getFbq() !== null;

/**
 * Event IDs let a future Conversions API call be deduplicated against the
 * browser event. Meta matches on (event_name, event_id).
 */
export const newEventId = (): string => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* falls through */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

/** Round to 2dp and drop anything non-finite — Meta rejects NaN/Infinity values. */
const money = (value: unknown): number | undefined => {
  const num = Number(value);
  if (!Number.isFinite(num)) return undefined;
  return Math.round(num * 100) / 100;
};

/**
 * Meta rejects anything that is not an ISO-4217 code, and the app's settings
 * value can come back as a symbol (₦) depending on configuration.
 */
export const normalizeCurrency = (currency?: string): string => {
  const code = String(currency ?? "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : DEFAULT_CURRENCY;
};

/** Strip undefined/null/empty values so we never send half-populated params. */
const clean = (params?: PixelParams): PixelParams | undefined => {
  if (!params) return undefined;
  const out: PixelParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length === 0) return;
    if (typeof value === "string" && value.trim() === "") return;
    out[key] = value;
  });
  return Object.keys(out).length ? out : undefined;
};

/**
 * Fire a standard event. Returns the event ID used, so a caller that also
 * posts to the Conversions API can reuse it for deduplication.
 */
export const trackPixelEvent = (
  event: MetaStandardEvent,
  params?: PixelParams,
  eventId: string = newEventId(),
): string => {
  const fbq = getFbq();
  const payload = clean(params);

  if (!fbq) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[meta-pixel] (not loaded)", event, payload ?? {});
    }
    return eventId;
  }

  try {
    if (payload) {
      fbq("track", event, payload, { eventID: eventId });
    } else {
      fbq("track", event, {}, { eventID: eventId });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to track Meta Pixel event:", event, error);
  }
  return eventId;
};

/** Non-standard event — shows in Events Manager as a custom conversion source. */
export const trackCustomEvent = (
  event: string,
  params?: PixelParams,
  eventId: string = newEventId(),
): string => {
  const fbq = getFbq();
  if (!fbq) return eventId;
  try {
    fbq("trackCustom", event, clean(params) ?? {}, { eventID: eventId });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to track Meta Pixel custom event:", event, error);
  }
  return eventId;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Product → catalogue mapping                                                */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * The single source of truth for `content_ids`. Must line up with the `id`
 * column of the Meta product catalogue feed.
 */
export const getContentId = (product: any): string => {
  const id =
    product?.pid ??
    product?.product_id ??
    product?.productId ??
    product?._id ??
    product?.id ??
    "";
  return String(id);
};

export const toPixelContent = (
  product: any,
  variant?: any,
  quantity = 1,
): PixelContent | null => {
  const id = getContentId(product);
  if (!id) return null;
  return {
    id,
    quantity: Math.max(1, Math.floor(Number(quantity) || 1)),
    item_price: money(
      variant?.price ??
        product?.buyPrice ??
        product?.unit_price ??
        product?.retail_rate ??
        product?.price ??
        0,
    ),
  };
};

const contentIdsOf = (contents: PixelContent[]): string[] =>
  contents.map((content) => content.id);

const totalItems = (contents: PixelContent[]): number =>
  contents.reduce((sum, content) => sum + (content.quantity ?? 1), 0);

/* ────────────────────────────────────────────────────────────────────────── */
/* Conversions API                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Identifiers for a shopper the server cannot look up itself (guest checkout).
 * Raw values go to OUR endpoint only — it hashes them before they reach Meta.
 * For signed-in shoppers this is unnecessary: the route reads the session.
 */
export type CapiUserData = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  countryCode?: string;
};

const CAPI_ENDPOINT = "/api/meta-capi";

/**
 * Mirror an event to the Conversions API. Browser-side pixel calls are lost to
 * ad blockers and ITP; the server-side copy is not. Meta collapses the two using
 * (event_name, event_id), so both halves must carry the same `eventId`.
 *
 * Fire-and-forget: analytics must never block or break a user flow.
 */
export const sendCapiEvent = (
  event: MetaStandardEvent,
  params: PixelParams | undefined,
  eventId: string,
  userData?: CapiUserData,
): void => {
  if (typeof window === "undefined") return;

  try {
    const body = JSON.stringify({
      eventName: event,
      eventId,
      eventSourceUrl: window.location.href,
      customData: clean(params) ?? {},
      userData,
    });

    // `keepalive` lets the request outlive the page — Purchase fires right
    // before a redirect, and InitiateCheckout right before leaving for the
    // payment gateway.
    void fetch(CAPI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {
      /* offline or blocked — the browser pixel is the fallback */
    });
  } catch {
    /* never let analytics break a user flow */
  }
};

/**
 * Fire an event through both channels under one event ID so Meta deduplicates
 * them. This is the function every event helper below goes through.
 */
export const dispatchMetaEvent = (
  event: MetaStandardEvent,
  params?: PixelParams,
  options: { eventId?: string; userData?: CapiUserData } = {},
): string => {
  const eventId = options.eventId || newEventId();
  trackPixelEvent(event, params, eventId);
  sendCapiEvent(event, params, eventId, options.userData);
  return eventId;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Standard events                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

/** SPA navigations — the base snippet only fires PageView on the initial load. */
export const pixelPageView = () => trackPixelEvent("PageView");

export const pixelViewContent = (
  content: PixelContent,
  meta: { name?: string; category?: string; currency?: string } = {},
) =>
  dispatchMetaEvent("ViewContent", {
    content_type: "product",
    content_ids: [content.id],
    contents: [content],
    content_name: meta.name,
    content_category: meta.category,
    currency: normalizeCurrency(meta.currency),
    value: content.item_price,
  });

export const pixelSearch = (
  searchString: string,
  contents: PixelContent[] = [],
  currency = DEFAULT_CURRENCY,
) =>
  dispatchMetaEvent("Search", {
    search_string: searchString,
    content_type: "product",
    content_ids: contentIdsOf(contents),
    contents,
    currency: normalizeCurrency(currency),
  });

export const pixelAddToCart = (
  content: PixelContent,
  meta: { name?: string; category?: string; currency?: string } = {},
) =>
  dispatchMetaEvent("AddToCart", {
    content_type: "product",
    content_ids: [content.id],
    contents: [content],
    content_name: meta.name,
    content_category: meta.category,
    currency: normalizeCurrency(meta.currency),
    value: money((content.item_price ?? 0) * (content.quantity ?? 1)),
  });

export const pixelAddToWishlist = (
  content: PixelContent,
  meta: { name?: string; category?: string; currency?: string } = {},
) =>
  dispatchMetaEvent("AddToWishlist", {
    content_type: "product",
    content_ids: [content.id],
    contents: [content],
    content_name: meta.name,
    content_category: meta.category,
    currency: normalizeCurrency(meta.currency),
    value: content.item_price,
  });

export const pixelInitiateCheckout = (
  contents: PixelContent[],
  value: number,
  currency = DEFAULT_CURRENCY,
) =>
  dispatchMetaEvent("InitiateCheckout", {
    content_type: "product",
    content_ids: contentIdsOf(contents),
    contents,
    num_items: totalItems(contents),
    currency: normalizeCurrency(currency),
    value: money(value),
  });

export const pixelAddPaymentInfo = (
  contents: PixelContent[],
  value: number,
  currency = DEFAULT_CURRENCY,
  paymentProvider?: string,
) =>
  dispatchMetaEvent("AddPaymentInfo", {
    content_type: "product",
    content_ids: contentIdsOf(contents),
    contents,
    num_items: totalItems(contents),
    currency: normalizeCurrency(currency),
    value: money(value),
    payment_method: paymentProvider,
  });

export const pixelPurchase = (
  contents: PixelContent[],
  value: number,
  currency = DEFAULT_CURRENCY,
  extra: { orderId?: string; eventId?: string; userData?: CapiUserData } = {},
) =>
  dispatchMetaEvent(
    "Purchase",
    {
      content_type: "product",
      content_ids: contentIdsOf(contents),
      contents,
      num_items: totalItems(contents),
      currency: normalizeCurrency(currency),
      value: money(value) ?? 0,
      order_id: extra.orderId,
    },
    { eventId: extra.eventId, userData: extra.userData },
  );

export const pixelSubmitApplication = (applicationType: string) =>
  dispatchMetaEvent("SubmitApplication", { content_name: applicationType });

export const pixelCompleteRegistration = (method = "email") =>
  dispatchMetaEvent("CompleteRegistration", { content_name: method, status: true });

export const pixelContact = (source: string, userData?: CapiUserData) =>
  dispatchMetaEvent("Contact", { content_name: source }, { userData });
