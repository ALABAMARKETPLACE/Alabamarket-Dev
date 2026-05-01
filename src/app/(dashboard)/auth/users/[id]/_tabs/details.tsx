import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  notification,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { GET, PATCH, POST } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import { useParams } from "next/navigation";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import moment from "moment";
import { FiArrowDown, FiArrowUp, FiShield } from "react-icons/fi";
import dayjs from "dayjs";
import CountryData from "@/shared/helpers/countryCode.json";

const { Text } = Typography;

const flagEmoji = (isoCode: string) =>
  isoCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");

const COUNTRY_OPTIONS = [...CountryData]
  .sort((a, b) => {
    if (a.code === "NG") return -1;
    if (b.code === "NG") return 1;
    return a.name.localeCompare(b.name);
  })
  .map((c) => ({ value: c.name, label: c.name }));

const DIAL_CODE_OPTIONS = [...CountryData]
  .sort((a, b) => {
    if (a.code === "NG") return -1;
    if (b.code === "NG") return 1;
    return a.name.localeCompare(b.name);
  })
  .map((c) => ({
    value: c.dial_code,
    label: `${flagEmoji(c.code)} ${c.dial_code}  ${c.name}`,
    dialCode: c.dial_code,
  }));

const ID_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID" },
  { value: "driver_license", label: "Driver's License" },
  { value: "voters_card", label: "Voter's Card" },
  { value: "nin", label: "NIN Slip" },
];

function SectionHead({ title }: { title: string }) {
  return (
    <Divider orientation="left" style={{ marginTop: 8, marginBottom: 16 }}>
      <Text strong style={{ fontSize: 13, color: "#374151" }}>
        {title}
      </Text>
    </Divider>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
      {children}
    </div>
  );
}

function UserDetails() {
  const params = useParams();
  const userId = params?.id as string;
  const queryClient = useQueryClient();
  const [notifApi, contextHolder] = notification.useNotification();

  const [assignOpen, setAssignOpen]       = useState(false);
  const [makeActiveRole, setMakeActiveRole] = useState(true);
  const [upgradeOpen, setUpgradeOpen]     = useState(false);
  const [downgradeOpen, setDowngradeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [upgradeForm] = Form.useForm();

  const { data: user, isLoading, isError, error } = useQuery({
    queryFn: ({ signal }) => GET(API.USER_DETAILS + userId, {}, signal),
    queryKey: ["admin_user_details", userId],
    select: (data: any) => (data?.status ? data?.data : {}),
  });

  useEffect(() => {
    if (upgradeOpen && user) {
      const nameParts = (user?.name ?? "").split(" ");
      upgradeForm.setFieldsValue({
        first_name: nameParts[0] ?? "",
        last_name:  nameParts.slice(1).join(" ") ?? "",
        email:      user?.email ?? "",
        phone:      user?.phone ?? "",
      });
    }
  }, [upgradeOpen, user, upgradeForm]);

  // ── Assign Admin ──────────────────────────────────────────────
  const assignMutation = useMutation({
    mutationFn: () =>
      PATCH(`${API.ASSIGN_ADMIN}${userId}/assign-admin`, {
        make_active_role: makeActiveRole,
      } as unknown as Record<string, unknown>),
    onSuccess: (res: any) => {
      if (res?.status === false) {
        notifApi.error({ message: res?.message || "Failed to assign admin role." });
        return;
      }
      notifApi.success({ message: "Admin role assigned successfully." });
      setAssignOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin_user_details", userId] });
    },
    onError: (err: any) => {
      notifApi.error({ message: err?.message || "Failed to assign admin role." });
    },
  });

  // ── Upgrade to Seller ─────────────────────────────────────────
  const upgradeMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      POST(`users/${userId}/upgrade-to-seller`, values),
    onSuccess: (res: any) => {
      if (res?.status === false) {
        notifApi.error({ message: res?.message || "Failed to upgrade user." });
        return;
      }
      notifApi.success({ message: "User upgraded to seller successfully." });
      setUpgradeOpen(false);
      upgradeForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["admin_user_details", userId] });
    },
    onError: (err: any) => {
      notifApi.error({ message: err?.message || "Failed to upgrade user to seller." });
    },
  });

  const handleUpgradeSubmit = (values: any) => {
    const payload: Record<string, unknown> = { ...values };
    if (values.dob) payload.dob = dayjs(values.dob).toISOString();
    if (values.id_expiry_date) payload.id_expiry_date = dayjs(values.id_expiry_date).toISOString();
    upgradeMutation.mutate(payload);
  };

  // ── Downgrade to Buyer ────────────────────────────────────────
  const downgradeMutation = useMutation({
    mutationFn: () =>
      POST(API.DOWNGRADE_TO_BUYER, { user_id: userId } as unknown as Record<string, unknown>),
    onSuccess: (res: any) => {
      if (res?.status === false) {
        notifApi.error({ message: res?.message || "Failed to downgrade user." });
        return;
      }
      notifApi.success({ message: "User downgraded to buyer." });
      setDowngradeOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin_user_details", userId] });
    },
    onError: (err: any) => {
      notifApi.error({ message: err?.message || "Failed to downgrade user." });
    },
  });

  // ── Descriptions data ─────────────────────────────────────────
  const userdata = useMemo<any[]>(() => {
    if (typeof user !== "object" || !user) return [];
    const array = Object.keys(user)
      .filter((key) => ["name", "email", "role", "phone", "username"].includes(key))
      .map((item, index) => ({ key: index, label: item, children: user[item] }));
    return [
      {
        key: "image",
        label: "Profile Image",
        children: <Avatar size={64} src={user?.image} />,
      },
      ...array,
      {
        key: "status",
        label: "Status",
        children: user?.status ? "Active" : "Inactive",
      },
      {
        key: "joined",
        label: "Joined On",
        children: moment(user?.createdAt).format("MM/DD/YYYY"),
      },
      {
        key: "mail_verify",
        label: "Mail Verify",
        children: user?.mail_verify
          ? <span className="text-success">Verified</span>
          : <span className="text-danger">Not Verified</span>,
      },
      {
        key: "phone_verify",
        label: "Phone Verify",
        children: user?.phone_verify
          ? <span className="text-success">Verified</span>
          : <span className="text-danger">Not Verified</span>,
      },
    ];
  }, [user]);

  return (
    <>
      {contextHolder}
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={(error as Error).message} />
      ) : (
        <>
          <Card>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Button
                icon={<FiShield style={{ marginRight: 4 }} />}
                onClick={() => setAssignOpen(true)}
                size="small"
                style={{ background: "#ede9fe", borderColor: "#c4b5fd", color: "#6d28d9" }}
              >
                Assign Admin
              </Button>
              <Button
                icon={<FiArrowUp style={{ marginRight: 4 }} />}
                onClick={() => setUpgradeOpen(true)}
                size="small"
                style={{ background: "#e0f2fe", borderColor: "#7dd3fc", color: "#0369a1" }}
              >
                Upgrade to Seller
              </Button>
              <Button
                icon={<FiArrowDown style={{ marginRight: 4 }} />}
                onClick={() => setDowngradeOpen(true)}
                size="small"
                style={{ background: "#fef3c7", borderColor: "#fcd34d", color: "#92400e" }}
              >
                Downgrade to Buyer
              </Button>
            </div>
            {mounted && (
              <Descriptions
                layout="vertical"
                size="middle"
                column={{ xs: 1, sm: 2, md: 3 }}
                items={userdata}
                labelStyle={{ color: "#6b7280", textTransform: "capitalize", fontWeight: 600, fontSize: 12 }}
                contentStyle={{ fontWeight: 500, paddingBottom: 12 }}
              />
            )}
          </Card>

          {mounted && <>
          {/* ── Assign Admin Modal ──────────────────────────────────── */}
          <Modal
            title="Assign Admin Role"
            open={assignOpen}
            onCancel={() => setAssignOpen(false)}
            footer={null}
            destroyOnClose
          >
            <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
              This will grant <strong>{user?.name || "this user"}</strong> admin
              privileges. Use <em>Make Active Role</em> to immediately switch their
              active role to admin.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                background: "#f9fafb",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                marginBottom: 24,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                  Make Active Role
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                  Immediately set admin as the user&apos;s current active role
                </div>
              </div>
              <Switch
                checked={makeActiveRole}
                onChange={setMakeActiveRole}
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                loading={assignMutation.isPending}
                onClick={() => assignMutation.mutate()}
              >
                Confirm &amp; Assign
              </Button>
            </div>
          </Modal>

          {/* ── Downgrade to Buyer Modal ────────────────────────────── */}
          <Modal
            title="Downgrade to Buyer"
            open={downgradeOpen}
            onCancel={() => setDowngradeOpen(false)}
            footer={null}
            destroyOnClose
          >
            <div
              style={{
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 24,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, color: "#92400e", marginBottom: 4 }}>
                This action will remove seller privileges
              </div>
              <div style={{ fontSize: 13, color: "#78350f" }}>
                <strong>{user?.name || "This user"}</strong> will lose access to seller
                features including store management, product listings, and order
                fulfillment. Their active role will be switched to{" "}
                <Tag color="blue">buyer</Tag>.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button onClick={() => setDowngradeOpen(false)}>Cancel</Button>
              <Button
                danger
                type="primary"
                loading={downgradeMutation.isPending}
                onClick={() => downgradeMutation.mutate()}
              >
                Confirm Downgrade
              </Button>
            </div>
          </Modal>

          {/* ── Upgrade to Seller Drawer ────────────────────────────── */}
          <Drawer
            title={
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Upgrade to Seller</div>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 400 }}>
                  Fill in seller profile details for{" "}
                  <strong>{user?.name || "this user"}</strong>
                </div>
              </div>
            }
            open={upgradeOpen}
            onClose={() => { setUpgradeOpen(false); upgradeForm.resetFields(); }}
            width={740}
            styles={{
              body: { overflowY: "auto", flex: 1, minHeight: 0, paddingBottom: 24 },
              content: { display: "flex", flexDirection: "column", height: "100vh" },
            }}
            footer={
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Button onClick={() => { setUpgradeOpen(false); upgradeForm.resetFields(); }}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  loading={upgradeMutation.isPending}
                  onClick={() => upgradeForm.submit()}
                  style={{ background: "#059669", borderColor: "#059669" }}
                >
                  Upgrade to Seller
                </Button>
              </div>
            }
            destroyOnClose
          >
            <Form
              form={upgradeForm}
              layout="vertical"
              onFinish={handleUpgradeSubmit}
              requiredMark={false}
              size="middle"
            >
              {/* ── Personal Information ── */}
              <SectionHead title="Personal Information" />
              <TwoCol>
                <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Required" }]}>
                  <Input placeholder="First name" />
                </Form.Item>
                <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Required" }]}>
                  <Input placeholder="Last name" />
                </Form.Item>
              </TwoCol>
              <TwoCol>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Valid email required" }]}>
                  <Input placeholder="email@example.com" />
                </Form.Item>
                <Form.Item label="Phone Number">
                  <Space.Compact style={{ width: "100%" }}>
                    <Form.Item name="code" noStyle initialValue="+234">
                      <Select
                        showSearch
                        optionFilterProp="label"
                        options={DIAL_CODE_OPTIONS}
                        popupMatchSelectWidth={false}
                        listHeight={260}
                        style={{ width: 120 }}
                        labelRender={({ label }) => {
                          const str = String(label ?? "");
                          return <span>{str.split("  ")[0]}</span>;
                        }}
                      />
                    </Form.Item>
                    <Form.Item name="phone" noStyle>
                      <Input placeholder="8012345678" style={{ flex: 1 }} />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
              </TwoCol>
              <TwoCol>
                <Form.Item name="dob" label="Date of Birth">
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item name="birth_country" label="Birth Country">
                  <Select
                    showSearch
                    placeholder="Select country"
                    optionFilterProp="label"
                    options={COUNTRY_OPTIONS}
                    listHeight={260}
                  />
                </Form.Item>
              </TwoCol>
              <TwoCol>
                <Form.Item name="password" label="New Password (optional)">
                  <Input.Password placeholder="Leave blank to keep current" />
                </Form.Item>
              </TwoCol>

              {/* ── Store & Business ── */}
              <SectionHead title="Store & Business" />
              <TwoCol>
                <Form.Item name="store_name" label="Store Name" rules={[{ required: true, message: "Required" }]}>
                  <Input placeholder="My Store" />
                </Form.Item>
                <Form.Item name="seller_name" label="Seller / Display Name">
                  <Input placeholder="Seller name" />
                </Form.Item>
              </TwoCol>
              <TwoCol>
                <Form.Item name="business_name" label="Business Name">
                  <Input placeholder="Business legal name" />
                </Form.Item>
                <Form.Item name="seller_country" label="Seller Country">
                  <Select
                    showSearch
                    placeholder="Select country"
                    optionFilterProp="label"
                    options={COUNTRY_OPTIONS}
                    listHeight={260}
                  />
                </Form.Item>
              </TwoCol>
              <Form.Item name="business_address" label="Business Address">
                <Input placeholder="Full business address" />
              </Form.Item>
              <Form.Item name="business_location" label="Business Location (Google Place)">
                <Input placeholder="Location string or place ID" />
              </Form.Item>
              <TwoCol>
                <Form.Item name="lat" label="Latitude">
                  <InputNumber style={{ width: "100%" }} placeholder="6.5244" />
                </Form.Item>
                <Form.Item name="long" label="Longitude">
                  <InputNumber style={{ width: "100%" }} placeholder="3.3792" />
                </Form.Item>
              </TwoCol>
              <TwoCol>
                <Form.Item name="manufacture" label="Manufactures / Produces">
                  <Input placeholder="What does this seller manufacture?" />
                </Form.Item>
                <Form.Item name="upscs" label="UPCs / SKUs">
                  <Input placeholder="Product codes" />
                </Form.Item>
              </TwoCol>
              <TwoCol>
                <Form.Item name="is_print_available" label="Print Services Available" valuePropName="checked">
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
                <Form.Item name="agreement" label="Agreement Reference">
                  <Input placeholder="Agreement code or URL" />
                </Form.Item>
              </TwoCol>

              {/* ── ID Verification ── */}
              <SectionHead title="ID Verification" />
              <TwoCol>
                <Form.Item name="id_type" label="ID Type">
                  <Select options={ID_TYPES} placeholder="Select ID type" allowClear />
                </Form.Item>
                <Form.Item name="id_issue_country" label="ID Issue Country">
                  <Input placeholder="Nigeria" />
                </Form.Item>
              </TwoCol>
              <TwoCol>
                <Form.Item name="id_proof" label="ID Document URL">
                  <Input placeholder="https://..." />
                </Form.Item>
                <Form.Item name="id_expiry_date" label="ID Expiry Date">
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
              </TwoCol>
              <TwoCol>
                <Form.Item name="trn_number" label="TRN Number">
                  <Input placeholder="Tax registration number" />
                </Form.Item>
                <Form.Item name="trade_lisc_no" label="Trade Licence No.">
                  <Input placeholder="Trade licence number" />
                </Form.Item>
              </TwoCol>
              <TwoCol>
                <Form.Item name="trn_upload" label="TRN Document URL">
                  <Input placeholder="https://..." />
                </Form.Item>
                <Form.Item name="idToken" label="ID Token">
                  <Input placeholder="Firebase / OAuth token" />
                </Form.Item>
              </TwoCol>

              {/* ── Settlement ── */}
              <SectionHead title="Settlement / Payout" />
              <TwoCol>
                <Form.Item name="settlement_bank" label="Settlement Bank">
                  <Input placeholder="Bank name" />
                </Form.Item>
                <Form.Item name="settlement_account_number" label="Settlement Account No.">
                  <Input placeholder="10-digit account number" />
                </Form.Item>
              </TwoCol>
              <TwoCol>
                <Form.Item name="settlement_account_name" label="Settlement Account Name">
                  <Input placeholder="Account holder name" />
                </Form.Item>
                <Form.Item name="account_number" label="Account Number (alt)">
                  <Input placeholder="Alternative account number" />
                </Form.Item>
              </TwoCol>
              <Form.Item name="account_name_or_code" label="Account Name / Code (alt)">
                <Input placeholder="Account name or code" />
              </Form.Item>

              {/* ── Subscription ── */}
              <SectionHead title="Subscription Plan" />
              <TwoCol>
                <Form.Item name="subscription_plan_id" label="Plan ID">
                  <InputNumber style={{ width: "100%" }} placeholder="1" min={0} />
                </Form.Item>
                <Form.Item name="subscription_plan" label="Plan Code">
                  <Input placeholder="Plan identifier" />
                </Form.Item>
              </TwoCol>
              <TwoCol>
                <Form.Item name="subscription_plan_name" label="Plan Name">
                  <Input placeholder="e.g. Gold Plan" />
                </Form.Item>
                <Form.Item name="subscription_price" label="Plan Price (₦)">
                  <InputNumber style={{ width: "100%" }} placeholder="0" min={0} />
                </Form.Item>
              </TwoCol>
              <Form.Item name="subscription_boosts" label="Included Boosts">
                <InputNumber style={{ width: "100%" }} placeholder="0" min={0} />
              </Form.Item>

              {/* ── Primary Contact ── */}
              <SectionHead title="Primary Contact" />
              <TwoCol>
                <Form.Item name="primary_contact_name" label="Contact Name">
                  <Input placeholder="Primary contact full name" />
                </Form.Item>
                <Form.Item name="primary_contact_phone" label="Contact Phone">
                  <Input placeholder="+2348000000000" />
                </Form.Item>
              </TwoCol>
            </Form>
          </Drawer>
          </>}
        </>
      )}
    </>
  );
}

export default UserDetails;
