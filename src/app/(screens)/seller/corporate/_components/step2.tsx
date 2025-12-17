import React, { useState, useEffect } from "react";
import { Col, Row, Container } from "react-bootstrap";
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Radio,
  notification,
  Space,
} from "antd";
import LocationPicker from "../../../../(dashboard)/_components/location_picker";
import API from "../../../../../config/API";
import { GET } from "../../../../../util/apicall";

function Step2({ businessType, formData, moveToNextStep, goBack }: any) {
  const [form] = Form.useForm();
  const [location, setLocation] = useState<any>(null);
  const [OpenPicker, setOpenPicker] = useState(false);
  const [Notifications, contextHolder] = notification.useNotification();
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [validatingAccount, setValidatingAccount] = useState(false);
  const [bankDetails, setBankDetails] = useState<any>(null);

  useEffect(() => {
    if (formData?.business_location) {
      const [lat, lng] = formData.business_location.split(" ").map(Number);
      setLocation({ lat, lng });
    }
    loadBanks();
  }, [formData]);

  const loadBanks = async () => {
    try {
      setLoadingBanks(true);
      console.log('Loading banks from:', API.PAYSTACK_BANKS);
      const response = await GET(API.PAYSTACK_BANKS);
      console.log('Banks response:', response);
      if (response.status) {
        setBanks(response.data || []);
        console.log('Banks loaded:', response.data?.length || 0, 'banks');
      } else {
        console.error('Failed to load banks - response not successful:', response);
        Notifications.error({
          message: 'Failed to load supported banks',
          description: response.message || 'Server returned unsuccessful response'
        });
      }
    } catch (error) {
      console.error('Failed to load banks:', error);
      Notifications.error({
        message: 'Failed to load supported banks',
        description: 'Please try again later'
      });
    } finally {
      setLoadingBanks(false);
    }
  };

  const validateAccountNumber = async (accountNumber: string, bankCode: string) => {
    if (!accountNumber || !bankCode || accountNumber.length < 10) {
      setBankDetails(null);
      return;
    }

    try {
      setValidatingAccount(true);
      const response = await GET(API.PAYSTACK_RESOLVE_ACCOUNT, { 
        account_number: accountNumber, 
        bank_code: bankCode 
      });
      if (response.status && response.data) {
        setBankDetails(response.data);
        form.setFieldValue('account_name_or_code', response.data.account_name);
        Notifications.success({
          message: 'Account Verified',
          description: `Account belongs to: ${response.data.account_name}`
        });
      } else {
        setBankDetails(null);
        form.setFieldValue('account_name_or_code', '');
        Notifications.error({
          message: 'Invalid Account',
          description: 'Could not verify this account number'
        });
      }
    } catch (error) {
      setBankDetails(null);
      form.setFieldValue('account_name_or_code', '');
      Notifications.error({
        message: 'Verification Failed',
        description: 'Could not verify account. Please check your details.'
      });
    } finally {
      setValidatingAccount(false);
    }
  };

  const onFinish = async (values: any) => {
    if (useManualLocation) {
      // For manual location, use default coordinates or allow user to skip
      const data = {
        ...values,
        lat: values.manual_lat || 0,
        long: values.manual_lng || 0,
      };
      moveToNextStep({ step2Data: data });
    } else if (location?.lat && location?.lng) {
      const data = { ...values, lat: location.lat, long: location.lng };
      moveToNextStep({ step2Data: data });
    } else {
      Notifications["warning"]({
        message: `Please choose your location or use manual entry`,
      });
    }
  };

  const array = Array.isArray(businessType)
    ? businessType.map((item: any) => ({
        ...item,
        value: item.name,
      }))
    : [];

  return (
    <div className="sellerRegister-stepbox">
      {contextHolder}
      <Container>
        <Row>
          <Col md={4}>
            <Form
              form={form}
              onFinish={onFinish}
              initialValues={{
                store_name: formData?.store_name,
                business_address: formData?.business_address,
                business_location: formData?.business_location,
                business_types: formData?.business_types,
                trn_number: formData?.trn_number,
                trade_licencse_no: formData?.trade_licencse_no,
                upscs: formData?.upscs,
                manufacture: formData?.manufacture,
                agreement: formData?.agreement,
                account_name_or_code: formData?.account_name_or_code,
                account_number: formData?.account_number,
                settlement_bank: formData?.settlement_bank,
              }}
            >
              <div className="input-form-label">Store Name</div>
              <Form.Item
                name="store_name"
                rules={[
                  {
                    required: true,
                    message: "Please enter your Store Name",
                  },
                  {
                    max: 50,
                    message: "Store Name is too long",
                  },
                ]}
              >
                <Input placeholder="Store Name" size="large" />
              </Form.Item>
              <div className="input-form-label">Business Location</div>
              <Form.Item
                name="business_address"
                rules={[
                  {
                    required: true,
                    message: "Please enter Business Location",
                  },
                  {
                    max: 200,
                    message: "Business Location is too long",
                  },
                ]}
              >
                <Input.TextArea
                  placeholder="Enter your Business Location"
                  size="large"
                  rows={3}
                />
              </Form.Item>
              <div className="input-form-label">
                <Checkbox
                  checked={useManualLocation}
                  onChange={(e) => setUseManualLocation(e.target.checked)}
                >
                  Enter location manually (if Google Maps is not accurate)
                </Checkbox>
              </div>
              {!useManualLocation ? (
                <>
                  <div className="input-form-label">Locate your Business</div>
                  <Form.Item
                    name="business_location"
                    rules={[
                      {
                        required: !useManualLocation,
                        message: "Please locate your Business",
                      },
                      {
                        max: 100,
                        message: "Location is too long",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Store Location"
                      size="large"
                      onClick={() => setOpenPicker(true)}
                    />
                  </Form.Item>
                </>
              ) : (
                <>
                  <div className="input-form-label">Manual Location Entry</div>
                  <Row>
                    <Col md={12}>
                      <Form.Item name="manual_lat" label="Latitude (Optional)">
                        <Input
                          placeholder="Enter Latitude (e.g., 6.5244)"
                          size="large"
                          type="number"
                          step="any"
                        />
                      </Form.Item>
                    </Col>
                    <Col md={12}>
                      <Form.Item name="manual_lng" label="Longitude (Optional)">
                        <Input
                          placeholder="Enter Longitude (e.g., 3.3792)"
                          size="large"
                          type="number"
                          step="any"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <p style={{ fontSize: 12, color: "#666" }}>
                    Note: You can leave coordinates empty and update them later
                    in your store settings.
                  </p>
                </>
              )}
              <div className="input-form-label">Business Type</div>
              <Form.Item
                name="business_types"
                rules={[
                  {
                    required: true,
                    message: "Please select Business Type",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Please select"
                  options={array}
                />
              </Form.Item>
              <div className="input-form-label">
                Business Registration Number
              </div>
              <Form.Item
                name="trn_number"
                rules={[
                  {
                    required: true,
                    message: "Business Registration Number is required",
                  },
                  {
                    max: 30,
                    message: "Business Registration Number is too long",
                  },
                ]}
              >
                <Input
                  placeholder="Enter Business Registration Number"
                  size="large"
                />
              </Form.Item>
              <div className="input-form-label">Union Membership Number</div>
              <Form.Item
                name={"trade_licencse_no"}
                rules={[
                  {
                    required: true,
                    message: "Union Membership Number is required",
                  },
                  {
                    max: 30,
                    message: "Union Membership Number is too long",
                  },
                ]}
              >
                <Input
                  placeholder="Enter Union Membership Number"
                  size="large"
                />
              </Form.Item>
              <div className="input-form-label">Select Bank</div>
              <Form.Item
                name="settlement_bank"
                rules={[
                  {
                    required: true,
                    message: "Please select your bank",
                  },
                ]}
              >
                <Select
                  placeholder="Select your bank"
                  size="large"
                  loading={loadingBanks}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={banks.map(bank => ({
                    label: bank.name,
                    value: bank.code
                  }))}
                  onChange={(bankCode) => {
                    const accountNumber = form.getFieldValue('account_number');
                    if (accountNumber) {
                      validateAccountNumber(accountNumber, bankCode);
                    }
                  }}
                />
              </Form.Item>
              <div className="input-form-label">Account Number</div>
              <Form.Item
                name="account_number"
                rules={[
                  {
                    required: true,
                    message: "Account Number is required",
                  },
                  {
                    pattern: /^\d{10}$/,
                    message: "Account Number must be exactly 10 digits",
                  },
                ]}
              >
                <Input
                  placeholder="Enter 10-digit Account Number"
                  size="large"
                  maxLength={10}
                  onChange={(e) => {
                    const accountNumber = e.target.value;
                    const bankCode = form.getFieldValue('settlement_bank');
                    if (accountNumber.length === 10 && bankCode) {
                      validateAccountNumber(accountNumber, bankCode);
                    } else {
                      setBankDetails(null);
                      form.setFieldValue('account_name_or_code', '');
                    }
                  }}
                />
              </Form.Item>
              <div className="input-form-label">Account Name</div>
              <Form.Item
                name="account_name_or_code"
                rules={[
                  {
                    required: true,
                    message: "Account verification is required",
                  },
                ]}
              >
                <Input
                  placeholder={bankDetails ? "Account name verified" : "Enter account number and select bank to verify"}
                  size="large"
                  disabled
                  value={bankDetails?.account_name || ''}
                  style={{
                    backgroundColor: bankDetails ? '#f6ffed' : '#f5f5f5',
                    borderColor: bankDetails ? '#52c41a' : undefined
                  }}
                />
              </Form.Item>
              {validatingAccount && (
                <div style={{ marginBottom: '16px', padding: '8px 12px', backgroundColor: '#fff7e6', border: '1px solid #ffa940', borderRadius: '6px' }}>
                  <span style={{ color: '#ffa940', fontSize: '14px' }}>Verifying account...</span>
                </div>
              )}
              {bankDetails && (
                <div style={{ marginBottom: '16px', padding: '8px 12px', backgroundColor: '#f6ffed', border: '1px solid #52c41a', borderRadius: '6px' }}>
                  <span style={{ color: '#52c41a', fontSize: '14px' }}>✓ Account verified: {bankDetails.account_name}</span>
                </div>
              )}
              <Row>
                <Col md="6" xs={6}>
                  <Button onClick={() => goBack()} block size="large">
                    Back
                  </Button>
                </Col>
                <Col md="6" xs={6}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block size="large">
                      Continue
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Container>
      {OpenPicker && (
        <LocationPicker
          open={OpenPicker}
          defaultLocation={location}
          close={() => setOpenPicker(false)}
          onChange={(lat: number, lng: number) => {
            setLocation({ lat, lng });
            form.setFieldValue("business_location", `${lat} ${lng}`);
          }}
        />
      )}
    </div>
  );
}

export default Step2;
