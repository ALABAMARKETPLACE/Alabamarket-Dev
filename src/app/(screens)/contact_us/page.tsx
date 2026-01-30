"use client";

import React, { useState, useEffect } from "react";
import {
  Breadcrumb,
  Row,
  Form,
  Input,
  Select,
  Button,
  notification,
} from "antd";
import Link from "next/link";
import { Col, Container } from "react-bootstrap";
import { MdWhatsapp } from "react-icons/md";
import {
  IoCallOutline,
  IoMailUnreadOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { useSelector } from "react-redux";
import API from "@/config/API";
import { POST } from "@/util/apicall";

/* =========================
   META HANDLER (STABLE)
   ========================= */
function updateMeta(description: string) {
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

function ContactUs() {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationApi, contextHolder] = notification.useNotification();

  /* =========================
     APPLY META DESCRIPTION
     ========================= */
  useEffect(() => {
    updateMeta(
      "Contact Alaba Marketplace support for orders, enquiries, and customer assistance."
    );

    // best-effort title (may be overridden by Next.js)
    document.title = "Contact Us | Alaba Marketplace";
  }, []);

  const map = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.0!2d3.180982!3d6.460719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b87bf2173a035%3A0x46d6a31cf47025c5!2sAlaba%20International%20Market!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng" width="100%" height="300" style="border:0;border-radius:10px;" loading="lazy"></iframe>`;
  const phoneNumber = "+2349117356897";

  const onFinish = async (values: any) => {
    try {
      setIsLoading(true);
      const response = await POST(API.ENQUIRY_CREATE, values);

      if (response.status) {
        notificationApi.success({ message: "Successfully Submitted" });
        form.resetFields();
      } else {
        notificationApi.error({ message: "Failed to submit request" });
      }
    } catch {
      notificationApi.error({ message: "An error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-Box">
      <Container>
        {contextHolder}

        <Breadcrumb
          items={[
            { title: <Link href="/">Home</Link> },
            { title: "Contact Us" },
          ]}
        />

        <br />
        <h1 className="page-text1">Contact Us</h1>
        <br />

        <Row>
          <Col sm={6} xs={12}>
            <div dangerouslySetInnerHTML={{ __html: map }} />

            <div className="media-box">
              <div className="box1">
                <MdWhatsapp size={24} />
                <a
                  href={`https://wa.me/${phoneNumber.replace("+", "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp: {phoneNumber}
                </a>
              </div>

              <div className="box1">
                <IoCallOutline size={24} />
                <a href={`tel:${phoneNumber}`}>Phone: {phoneNumber}</a>
              </div>

              <div className="box1">
                <IoMailUnreadOutline size={24} />
                <a href="mailto:info@alabamarketplace.ng">
                  info@alabamarketplace.ng
                </a>
              </div>

              <div className="box1">
                <IoLocationOutline size={24} />
                <span>
                  B439 Electronics Line, Main Gate Alaba International Market,
                  Lagos
                </span>
              </div>
            </div>
          </Col>

          <Col sm={6} xs={12}>
            <h2 className="page-text1">Send a Message</h2>

            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="booking">Booking</Select.Option>
                  <Select.Option value="orders">Orders</Select.Option>
                  <Select.Option value="services">Services</Select.Option>
                  <Select.Option value="others">Others</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item
                name="message"
                label="Message"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>

              <Button htmlType="submit" loading={isLoading} className="btn-clr">
                Send Message
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ContactUs;
