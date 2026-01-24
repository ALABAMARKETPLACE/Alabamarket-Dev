import { NextResponse } from "next/server";

const SITE_URL = "https://alabamarketplace.ng";

// Your static pages
const staticUrls = ["", "/about", "/fa-questions", "/about-us", "/contact_us"];

// APIs you provided
const CATEGORY_API = "https://apis.alabamarketplace.ng/category";
const PRODUCTS_API = "https://apis.alabamarketplace.ng/products/bystore";

type AnyObj = Record<string, any>;

/**
 * Tries to extract an array from common API response shapes:
 * - [ ... ]
 * - { data: [ ... ] }
 * - { data: { items: [ ... ] } }
 * - { items: [ ... ] }
 * - { results: [ ... ] }
 */
function extractArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;

  const candidates = [
    payload?.data,
    payload?.items,
    payload?.results,
    payload?.data?.items,
    payload?.data?.results,
    payload?.data?.data,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  return [];
}

async function fetchCategories(): Promise<string[]> {
  try {
    const res = await fetch(CATEGORY_API, { cache: "no-store" });
    if (!res.ok) return [];

    const json = await res.json();
    const categories = extractArray(json);

    // Try common id fields: id, _id, categoryId
    return categories
      .map((c: AnyObj) => c?.id ?? c?._id ?? c?.categoryId)
      .filter((id: any) => id !== undefined && id !== null && id !== "")
      .map((id: string | number) => `/category/${id}`);
  } catch {
    return [];
  }
}

async function fetchAllProducts(): Promise<string[]> {
  const urls: string[] = [];
  let page = 1;
  const take = 50; // increase/decrease if needed
  const order = "DESC";

  // Safety cap so sitemap generation can't loop forever if API misbehaves
  const MAX_PAGES = 500;

  try {
    while (page <= MAX_PAGES) {
      const res = await fetch(
        `${PRODUCTS_API}?order=${order}&page=${page}&take=${take}`,
        { cache: "no-store" }
      );

      if (!res.ok) break;

      const json = await res.json();
      const products = extractArray(json);

      if (!Array.isArray(products) || products.length === 0) break;

      for (const p of products) {
        const id = (p as AnyObj)?.id ?? (p as AnyObj)?._id ?? (p as AnyObj)?.productId;
        if (id !== undefined && id !== null && id !== "") {
          urls.push(`/product/${id}`);
        }
      }

      // If we got fewer than "take", we reached the last page
      if (products.length < take) break;

      page++;
    }
  } catch {
    // If products fetch fails, sitemap will still return static + categories
  }

  return urls;
}

export async function GET() {
  const [categoryUrls, productUrls] = await Promise.all([
    fetchCategories(),
    fetchAllProducts(),
  ]);

  // De-duplicate
  const allPaths = Array.from(
    new Set([...staticUrls, ...categoryUrls, ...productUrls])
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
  .map(
    (path) => `  <url>
    <loc>${SITE_URL}${path}</loc>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
