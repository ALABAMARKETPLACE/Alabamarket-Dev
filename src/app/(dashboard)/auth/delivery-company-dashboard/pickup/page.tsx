"use client";
import React from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { useSession } from "next-auth/react";
import PickupModule from "../_components/pickupModule";

function PickupPage() {
  const { data: session } = useSession();
  const companyId = (session as any)?.user?.delivery_company_id;

  return (
    <>
      <PageHeader
        title={"Pickup Module"}
        bredcume={"Dashboard / Delivery Company / Pickup"}
      />
      <PickupModule companyId={companyId} />
    </>
  );
}

export default PickupPage;

