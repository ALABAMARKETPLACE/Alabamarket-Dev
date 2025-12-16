"use client";
import React, { useState } from "react";
import CONFIG from "@/config/configuration";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  notification,
  Select,
  Space,
  Switch,
  TimePicker,
} from "antd";
import { Col, Row } from "react-bootstrap";
import { IoLocationSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import Loading from "@/app/(dashboard)/_components/loading/index";
import moment from "moment";
import dayjs from "dayjs";
import ImagePicker from "@/app/(dashboard)/_components/ImagePicker/imagePicker";
import { COMPRESS_IMAGE, PUT } from "@/util/apicall";
import PrefixSelector from "@/components/prefixSelector/page";
import Error from "@/app/(dashboard)/_components/error";
import LocationPicker from "@/app/(dashboard)/_components/location_picker";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function Page() {
  const { data: session }: any = useSession();
  const router = useRouter();
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const [logo, setLogo] = useState<any>(null);
  const [cover, setCover] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isWarningExpanded, setIsWarningExpanded] = useState(false);

  // Redirect admin to dashboard if they try to access this page
  React.useEffect(() => {
    if (session?.role === "admin") {
      router.push("/auth/dashboard");
    }
  }, [session, router]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    setIsWarningExpanded(!isMobileView);
  }, [isMobileView]);

  const {
    data: store,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [API.STORE_INFO],
    enabled: session?.role === "seller", // Only fetch if user is seller
    select: (data: any) => {
      if (data?.status) return data?.data;
      return null;
    },
  });

  const { data: busines_types } = useQuery({
    queryKey: [API.BUSINESS_TYPE],
    staleTime: 10000 * 60 * 5,
    select: (data: any) => {
      if (data?.status)
        return Array.isArray(data?.data)
          ? data?.data?.map((item: any) => ({ ...item, value: item.name }))
          : [];
      return [];
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: async (body: any) => {
      const formData: any = { ...body };
      if (logo?.file) {
        const response = await COMPRESS_IMAGE(logo.file);
        formData.logo_upload = response?.url;
      }
      if (cover?.file) {
        const response = await COMPRESS_IMAGE(cover.file);
        formData.cover_image = response?.url;
      }
      formData.from = dayjs(body?.from).format("HH:mm:ss");
      formData.to = dayjs(body?.to).format("HH:mm:ss");
      formData.status = body?.status == true ? "approved" : "inactive";
      return PUT(API.STORE_UPDATE, formData);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Store Informations updated`,
      });
      queryClient.invalidateQueries({ queryKey: [API.STORE_INFO] });
    },
  });

  // Show loading if checking session or if admin is being redirected
  if (!session || session?.role === "admin") {
    return <Loading />;
  }

  return (
    <div>
      {contextHolder}
      <PageHeader title={"Manage Store"} bredcume={"Dashboard / Manage Store"}>
        <div
          style={{
            width: isMobileView ? "100%" : 400,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ fontSize: 12, color: "red" }}>
            Warning: Changing Store Status affects:
          </div>
          <div
            style={{
              fontSize: 10,
              whiteSpace:
                isMobileView && !isWarningExpanded ? "nowrap" : "normal",
              overflow:
                isMobileView && !isWarningExpanded ? "hidden" : "visible",
              textOverflow:
                isMobileView && !isWarningExpanded ? "ellipsis" : "clip",
            }}
          >
            Making changes to status of your store will impact the visiblity of
            the store to the users, if store is inactive then no users can see
            or order from your store.
          </div>
          {isMobileView && (
            <Button
              type="link"
              size="small"
              style={{ padding: 0, alignSelf: "flex-start" }}
              onClick={() => setIsWarningExpanded((prev) => !prev)}
            >
              {isWarningExpanded ? "See less" : "See more"}
            </Button>
          )}
        </div>
        <Form.Item noStyle>
          <Button
            type="primary"
            htmlType="submit"
            className="px-5"
            size="large"
            loading={mutationUpdate.isPending}
            onClick={() => form.submit()}
          >
            Save
          </Button>
        </Form.Item>
      </PageHeader>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error?.message} />
      ) : (
        <Form
          form={form}
          initialValues={{
            store_name: store?.store_name,
            business_address: store?.business_address,
            name: store?.name,
            email: store?.email,
            phone: store?.phone,
            id_issue_country: store?.id_issue_country,
            id_expiry_date: moment(store?.id_expiry_date).format("MMM Do YYYY"),
            id_type: store?.id_type,
            trade_lisc_no: store?.trade_lisc_no,
            trn_number: store?.trn_number,
            upscs: store?.upscs,
            manufacture: store?.manufacture,
            seller_country: store?.seller_country,
            delivery_period: store?.delivery_period,
            location: store?.lat + "," + store?.long,
            from: dayjs(store?.from, "HH:mm:ss"),
            to: dayjs(store?.to, "HH:mm:ss"),
            description: store?.description,
            business_types: store?.business_types,
            code: store?.code,
            status: store?.status == "approved" ? true : false,
            lat: store?.lat,
            long: store?.long,
          }}
          onFinish={(val) => mutationUpdate.mutate(val)}
        >
          <Card
            title={"Store Listing"}
            extra={[
              <div className="d-flex gap-3 align-items-center">
                <Form.Item
                  className="mb-0"
                  label="Store Status"
                  name={"status"}
                >
                  <Switch />
                </Form.Item>
              </div>,
            ]}
          >
            <Row>
              <Col sm={4}>
                <div className="form-lable">Store Name</div>
                <Form.Item
                  name={"store_name"}
                  rules={[
                    { required: true, message: "Please Enter Store name" },
                  ]}
                >
                  <Input size="large" placeholder="Store Name" />
                </Form.Item>
                <div className="form-lable">Store Type</div>
                <Form.Item name={"business_types"}>
                  <Select
                    mode="multiple"
                    allowClear
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="Please select"
                    options={busines_types}
                    optionRender={(option: any) => (
                      <Space>
                        <span role="img" aria-label={option?.data?.name}></span>
                        {option?.data?.name}
                      </Space>
                    )}
                  />
                </Form.Item>
                <div className="form-lable">Store Description</div>
                <Form.Item name={"description"}>
                  <Input.TextArea size="large" placeholder="Description Name" />
                </Form.Item>
                <div className="form-lable">Store Full Address</div>
                <Form.Item
                  name={"business_address"}
                  rules={[
                    { required: true, message: "Enter Business Address" },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    size="large"
                    placeholder="Store Address"
                  />
                </Form.Item>
              </Col>
              <Col sm={4}>
                <div className="form-lable">Store Logo</div>
                <Form.Item>
                  <ImagePicker
                    fileURL={logo?.url ?? (store?.logo_upload || "")}
                    onChange={(val) => setLogo(val)}
                    aspectRatio={1 / 1}
                    width={"100%"}
                    height={"23vh"}
                  />
                </Form.Item>
                <div style={{ padding: 12 }} />
                <div className="form-lable">Store Cover Image</div>
                <Form.Item>
                  <ImagePicker
                    fileURL={cover?.url ?? (store?.cover_image || "")}
                    onChange={(val) => setCover(val)}
                    aspectRatio={1 / 1}
                    width={"100%"}
                    height={"23vh"}
                  />
                </Form.Item>
              </Col>
              <Col sm={4}>
                <br />
                <Alert
                  message="Informational Notes"
                  description={
                    <>
                      <li>
                        The Store name and Store cover image will be visible to
                        the users visiting the {CONFIG.NAME} website.
                      </li>

                      <li>
                        The Store name and Store cover image will be visible to
                        the users visiting the {CONFIG.NAME} website.
                      </li>
                      <li>
                        Store log will be visible to all user's vising your
                        store page.
                      </li>
                    </>
                  }
                  type="info"
                  showIcon
                />
              </Col>
            </Row>
          </Card>
          <br />
          <Card title={"Delivery Configuration"}>
            <Row>
              <Col sm={4}>
                <div className="form-lable">Minimum Delivery Time (days)</div>
                <Form.Item
                  name={"delivery_period"}
                  rules={[{ required: true, message: "Enter Delivery Time" }]}
                >
                  <Input size="large" placeholder="2" type="number" />
                </Form.Item>
                <div className="form-lable">Daily Delivery Time</div>
                <hr />
                <Row>
                  <Col sm={6}>
                    <div className="form-lable">From</div>
                    <Form.Item name={"from"} rules={[{ required: true }]}>
                      <TimePicker
                        className="w-100"
                        size="large"
                        format="HH:mm:ss"
                        defaultOpenValue={dayjs("09:08:23", "HH:mm:ss")}
                      />
                    </Form.Item>
                  </Col>
                  <Col sm={6}>
                    <div className="form-lable">To</div>
                    <Form.Item name={"to"} rules={[{ required: true }]}>
                      <TimePicker
                        className="w-100"
                        size="large"
                        defaultOpenValue={dayjs("12:08:23", "HH:mm:ss")}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col sm={4}>
                <div className="form-lable">Working Days</div>
                <hr />
              </Col>
              <Col sm={4}>
                <div className="form-lable">Store Location</div>
                <Form.Item name={"location"}>
                  <Input
                    size="large"
                    placeholder="Store Location"
                    suffix={
                      <IoLocationSharp onClick={() => setOpenModal(true)} />
                    }
                  />
                </Form.Item>
                <Alert
                  message="Informational Notes"
                  description={
                    <>
                      <li>
                        The minimum delivery time is the period before which
                        delivery is expected for an order
                      </li>
                      <li>
                        Daily delivery time from and to indicates the available
                        delivery window.
                      </li>{" "}
                      <br />
                      <li>
                        Store location is crucial for customer visibility.
                        Customers can only see your store if they are within the
                        admin-defined radius of its location.
                      </li>
                    </>
                  }
                  type="info"
                  showIcon
                />
              </Col>
            </Row>
          </Card>
          <br />
          <Card title={"Contact Info"}>
            <Row>
              <Col sm={4}>
                <div className="form-lable">Email Address</div>
                <Form.Item name={"email"} rules={[{ required: true }]}>
                  <Input size="large" placeholder="Store Name" />
                </Form.Item>
                <div className="form-lable">Contact Number</div>
                <Form.Item name={"phone"} rules={[{ required: true }]}>
                  {/* <Input size="large" placeholder="Store Name" /> */}
                  <Input
                    addonBefore={<PrefixSelector />}
                    style={{ width: "100%" }}
                    size="large"
                    placeholder="Enter Phone Number"
                    type="number"
                  />
                </Form.Item>
                <div className="form-lable">Seller Name</div>
                <Form.Item name={"name"} rules={[{ required: true }]}>
                  <Input size="large" placeholder="Store Name" />
                </Form.Item>
                <div className="form-lable">Citizenship Country</div>
                <Form.Item name={"seller_country"}>
                  <Input size="large" placeholder="Store Name" disabled />
                </Form.Item>
              </Col>
              <Col sm={4}>
                <div className="form-lable">ID Proof</div>
                <Form.Item name={"id_type"}>
                  <Input size="large" placeholder="Store Name" disabled />
                </Form.Item>
                <div className="form-lable">Issue Country</div>
                <Form.Item name={"id_issue_country"}>
                  <Input size="large" placeholder="Store Name" disabled />
                </Form.Item>
                <div className="form-lable">Expiry Date</div>
                <Form.Item name={"id_expiry_date"}>
                  <Input size="large" placeholder="Store Name" disabled />
                </Form.Item>
              </Col>
              <Col sm={4}>
                <Alert
                  message="Informational Notes"
                  description={
                    <>
                      <li>
                        Email and Contact number are your contact details of the
                        store. it will not be visible to the users.
                      </li>{" "}
                      <br />
                      <li>
                        And the id proof is the one which you submitted at the
                        time of registration.
                      </li>
                    </>
                  }
                  type="info"
                  showIcon
                />
              </Col>
            </Row>
          </Card>
          <br />
          <Card title={"Business Details"}>
            <Row>
              <Col sm={4}>
                <div className="form-lable">Business Registration Number</div>
                <Form.Item name={"trn_number"}>
                  <Input disabled size="large" placeholder="Store Name" />
                </Form.Item>
              </Col>
              <Col sm={4}>
                <div className="form-lable">Union Membership Number</div>
                <Form.Item name={"trade_lisc_no"}>
                  <Input disabled size="large" placeholder="Store Name" />
                </Form.Item>
              </Col>
              <Col sm={4}>
                <div className="form-lable">UPSC</div>
                <Form.Item name={"upscs"}>
                  <Input disabled size="large" placeholder="Store Name" />
                </Form.Item>
              </Col>
              <Col sm={4}>
                <div className="form-lable">Are you Manufacture</div>
                <Form.Item name={"manufacture"}>
                  <Input disabled size="large" placeholder="Store Name" />
                </Form.Item>
                <Form.Item noStyle shouldUpdate name={"lat"}>
                  {() => (
                    <Form.Item name="virtualField" noStyle>
                      <Input type="hidden" />
                    </Form.Item>
                  )}
                </Form.Item>
                <Form.Item noStyle shouldUpdate name={"long"}>
                  {() => (
                    <Form.Item name="virtualField" noStyle>
                      <Input type="hidden" />
                    </Form.Item>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      )}
      <LocationPicker
        onChange={(lat, long) =>
          form.setFieldsValue({
            lat,
            long,
            location: lat + "," + long,
          })
        }
        open={openModal}
        close={() => setOpenModal(false)}
        title="Select your Store location"
        defaultLocation={{ lat: store?.lat, long: store?.long }}
      />
    </div>
  );
}

export default Page;
