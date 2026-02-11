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
  userId?: string | number;
  user_id?: string | number;
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
  const isGuest = props.data?.is_guest_order || !userId;

  const { data: customerData, isLoading } = useQuery({
    queryFn: async () => {
      if (!userId) return null;
      const result = await fetchUserContactDetails(userId);
      return result as UserData | null;
    },
    queryKey: ["customer_details", userId],
    enabled: !!userId && !isGuest,
  });

  // Handle guest order display
  if (isGuest) {
    const guestName = props.data?.guest_name || props.data?.name || "Guest Customer";
    const guestEmail = props.data?.guest_email || "N/A";
    const guestPhone = props.data?.guest_phone || props.data?.address?.phone_no || "N/A";

    return (
      <Card
        title={
          <span>
            <UserOutlined style={{ marginRight: 8 }} />
            Customer Details
            <Tag color="orange" style={{ marginLeft: 8 }}>Guest</Tag>
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

  if (!userId) {
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
