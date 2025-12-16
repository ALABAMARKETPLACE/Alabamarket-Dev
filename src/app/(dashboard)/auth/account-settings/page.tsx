"use client";

import React, { useEffect, useMemo } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Tabs,
  Typography,
  message,
} from "antd";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { GET, PUT } from "@/util/apicall";
import API from "@/config/API";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const tabKey = "account-details";

function AccountSettingsPage() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const {
    data: accountResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["seller-account-details"],
    queryFn: () => GET(API.CORPORATE_STORE_ACCOUNT_DETAILS),
    staleTime: 5 * 60 * 1000,
    select: (data: any) => data?.data ?? null,
  });

  useEffect(() => {
    if (accountResponse) {
      form.setFieldsValue({
        account_name_or_code: accountResponse?.account_name_or_code ?? "",
        account_number: accountResponse?.account_number ?? "",
      });
    }
  }, [accountResponse, form]);

  const { mutateAsync: updateAccount, isPending: isUpdating } = useMutation({
    mutationFn: (payload: {
      account_name_or_code: string;
      account_number: string;
    }) => PUT(API.CORPORATE_STORE_ACCOUNT_DETAILS, payload),
    onSuccess: () => {
      message.success("Account details updated");
      queryClient.invalidateQueries({
        queryKey: ["seller-account-details"],
      });
    },
    onError: (err: any) => {
      message.error(err?.message ?? "Unable to update account details");
    },
  });

  const hasCompleteDetails = useMemo(() => {
    if (!accountResponse) return false;
    return Boolean(
      accountResponse?.account_name_or_code && accountResponse?.account_number
    );
  }, [accountResponse]);

  const alertConfig = useMemo(() => {
    if (isError) {
      return {
        type: "error" as const,
        message: "Unable to load account details",
        description:
          (error as any)?.message ??
          "Please refresh the page or try again in a moment.",
      };
    }
    if (!hasCompleteDetails) {
      return {
        type: "warning" as const,
        message: "No payout account on file",
        description:
          "Add your account name and number so we can process settlements without delay.",
      };
    }
    return {
      type: "success" as const,
      message: "Account details are up to date",
      description: `We will credit settlements to ${accountResponse?.account_name_or_code}.`,
    };
  }, [hasCompleteDetails, accountResponse, isError, error]);

  const handleSubmit = async (values: {
    account_name_or_code: string;
    account_number: string;
  }) => {
    await updateAccount(values);
  };

  return (
    <div>
      <PageHeader title="Settings" bredcume="Dashboard / Settings / Account" />
      <Card loading={isLoading}>
        <Tabs defaultActiveKey={tabKey}>
          <Tabs.TabPane
            tab={
              <span>{accountResponse?.store_name ?? "Account Details"}</span>
            }
            key={tabKey}
          >
            <div className="d-flex flex-column gap-3">
              <Alert
                showIcon
                type={alertConfig.type}
                message={alertConfig.message}
                description={alertConfig.description}
              />

              <Descriptions size="small" layout="vertical" bordered column={2}>
                <Descriptions.Item label="Store">
                  {accountResponse?.store_name ?? "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Account Status">
                  {hasCompleteDetails ? "Active" : "Pending setup"}
                </Descriptions.Item>
                <Descriptions.Item label="Account Name / Code">
                  {accountResponse?.account_name_or_code ?? "Not provided"}
                </Descriptions.Item>
                <Descriptions.Item label="Account Number">
                  {accountResponse?.account_number ?? "Not provided"}
                </Descriptions.Item>
              </Descriptions>

              <Card title="Update payout account" size="small" bordered={false}>
                <Typography.Paragraph type="secondary">
                  Use the fields below to keep your payout information current.
                  These details must match your bank or settlement account.
                </Typography.Paragraph>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  requiredMark={false}
                >
                  <Form.Item
                    label="Account Name / Code"
                    name="account_name_or_code"
                    rules={[
                      {
                        required: true,
                        message: "Account name or code is required",
                      },
                      {
                        max: 120,
                        message: "Account name or code is too long",
                      },
                    ]}
                  >
                    <Input placeholder="e.g. John Doe / Seller-ACC-42" />
                  </Form.Item>

                  <Form.Item
                    label="Account Number"
                    name="account_number"
                    rules={[
                      {
                        required: true,
                        message: "Account number is required",
                      },
                      {
                        max: 50,
                        message: "Account number is too long",
                      },
                    ]}
                  >
                    <Input placeholder="e.g. 1234567890" />
                  </Form.Item>

                  <Button type="primary" htmlType="submit" loading={isUpdating}>
                    Save account details
                  </Button>
                </Form>
              </Card>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

export default AccountSettingsPage;
