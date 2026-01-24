import { NextResponse } from "next/server";

const baseUrl = "https://alabamarketplace.ng";

// List all pages you want in the sitemap
const urls = [
  "",        // home page
  "/about",
  "/fa-questions",
  "/about-us", 
  "/contact_us" 
];

export async function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${baseUrl}${url}</loc>
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
