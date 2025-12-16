"use client";
import { Button, Form, Input } from "antd";
import React from "react";
import { Row, Col } from "react-bootstrap";

function EditEmailChange(props: any) {
  const [form] = Form.useForm();

  return (
    <div className="">
      <Form form={form} onFinish={props?.updateEmail}>
        <Row>
          <Col md="6">
            <Form.Item
              name="email"
              initialValue={props?.email}
              rules={[
                { required: true, message: "Please enter Email" },
                { type: "email", message: "Enter Valid email" },
              ]}
            >
              <Input size="large" placeholder="Enter Your Email" />
            </Form.Item>
          </Col>
          <Col md="6">
            <Button
              loading={props?.loading}
              type="primary"
              size="large"
              onClick={() => form.submit()}
            >
              Update
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default EditEmailChange;
