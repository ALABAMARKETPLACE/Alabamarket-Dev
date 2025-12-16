import { Row, Col, Button } from "antd";
import React from "react";
import API from "../../../../../config/API";
import { useRouter } from "next/navigation";

function IndividualStep2({ loading, goBack }: any) {
  const navigation = useRouter();

  return (
    <div>
      <h5 className="">Application Submitted</h5>
      <br />
      <div className="sellerRegister-text2 mb-3">
        You have Successfully registered as an Individual seller on {API.NAME}!
        We will verify your application and get back to you
      </div>

      <Row className="mb-3">
        <Col sm={6} xs={12}>
          <Button block size="large" onClick={() => goBack()}>
            Go Back
          </Button>
        </Col>
        <Col sm={6} xs={12} className="px-3">
          <Button
            type="primary"
            block
            size="large"
            onClick={() => navigation.back()}
          >
            Login
          </Button>
        </Col>
      </Row>
    </div>
  );
}
export default IndividualStep2;
