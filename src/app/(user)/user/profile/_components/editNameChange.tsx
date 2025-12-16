"use client";
import React from "react";
import { Button, Col, Form, Input, Row, notification } from "antd";

function EditNameChange(props: any) {
  const [form] = Form.useForm();

  return (
    <div className="NameChange_1">
      <Form form={form} onFinish={props?.updateName}>
        <div style={{ display: "flex" }}>
          <Row gutter={16}>
            <Col md={8} sm={8} xs={12}>
              <Form.Item
                name="first_name"
                initialValue={props?.firstname}
                rules={[
                  { required: true, message: "Please enter First name" },
                  { max: 20 },
                ]}
              >
                <Input size="large" placeholder="Enter Your First Name" />
              </Form.Item>
            </Col>
            <Col md={8} sm={8} xs={12}>
              <Form.Item
                name="last_name"
                initialValue={props?.lastname}
                rules={[
                  { required: true, message: "Please enter Last name" },
                  { max: 20 },
                ]}
              >
                <Input size="large" placeholder="Enter Your Last Name" />
              </Form.Item>
            </Col>
            <Col md={8} sm={8} xs={24}>
              <Button
                loading={props?.loading}
                onClick={() => form.submit()}
                size="large"
                type="primary"
              >
                Update Name
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </div>
  );
}

export default EditNameChange;
