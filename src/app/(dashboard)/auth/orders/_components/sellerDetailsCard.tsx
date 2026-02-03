import { Card, Spin, Tag } from "antd";
import { Descriptions } from "antd";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import { ShopOutlined, PhoneOutlined } from "@ant-design/icons";

interface SellerData {
  seller_id?: string | number;
  storeId?: string | number;
  store_name?: string;
  [key: string]: unknown;
}

interface SellerDetailsResponse {
  data: {
    id?: string | number;
    seller_name?: string;
    business_name?: string;
    store_name?: string;
    phone?: string;
    email?: string;
    user_name?: string;
    [key: string]: unknown;
  };
}

type Props = {
  data: SellerData;
};

export default function SellerDetailsCard(props: Props) {
  const storeId = props.data?.storeId || props.data?.seller_id;

  const { data: sellerData, isLoading } = useQuery({
    queryFn: async () => {
      const res = await GET(API_ADMIN.STORE_INFO_ADMIN + storeId);
      return res as SellerDetailsResponse;
    },
    queryKey: ["seller_details", storeId],
    enabled: !!storeId,
  });

  const getSellerName = () => {
    const seller = sellerData?.data;
    if (!seller) return "Loading...";

    if (seller.seller_name) return seller.seller_name;
    if (seller.business_name) return seller.business_name;
    if (seller.store_name) return seller.store_name;
    if (seller.user_name) return seller.user_name;

    return "Unknown Seller";
  };

  const getPhoneNumber = () => {
    const phone = sellerData?.data?.phone;
    return phone || "N/A";
  };

  if (!storeId) {
    return (
      <Card
        title={
          <span>
            <ShopOutlined style={{ marginRight: 8 }} />
            Seller Details
          </span>
        }
        className="h-100"
      >
        <p style={{ color: "#999" }}>No seller information available</p>
      </Card>
    );
  }

  return (
    <Card
      title={
        <span>
          <ShopOutlined style={{ marginRight: 8 }} />
          Seller Details
        </span>
      }
      loading={isLoading}
      className="h-100"
    >
      {sellerData?.data ? (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Store/Seller Name">
            <Tag color="blue">{getSellerName()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Phone Number">
            <span>
              <PhoneOutlined style={{ marginRight: 8 }} />
              {getPhoneNumber()}
            </span>
          </Descriptions.Item>
          {sellerData?.data?.email && (
            <Descriptions.Item label="Email">
              {sellerData.data.email}
            </Descriptions.Item>
          )}
        </Descriptions>
      ) : (
        <Spin />
      )}
    </Card>
  );
}
