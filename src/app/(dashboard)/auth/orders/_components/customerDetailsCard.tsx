import { Card } from "antd";
import { Descriptions, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { UserOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { fetchUserContactDetails, getUserContactName, getUserEmail, getUserPhone } from "@/util/orderDetailsHelpers";

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
  [key: string]: unknown;
}

type Props = {
  data: CustomerData;
};

export default function CustomerDetailsCard(props: Props) {
  const userId = props.data?.userId || props.data?.user_id;

  const { data: customerData, isLoading } = useQuery({
    queryFn: async () => {
      if (!userId) return null;
      const result = await fetchUserContactDetails(userId);
      return result as UserData | null;
    },
    queryKey: ["customer_details", userId],
    enabled: !!userId,
  });

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
