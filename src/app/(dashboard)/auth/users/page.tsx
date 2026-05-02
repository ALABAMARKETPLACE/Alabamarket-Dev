"use client";
import React, { useEffect, useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import { Button, Form, Input, Modal, Select, notification } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { FiUserPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GET, POST } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import DataTable from "./_components/dataTable";
import options from "./_components/options.json";
import Error from "@/app/(dashboard)/_components/error";
import useCreateQueryString from "@/shared/hook/useCreateQueryString";
import debounce from "@/shared/helpers/debounce";

function Page() {
  const [searchParams, setQuery] = useCreateQueryString();
  const page   = Number(searchParams.get("page"))  || 1;
  const take   = Number(searchParams.get("take"))  || 10;
  const name   = searchParams.get("query")  || "";
  const status = searchParams.get("status") || "all";

  const [inviteOpen, setInviteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [form] = Form.useForm();
  const [notifApi, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  const debounceQuery = debounce((val: string) => setQuery({ page: 1, query: val }));

  const { data: users, isLoading, isFetching, refetch, isError, error } = useQuery({
    queryFn: async ({ queryKey }) =>
      await GET(API.APP_USERS, queryKey[1] as Record<string, unknown>),
    queryKey: ["admin_users", { page, name, take, status, order: "DESC" }],
  });

  const inviteMutation = useMutation({
    mutationFn: (values: { email: string; first_name: string; last_name: string }) =>
      POST(API.ADMIN_INVITE, values as unknown as Record<string, unknown>),
    onSuccess: (res: any) => {
      if (res?.status === false) {
        notifApi.error({ message: res?.message || "Invite failed." });
        return;
      }
      notifApi.success({ message: "Invitation sent successfully." });
      form.resetFields();
      setInviteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
    onError: (err: any) => {
      notifApi.error({ message: err?.message || "Failed to send invitation." });
    },
  });

  return (
    <>
      {contextHolder}

      <PageHeader title="Users" bredcume="Dashboard / Users">
        <Input
          allowClear
          suffix={<IoSearchOutline />}
          placeholder="Search name/email/phone"
          onChange={(e) => debounceQuery(e?.target?.value)}
          defaultValue={name}
        />
        <Select
          style={{ width: 150 }}
          defaultValue={status}
          options={options}
          allowClear
          onChange={(v) => setQuery({ status: v, page: 1 })}
        />
        <Button
          type="primary"
          icon={<FiUserPlus />}
          onClick={() => setInviteOpen(true)}
        >
          Invite Admin
        </Button>
        <Button type="primary" ghost onClick={() => refetch()} loading={isFetching && !isLoading}>
          Refresh
        </Button>
      </PageHeader>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error?.message} />
      ) : (
        <DataTable
          data={Array.isArray(users?.data) ? users?.data : []}
          count={users?.meta?.itemCount}
          setPage={(p: number, t: number) => setQuery({ page: p, take: t })}
          pageSize={take}
          page={page}
        />
      )}

      {/* ── Invite Admin Modal ─────────────────────────────────────────── */}
      {mounted && <Modal
        title="Invite New Admin"
        open={inviteOpen}
        onCancel={() => { setInviteOpen(false); form.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 13 }}>
          An invitation email will be sent to the address below. The recipient will
          set their own password when they accept the invite.
        </p>
        <Form form={form} layout="vertical" onFinish={(v) => inviteMutation.mutate(v)}>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="new-admin@example.com" size="large" />
          </Form.Item>
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: "First name is required" }]}
          >
            <Input placeholder="First name" size="large" />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: "Last name is required" }]}
          >
            <Input placeholder="Last name" size="large" />
          </Form.Item>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button onClick={() => { setInviteOpen(false); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={inviteMutation.isPending}>
              Send Invitation
            </Button>
          </div>
        </Form>
      </Modal>}
    </>
  );
}

export default Page;
