import { Metadata } from "next";
import CONFIG from "@/config/configuration";

import Home from "./(screens)/home/page";

export const metadata: Metadata = {
  title: CONFIG.NAME,
  description: "Alaba Marketplace ecommerce home page",
  openGraph: {
    title: CONFIG.NAME,
    description: "start shopping with Alaba Marketplace..",
    type: "website",
    locale: "en_US",
    siteName: CONFIG.NAME,
  },
};

export default async function page() {
  return <Home />;
}
