import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { options as authOptions } from "../auth/[...nextauth]/options";

/**
 * Meta Conversions API relay.
 *
 * The browser pixel is blocked for a large share of traffic (ad blockers, ITP,
 * iOS). This route sends the same events server-to-server. Meta collapses the
 * two copies on (event_name, event_id), so a shopper is never counted twice —
 * see `dispatchMetaEvent` in src/utils/metaPixel.ts, which issues both halves
 * under one ID.
 *
 * Personally identifiable data never leaves this process in the clear: emails,
 * phone numbers and names are normalised and SHA-256 hashed here, which is what
 * Meta's matching expects.
 *
 * No-ops unless META_CAPI_ACCESS_TOKEN is set, so dev and preview builds send
 * nothing.
 */

const GRAPH_API_VERSION = "v21.0";

const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const PIXEL_ID =
  process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || "2200490810890736";
/** Set while validating in Events Manager → Test events; leave unset in production. */
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE;

/**
 * Only events the app actually emits. The endpoint is public by necessity, so
 * an allowlist keeps it from being used to inject junk into the dataset.
 */
const ALLOWED_EVENTS = new Set([
  "ViewContent",
  "Search",
  "AddToCart",
  "AddToWishlist",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Lead",
  "CompleteRegistration",
  "SubmitApplication",
  "Contact",
]);

const MAX_BODY_BYTES = 16 * 1024;

const sha256 = (value: string): string =>
  createHash("sha256").update(value).digest("hex");

/** Meta requires lowercase, trimmed, whitespace-free values before hashing. */
const hashText = (value?: unknown): string | undefined => {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return undefined;
  return sha256(text);
};

/** Phone numbers hash as digits only, including country code, no leading +. */
const hashPhone = (phone?: unknown, countryCode?: unknown): string | undefined => {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) return undefined;

  const cc = String(countryCode ?? "").replace(/\D/g, "");
  let normalized = digits;
  if (cc && !digits.startsWith(cc)) {
    // Nigerian numbers are commonly stored as 0803…; drop the trunk zero.
    normalized = cc + digits.replace(/^0+/, "");
  }
  return sha256(normalized);
};

const firstIp = (header: string | null): string | undefined => {
  if (!header) return undefined;
  const ip = header.split(",")[0]?.trim();
  return ip || undefined;
};

export async function POST(request: NextRequest) {
  // Nothing configured — accept and discard so the client never sees an error.
  if (!ACCESS_TOKEN) {
    return new NextResponse(null, { status: 204 });
  }

  // Same-origin only. Blocks trivial cross-site abuse of a public endpoint.
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.get("host")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let body: {
    eventName?: string;
    eventId?: string;
    eventSourceUrl?: string;
    customData?: Record<string, unknown>;
    userData?: Record<string, unknown>;
  };

  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = String(body?.eventName ?? "");
  if (!ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ error: "Unsupported event" }, { status: 400 });
  }
  if (!body?.eventId) {
    // Without an event ID the pixel copy cannot be deduplicated against this one.
    return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
  }

  // Prefer the signed-in session over anything the client sent — it is the one
  // identity source the browser cannot tamper with. `userData` in the request
  // covers guest checkout, where there is no session to read.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sessionUser: any = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session: any = await getServerSession(authOptions as any);
    sessionUser = session?.user ?? null;
  } catch {
    sessionUser = null;
  }

  const claimed = body?.userData ?? {};
  const email = sessionUser?.email ?? claimed?.email;
  const phone = sessionUser?.phone ?? claimed?.phone;
  const countryCode = sessionUser?.countrycode ?? claimed?.countryCode;
  const firstName = sessionUser?.first_name ?? claimed?.firstName;
  const lastName = sessionUser?.last_name ?? claimed?.lastName;

  // _fbp / _fbc are the pixel's own browser and click identifiers. They are the
  // strongest signal available for a shopper who never logs in.
  const fbp = request.cookies.get("_fbp")?.value;
  const fbc = request.cookies.get("_fbc")?.value;

  const userData: Record<string, unknown> = {
    em: hashText(email),
    ph: hashPhone(phone, countryCode),
    fn: hashText(firstName),
    ln: hashText(lastName),
    external_id: sessionUser?.id ? hashText(String(sessionUser.id)) : undefined,
    fbp,
    fbc,
    client_ip_address:
      firstIp(request.headers.get("x-forwarded-for")) ??
      firstIp(request.headers.get("x-real-ip")),
    client_user_agent: request.headers.get("user-agent") ?? undefined,
  };

  Object.keys(userData).forEach((key) => {
    if (userData[key] === undefined) delete userData[key];
  });

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: String(body.eventId),
        event_source_url: body?.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: body?.customData ?? {},
      },
    ],
  };
  if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(
        ACCESS_TOKEN,
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("Meta CAPI rejected event:", eventName, response.status, detail);
      return NextResponse.json({ ok: false }, { status: 202 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Meta CAPI request failed:", eventName, error);
    // 202: the browser pixel already reported this event, so the client has
    // nothing to retry or recover.
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
