"use client";

import API from "@/config/configuration";
import React, { useEffect } from "react";
import { Container } from "react-bootstrap";

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

function SellerSupport() {
  useEffect(() => {
    updateMetaDescription(
      `Get dedicated seller support on ${API.NAME} to manage your business, products, and account efficiently.`
    );

    // best-effort title (may be overridden globally)
    document.title = "Seller Support | Alaba Marketplace";
  }, []);

  return (
    <div className="page-Box">
      <Container>
        <div className="page-breadcrumbs">Home / Seller Support</div>
        <br />
        <h1 className="page-text1">Assistance designed for your needs</h1>
        <br />
        <p className="page-text3">
          Selling online for your business can present different situations
          where expert guidance is valuable. Our dedicated {API.NAME} Seller
          Support team is available to assist you with any inquiries, concerns,
          or assistance related to your business on {API.NAME}. You can
          conveniently access our seller support team through the {API.NAME}
          seller dashboard for prompt assistance.
        </p>
        <p className="page-text3">
          The turnaround time for resolving business problems may vary depending
          on the specific issue. However, we assure you that we are committed to
          addressing and resolving any concerns or issues you may have in a
          timely manner.
        </p>
        <br />
        <h4 className="page-text2">Personal Assistance</h4>
        <p className="page-text3">
          With our various Account Management services, you will be assigned a
          dedicated {API.NAME} Account Manager who will assist you in
          efficiently managing your business. The Account Manager is trained by{" "}
          {API.NAME} and equipped to provide guidance and support whenever you
          require it.
        </p>
      </Container>
    </div>
  );
}

export default SellerSupport;
