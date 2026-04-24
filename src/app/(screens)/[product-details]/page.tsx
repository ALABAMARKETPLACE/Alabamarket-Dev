import { Metadata } from "next";
import React from "react";
import DetailsCard from "./detailsCard";
import { GET_SERVER } from "@/util/apicall_server";
import API from "@/config/API";
import CONFIG from "@/config/configuration";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import "./style.scss";

async function fetchData(id: string) {
  try {
    const session: any = await getServerSession(options);
    const response = await GET_SERVER(
      API.PRODUCT_SEARCH_DETAILS + id,
      {},
      null,
      session?.token
    );
    if (response?.status) return response?.data;
    return null;
  } catch (err) {
    return null;
  }
}

export const generateMetadata = async ({
  params,
  searchParams,
}: any): Promise<Metadata> => {
  const routeParams = await params;
  const queryParams = await searchParams;
  // Prefer slug from route segment — the endpoint accepts both slug and pid
  const id = routeParams?.["product-details"] || queryParams?.pid;
  const data = await fetchData(id);
  const slug = routeParams?.["product-details"] || "";
  return {
    title: data?.name || "",
    description: data?.description || "",
    openGraph: {
      title: data?.name,
      description: data?.description,
      type: "website",
      locale: "en_US",
      siteName: CONFIG.NAME,
      url: `${CONFIG.WEBSITE}/${slug}`,
      images: {
        url: data?.image,
        alt: data?.name,
        width: 575,
        height: 275,
      },
    },
  };
};

async function ProductScreen({ params, searchParams }: any) {
  const routeParams = await params;
  const queryParams = await searchParams;

  // Prefer slug from the route segment — cleaner and the endpoint supports it.
  // Fall back to ?pid= query param for backwards-compatibility with old links.
  const id = routeParams?.["product-details"] || queryParams?.pid;
  const data = await fetchData(id);

  // Always pass the real UUID pid from the response so DetailsCard can use it
  // for cart operations, URL history, wishlist, etc. — regardless of what was
  // used to fetch.
  const pid = data?.pid || queryParams?.pid || id;

  return <DetailsCard data={data} params={{ ...queryParams, pid }} />;
}

export default ProductScreen;
