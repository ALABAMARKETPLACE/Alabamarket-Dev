import { GET } from "@/util/apicall";
import API from "@/config/API";
import API_ADMIN from "@/config/API_ADMIN";

/**
 * Seller/Store data structure
 */
interface SellerData {
  id?: string | number;
  seller_name?: string;
  business_name?: string;
  store_name?: string;
  user_name?: string;
  phone?: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * User/Customer data structure
 */
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

/**
 * Address data structure
 */
interface AddressData {
  phone_no?: string;
  [key: string]: unknown;
}

/**
 * Fetch seller/store details from storeId
 */
export const fetchSellerDetails = async (storeId: string | number) => {
  try {
    if (!storeId) return null;
    const response = await GET(API_ADMIN.STORE_INFO_ADMIN + storeId);
    return response?.data || null;
  } catch (error) {
    console.error("Error fetching seller details:", error);
    return null;
  }
};

/**
 * Get seller name from store details
 */
export const getSellerName = (sellerData: SellerData | null): string => {
  if (!sellerData) return "Unknown Seller";

  return (
    sellerData.seller_name ||
    sellerData.business_name ||
    sellerData.store_name ||
    sellerData.user_name ||
    "Unknown Seller"
  );
};

/**
 * Get seller phone from store details
 */
export const getSellerPhone = (sellerData: SellerData | null): string => {
  return sellerData?.phone || "N/A";
};

/**
 * Get seller email from store details
 */
export const getSellerEmail = (sellerData: SellerData | null): string => {
  return sellerData?.email || "N/A";
};

/**
 * Fetch user contact details (name, email, phone) from userId
 */
export const fetchUserContactDetails = async (userId: string | number) => {
  try {
    if (!userId) return null;
    const response = await GET(API.USER_DETAILS + userId);
    return response?.data || null;
  } catch (error) {
    console.error("Error fetching user contact details:", error);
    return null;
  }
};

/**
 * Get user contact name from user details
 */
export const getUserContactName = (userData: UserData | null): string => {
  if (!userData) return "Unknown Customer";

  return (
    userData.name ||
    userData.user_name ||
    userData.full_name ||
    userData.firstName ||
    "Unknown Customer"
  );
};

/**
 * Get user email from user details
 */
export const getUserEmail = (userData: UserData | null): string => {
  return userData?.email || "N/A";
};

/**
 * Get user phone from user details or address
 */
export const getUserPhone = (
  userData: UserData | null,
  addressData?: AddressData | null,
): string => {
  return userData?.phone || addressData?.phone_no || "N/A";
};

/**
 * Combined seller and customer details response
 */
interface OrderRelatedDetails {
  seller: {
    data: SellerData | null;
    name: string;
    phone: string;
    email: string;
  };
  customer: {
    data: UserData | null;
    name: string;
    email: string;
    phone: string;
  };
}

/**
 * Combine all order-related details in one call
 */
export const fetchOrderRelatedDetails = async (
  storeId?: string | number,
  userId?: string | number,
): Promise<OrderRelatedDetails> => {
  const [sellerDetails, userDetails] = await Promise.all([
    storeId ? fetchSellerDetails(storeId) : Promise.resolve(null),
    userId ? fetchUserContactDetails(userId) : Promise.resolve(null),
  ]);

  return {
    seller: {
      data: sellerDetails as SellerData | null,
      name: getSellerName(sellerDetails as SellerData | null),
      phone: getSellerPhone(sellerDetails as SellerData | null),
      email: getSellerEmail(sellerDetails as SellerData | null),
    },
    customer: {
      data: userDetails as UserData | null,
      name: getUserContactName(userDetails as UserData | null),
      email: getUserEmail(userDetails as UserData | null),
      phone: getUserPhone(userDetails as UserData | null),
    },
  };
};
