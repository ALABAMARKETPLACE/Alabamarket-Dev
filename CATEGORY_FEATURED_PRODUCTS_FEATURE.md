# Category Featured Products Feature

## Overview

This feature makes the category lines (Kitchen, Generator, etc.) clickable and displays featured products dynamically based on the selected category. It works in sync with the existing `/category` page.

## Components

### 1. **CategoryFeaturedProducts** Component

**Location:** `/src/app/(screens)/home/_components/categoryFeaturedProducts.tsx`

This component:

- Displays all category lines in an interactive carousel
- Shows featured products for the selected category
- Auto-selects the first category on load
- Fetches products from the same endpoint as the category page (`PRODUCT_SEARCH_BOOSTED_CATEGORY`)
- Has a "View All" button to navigate to the full category page

**Props:**

- `categories: any[]` - Array of category objects from Redux

### 2. **SubCategoryList** Component (Existing)

**Location:** `/src/app/(screens)/home/_components/subCategoryList.tsx`

Enhanced with:

- Smooth hover animations
- Clear visual feedback
- Responsive navigation arrows

## How It Works

1. **Category Selection:**

   - Users can click on any category line (Kitchen, Generator, Sports, etc.)
   - The selected category is highlighted with an orange border
   - Products update automatically when a category is selected

2. **Product Display:**

   - Products are fetched using the same API endpoint as the category page
   - Display includes scrollable carousel with left/right navigation
   - Shows 12 products per category
   - "View All" button navigates to the full category page with all filters

3. **Data Synchronization:**
   - Uses the same API endpoint: `PRODUCT_SEARCH_BOOSTED_CATEGORY`
   - Maintains consistency with category page sorting and filtering
   - Supports the same price and order parameters

## Styling

**File:** `/src/app/(screens)/home/_components/categoryFeaturedProducts.scss`

Features:

- Responsive design (mobile, tablet, desktop)
- Smooth transitions and animations
- Orange (#ff6b35) accent color for active states
- Clean, modern UI with proper spacing

## Usage in Home Page

The component is integrated in the home page:

```tsx
{
  subCategories?.length > 0 && (
    <>
      <CategoryFeaturedProducts categories={subCategories} />
      <div className="HomeSCreen-space" />
    </>
  );
}
```

**Location in Page Flow:**

- After: Featured Platinum/Gold/Silver sections
- Before: Featured Categories ("Our Top Offers") section
- After: All Products and Recently Visited sections

## API Integration

**Endpoint Used:**

```
API.PRODUCT_SEARCH_BOOSTED_CATEGORY
```

**Parameters:**

- `subCategory`: Category ID (required)
- `page`: Page number (default: 1)
- `take`: Items per page (default: 12)
- `price`: Sorting by price (RAND, ASC, DESC)
- `order`: Sorting order (ASC, DESC)

## Mobile Responsiveness

The component is fully responsive:

- **Desktop:** Full-size category images (120x120px)
- **Tablet:** Medium-size category images (90x90px)
- **Mobile:** Compact category images (75x75px)

## Future Enhancements

Possible improvements:

1. Add category filtering by "line" (e.g., only show Kitchen line products)
2. Remember user's selected category preference
3. Add category-based product recommendations
4. Implement category-specific banners or promotions
5. Add analytics tracking for category interactions

## Testing

To test the feature:

1. Navigate to the home page (`/`)
2. Scroll to the "Shop by Category Lines" section
3. Click on different category items
4. Verify products update correctly
5. Click "View All" to navigate to the full category page
6. Verify the category page shows the same products initially

## Troubleshooting

**Products not loading:**

- Check if categories are being passed correctly from Redux
- Verify API endpoint is accessible
- Check browser console for any errors

**Styling issues:**

- Ensure SCSS imports are correct
- Check for conflicting Bootstrap styles
- Clear browser cache if styles don't update

**Navigation issues:**

- Verify category IDs are being encoded correctly
- Check URL parameters in browser's address bar
