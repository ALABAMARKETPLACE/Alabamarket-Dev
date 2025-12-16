"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, InputNumber, notification, Select, Tabs } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GET, PUT } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";

function EditNewDistanceCharge() {
  const [formCountry] = Form.useForm();
  const [formState] = Form.useForm();
  const [activeTab, setActiveTab] = useState("countries");
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();

  // Fetch existing data
  const {
    data: existingData,
    isLoading: loadingData,
    isError,
    error,
  } = useQuery<any>({
    queryKey: [API_ADMIN.NEW_DISTANCE_CHARGE + params.id],
    queryFn: () => GET(API_ADMIN.NEW_DISTANCE_CHARGE + params.id),
    select: (res) => (res?.status ? res?.data : null),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Fetch countries
  const { data: countries, isLoading: loadingCountries } = useQuery<any>({
    queryKey: [API_ADMIN.COUNTRIES],
    select: (res) => (res?.status ? res?.data : []),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Fetch states
  const { data: states, isLoading: loadingStates } = useQuery<any>({
    queryKey: [API_ADMIN.STATES],
    select: (res) => (res?.status ? res?.data : []),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Set initial values
  useEffect(() => {
    if (existingData) {
      const tab = existingData.country_id ? "countries" : "states";
      setActiveTab(tab);

      if (existingData.country_id) {
        formCountry.setFieldsValue({
          country_id: existingData.country_id,
          min_weight: existingData.min_weight,
          max_weight: existingData.max_weight,
          delivery_charge: existingData.delivery_charge,
        });
      } else {
        formState.setFieldsValue({
          state_id: existingData.state_id,
          min_weight: existingData.min_weight,
          max_weight: existingData.max_weight,
          delivery_charge: existingData.delivery_charge,
        });
      }
    }
  }, [existingData]);

  const mutationUpdate = useMutation({
    mutationFn: (body: object) =>
      PUT(API_ADMIN.NEW_DISTANCE_CHARGE + params.id, body),
    onError: (error) => {
      Notifications["error"]({ message: error.message });
    },
    onSuccess: () => {
      Notifications["success"]({
        message: "Distance Charge Updated Successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["new-distance-charges"] });
      router.push("/auth/settings?tab=6");
    },
  });

  const handleSubmit = (values: any) => {
    const payload: any = {
      min_weight: values.min_weight,
      max_weight: values.max_weight,
      delivery_charge: values.delivery_charge,
    };

    if (activeTab === "countries") {
      payload.country_id = values.country_id;
      payload.state_id = null;
    } else {
      payload.state_id = values.state_id;
      payload.country_id = null;
    }

    mutationUpdate.mutate(payload);
  };

  if (loadingData) return <Loading />;
  if (isError) return <Error description={error?.message} />;

  return (
    <>
      {contextHolder}
      <PageHeader
        title="Edit Distance Charge"
        bredcume="Settings / New Distance Charge / Edit"
      >
        <Button onClick={() => router.push("/auth/settings?tab=6")}>
          Back
        </Button>
      </PageHeader>

      <div style={{ backgroundColor: "white", padding: 24, marginTop: 16 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="By Country" key="countries">
            <Form form={formCountry} layout="vertical" onFinish={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    label="Country"
                    name="country_id"
                    rules={[
                      { required: true, message: "Please select a country" },
                    ]}
                  >
                    <Select
                      placeholder="Select Country"
                      size="large"
                      loading={loadingCountries}
                      showSearch
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
                    />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    label="Min Weight (kg)"
                    name="min_weight"
                    rules={[
                      {
                        required: true,
                        message: "Please enter minimum weight",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="0"
                      size="large"
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    label="Max Weight (kg)"
                    name="max_weight"
                    rules={[
                      {
                        required: true,
                        message: "Please enter maximum weight",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || value > getFieldValue("min_weight")) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            "Max weight must be greater than min weight"
                          );
                        },
                      }),
                    ]}
                  >
                    <InputNumber
                      placeholder="0"
                      size="large"
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    label="Delivery Charge"
                    name="delivery_charge"
                    rules={[
                      {
                        required: true,
                        message: "Please enter delivery charge",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="0.00"
                      size="large"
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                      prefix="$"
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="d-flex gap-2 justify-content-end mt-4">
                <Button onClick={() => router.push("/auth/settings?tab=6")}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={mutationUpdate.isPending}
                >
                  Update
                </Button>
              </div>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="By State" key="states">
            <Form form={formState} layout="vertical" onFinish={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    label="State"
                    name="state_id"
                    rules={[
                      { required: true, message: "Please select a state" },
                    ]}
                  >
                    <Select
                      placeholder="Select State"
                      size="large"
                      loading={loadingStates}
                      showSearch
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
                    />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    label="Min Weight (kg)"
                    name="min_weight"
                    rules={[
                      {
                        required: true,
                        message: "Please enter minimum weight",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="0"
                      size="large"
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    label="Max Weight (kg)"
                    name="max_weight"
                    rules={[
                      {
                        required: true,
                        message: "Please enter maximum weight",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || value > getFieldValue("min_weight")) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            "Max weight must be greater than min weight"
                          );
                        },
                      }),
                    ]}
                  >
                    <InputNumber
                      placeholder="0"
                      size="large"
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    label="Delivery Charge"
                    name="delivery_charge"
                    rules={[
                      {
                        required: true,
                        message: "Please enter delivery charge",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="0.00"
                      size="large"
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                      prefix="$"
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="d-flex gap-2 justify-content-end mt-4">
                <Button onClick={() => router.push("/auth/settings?tab=6")}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={mutationUpdate.isPending}
                >
                  Update
                </Button>
              </div>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </>
  );
}

export default EditNewDistanceCharge;
