import React, { useEffect, useState } from "react";
import { Modal, Select } from "antd";
import { Button, Form, Input, Radio, notification } from "antd";
import { POST, PUT } from "../../../../../util/apicall";
import API from "../../../../../config/API";
import { useSelector } from "react-redux";
import TextArea from "antd/es/input/TextArea";
import { Col, Row } from "react-bootstrap";
import AutoCompleteLocation from "../../profile/_components/autoCompleteLocation";
import PrefixSelector from "../../../../../components/prefixSelector/page";
import { useSession } from "next-auth/react";
const update = "update";
const AddressModal = (props: any) => {
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const { data: User } = useSession();
  const [latLong, setLatLong] = useState<{
    lat: number;
    long: number;
  } | null>();
  const type = props?.type;
  useEffect(() => {
    if (type == update) {
      form.setFieldsValue({
        type: props?.selected?.type,
        flat: props?.selected?.flat,
        pincode: props?.selected?.pin_code,
        state: props?.selected?.state,
        street: props?.selected?.street,
        city: props?.selected?.city,
        code: props?.selected?.code,
        phone: props?.selected?.alt_phone,
        location: props?.selected?.geo_location,
        address: props?.selected?.fullAddress,
      });
      setLatLong({ lat: props?.selected?.lat, long: props?.selected?.long });
    } else {
      form.resetFields();
      setLatLong(null);
    }
  }, [type, props]);
  const formSubmitHandler = async (values: any) => {
    const url =
      type == update ? API.ADDRESS + props?.selected?.id : API.ADDRESS;
    const obj = {
      flat: values?.flat,
      pin_code: values?.pincode,
      state: values?.state,
      city: values?.city,
      street: values?.street,
      code: values?.code,
      alt_phone: values?.phone,
      geo_location: values?.location,
      fullAddress: values?.address,
      type: values?.type,
      lat: latLong?.lat,
      long: latLong?.long,
    };
    if (!latLong?.lat || !latLong?.long) {
      Notifications["error"]({
        message: "Location Not Selected",
        description: `Please Select a location `,
      });
      return;
    }
    setIsLoading(true);
    try {
      const response: any =
        type == update ? await PUT(url, obj) : await POST(url, obj);
      if (response?.status) {
        Notifications["success"]({
          message: "Success",
          description: `Successfully ${
            type == update ? "updated" : "Added"
          } the Address`,
        });
        form.resetFields();
        props?.modalClose();
        props?.fetchAddress();
      } else {
        Notifications["error"]({
          message: `Failed to ${type == update ? "Update" : "Add New Address"}`,
          description: response.message,
        });
      }
    } catch (err: any) {
      Notifications["error"]({
        message: `Failed to ${type == update ? "Update" : "Add New Address"}`,
        description: err.message,
      });
    }
    setIsLoading(false);
  };
  //=====================================================================autocomplete

  return (
    <Modal
      title={`${type == "add" ? "Add New" : "Edit"} Address `}
      open={props?.open}
      onCancel={() => {
        props?.modalClose();
        form.resetFields();
      }}
      okText="Update"
      centered
      cancelButtonProps={{ style: { display: "none" } }}
      okButtonProps={{ style: { display: "none" } }}
    >
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={formSubmitHandler}
        initialValues={{ code: "+971", type: "home" }}
      >
        <AutoCompleteLocation
          label={false}
          size="large"
          setCurrentLocation={(value: any) => {
            console.log(value);
            setLatLong({ lat: value?.lat, long: value?.long });
            form.setFieldsValue({
              code: value?.code,
              pincode: value?.pincode,
              state: value?.state,
              street: value?.street,
              city: value?.city ?? value?.location,
              address: value?.address,
              location: form.getFieldValue("location") ?? value?.street,
            });
          }}
        />
        <Row className="mt-3">
          <Col md={6}>
            {" "}
            <Form.Item
              label="Type"
              name={"type"}
              rules={[
                {
                  required: true,
                  message: "Please Select a type of address",
                },
              ]}
            >
              <Select size="large">
                <Select.Option key="home" value="home">
                  Home
                </Select.Option>
                <Select.Option key="business" value="business">
                  Business
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item
              label="Flat"
              name={"flat"}
              rules={[
                {
                  required: true,
                  message: "Please Enter Flat Number",
                },
                { max: 50, message: "Flat Number is too long" },
              ]}
            >
              <Input placeholder="Flat" size="large" />
            </Form.Item>
          </Col>
          <Col className="col-12">
            <Form.Item
              label="Address"
              name="address"
              rules={[
                {
                  required: true,
                  message: "Please Enter Address",
                },
                {
                  min: 10,
                  message: "Enter a Valid address",
                },
                {
                  max: 200,
                  message: "Enter a Valid address",
                },
              ]}
            >
              <TextArea rows={3} placeholder="Address" maxLength={200} />
            </Form.Item>
          </Col>

          <Col md="6">
            <Form.Item
              label="PinCode"
              name="pincode"
              rules={[
                {
                  required: true,
                  message: "Please Enter PinCode",
                },
                {
                  min: 4,
                  message: "Enter a Valid Pincode",
                },
                {
                  max: 40,
                  message: "Enter a Valid Pincode",
                },
              ]}
            >
              <Input placeholder="Pincode" size="large" />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item
              label="State"
              name="state"
              rules={[
                {
                  required: true,
                  message: "Please Enter State",
                },
                {
                  min: 4,
                  message: "Enter a Valid State",
                },
                {
                  max: 100,
                  message: "Enter a Valid State",
                },
              ]}
            >
              <Input placeholder="State" size="large" />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item
              label="Street"
              name="street"
              rules={[
                {
                  required: true,
                  message: "Please Enter Street",
                },
                {
                  min: 4,
                  message: "Enter a Valid Street name",
                },
                {
                  max: 100,
                  message: "Enter a Valid Street name",
                },
              ]}
            >
              <Input placeholder="Street" size="large" />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item
              label="City"
              name="city"
              rules={[
                {
                  required: true,
                  message: "Please Enter City",
                },
                {
                  min: 4,
                  message: "Enter a Valid City name",
                },
                {
                  max: 100,
                  message: "Enter a Valid City name",
                },
              ]}
            >
              <Input placeholder="City" size="large" />
            </Form.Item>
          </Col>
          <Col className="col-12">
            <Form.Item
              label="Alternate Phone"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please Enter Phone Number",
                },
                {
                  min: 8,
                  message: "Enter a Valid Phone Number",
                },
                {
                  max: 16,
                  message: "Enter a Valid Phone Number",
                },
              ]}
            >
              <Input
                addonBefore={<PrefixSelector />}
                style={{ width: "100%" }}
                size="large"
                type="number"
                placeholder="Phone Number"
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="d-flex gap-2 justify-content-end">
          <Button onClick={props?.modalClose}>Cancel</Button>
          <Button type="primary" loading={isLoading} onClick={form.submit}>
            {type == update ? "Update" : "Add"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddressModal;
