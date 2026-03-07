import { Card, Spin, Tag } from "antd";
import { Descriptions } from "antd";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import {
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import StoreInfoCard from "./storeInfoCard";

interface SellerData {
  seller_id?: string | number;
  storeId?: string | number;
  store_name?: string;
  [key: string]: unknown;
}

type Props = {
  data: SellerData;
  /** Card header label — defaults to "Seller Details" */
  label?: string;
};

/**
 * Safely extract the first truthy string value from a record
 * by trying multiple field names in order.
 */
function pick(
  obj: Record<string, unknown> | null | undefined,
  ...keys: string[]
): string | undefined {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

/**
 * Like pick() but also accepts numbers — needed for ID fields
 * which the backend commonly returns as numbers, not strings.
 */
function pickId(
  obj: Record<string, unknown> | null | undefined,
  ...keys: string[]
): string | number | undefined {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if ((typeof v === "string" && v.trim().length > 0) || (typeof v === "number" && v > 0)) {
      return v as string | number;
    }
  }
  return undefined;
}

/** Pull a nested plain-object sub-key, or null */
function sub(
  obj: Record<string, unknown> | null | undefined,
  key: string,
): Record<string, unknown> | null {
  if (!obj) return null;
  const v = obj[key];
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

export default function SellerDetailsCard(props: Props) {
  const cardTitle = props.label ?? "Seller Details";
  const storeId = props.data?.storeId || props.data?.seller_id;
  const inline = props.data as Record<string, unknown>;

  // ── 1. Fetch store registration details (coorporate_store/sellerdetails/:id)
  //    Response shape: { status, data: { name, email, phone, code, business_address, store_name, user_id, … } }
  const { data: storeDetails, isLoading: isStoreLoading } = useQuery({
    queryFn: async () => {
      const res = (await GET(API_ADMIN.STORE_INFO_ADMIN + storeId)) as Record<
        string,
        unknown
      >;
      // Unwrap nested { data: { data: { … } } } or { data: { … } }
      const inner = res?.data as Record<string, unknown> | null | undefined;
      return ((inner?.data as Record<string, unknown>) ?? inner ?? res) as Record<
        string,
        unknown
      >;
    },
    queryKey: ["seller_details", storeId],
    enabled: !!storeId,
  });

  // ── 2. Discover seller user ID from store details.
  //    NOTE: user_id is commonly a number — pickId() handles both string and number.
  const sellerUserId =
    pickId(inline, "seller_user_id", "userId", "user_id", "sellerId") ??
    pickId(storeDetails, "user_id", "userId", "seller_user_id", "sellerId");

  // ── 3. Fetch seller auth profile (auth/sellers/:userId)
  const { data: sellerAuth } = useQuery({
    queryFn: async () => {
      const res = (await GET(
        API_ADMIN.AUTH_SELLER_DETAILS + sellerUserId,
      )) as Record<string, unknown>;
      return ((res?.data as Record<string, unknown>) ?? res) as Record<
        string,
        unknown
      >;
    },
    queryKey: ["seller_auth_details", sellerUserId],
    enabled: !!sellerUserId,
  });

  // ── 4. Fetch general user profile (user/details/:userId)
  const { data: userProfile } = useQuery({
    queryFn: async () => {
      const res = (await GET(
        API_ADMIN.USER_DETAILS + sellerUserId,
      )) as Record<string, unknown>;
      return ((res?.data as Record<string, unknown>) ?? res) as Record<
        string,
        unknown
      >;
    },
    queryKey: ["seller_user_details", sellerUserId],
    enabled: !!sellerUserId,
  });

  // Sub-objects that the backend sometimes nests contact info inside
  const storeUser = sub(storeDetails, "user") ?? sub(storeDetails, "seller") ?? sub(storeDetails, "User");
  const authUser  = sub(sellerAuth, "user") ?? sub(sellerAuth, "User");

  // ── Helper: build a phone string including country code when available
  const buildPhone = (
    src: Record<string, unknown> | null | undefined,
  ): string | undefined => {
    if (!src) return undefined;
    const ph = pick(src, "phone", "phone_no", "phone_number");
    if (!ph) return undefined;
    // If the number already starts with '+', it includes the country code
    if (ph.startsWith("+")) return ph;
    const cc = pick(src, "code", "countrycode", "country_code", "dial_code");
    return cc ? `${cc}${ph}`.replace(/\s+/g, "") : ph;
  };

  // ── Derived display values ──

  const getSellerName = (): string => {
    return (
      pick(storeDetails, "seller_name", "sellerName", "business_name", "businessName", "store_name", "storeName", "user_name", "userName", "name") ||
      pick(storeUser, "name", "seller_name", "user_name") ||
      pick(sellerAuth, "seller_name", "business_name", "store_name", "name") ||
      pick(inline, "store_name", "seller_name") ||
      (storeId ? `Store #${storeId}` : "N/A")
    );
  };

  const getPhoneNumber = (): string => {
    return (
      buildPhone(storeDetails) ||
      buildPhone(storeUser) ||
      buildPhone(sellerAuth) ||
      buildPhone(authUser) ||
      buildPhone(userProfile) ||
      pick(inline, "store_phone", "seller_phone") ||
      "N/A"
    );
  };

  const getEmail = (): string => {
    return (
      pick(storeDetails, "email", "store_email", "storeEmail", "seller_email") ||
      pick(storeUser, "email") ||
      pick(sellerAuth, "email") ||
      pick(authUser, "email") ||
      pick(userProfile, "email") ||
      pick(inline, "store_email", "seller_email") ||
      "N/A"
    );
  };

  const getAddress = (): string => {
    return (
      pick(storeDetails, "business_address", "businessAddress", "address", "store_address", "storeAddress") ||
      pick(storeUser, "address", "business_address") ||
      pick(sellerAuth, "business_address", "address") ||
      pick(authUser, "address", "business_address") ||
      pick(userProfile, "address", "business_address") ||
      pick(inline, "store_address", "seller_address") ||
      "N/A"
    );
  };

  // ── Render ──

  if (!storeId) {
    const hasInline =
      !!inline?.store_name ||
      !!inline?.store_phone ||
      !!inline?.store_address ||
      !!inline?.store_logo ||
      !!inline?.store_email;
    if (hasInline) {
      return (
        <StoreInfoCard
          title={cardTitle}
          store_name={inline.store_name as string | undefined}
          store_email={inline.store_email as string | undefined}
          store_phone={inline.store_phone as string | undefined}
          store_address={inline.store_address as string | undefined}
          store_logo={inline.store_logo as string | undefined}
        />
      );
    }
    return (
      <Card
        title={
          <span>
            <ShopOutlined style={{ marginRight: 8 }} />
            {cardTitle}
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
          {cardTitle}
        </span>
      }
      loading={isStoreLoading}
      className="h-100"
    >
      {storeDetails ? (
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
          <Descriptions.Item label="Email">
            <span>
              <MailOutlined style={{ marginRight: 8 }} />
              {getEmail()}
            </span>
          </Descriptions.Item>
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
