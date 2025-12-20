"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function DeliveryCompanyDashboard() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // Redirect to orders page by default
    router.push("/auth/delivery-company-dashboard/orders");
  }, [router]);

  return <div>Redirecting...</div>;
}

export default DeliveryCompanyDashboard;
