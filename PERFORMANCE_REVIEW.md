# AlabaMart — Performance Review & Load Time Enhancement Plan

> Audited: 2026-03-16 | Stack: Next.js 14 App Router · TypeScript · Ant Design · Redux Toolkit · React Query

---

## Executive Summary

| Metric | Estimated Current | Target After Fixes |
|---|---|---|
| FCP (First Contentful Paint) | ~4–6 s | < 1.5 s |
| LCP (Largest Contentful Paint) | ~6–9 s | < 2.5 s |
| TTI (Time to Interactive) | ~8–12 s | < 3.5 s |
| JS Bundle (initial) | ~800–1000 KB | < 300 KB |
| Unused CSS | ~250 KB | < 30 KB |

---

## Priority Matrix

| # | Issue | Severity | Effort | Impact |
|---|---|---|---|---|
| 1 | moment.js in bundle | 🔴 Critical | Low | -67 KB |
| 2 | Home page fetching 2,500 products | 🔴 Critical | Medium | -50+ MB RAM, -3s TTI |
| 3 | Home page "use client" (no SSR) | 🔴 Critical | High | -3s FCP |
| 4 | Bootstrap + Ant Design both loaded | 🔴 Critical | Medium | -150 KB CSS |
| 5 | Google Fonts via @import (render-blocking) | 🔴 Critical | Low | -1.5s FCP |
| 6 | ChatBot always rendered on every page | 🔴 Critical | Low | -540 lines JS |
| 7 | Raw `<img>` tags (33 of 48 images unoptimized) | 🔴 High | Medium | -2s LCP |
| 8 | GTM + AdSense blocking render | 🔴 High | Low | -1s FCP |
| 9 | Redux persisting 10 slices to localStorage | 🟠 High | Low | -hydration issues |
| 10 | 30-second setInterval re-render on home | 🟠 High | Low | -continuous CPU |
| 11 | openai SDK in production bundle | 🟠 High | Low | -150 KB |
| 12 | Slick carousel CSS loaded globally | 🟠 High | Low | -unused CSS |
| 13 | Header dynamically imported with ssr:false | 🟠 High | Low | -delayed header |
| 14 | 5 TTF @font-face without font-display | 🟡 Medium | Low | FOIT/FOUS |
| 15 | i18next loaded but unused | 🟡 Medium | Low | -50 KB |
| 16 | chart.js not lazy-loaded | 🟡 Medium | Low | -200 KB on non-dashboard |
| 17 | 9 providers nested in root layout | 🟡 Medium | Medium | hydration overhead |
| 18 | Home page staggered query delays (200/400/600ms) | 🟡 Medium | Low | -600ms visible |
| 19 | 5x duplicated error handling in apicall.ts | 🟡 Medium | Low | maintenance |
| 20 | console.warn monkey-patched globally | 🟡 Medium | Low | debugging risk |

---

## Section 1 — Dependencies

### 1.1 Remove moment.js (67 KB gzipped)

**Files:** `package.json`

The project has **three** date libraries: `dayjs`, `moment`, and `react-moment`. Moment is deprecated and 33× heavier than dayjs.

```
# Remove
moment
react-moment

# Keep
dayjs
```

Replace any `moment(...)` calls with `dayjs(...)` — the API is nearly identical.

---

### 1.2 Remove openai SDK from client bundle

**Files:** `package.json`

The `openai` package (~150 KB) should only run server-side (API routes / Server Actions). Move it to be used exclusively inside `app/api/` route handlers so Next.js tree-shakes it from the client bundle.

---

### 1.3 Remove i18next if unused

**Files:** `package.json`

`i18next`, `i18next-browser-languagedetector`, `react-i18next` are present but not wired to any visible translation strings. If internationalisation is not active, remove all three (~50 KB).

---

### 1.4 Audit `deep`, `deeps`, `legacy`, `peer` packages

**Files:** `package.json`

These four packages have vague names, very low version numbers, and no clear usage. Audit and remove unused ones.

---

### 1.5 Lazy-load chart.js

**Files:** `package.json`, dashboard pages

Chart.js + react-chartjs-2 is ~200 KB. It is only needed on dashboard pages. Use dynamic imports:

```typescript
// Instead of top-level import:
import { Line } from "react-chartjs-2";

// Use:
const Line = dynamic(() => import("react-chartjs-2").then(m => m.Line), { ssr: false });
```

---

## Section 2 — CSS / Fonts

### 2.1 Replace Google Fonts @import with next/font (CRITICAL)

**File:** `src/app/global.scss` lines 3–4

`@import url("https://fonts.googleapis.com/...")` is **render-blocking** — the browser cannot paint text until the font CSS resolves.

```typescript
// src/app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });
```

Remove the `@import` from `global.scss` entirely.

---

### 2.2 Add font-display: swap to @font-face rules

**File:** `src/app/global.scss` lines 28–47

All 5 DMSans TTF `@font-face` declarations are missing `font-display`. Without it, text is invisible until fonts load (FOIT).

```scss
@font-face {
  font-family: "DMSans";
  src: url("...") format("truetype");
  font-display: swap; // ← add this
}
```

Or better — migrate to `next/font/local` which handles this automatically.

---

### 2.3 Stop importing all of Bootstrap globally

**File:** `src/app/global.scss` line 2

```scss
@import "../../node_modules/bootstrap/scss/bootstrap.scss"; // ← loads 150 KB
```

The app uses Bootstrap only for `Container`, `Row`, `Col` grid layout. Options:
- Import only Bootstrap's grid module: `@import "bootstrap/scss/grid"`
- Or replace Bootstrap grid with CSS Grid / Flexbox natively and remove Bootstrap entirely

---

### 2.4 Move slick-carousel CSS to only components that use it

**File:** `src/app/layout.tsx` lines 3–4

```typescript
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
```

These are loaded on **every page**. Move them into the specific components that render carousels.

---

## Section 3 — Root Layout & Scripts

### 3.1 Lazy-load the ChatBot component

**File:** `src/app/layout.tsx` line 102

The ChatBot is 540+ lines and runs on every single page including checkout, cart, product pages.

```typescript
// Replace static import with:
const ChatBot = dynamic(() => import("@/components/chatbot"), {
  ssr: false,
  loading: () => null,
});
```

---

### 3.2 Use @next/third-parties for GTM and AdSense

**File:** `src/app/layout.tsx` lines 51–79

Raw inline `<script>` tags for GTM and AdSense block rendering.

```typescript
import { GoogleTagManager } from "@next/third-parties/google";
import { GoogleAnalytics } from "@next/third-parties/google";

// In <body> after main content:
<GoogleTagManager gtmId="GTM-XXXXX" />
```

This defers the scripts to after the page is interactive.

---

### 3.3 Consolidate Provider layers

**File:** `src/app/layout.tsx` lines 90–110

Currently 5+ nested providers wrap every page. Combine `AuthProvider`, `ReactQueryProvider`, and `StoreProvider` into a single `<AppProviders>` component to reduce the React tree depth.

---

## Section 4 — Home Page (CRITICAL)

**File:** `src/app/(screens)/home/page.tsx` (927 lines, "use client")

The home page is the single biggest performance problem in the application.

### 4.1 Stop fetching 2,500 products into memory

**Lines:** 594–645

```typescript
// Currently fetches up to 50 pages × 50 items = 2,500 products held in RAM
const allProductsPool = useQuery({ queryKey: [...], queryFn: ... /* fetches all pages */ });
```

**Fix:** Fetch 1 page (20–50 items) with `useInfiniteQuery`. Load more on scroll via Intersection Observer.

---

### 4.2 Remove the 30-second rotation setInterval

**Lines:** 647–652

```typescript
setInterval(() => setRotationSeed(Math.random()), 30000);
```

This triggers a full re-render of the home page every 30 seconds — keeping the CPU busy, draining mobile battery, and resetting scroll position. Remove it.

---

### 4.3 Remove artificial query stagger delays

**Lines:** 498–516

```typescript
// 200ms, 400ms, 600ms intentional delays before firing queries
setTimeout(() => refetchFeatured(), 200);
setTimeout(() => refetchGold(), 400);
setTimeout(() => refetchSilver(), 600);
```

Fire all queries in parallel. React Query handles deduplication.

---

### 4.4 Move data fetching to Server Component

**Line:** 1 (`"use client"`)

The entire home page is a client component — users get a blank white page until 800+ KB of JS loads, parses, and executes. Convert the page shell to a Server Component and push interactivity down to leaf components only.

```
app/(screens)/home/
  page.tsx          ← Server Component (fetch data here)
  _components/
    HeroSlider.tsx  ← "use client" (interactive)
    ProductGrid.tsx ← Server Component (static grid)
    FilterBar.tsx   ← "use client" (interactive)
```

---

### 4.5 Memoize product sorting/deduplication

**Lines:** 268–419

`splitProductsByPriority()` and similar functions run on every render. Wrap in `useMemo` with stable dependency arrays.

---

## Section 5 — Images

### 5.1 Replace raw `<img>` with `next/image`

Currently **33 out of 48** image elements are raw `<img>` tags — no lazy loading, no WebP conversion, no size optimization.

Priority locations:
- `src/app/(screens)/home/page.tsx` — hero banners, product cards
- `src/app/(screens)/[product-details]/_components/images.tsx` — main product image
- `src/app/(user)/cart/_components/cartItem.tsx` — cart thumbnails
- `src/components/header/index.tsx` — logo

```tsx
// Replace:
<img src={product.image} alt={product.name} />

// With:
import Image from "next/image";
<Image src={product.image} alt={product.name} width={300} height={300} />
```

---

### 5.2 Restrict next/image remotePatterns

**File:** `next.config.mjs` lines 6–12

```javascript
// Current (insecure, defeats optimization):
{ hostname: "**", pathname: "**" }

// Replace with actual domains:
{ hostname: "res.cloudinary.com" },
{ hostname: "your-s3-bucket.s3.amazonaws.com" },
{ hostname: "alabamarketplace.ng" },
```

---

## Section 6 — Redux & State

### 6.1 Reduce what Redux Persist saves

**File:** `src/redux/store/store.ts` lines 30–33

Currently persisting ~10 slices to localStorage. This adds serialization overhead on every state change and can cause hydration mismatches.

**Keep persisted:** `auth`, `cart`
**Remove from persist:** `category`, `settings`, `location`, `language` — fetch these fresh on mount.

---

### 6.2 Enable React Strict Mode

**File:** `next.config.mjs` line 3

```javascript
// Change:
reactStrictMode: false

// To:
reactStrictMode: true
```

Strict mode surfaces double-render bugs, stale closure issues, and memory leaks before they reach production.

---

## Section 7 — API Calls

### 7.1 Extract shared error handling in apicall.ts

**File:** `src/util/apicall.ts`

The same 20-line error-handling block is copy-pasted 5 times (GET, POST, PUT, PATCH, DELETE). Extract to a `handleApiError(error)` utility.

---

### 7.2 Increase default React Query staleTime

**File:** `src/util/queryProvider.tsx`

```typescript
// Current: data goes stale after 1 minute → triggers background refetch
staleTime: 1000 * 60 * 1,

// Recommended: 5 minutes for product/category data
staleTime: 1000 * 60 * 5,
```

---

## Section 8 — Header

### 8.1 Remove ssr: false from Header dynamic import

**File:** `src/components/header/HeaderClientWrapper.tsx`

```typescript
// Current:
const Header = dynamic(() => import("./index"), { ssr: false });

// The header should always be server-rendered for SEO and FCP.
// Remove dynamic() entirely and use a normal import.
import Header from "./index";
```

---

## Quick Wins (< 1 hour each)

These can be done immediately with no architectural changes:

| Task | File | Estimated Gain |
|---|---|---|
| Add `font-display: swap` to @font-face | `global.scss` | -FOIT |
| Remove moment + react-moment | `package.json` | -67 KB |
| Remove openai from client | `package.json` | -150 KB |
| Remove i18next if unused | `package.json` | -50 KB |
| Move slick CSS to carousel component | `layout.tsx` | -unused CSS |
| Lazy-load ChatBot | `layout.tsx` | -540 lines on every page |
| Remove 30s rotation interval | `home/page.tsx` | -continuous CPU |
| Remove artificial query delays | `home/page.tsx` | -600ms |
| Set `font-display: swap` | `global.scss` | -FOIT |
| Restrict remotePatterns | `next.config.mjs` | security + optimization |

---

## Recommended Implementation Order

```
Phase 1 — Quick wins (1–2 days)
  → Remove moment, openai, i18next from bundle
  → Add font-display: swap
  → Lazy-load ChatBot
  → Remove rotation interval + stagger delays
  → Move slick CSS

Phase 2 — Images & Fonts (2–3 days)
  → Migrate Google Fonts to next/font
  → Replace raw <img> with next/image
  → Restrict remotePatterns

Phase 3 — CSS (1–2 days)
  → Remove full Bootstrap, use only grid module
  → Audit Ant Design tree-shaking

Phase 4 — Home Page (3–5 days)
  → Cap product pool to 1 page + infinite scroll
  → Convert to hybrid Server/Client Component
  → Memoize sort/dedupe functions

Phase 5 — Redux & State (1–2 days)
  → Reduce persisted slices to auth + cart
  → Enable React Strict Mode

Phase 6 — Architecture (ongoing)
  → Consolidate providers
  → Extract apicall.ts error handler
  → Server Actions for delivery calculation at checkout
```

---

*Generated by performance audit · AlabaMart Dev · 2026-03-16*
