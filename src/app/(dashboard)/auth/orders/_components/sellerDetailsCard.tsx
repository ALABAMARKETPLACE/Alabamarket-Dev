import { Card, Spin, Tag } from "antd";
import { Descriptions } from "antd";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import {
  ShopOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import StoreInfoCard from "./storeInfoCard";

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
    name?: string;
    phone?: string;
    email?: string;
    user_name?: string;
    address?: string;
    business_address?: string;
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
      const res = (await GET(
        API_ADMIN.AUTH_SELLER_DETAILS + storeId,
      )) as Record<string, unknown>;
      // Handle both nested { data: ... } and flat response structures
      if (res?.data) {
        return res as unknown as SellerDetailsResponse;
      }
      return { data: res } as unknown as SellerDetailsResponse;
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
    // Fallback for flat structure if properties are directly on data but named differently
    if (seller.name) return seller.name;

    return "Unknown Seller";
  };

  const getPhoneNumber = () => {
    const phone = sellerData?.data?.phone;
    return phone || "N/A";
  };

  const getAddress = () => {
    const seller = sellerData?.data;
    return seller?.business_address || seller?.address || "N/A";
  };

  if (!storeId) {
    const hasInline =
      !!props?.data?.store_name ||
      !!props?.data?.store_phone ||
      !!props?.data?.store_address ||
      !!props?.data?.store_logo ||
      !!props?.data?.store_email;
    if (hasInline) {
      return (
        <StoreInfoCard
          store_name={(props?.data as { store_name?: string })?.store_name}
          store_email={(props?.data as { store_email?: string })?.store_email}
          store_phone={(props?.data as { store_phone?: string })?.store_phone}
          store_address={
            (props?.data as { store_address?: string })?.store_address
          }
          store_logo={(props?.data as { store_logo?: string })?.store_logo}
        />
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
          <Descriptions.Item label="Address">
            <span>
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              {getAddress()}
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
