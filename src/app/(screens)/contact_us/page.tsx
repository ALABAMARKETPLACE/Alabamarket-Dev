"use client";

import { Form, Input, Select, Button, notification } from "antd";
import Link from "next/link";
import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { MdWhatsapp } from "react-icons/md";
import {
  IoCallOutline,
  IoMailUnreadOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { useSelector } from "react-redux";
import API from "@/config/API";
import { POST } from "@/util/apicall";
import CONFIG from "@/config/configuration";
import PolicyPageLayout from "@/components/policyPageLayout";

function ContactUs() {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const Settings = useSelector((state: any) => state.Settings.Settings);
  const [notificationApi, contextHolder] = notification.useNotification();

  const map = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.0!2d3.180982!3d6.460719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b87bf2173a035%3A0x46d6a31cf47025c5!2sAlaba%20International%20Market!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng" width="100%" height="280" style="border:0;border-radius:10px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  const phoneNumber = CONFIG.CONTACT_NUMBER;
  const whatsappNumber = phoneNumber.replace(/[^\d]/g, "");

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
    <PolicyPageLayout title="Contact Us" currentPath="/contact_us">
      {contextHolder}
      <Row className="g-4">
        <Col md={6} xs={12}>
          <div dangerouslySetInnerHTML={{ __html: map }} />
          <div style={{ marginTop: 20 }}>
            <div className="box1" style={{ display: "flex", alignItems: "center", padding: "10px 0" }}>
              <MdWhatsapp size={22} color="#25D366" style={{ marginRight: 10, flexShrink: 0 }} />
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="page-text3" style={{ margin: 0 }}>
                WhatsApp: {phoneNumber}
              </a>
            </div>
            <div className="box1" style={{ display: "flex", alignItems: "center", padding: "10px 0" }}>
              <IoCallOutline size={22} color="#0066CC" style={{ marginRight: 10, flexShrink: 0 }} />
              <a href={`tel:${phoneNumber.replace(/\s/g, "")}`} className="page-text3" style={{ margin: 0 }}>
                Phone: {phoneNumber}
              </a>
            </div>
            <div className="box1" style={{ display: "flex", alignItems: "center", padding: "10px 0" }}>
              <IoMailUnreadOutline size={22} color="#EA4335" style={{ marginRight: 10, flexShrink: 0 }} />
              <a href="mailto:info@alabamarketplace.ng" className="page-text3" style={{ margin: 0 }}>
                info@alabamarketplace.ng
              </a>
            </div>
            <div className="box1" style={{ display: "flex", alignItems: "flex-start", padding: "10px 0" }}>
              <IoLocationOutline size={22} color="#FF5722" style={{ marginRight: 10, flexShrink: 0, marginTop: 2 }} />
              <span className="page-text3" style={{ margin: 0 }}>
                B439 Electronics Line, Main Gate Alaba International Market Ojo Lagos
              </span>
            </div>
          </div>
        </Col>
        <Col md={6} xs={12}>
          <h4 className="page-text1" style={{ marginBottom: 20 }}>Send a Message</h4>
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              name="subject"
              label="Subject"
              rules={[{ required: true, message: "Please select a subject" }]}
            >
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
            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="message" label="Message" rules={[{ required: true }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" loading={isLoading} className="btn-clr">
                Send Message
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </PolicyPageLayout>
  );
}

export default ContactUs;
