import { Card } from "antd";
import { Descriptions, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { UserOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import {
  fetchUserContactDetails,
  getUserContactName,
  getUserEmail,
  getUserPhone,
} from "@/util/orderDetailsHelpers";

interface UserData {
  id?: string | number;
  name?: string;
  user_name?: string;
  full_name?: string;
  firstName?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

interface AddressData {
  phone_no?: string;
  [key: string]: unknown;
}

interface CustomerData {
  userId?: string | number | null;
  user_id?: string | number | null;
  address?: AddressData;
  is_guest_order?: boolean;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  name?: string;
  [key: string]: unknown;
}

type Props = {
  data: CustomerData;
};

export default function CustomerDetailsCard(props: Props) {
  const userId = props.data?.userId || props.data?.user_id;
  // Only treat as guest if explicitly marked as guest order
  // Don't assume guest just because userId is missing
  const isGuest = props.data?.is_guest_order === true;
  const hasInlineCustomer =
    typeof (props.data as { customer_name?: unknown })?.customer_name ===
      "string" ||
    typeof (props.data as { customer_email?: unknown })?.customer_email ===
      "string" ||
    typeof (props.data as { customer_phone?: unknown })?.customer_phone ===
      "string";

  const { data: customerData, isLoading } = useQuery({
    queryFn: async () => {
      if (!userId) return null;
      const result = await fetchUserContactDetails(userId);
      return result as UserData | null;
    },
    queryKey: ["customer_details", userId],
    enabled: !!userId,
  });

  // Handle guest order display - only if explicitly marked as guest
  if (isGuest) {
    const guestName =
      props.data?.guest_name || props.data?.name || "Guest Customer";
    const guestEmail = props.data?.guest_email || "N/A";
    const guestPhone =
      props.data?.guest_phone || props.data?.address?.phone_no || "N/A";

    return (
      <Card
        title={
          <span>
            <UserOutlined style={{ marginRight: 8 }} />
            Customer Details
            <Tag color="orange" style={{ marginLeft: 8 }}>
              Guest
            </Tag>
          </span>
        }
        className="h-100"
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Customer Name">
            <Tag color="cyan">{guestName}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <span>
              <MailOutlined style={{ marginRight: 8 }} />
              {guestEmail}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Phone Number">
            <span>
              <PhoneOutlined style={{ marginRight: 8 }} />
              {guestPhone}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  }

  // For non-guest orders without userId, show inline customer details if available
  if (!userId) {
    if (hasInlineCustomer) {
      const nameInline =
        (props.data as { customer_name?: string })?.customer_name ||
        (props.data as { name?: string })?.name ||
        "N/A";
      const emailInline =
        (props.data as { customer_email?: string })?.customer_email || "N/A";
      const phoneInline =
        (props.data as { customer_phone?: string })?.customer_phone ||
        (props.data?.address?.phone_no as string | undefined) ||
        "N/A";
      return (
        <Card
          title={
            <span>
              <UserOutlined style={{ marginRight: 8 }} />
              Customer Details
            </span>
          }
          className="h-100"
        >
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Customer Name">
              <Tag color="cyan">{nameInline}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <span>
                <MailOutlined style={{ marginRight: 8 }} />
                {emailInline}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Phone Number">
              <span>
                <PhoneOutlined style={{ marginRight: 8 }} />
                {phoneInline}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      );
    }
    return (
      <Card
        title={
          <span>
            <UserOutlined style={{ marginRight: 8 }} />
            Customer Details
          </span>
        }
        className="h-100"
      >
        <p style={{ color: "#999" }}>No customer information available</p>
      </Card>
    );
  }

  const customerName = getUserContactName(customerData || null);
  const customerEmail = getUserEmail(customerData || null);
  const customerPhone = getUserPhone(customerData || null, props.data?.address);

  return (
    <Card
      title={
        <span>
          <UserOutlined style={{ marginRight: 8 }} />
          Customer Details
        </span>
      }
      loading={isLoading}
      className="h-100"
    >
      {customerData ? (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Customer Name">
            <Tag color="cyan">{customerName}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <span>
              <MailOutlined style={{ marginRight: 8 }} />
              {customerEmail}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Phone Number">
            <span>
              <PhoneOutlined style={{ marginRight: 8 }} />
              {customerPhone}
            </span>
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <p style={{ color: "#999" }}>Unable to load customer details</p>
      )}
    </Card>
  );
}
