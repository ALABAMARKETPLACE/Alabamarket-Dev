import React, { useEffect, useState } from "react";
import { Modal, Select } from "antd";
import { Button, Form, Input, notification } from "antd";
import { POST, PUT, GET } from "../../../../../util/apicall";
import API from "../../../../../config/API";
import TextArea from "antd/es/input/TextArea";
import { Col, Row } from "react-bootstrap";
import PrefixSelector from "../../../../../components/prefixSelector/page";
import { useQuery } from "@tanstack/react-query";

const update = "update";

interface NewAddressModalProps {
  open: boolean;
  modalClose: () => void;
  type: string;
  selected: any;
  fetchAddress: () => void;
}

const NewAddressModal = (props: NewAddressModalProps) => {
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const type = props?.type;

  // Watch for country and state selection to hide/show fields
  const countryId = Form.useWatch("country_id", form);
  const stateId = Form.useWatch("state_id", form);

  // Fetch countries
  const { data: countries, isLoading: loadingCountries } = useQuery<any>({
    queryKey: [API.COUNTRIES],
    queryFn: async () => await GET(API.COUNTRIES),
    select: (res) => (res?.status ? res?.data : []),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Fetch states
  const { data: states, isLoading: loadingStates } = useQuery<any>({
    queryKey: [API.STATES],
    queryFn: async () => await GET(API.STATES),
    select: (res) => (res?.status ? res?.data : []),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (type === update && props?.selected) {
      form.setFieldsValue({
        address_type: props.selected.address_type,
        full_address: props.selected.full_address,
        pincode: props.selected.pincode,
        phone_no: props.selected.phone_no,
        country_id: props.selected.country_id,
        state_id: props.selected.state_id,
        code: props.selected.code || "+971",
      });
    } else {
      form.resetFields();
    }
  }, [type, props.selected, form]);

  const formSubmitHandler = async (values: any) => {
    const url =
      type === update
        ? API.NEW_ADDRESS + props.selected?.id
        : API.NEW_ADDRESS_ALL;

    const obj = {
      address_type: values.address_type,
      full_address: values.full_address,
      pincode: values.pincode,
      phone_no: values.phone_no,
      country_id: values.country_id || null,
      state_id: values.state_id || null,
    };

    // Validate at least one of country or state is selected
    if (!obj.country_id && !obj.state_id) {
      Notifications["error"]({
        message: "Validation Error",
        description: "Please select either a Country or a State",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response: any =
        type === update ? await PUT(url, obj) : await POST(url, obj);

      if (response?.status) {
        Notifications["success"]({
          message: "Success",
          description: `Successfully ${
            type === update ? "updated" : "added"
          } the address`,
        });
        form.resetFields();
        props.modalClose();
        props.fetchAddress();
      } else {
        Notifications["error"]({
          message: `Failed to ${
            type === update ? "Update" : "Add New Address"
          }`,
          description: response.message,
        });
      }
    } catch (err: any) {
      Notifications["error"]({
        message: `Failed to ${type === update ? "Update" : "Add New Address"}`,
        description: err.message,
      });
    }
    setIsLoading(false);
  };

  return (
    <Modal
      title={`${type === "add" ? "Add New" : "Edit"} Address`}
      open={props.open}
      onCancel={() => {
        props.modalClose();
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
        initialValues={{ code: "+971", address_type: "Home" }}
      >
        <Row className="mt-3">
          <Col md={12}>
            <Form.Item
              label="Address Type"
              name="address_type"
              rules={[
                {
                  required: true,
                  message: "Please select address type",
                },
              ]}
            >
              <Select size="large" placeholder="Select address type">
                <Select.Option key="Home" value="Home">
                  Home
                </Select.Option>
                <Select.Option key="Work" value="Work">
                  Work
                </Select.Option>
                <Select.Option key="Office" value="Office">
                  Office
                </Select.Option>
                <Select.Option key="Other" value="Other">
                  Other
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col className="col-12">
            <Form.Item
              label="Full Address"
              name="full_address"
              rules={[
                {
                  required: true,
                  message: "Please enter full address",
                },
                {
                  min: 10,
                  message: "Address must be at least 10 characters",
                },
                {
                  max: 500,
                  message: "Address must not exceed 500 characters",
                },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Enter your complete address"
                maxLength={500}
              />
            </Form.Item>
          </Col>

          <Col md={6}>
            <Form.Item
              label="Pincode"
              name="pincode"
              rules={[
                {
                  required: true,
                  message: "Please enter pincode",
                },
                {
                  min: 1,
                  message: "Enter a valid pincode",
                },
                {
                  max: 20,
                  message: "Pincode must not exceed 20 characters",
                },
              ]}
            >
              <Input placeholder="Pincode" size="large" />
            </Form.Item>
          </Col>

          <Col md={6}>
            <Form.Item
              label="Phone Number"
              name="phone_no"
              rules={[
                {
                  required: true,
                  message: "Please enter phone number",
                },
                {
                  min: 10,
                  message: "Phone number must be at least 10 characters",
                },
                {
                  max: 20,
                  message: "Phone number must not exceed 20 characters",
                },
              ]}
            >
              <Input
                addonBefore={<PrefixSelector />}
                style={{ width: "100%" }}
                size="large"
                type="tel"
                placeholder="Phone Number"
              />
            </Form.Item>
          </Col>

          {/* Country Field - Hidden if State is selected */}
          {!stateId && (
            <Col md={12}>
              <Form.Item
                label="Country"
                name="country_id"
                rules={[
                  {
                    required: !stateId,
                    message: "Please select a country or state",
                  },
                ]}
              >
                <Select
                  placeholder="Select Country"
                  size="large"
                  loading={loadingCountries}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={
                    Array.isArray(countries)
                      ? countries.map((c: any) => ({
                          value: c.id,
                          label: c.country_name,
                        }))
                      : []
                  }
                  onChange={(value) => {
                    if (value) {
                      form.setFieldValue("state_id", undefined);
                    }
                  }}
                />
              </Form.Item>
            </Col>
          )}

          {/* State Field - Hidden if Country is selected */}
          {!countryId && (
            <Col md={12}>
              <Form.Item
                label="State"
                name="state_id"
                rules={[
                  {
                    required: !countryId,
                    message: "Please select a state or country",
                  },
                ]}
              >
                <Select
                  placeholder="Select State"
                  size="large"
                  loading={loadingStates}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={
                    Array.isArray(states)
                      ? states.map((s: any) => ({
                          value: s.id,
                          label: s.name,
                        }))
                      : []
                  }
                  onChange={(value) => {
                    if (value) {
                      form.setFieldValue("country_id", undefined);
                    }
                  }}
                />
              </Form.Item>
            </Col>
          )}

          {/* Info Message */}
          <Col md={12}>
            <p className="text-muted" style={{ fontSize: "12px" }}>
              <i>Note: Select either Country or State (not both)</i>
            </p>
          </Col>
        </Row>

        <div className="d-flex gap-2 justify-content-end">
          <Button onClick={props.modalClose}>Cancel</Button>
          <Button type="primary" loading={isLoading} htmlType="submit">
            {type === update ? "Update" : "Add"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default NewAddressModal;
