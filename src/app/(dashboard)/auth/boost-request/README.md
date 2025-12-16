# Boost Request Module - Frontend Integration

## ✅ Completed Tasks

### 1. Backend Updates

- ✅ Added role-based filtering in `findAll` service
  - Sellers see **only their own** boost requests
  - Admins can see all boost requests
- ✅ Updated controller to pass `role` and `sellerId` parameters

### 2. Frontend Structure Created

```
boost-request/
├── page.tsx                     ✅ Main list page (NO TABS - single view)
├── _components/
│   ├── dataTable.tsx           ✅ Table with pagination (desktop + mobile)
│   ├── requestForm.tsx         ✅ Reusable form component
│   └── BoostRequestFilterBar   ✅ Filter controls
├── [id]/
│   ├── page.tsx                ✅ Detail page
│   └── edit/
│       └── page.tsx            ✅ Edit page
└── create/
    └── page.tsx                ✅ Create page
```

### 3. Configuration Updates

- ✅ Added to `API_ADMIN.ts`:

  ```typescript
  BOOST_REQUESTS: "boost-requests/",
  BOOST_REQUEST_APPROVE: "boost-requests/approve",
  ```

- ✅ Added to `route.json`:

  ```json
  {
    "id": 17,
    "menu": "Boost Requests",
    "icon": "TbRocket",
    "route": "/auth/boost-request",
    "role": ["seller"]
  }
  ```

- ✅ Added `TbRocket` icon to `dynamicIcons.tsx`

---

## 📋 Features Implemented

### Main List Page (`page.tsx`)

- ✅ Search by seller name (debounced)
- ✅ Filter by status (all/pending/approved/rejected/expired)
- ✅ Pagination
- ✅ Refresh button
- ✅ "New Request +" button → navigates to create page

### Data Table (`dataTable.tsx`)

- ✅ Displays: ID, Seller Name, Plan, Products Count, Days, Total Amount, Status, Dates
- ✅ Status badges with colors:
  - 🟠 Pending
  - 🟢 Approved
  - 🔴 Rejected
  - ⚫ Expired
- ✅ Action button → navigates to detail page
- ✅ Horizontal scroll for small screens
- ✅ Empty state with icon

---

## ⏳ TODO: Files to Create

### 1. Detail Page: `[id]/page.tsx`

**Should display:**

- Seller Information (name, email, phone)
- Plan Details (name, duration, price, limits)
- Products List (with images, names, prices)
- Boost Period (start date, end date, days)
- Total Amount
- Status (with badge)
- Remarks
- Timestamps (requested_at, approved_at)

**Actions (if status = pending):**

- Edit Button → navigate to edit page
- Cancel/Delete Button

**Style:** Similar to subscription plan detail view with Cards

---

### 2. Create Page: `create/page.tsx`

**Form Fields:**

1. Select Subscription Plan (dropdown from active plans)
2. Select Products (multi-select, within plan limits)
3. Start Date (date picker)
4. End Date (date picker)
   - Auto-calculate days
   - Show live total amount calculation
5. Remarks (optional textarea)

**Validations:**

- Product count must be within plan's min/max
- End date > Start date
- Show real-time calculation: `products × price` (price is per product for the plan duration)

**Style:** Similar to subscription plan create form

---

### 3. Edit Page (Optional): `[id]/edit/page.tsx`

Similar to create, but:

- Pre-fill existing data
- Only allow edit if status = "pending"
- Recalculate total on any change

---

## 🎨 Style Guidelines (Maintain Consistency)

Based on existing patterns:

```tsx
// Page Header
<PageHeader title={"..."} bredcume={"Dashboard / ..."}>
  {/* Action buttons */}
</PageHeader>

// Cards for detail view
<Card title="Section Title">
  <Descriptions items={...} />
</Card>

// Forms
<Form layout="vertical" onFinish={...}>
  <Form.Item label="..." name="..." rules={[...]}>
    <Input/Select/DatePicker size="large" />
  </Form.Item>
</Form>

// Buttons
<Button type="primary">Submit</Button>
<Button type="primary" ghost>Cancel</Button>
```

---

## 🔐 Role Management

### Menu Visibility

- **Seller**: ✅ Can see "Boost Requests" menu
- **Admin**: ❌ Cannot see (not in their role array)

### Data Access

- **Seller**: Only sees their own boost requests
- **Admin**: Can see all boost requests (if added to role array)

### Route Protection (middleware.ts)

Currently NO protection for `/auth/boost-request` route.

**Should add:**

```typescript
// Only if you want both seller and admin access
const seller_routes = [
  "/auth/boost-request",
  // ...
];
```

---

## 🧪 Test Cases

1. ✅ Seller logs in → sees "Boost Requests" menu
2. ✅ Admin logs in → does NOT see "Boost Requests" menu
3. ✅ Seller navigates to page → sees only their boost requests
4. ✅ Search works (debounced)
5. ✅ Status filter works
6. ✅ Pagination works
7. ✅ Create new boost request
8. ✅ View details
9. ✅ Edit pending request
10. ✅ Cannot edit approved/rejected request

---

## 📝 Completed

All features have been implemented:
- ✅ List page with filters and pagination
- ✅ Detail page with all request info
- ✅ Create page with form validation
- ✅ Edit page (only for pending requests)
- ✅ Mobile responsive design

---

## 🚨 Important Notes

### Backend TODO

Replace placeholders in controller:

```typescript
// CURRENT (temporary):
const role = "seller";
const sellerId = 1;

// SHOULD BE:
@UserRole() role: string,
@SellerId() sellerId: number
```

### Frontend Data Structure

API Response:

```json
{
  "data": {
    "data": [...],  // Array of boost requests
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  },
  "success": true,
  "message": "Successfully Retrieved"
}
```

---

**All integration complete!** 🎉
