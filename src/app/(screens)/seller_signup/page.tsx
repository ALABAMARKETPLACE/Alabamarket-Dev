"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";

/* =========================
   META HANDLER (SAME AS CONTACT/FAQ)
   ========================= */
function updateMetaDescription(description: string) {
  let tag = document.querySelector(
    'meta[name="description"]'
  ) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement("meta");
    tag.name = "description";
    document.head.appendChild(tag);
  }

  tag.content = description;
}

function SellerSignup() {
  const router = useRouter();

  useEffect(() => {
    updateMetaDescription(
      "Create a seller account on Alaba Marketplace and start selling products online with support and tools for your business."
    );

    // best-effort title (may be overridden globally)
    document.title = "Become a Seller | Alaba Marketplace";

    // keep your existing redirect behaviour
    router.push("/seller");
  }, [router]);

  return <Loading />;
}

export default SellerSignup;
