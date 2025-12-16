"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";

function SellerSignup() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual seller registration page
    router.push("/seller");
  }, [router]);

  return <Loading />;
}

export default SellerSignup;
