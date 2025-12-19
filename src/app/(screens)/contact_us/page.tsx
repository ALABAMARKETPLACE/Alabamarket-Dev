"use client";

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
import React, { useState } from "react";
import { Col, Container } from "react-bootstrap";
import { MdWhatsapp } from "react-icons/md";
import { IoCallOutline, IoMailUnreadOutline, IoLocationOutline } from "react-icons/io5";
// import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import API from "@/config/API";
// import { POST } from "@/utils/apiCalls";
import { useTranslation } from "react-i18next";
import { POST } from "@/util/apicall";

function ContactUs() {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const Settings = useSelector((state: any) => state.Settings.Settings);
  const [notificationApi, contextHolder] = notification.useNotification();

  const map = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.0!2d3.180982!3d6.460719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b87bf2173a035%3A0x46d6a31cf47025c5!2sAlaba%20International%20Market!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng" width="100%" height="300" style="border:0;border-radius:10px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  const phoneNumber = "+2349117356897";

  const onFinish = async (values: any) => {
    try {
      setIsLoading(true);
      const response = await POST(API.ENQUIRY_CREATE, values);

      if (response.status) {
        notificationApi.success({ message: "Successfully Submitted" });
        form.resetFields();
      } else {
        notificationApi.error({ message: "Failed to Submit Request" });
      }
    } catch (error) {
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
        <h1 className="page-text1">
          {/* {t("contact_us1.contact.contact_us_a")} */}
          Contact Us
        </h1>
        <br />
        <Row>
          <Col sm={6} xs={12}>
            <div dangerouslySetInnerHTML={{ __html: map }} />
            <div className="media-box">
              <div className="box1" style={{ padding: "10px 0" }}>
                <MdWhatsapp size={24} color="#25D366" style={{ marginRight: 10 }} />
                <a
                  href={`https://wa.me/${phoneNumber.replace('+', '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp: {phoneNumber}
                </a>
              </div>
              <div className="box1" style={{ padding: "10px 0" }}>
                <IoCallOutline size={24} color="#0066CC" style={{ marginRight: 10 }} />
                <a href={`tel:${phoneNumber}`}>
                  Phone: {phoneNumber}
                </a>
              </div>
              <div className="box1" style={{ padding: "10px 0" }}>
                <IoMailUnreadOutline size={24} color="#EA4335" style={{ marginRight: 10 }} />
                <a href="mailto:info@taxgoglobal.com">
                  Mail: info@taxgoglobal.com
                </a>
              </div>
              <div className="box1" style={{ padding: "10px 0" }}>
                <IoLocationOutline size={24} color="#FF5722" style={{ marginRight: 10 }} />
                <span>B439 Electronics Line, Main Gate Alaba International Market Ojo Lagos</span>
              </div>
            </div>
          </Col>
          <Col sm={6} xs={12} className="px-md-5">
            <div className="contac-info">
              <div className="contact-box1">
                <h1 className="page-text1">
                  {/* {t("contact_us1.contact.send_message")} */}
                  Send a Message
                </h1>
                <Form form={form} onFinish={onFinish} layout="vertical">
                  <Form.Item
                    name="subject"
                    label="Subject"
                    // {t("contact_us1.contact.subject")}
                    rules={[
                      { required: true, message: "Please select a subject" },
                    ]}
                  >
                    <Select>
                      <Select.Option value="booking">Booking</Select.Option>
                      <Select.Option value="orders">Orders</Select.Option>
                      <Select.Option value="services">Services</Select.Option>
                      <Select.Option value="others">Others</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="name"
                    label="Name"
                    // {t("contact_us1.contact.name")}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    // {t("contact_us1.contact.email")}
                    rules={[{ required: true, type: "email" }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="Phone"
                    // {t("contact_us1.contact.phone")}
                    rules={[{ required: true }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                  <Form.Item
                    name="message"
                    label="Message"
                    // {t("contact_us1.contact.message")}
                    rules={[{ required: true }]}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      // type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      // className="btnclass"
                      className="btn-clr"
                    >
                      Send Message
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ContactUs;
