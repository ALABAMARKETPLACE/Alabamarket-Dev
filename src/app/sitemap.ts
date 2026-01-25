import type { MetadataRoute } from "next";

const SITE_URL = "https://alabamarketplace.ng";

// APIs you provided
const CATEGORY_API = "https://apis.alabamarketplace.ng/category";
const PRODUCTS_API = "https://apis.alabamarketplace.ng/products/bystore";

// Static pages you want indexed
const staticPaths = ["", "/about", "/fa-questions", "/about-us", "/contact_us"];

type AnyObj = Record<string, any>;

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

async function getCategoryEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(CATEGORY_API, { cache: "no-store" });
    if (!res.ok) return [];

    const json = await res.json();
    const categories = extractArray(json);

    return categories
      .map((c: AnyObj) => c?.id ?? c?._id ?? c?.categoryId)
      .filter((id: any) => id !== undefined && id !== null && id !== "")
      .map((id: string | number) => ({
        url: `${SITE_URL}/category/${id}`,
        changeFrequency: "weekly",
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}

async function getAllProductEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  let page = 1;
  const take = 50;
  const order = "DESC";
  const MAX_PAGES = 500; // safety cap

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
          entries.push({
            url: `${SITE_URL}/product/${id}`,
            changeFrequency: "daily",
            priority: 0.8,
          });
        }
      }

      if (products.length < take) break; // last page
      page++;
    }
  } catch {
    // if it fails, return whatever we have (or empty)
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  const [categoryEntries, productEntries] = await Promise.all([
    getCategoryEntries(),
    getAllProductEntries(),
  ]);

  // De-dupe by URL
  const map = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const item of [...staticEntries, ...categoryEntries, ...productEntries]) {
    map.set(item.url, item);
  }

  return Array.from(map.values());
}
