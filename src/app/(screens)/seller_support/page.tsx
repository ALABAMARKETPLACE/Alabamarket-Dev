import API from "@/config/configuration";
import React from "react";
import { Container } from "react-bootstrap";

function SellerSupport() {
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
          timely manner. Our aim is to ensure that all problems are effectively
          resolved to provide a satisfactory resolution.
        </p>
        <br />
        <h4 className="page-text2">Personal Assistance</h4>
        <p className="page-text3">
          With our various Account Management services, you will be assigned a
          dedicated {API.NAME} Account Manager who will assist you in
          efficiently managing your business. The Account Manager is trained by{" "}
          {API.NAME} and equipped to provide guidance and support whenever you
          require it. They can offer valuable advice on enhancing your product
          selection, optimising delivery speed, setting competitive product
          pricing, and various other areas that contribute to attracting more
          customers to your products on {API.NAME}. Their expertise aims to help
          you maximise your success on the platform.
        </p>
      </Container>
    </div>
  );
}

export default SellerSupport;
