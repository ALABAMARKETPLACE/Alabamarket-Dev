# Order Details Fetching - Seller & Customer Information

## Overview
This solution provides utilities and components to fetch and display seller details and customer contact information on the order details page.

## Files Created

### 1. **Order Details Helper Utilities** 
📄 `/src/util/orderDetailsHelpers.ts`

Contains the following functions:

#### Seller Details Functions
- **`fetchSellerDetails(storeId)`** - Fetches seller/store information from backend
- **`getSellerName(sellerData)`** - Extracts seller name from seller data object
- **`getSellerPhone(sellerData)`** - Extracts seller phone number
- **`getSellerEmail(sellerData)`** - Extracts seller email

#### Customer Details Functions
- **`fetchUserContactDetails(userId)`** - Fetches customer/user information from backend
- **`getUserContactName(userData)`** - Extracts customer name from user data
- **`getUserEmail(userData)`** - Extracts customer email
- **`getUserPhone(userData, addressData)`** - Extracts customer phone with fallback to address phone

#### Combined Function
- **`fetchOrderRelatedDetails(storeId, userId)`** - Fetches both seller and customer details in parallel and returns formatted data

### 2. **Customer Details Card Component**
📄 `/src/app/(dashboard)/auth/orders/_components/customerDetailsCard.tsx`

A React component that displays customer contact information in a card layout:
- Shows customer name, email, and phone number
- Displays loading state while fetching data
- Handles missing data gracefully with fallback messages
- Uses Ant Design components for consistent styling

### 3. **Updated Order Details Page**
📄 `/src/app/(dashboard)/auth/orders/[orderId]/page.tsx`

- Added import for `CustomerDetailsCard` component
- Integrated `CustomerDetailsCard` into the order details layout alongside `SellerDetailsCard`
- Displays in the right sidebar below seller details

## Usage Example

### Direct Usage in Components
```tsx
import { fetchOrderRelatedDetails } from '@/util/orderDetailsHelpers';

// Fetch both seller and customer details
const details = await fetchOrderRelatedDetails(storeId, userId);

console.log(details.seller.name);     // "Tease"
console.log(details.seller.phone);    // "1234567890"
console.log(details.customer.name);   // "John Doe"
console.log(details.customer.email);  // "john@example.com"
```

### In React Components (with useQuery)
```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchUserContactDetails } from '@/util/orderDetailsHelpers';

const { data: customerData } = useQuery({
  queryFn: async () => await fetchUserContactDetails(userId),
  queryKey: ["customer_details", userId],
  enabled: !!userId,
});
```

### Using the Card Component
```tsx
import CustomerDetailsCard from '@/app/(dashboard)/auth/orders/_components/customerDetailsCard';

<CustomerDetailsCard data={order?.data} />
```

## Data Flow

### From Order Response
```json
{
  "id": "373",
  "userId": "2963",
  "store_name": "Tease",
  "storeId": (retrieved from context),
  "address": {
    "user_id": "2963",
    "phone_no": "7058702564"
  }
}
```

### Seller Details API Response
```json
{
  "data": {
    "seller_name": "Store Owner Name",
    "business_name": "Business Name",
    "store_name": "Tease",
    "phone": "1234567890",
    "email": "seller@example.com"
  }
}
```

### Customer Details API Response
```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  }
}
```

## Features

✅ Parallel data fetching for better performance
✅ Proper error handling and fallbacks
✅ TypeScript support with full type safety
✅ Caching via React Query to avoid duplicate requests
✅ Graceful handling of missing data
✅ Responsive card layout with Ant Design components
✅ Fallback values when primary data is unavailable

## Integration with Existing Code

The solution integrates seamlessly with:
- **React Query** for data fetching and caching
- **Ant Design** components (Card, Descriptions, Icons)
- **Existing SellerDetailsCard** component (placed above CustomerDetailsCard)
- **Order details structure** (uses userId and storeId from order response)

## Browser Support & Dependencies

- React 18+
- Next.js 16+
- @tanstack/react-query
- antd (Ant Design)
- TypeScript

## Build Status

✅ Build successful (41s)
✅ All TypeScript types validated
✅ No compilation errors
✅ All routes properly configured
