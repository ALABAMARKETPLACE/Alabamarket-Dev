"use client";
import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Form, Input, Button, Select, notification, Space } from "antd";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import PrefixSelector from "@/components/prefixSelector/page";
import { useQuery } from "@tanstack/react-query";
import TextArea from "antd/es/input/TextArea";
import { useDispatch } from "react-redux";
import { storeAddress } from "@/redux/slice/checkoutSlice";

// Guest address storage key
const GUEST_ADDRESS_KEY = "guest_checkout_address";
const GUEST_EMAIL_KEY = "guest_checkout_email";

// Helper to save guest address to localStorage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const saveGuestAddress = (address: any, email: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_ADDRESS_KEY, JSON.stringify(address));
    localStorage.setItem(GUEST_EMAIL_KEY, email);
  } catch {
    console.error("Failed to save guest address to localStorage");
  }
};

// Helper to get guest address from localStorage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getGuestAddress = (): { address: any; email: string } | null => {
  if (typeof window === "undefined") return null;
  try {
    const address = localStorage.getItem(GUEST_ADDRESS_KEY);
    const email = localStorage.getItem(GUEST_EMAIL_KEY);
    if (address && email) {
      return { address: JSON.parse(address), email };
    }
    return null;
  } catch {
    return null;
  }
};

// Helper to clear guest address from localStorage
export const clearGuestAddress = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_ADDRESS_KEY);
    localStorage.removeItem(GUEST_EMAIL_KEY);
  } catch {
    console.error("Failed to clear guest address from localStorage");
  }
};

interface GuestAddressFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddressSubmit?: (address: any, email: string) => void;
}

function GuestAddressForm({ onAddressSubmit }: GuestAddressFormProps) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [Notifications, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch countries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: countries } = useQuery<any>({
    queryKey: [API.COUNTRIES],
    queryFn: async () => await GET(API.COUNTRIES),
    select: (res) => (res?.status ? res?.data : []),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Fetch states
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: states, isLoading: loadingStates } = useQuery<any>({
    queryKey: [API.STATES],
    queryFn: async () => await GET(API.STATES),
    select: (res) => (res?.status ? res?.data : []),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lagosStates, setLagosStates] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [otherStates, setOtherStates] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lagosCities, setLagosCities] = useState<any[]>([]);
  const [isLagosGroupSelected, setIsLagosGroupSelected] = useState(false);

  useEffect(() => {
    if (Array.isArray(states)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lagos = states.filter((s: any) =>
        s.name.toLowerCase().includes("lagos")
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const others = states.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (s: any) => !s.name.toLowerCase().includes("lagos")
      );
      setLagosStates(lagos);
      setOtherStates(others);

      // Parse cities from Lagos states descriptions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cities: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lagos.forEach((state: any) => {
        if (state.description) {
          const stateCities = state.description
            .split(",")
            .map((c: string) => c.trim());
          stateCities.forEach((city: string) => {
            if (city) {
              cities.push({
                label: city,
                value: city,
                stateId: state.id,
              });
            }
          });
        }
      });
      cities.sort((a, b) => a.label.localeCompare(b.label));
      setLagosCities(cities);
    }
  }, [states]);

  // Load saved guest address on mount
  useEffect(() => {
    const savedData = getGuestAddress();
    if (savedData) {
      const { address, email } = savedData;
      form.setFieldsValue({
        email: email,
        full_name: address.full_name,
        phone_no: address.phone_no,
        full_address: address.full_address,
        address_type: address.address_type || "Home",
        main_state_selection: address.main_state_selection,
        lagos_city: address.lagos_city,
        state_id: address.state_id,
      });
      
      if (address.main_state_selection === "LAGOS_GROUP") {
        setIsLagosGroupSelected(true);
      }
      
      // If we have a saved address, dispatch it
      if (address.id) {
        dispatch(storeAddress(address));
      }
    }
  }, [form, dispatch]);

  const mainStateSelection = Form.useWatch("main_state_selection", form);

  // Update visibility based on selection
  useEffect(() => {
    setIsLagosGroupSelected(mainStateSelection === "LAGOS_GROUP");
  }, [mainStateSelection]);

  // Handle City Selection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCityChange = (value: string, option: any) => {
    if (option && option.stateId) {
      form.setFieldValue("state_id", option.stateId);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submit = async (values: any) => {
    try {
      setIsLoading(true);

      // Validate email
      if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        Notifications["error"]({
          message: "Validation Error",
          description: "Please enter a valid email address.",
        });
        setIsLoading(false);
        return;
      }

      // Ensure we have a valid state ID
      if (values.main_state_selection === "LAGOS_GROUP" && !values.state_id) {
        Notifications["error"]({
          message: "Validation Error",
          description: "Please select your City/Area in Lagos.",
        });
        setIsLoading(false);
        return;
      }

      const finalStateId =
        values.main_state_selection === "LAGOS_GROUP"
          ? values.state_id
          : values.main_state_selection;

      // Find the state details for the address
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectedState = states?.find((s: any) => s.id === finalStateId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectedCountry = countries?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => c.id === values.country_id
      );

      // Create a guest address object (not saved to backend)
      const guestAddress = {
        id: `guest_${Date.now()}`, // Temporary ID for the session
        address_type: values.address_type,
        full_address: values.full_address,
        full_name: values.full_name,
        pincode: "000000",
        phone_no: values.phone_no,
        country_code: values?.code ?? "+234",
        country_id: values.country_id || null,
        state_id: finalStateId || null,
        stateDetails: selectedState || { id: finalStateId, name: selectedState?.name },
        countryDetails: selectedCountry,
        main_state_selection: values.main_state_selection,
        lagos_city: values.lagos_city,
        is_guest: true,
      };

      // Save to localStorage for persistence
      saveGuestAddress(guestAddress, values.email);

      // Dispatch to redux
      dispatch(storeAddress(guestAddress));

      // Callback
      if (onAddressSubmit) {
        onAddressSubmit(guestAddress, values.email);
      }

      Notifications["success"]({
        message: "Success",
        description: "Delivery address saved successfully.",
      });

      setIsLoading(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setIsLoading(false);
      Notifications["error"]({
        message: "Failed",
        description: err.message || "Failed to save address",
      });
    }
  };

  return (
    <Container fluid>
      {contextHolder}
      <br />
      <div className="mb-3">
        <p className="text-muted" style={{ fontSize: "14px" }}>
          Enter your delivery details to continue. No account required!
        </p>
      </div>
      <Form
        form={form}
        onFinish={submit}
        layout="vertical"
        initialValues={{ address_type: "Home", code: "+234" }}
      >
        <Row>
          {/* Email Field - Required for Guest Checkout */}
          <Col sm={6} xs={12}>
            <div className="input-form-label">Email Address *</div>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                size="large"
                type="email"
                placeholder="your@email.com"
              />
            </Form.Item>
          </Col>

          {/* Full Name Field */}
          <Col sm={6} xs={12}>
            <div className="input-form-label">Full Name *</div>
            <Form.Item
              name="full_name"
              rules={[
                { required: true, message: "Please enter your full name" },
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
            >
              <Input size="large" placeholder="Your Full Name" />
            </Form.Item>
          </Col>

          <Col sm={6} xs={12}>
            <div className="input-form-label">Address Type</div>
            <Form.Item
              name="address_type"
              rules={[
                { required: true, message: "Please select address type" },
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

          <Col sm={6} xs={12}>
            <div className="input-form-label">Phone Number *</div>
            <Form.Item
              name="phone_no"
              rules={[
                { required: true, message: "Please enter phone number" },
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
              <Space.Compact style={{ width: "100%" }}>
                <PrefixSelector />
                <Input
                  style={{ width: "100%" }}
                  size="large"
                  type="tel"
                  placeholder="Phone Number"
                />
              </Space.Compact>
            </Form.Item>
          </Col>

          <Col sm={12} xs={12}>
            <div className="input-form-label">Full Address *</div>
            <Form.Item
              name="full_address"
              rules={[
                { required: true, message: "Please enter full address" },
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
                placeholder="Enter your complete address (street, landmark, etc.)"
                maxLength={500}
                size="large"
              />
            </Form.Item>
          </Col>

          {/* State Field */}
          <Col sm={6} xs={12}>
            <div className="input-form-label">State *</div>
            <Form.Item
              name="main_state_selection"
              rules={[
                {
                  required: true,
                  message: "Please select a state",
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
                options={[
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ...otherStates.map((s: any) => ({
                    value: s.id,
                    label: s.name,
                  })),
                  // Add grouped Lagos option if any Lagos states exist
                  ...(lagosStates.length > 0
                    ? [{ value: "LAGOS_GROUP", label: "Lagos" }]
                    : []),
                ].sort((a, b) => a.label.localeCompare(b.label))}
                onChange={(value) => {
                  if (value === "LAGOS_GROUP") {
                    setIsLagosGroupSelected(true);
                    form.setFieldValue("state_id", undefined);
                  } else {
                    setIsLagosGroupSelected(false);
                    form.setFieldValue("state_id", value);
                  }
                }}
              />
            </Form.Item>
          </Col>

          {/* Hidden State ID field for Lagos */}
          <Form.Item name="state_id" hidden>
            <Input />
          </Form.Item>

          {/* Lagos City Dropdown */}
          {isLagosGroupSelected && (
            <Col sm={6} xs={12}>
              <div className="input-form-label">City *</div>
              <Form.Item
                name="lagos_city"
                rules={[
                  {
                    required: true,
                    message: "Please select your city",
                  },
                ]}
                help={
                  <span className="text-muted" style={{ fontSize: "12px" }}>
                    Select your specific city or area in Lagos for accurate
                    delivery charges.
                  </span>
                }
              >
                <Select
                  placeholder="Select City in Lagos"
                  size="large"
                  showSearch
                  allowClear
                  options={lagosCities}
                  onChange={handleCityChange}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          )}

          {/* Info Message */}
          <Col sm={12}>
            <p className="text-muted" style={{ fontSize: "12px" }}>
              <i>
                Note: Your order confirmation and updates will be sent to your
                email address.
              </i>
            </p>
          </Col>

          <Col sm={12} xs={12}>
            <Button
              htmlType="submit"
              block
              size="large"
              type="primary"
              loading={isLoading}
              style={{ height: 50 }}
            >
              Save Delivery Address
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default GuestAddressForm;
