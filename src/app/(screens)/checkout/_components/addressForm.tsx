"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Container, Row, Col } from "react-bootstrap";
import { Form, Input, Button, Select, notification } from "antd";
import { POST } from "@/util/apicall";
import API from "@/config/API";
import AutoCompleteLocation from "@/app/(user)/user/profile/_components/autoCompleteLocation";
import PrefixSelector from "@/components/prefixSelector/page";
import { useSession } from "next-auth/react";

function AddressForm(props: any) {
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const { user }: any = useSession();
  const [location, setLocation] = useState<any>({});
  const [isLoading, setIsLoading] = useState<any>(false);

  const locationPick = async (loca: any) => {
    setLocation(loca);
    form.setFieldsValue({
      code: loca?.code,
      pin_code: loca?.pincode,
      state: loca?.state,
      street: loca?.street,
      city: loca?.city,
      fullAddress: loca.address ?? loca.premise,
      location: loca.address ?? loca.premise,
      country: loca?.country,
    });
  };

  const submit = async (values: any) => {
    try {
      setIsLoading(true);
      const obj = {
        userId: user?.user?.data._id,
        flat: values?.flat,
        pin_code: values?.pin_code,
        state: values?.state,
        city: values?.city,
        street: values?.street,
        code: values?.code,
        alt_phone: values?.alt_phone,
        geo_location: values?.location,
        fullAddress: values?.fullAddress,
        country: values?.country,
        type: values?.type,
        lat: location?.lat,
        long: location?.long,
      };
      var response: any = await POST(API.ADDRESS, obj);
      if (response?.status) {
        Notifications["success"]({
          message: "Success",
          description: `Address added Successfully.`,
        });
        props?.onChange();
      } else {
        Notifications["error"]({
          message: `Failed to add address`,
          description: response.message,
        });
      }
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      Notifications["error"]({
        message: `Failed`,
        description: "Failed to add address",
      });
    }
  };

  return (
    <Container fluid>
      {contextHolder}
      <br />
      <Form
        form={form}
        onFinish={submit}
        initialValues={{ type: "home", code: "+971" }}
      >
        <Row>
          <Col sm={12} xs={12}>
            <div className="input-form-label">Search Location </div>
            <Form.Item>
              <AutoCompleteLocation
                label={false}
                size="large"
                value={location?.location}
                setCurrentLocation={(value: any) => locationPick(value)}
              />
            </Form.Item>
          </Col>
          <Col sm={6} xs={12}>
            <div className="input-form-label">Address Type</div>
            <Form.Item name={"type"} rules={[{ required: true }]}>
              <Select size="large" placeholder="Eg : Home , Office , Others">
                <Select.Option key="home" value="home">
                  Home
                </Select.Option>
                <Select.Option key="office" value="office">
                  Office
                </Select.Option>
                <Select.Option key="other" value="other">
                  Other
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col sm={6} xs={12}>
            <div className="input-form-label">Home or Flat/room</div>
            <Form.Item name={"flat"} rules={[{ required: true }]}>
              <Input size="large" placeholder="Eg : 12b skyline" />
            </Form.Item>
          </Col>
          <Col sm={6} xs={12}>
            <div className="input-form-label">Full Addresss</div>
            <Form.Item name={"fullAddress"} rules={[{ required: true }]}>
              <Input.TextArea
                rows={4}
                style={{ height: 126 }}
                size="large"
                placeholder="Eg : 12b skyline"
              />
            </Form.Item>
          </Col>
          <Col sm={6} xs={12}>
            <div className="input-form-label">PinCode</div>
            <Form.Item name={"pin_code"} rules={[{ required: true }]}>
              <Input size="large" placeholder="Eg : 12b skyline" />
            </Form.Item>
            <div className="input-form-label">Street</div>
            <Form.Item name={"street"} rules={[{ required: true }]}>
              <Input size="large" placeholder="Eg : 12b skyline" />
            </Form.Item>
          </Col>
          <Col sm={6} xs={12}>
            <div className="input-form-label">City</div>
            <Form.Item name={"city"} rules={[{ required: true }]}>
              <Input size="large" placeholder="Eg : 12b skyline" />
            </Form.Item>
          </Col>
          <Col sm={6} xs={6}>
            <div className="input-form-label">State</div>
            <Form.Item name={"state"} rules={[{ required: true }]}>
              <Input size="large" placeholder="Eg : 12b skyline" />
            </Form.Item>
          </Col>

          <Col sm={6} xs={6}>
            <div className="input-form-label">Country</div>
            <Form.Item name={"country"} rules={[{ required: true }]}>
              <Input size="large" placeholder="Eg : USA" />
            </Form.Item>
          </Col>
          <Col sm={6} xs={12}>
            <div className="input-form-label">Phone Number</div>
            <Form.Item name="alt_phone" rules={[{ required: true }]}>
              <Input
                addonBefore={<PrefixSelector />}
                style={{ width: "100%" }}
                size="large"
                type="number"
                placeholder="Phone Number"
              />
            </Form.Item>
          </Col>
          <Col sm={6} xs={6}>
            {props?.closable ? (
              <Button
                block
                size="large"
                danger
                onClick={() => props?.close()}
                style={{ height: 50 }}
              >
                Cancel
              </Button>
            ) : null}
          </Col>
          <Col sm={6} xs={6}>
            <Button
              htmlType="submit"
              block
              size="large"
              type="primary"
              loading={isLoading}
              style={{ height: 50 }}
            >
              Save
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
export default AddressForm;
