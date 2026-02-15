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

// Helper to get fallback value from props.data
function getInlineFallback(props: Props, key: string): string | undefined {
  return (props?.data as Record<string, unknown>)?.[key] as string | undefined;
}

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
      const res = (await GET(API_ADMIN.STORE_INFO_ADMIN + storeId)) as Record<
        string,
        unknown
      >;
      // Handle both nested { data: ... } and flat response structures
      if (res?.data) {
        return res as unknown as SellerDetailsResponse;
      }
      return { data: res } as unknown as SellerDetailsResponse;
    },
    queryKey: ["seller_details", storeId],
    enabled: !!storeId,
  });

  // Try to discover seller's userId to fetch phone/email from user profile
  const sellerUserId =
    (props.data as Record<string, unknown>)?.["seller_user_id"] ||
    (props.data as Record<string, unknown>)?.["sellerId"] ||
    (sellerData?.data as Record<string, unknown> | undefined)?.["user_id"] ||
    (sellerData?.data as Record<string, unknown> | undefined)?.["userId"] ||
    (sellerData?.data as Record<string, unknown> | undefined)?.[
      "seller_user_id"
    ] ||
    null;

  const { data: sellerUserRaw } = useQuery({
    queryFn: async () => {
      if (!sellerUserId) return null;
      const res = (await GET(API_ADMIN.USER_DETAILS + sellerUserId)) as Record<
        string,
        unknown
      >;
      return (res as { data?: Record<string, unknown> })?.data || res || null;
    },
    queryKey: ["seller_user_details", sellerUserId],
    enabled: !!sellerUserId,
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
    const user = sellerUserRaw as Record<string, unknown> | null;
    const cc =
      (user?.["countrycode"] as string | undefined) ||
      (user?.["country_code"] as string | undefined);
    const ph =
      (user?.["phone"] as string | undefined) ||
      (user?.["phone_no"] as string | undefined);
    if (ph && cc) return `${cc}${ph}`.replace(/\s+/g, "");
    if (ph) return ph;
    const phone = sellerData?.data?.phone;
    if (phone) return phone;
    // Fallback to inline order data
    return (
      getInlineFallback(props, "store_phone") ||
      getInlineFallback(props, "seller_phone") ||
      "N/A"
    );
  };

  const getEmail = () => {
    const user = sellerUserRaw as Record<string, unknown> | null;
    const email =
      (user?.["email"] as string | undefined) ||
      (sellerData?.data?.email as string | undefined);
    if (email) return email;
    // Fallback to inline order data
    return (
      getInlineFallback(props, "store_email") ||
      getInlineFallback(props, "seller_email") ||
      "N/A"
    );
  };

  const getAddress = () => {
    const seller = sellerData?.data as Record<string, unknown> | undefined;
    const address =
      (seller?.["business_address"] as string | undefined) ||
      (seller?.["address"] as string | undefined) ||
      (sellerUserRaw as Record<string, unknown> | null)?.["address"];
    if (address) return address;
    // Fallback to inline order data
    return (
      getInlineFallback(props, "store_address") ||
      getInlineFallback(props, "seller_address") ||
      "N/A"
    );
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
            {typeof getSellerName() === "string" ? (
              <Tag color="blue">{getSellerName()}</Tag>
            ) : (
              <Tag color="blue">Unknown Seller</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Phone Number">
            <span>
              <PhoneOutlined style={{ marginRight: 8 }} />
              {getPhoneNumber()}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Email">{getEmail()}</Descriptions.Item>
          <Descriptions.Item label="Address">
            <span>
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              {getAddress()}
            </span>
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Spin />
      )}
    </Card>
  );
}
