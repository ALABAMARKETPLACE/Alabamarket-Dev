import { Metadata } from "next";
import React from "react";
import DetailsCard from "./detailsCard";
import { GET_SERVER } from "@/util/apicall_server";
import API from "@/config/API";
import CONFIG from "@/config/configuration";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import './style.scss'
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
  searchParams,
}: any): Promise<Metadata> => {
  const data = await fetchData(searchParams?.pid);
  return {
    title: data?.name || "",
    description: data?.description || "",
    openGraph: {
      title: data?.name,
      description: data?.description,
      type: "website",
      locale: "en_US",
      siteName: CONFIG.NAME,
      url: `${CONFIG.WEBSITE}/${searchParams.slug}/?pid=${searchParams?.pid}&review=${searchParams?.review}`,
      images: {
        url: data?.image,
        alt: data?.name,
        width: 575,
        height: 275,
      },
    },
  };
};

async function ProductScreen({ searchParams }: any) {
  const data = await fetchData(searchParams?.pid);
  return <DetailsCard data={data} params={searchParams} />;
}

export default ProductScreen;
