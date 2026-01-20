# Dashboard & Seller Panel - Implementation Examples

## Table of Contents
1. [Card Components](#card-components)
2. [Table Layouts](#table-layouts)
3. [Page Headers](#page-headers)
4. [Filter Controls](#filter-controls)
5. [Mobile-First Patterns](#mobile-first-patterns)
6. [Common Patterns](#common-patterns)

---

## Card Components

### Basic Statistics Card

```tsx
// Component Usage
<div className="DashboardAdmin-card">
  <div className="DashboardAdmin-card-header">
    <div className="DashboardAdmin-card-icons">
      <LuUsers color="#FF9500" />
    </div>
  </div>
  <div className="DashboardAdmin-card-text1">Total Users</div>
  <div className="DashboardAdmin-card-text2">5,234</div>
  <div className="DashboardAdmin-card-text3">↑ 12% from last month</div>
</div>
```

### CSS Classes Breakdown

```scss
// Main card container
.DashboardAdmin-card {
  // White background with shadow
  // Responsive padding: 24px → 16px → 12px
  // Hover: elevation increase, slight border color change
  // Min height: 160px for proper spacing
}

// Icon wrapper
.DashboardAdmin-card-icons {
  // 52x52px icon container
  // Gradient background that reacts to hover
  // Scales up slightly on card hover
}

// Label
.DashboardAdmin-card-text1 {
  // Uppercase, small font
  // Secondary text color
  // Letter spacing for emphasis
}

// Value
.DashboardAdmin-card-text2 {
  // Large, bold font (28px)
  // Primary color
  // Negative letter spacing for compactness
}

// Subtext
.DashboardAdmin-card-text3 {
  // Small, secondary color
  // Provides context
  // Example: "↑ 12% from last month"
}
```

### Responsive Grid

```tsx
// Grid will automatically adjust columns
<div className="dashboard-grid">
  {[1, 2, 3, 4].map(item => (
    <div key={item} className="DashboardAdmin-card">
      {/* Card content */}
    </div>
  ))}
</div>

// CSS Grid Behavior:
// Desktop: 4 columns
// Tablet:  3 columns
// Mobile:  1 column
```

---

## Table Layouts

### Desktop Table

```tsx
import { Table } from 'antd';

const columns = [
  {
    title: 'Product',
    dataIndex: 'name',
    render: (text, record) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="table-img">
          <img src={record.image} alt={text} />
        </div>
        <div>
          <div className="dashboard-text-primary">{text}</div>
          <div className="dashboard-text-secondary" style={{ fontSize: '12px' }}>
            {record.sku}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    render: (price) => `₦${price.toLocaleString()}`,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (status) => (
      <span className={`dashboard-badge badge-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    ),
  },
  {
    title: 'Actions',
    render: (_, record) => (
      <div className="table-action">
        <button>Edit</button>
        <button>Delete</button>
      </div>
    ),
  },
];

export function ProductTable({ data }) {
  return (
    <div className="dashboard-Layout">
      <Table
        columns={columns}
        dataSource={data}
        className="ant-table-wrapper"
        pagination={{ pageSize: 10 }}
        rowKey="id"
      />
    </div>
  );
}
```

### Mobile Table (Card View)

```tsx
// For screens ≤768px, use this card layout instead
export function ProductTableMobile({ data }) {
  return (
    <div className="products-tableMobile">
      {data.map((item) => (
        <div key={item.id} className="products-tableMobileCard">
          {/* Header */}
          <div className="products-tableMobileHeader">
            <div className="products-tableMobileImage">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="products-tableMobileTitle">
              <div className="title">{item.name}</div>
              <div className="sub">{item.sku}</div>
            </div>
          </div>

          {/* Body */}
          <div className="products-tableMobileBody">
            <div className="products-tableMobileRow">
              <span className="label">Price</span>
              <span className="value">₦{item.price.toLocaleString()}</span>
            </div>
            <div className="products-tableMobileRow">
              <span className="label">Quantity</span>
              <span className="value">{item.quantity}</span>
            </div>
            <div className="products-tableMobileRow">
              <span className="label">Status</span>
              <span
                className={`products-tableMobileStatus status-${item.status}`}
              >
                {item.status}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="products-tableMobileActions">
            <button className="btn-edit">Edit</button>
            <button className="btn-delete">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### CSS for Table Styling

```scss
// Desktop table styling automatically applied via:
// .dashboard-Layout .ant-table-wrapper { ... }

// Mobile table styling automatically applied via:
// .products-tableMobile { ... }

// No JavaScript changes needed - CSS handles the layout switch!
```

---

## Page Headers

### Basic Page Header

```tsx
import PageHeader from '@/app/(dashboard)/_components/pageHeader';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        bredcume="Manage your product inventory"
      >
        <Button type="primary" icon={<PlusOutlined />}>
          Add Product
        </Button>
      </PageHeader>

      {/* Page content */}
    </>
  );
}
```

### Page Header with Multiple Actions

```tsx
<PageHeader
  title="Orders"
  bredcume="View and manage all orders"
>
  <Button type="primary">Export</Button>
  <Button>Filters</Button>
  <Button type="dashed">Settings</Button>
</PageHeader>

// CSS automatically handles:
// - Right-aligned buttons on desktop
// - Stacked buttons on mobile
// - Proper spacing and alignment
```

### Page Header CSS

```scss
.dashboard-pageHeader {
  // Flexbox row layout
  // Space between title and buttons
  // Bottom border separator
  
  // Mobile: buttons stack below title
  @media (max-width: 768px) {
    // Buttons become full width
  }
}

.dashboard-pageHeaderBox {
  // Container for action buttons
  // Flexbox with gap
  // Wraps on smaller screens
}

.dashboard-pageHeadertxt1 {
  // Main title
  // 28px desktop → 22px tablet → 20px mobile
  // Bold font with negative letter spacing
}

.dashboard-pageHeadertxt2 {
  // Breadcrumb/subtitle
  // Secondary color
  // 14px desktop → 12px mobile
}

.dashboard-pageHeaderBox2 {
  // Back button
  // 40x40px
  // Hover: color and background change
  // Click: navigates back
}
```

---

## Filter Controls

### Standard Filter Bar

```tsx
import { Input, Select, DatePicker, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

export function ProductFilters() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(null);

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setDate(null);
  };

  return (
    <div className="products-filterControls">
      <Input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        prefix={<SearchOutlined />}
      />

      <Select
        placeholder="Select category"
        value={category}
        onChange={setCategory}
        options={[
          { label: 'Electronics', value: 'electronics' },
          { label: 'Clothing', value: 'clothing' },
          { label: 'Books', value: 'books' },
        ]}
      />

      <DatePicker
        placeholder="Select date"
        value={date}
        onChange={setDate}
      />

      <Button type="primary">Filter</Button>
      <Button icon={<ClearOutlined />} onClick={handleReset}>
        Reset
      </Button>
    </div>
  );
}
```

### Advanced Filters with Dropdown

```tsx
import { Dropdown, Button } from 'antd';
import { FilterOutlined, DownOutlined } from '@ant-design/icons';

export function AdvancedFilters() {
  const filterMenu = {
    items: [
      { label: 'Price: Low to High', key: 'price-asc' },
      { label: 'Price: High to Low', key: 'price-desc' },
      { label: 'Newest First', key: 'newest' },
      { label: 'Most Popular', key: 'popular' },
    ],
  };

  return (
    <div className="products-filterControls">
      <Input placeholder="Search..." />

      <Dropdown menu={filterMenu}>
        <Button icon={<FilterOutlined />}>
          Sort <DownOutlined />
        </Button>
      </Dropdown>

      <Button type="primary">Apply Filters</Button>
    </div>
  );
}
```

### Filter Controls CSS

```scss
.products-filterControls {
  // Horizontal flex layout on desktop
  // Vertical stack on mobile
  // Bordered container with shadow
  // Responsive gap between items
  
  // Desktop: All items in one row
  // Tablet: May wrap if needed
  // Mobile: All items stack vertically
  
  // All child inputs: 40px height, consistent styling
  // All buttons: matching height and radius
}

// Mobile behavior:
// Each input/select becomes full width
// Buttons also become full width
// Proper spacing between rows
```

---

## Mobile-First Patterns

### Responsive Container

```tsx
// Always start with mobile layout, enhance for larger screens

<div className="dashboard-section">
  {/* Content automatically adapts */}
</div>

// CSS handles all responsive behavior
// No need for conditional renders
```

### Responsive Grid

```tsx
<div className="dashboard-grid">
  {/* Items automatically arrange:
      Mobile:  1 column
      Tablet:  2 columns
      Desktop: 4 columns
  */}
</div>
```

### Responsive Row

```tsx
<div className="dashboard-row">
  {/* Items automatically wrap on mobile */}
  <div style={{ flex: 1 }}>Item 1</div>
  <div style={{ flex: 1 }}>Item 2</div>
  <div style={{ flex: 1 }}>Item 3</div>
</div>
```

---

## Common Patterns

### Status Badge

```tsx
<span className="dashboard-badge badge-success">
  ✓ Active
</span>

<span className="dashboard-badge badge-warning">
  ⏳ Pending
</span>

<span className="dashboard-badge badge-danger">
  ✗ Inactive
</span>
```

### Empty State

```tsx
<div className="dashboard-empty-state">
  <div className="icon">📦</div>
  <div className="title">No Products Found</div>
  <div className="description">
    You haven't added any products yet. Click below to create one.
  </div>
  <button onClick={() => router.push('/products/new')}>
    Create Product
  </button>
</div>
```

### Loading State

```tsx
<div className="dashboard-loading">
  <div className="spinner"></div>
  <span style={{ marginLeft: '12px' }}>Loading...</span>
</div>
```

### Form Group

```tsx
<div className="dashboard-form-group">
  <label htmlFor="product-name">Product Name</label>
  <input
    id="product-name"
    type="text"
    placeholder="Enter product name"
  />
</div>
```

### Button Group

```tsx
<div className="dashboard-btn-group">
  <button className="btn-primary">Save</button>
  <button className="btn-secondary">Cancel</button>
  <button className="btn-danger">Delete</button>
</div>
```

### Divider

```tsx
<div className="dashboard-divider"></div>

<!-- Or vertical -->
<div className="dashboard-divider vertical"></div>
```

---

## Best Practices

### 1. **Always Use Grid for Cards**
```tsx
// ✅ Good - responsive auto-adjust
<div className="dashboard-grid">
  {cards.map(card => <Card key={card.id} />)}
</div>

// ❌ Avoid - fixed layout
<div style={{ display: 'flex', gap: '16px' }}>
  {cards.map(card => <Card key={card.id} />)}
</div>
```

### 2. **Use Semantic HTML**
```tsx
// ✅ Good
<button className="dashboard-btn">Click me</button>
<h1 className="dashboard-pageHeadertxt1">Title</h1>

// ❌ Avoid
<div onClick={...}>Click me</div>
<div className="title-large">Title</div>
```

### 3. **Mobile-First CSS**
```scss
// ✅ Good - mobile first
.component {
  // Mobile styles
  padding: 16px;

  @media (min-width: 768px) {
    // Tablet+
    padding: 24px;
  }
}

// ❌ Avoid - desktop first
.component {
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
}
```

### 4. **Consistent Spacing**
```tsx
// ✅ Good - use spacing values
<div style={{ gap: '24px' }} className="dashboard-grid">

// ❌ Avoid - arbitrary values
<div style={{ gap: '23px' }}>
```

### 5. **Accessible Interactive Elements**
```tsx
// ✅ Good
<button
  className="dashboard-btn"
  onClick={handler}
  aria-label="Add new product"
>
  <PlusIcon />
</button>

// ❌ Avoid
<div onClick={handler}>
  <PlusIcon />
</div>
```

---

## Testing Responsive Design

### Breakpoints to Test

```
480px   - Small phone
768px   - Tablet
1024px  - Large tablet
1920px  - Desktop
```

### Testing Checklist

- [ ] Mobile (320px - 480px)
- [ ] Tablet (481px - 768px)
- [ ] Desktop (769px - 1024px)
- [ ] Large Desktop (1025px+)
- [ ] Portrait orientation
- [ ] Landscape orientation
- [ ] Zoom in/out
- [ ] Touch interactions
- [ ] Keyboard navigation
- [ ] Screen readers

---

## Troubleshooting

### Issue: Cards not stacking on mobile
**Solution**: Ensure parent has `.dashboard-grid` class

### Issue: Buttons overflowing on mobile
**Solution**: Use `.dashboard-btn-group` for proper wrapping

### Issue: Tables showing horizontal scroll on mobile
**Solution**: Ensure table is inside element without fixed width

### Issue: Sidebar not sliding on mobile
**Solution**: Check that `transform` and `transition` are applied

### Issue: Text not readable on small screens
**Solution**: Verify media queries are reducing font sizes properly

---

## Performance Tips

1. **Lazy load heavy components**
   ```tsx
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

2. **Use CSS for animations**
   ```scss
   // ✅ Good - hardware accelerated
   transition: transform 200ms ease;

   // ❌ Avoid - CPU intensive
   setTimeout(() => update(), 16);
   ```

3. **Optimize images**
   ```tsx
   // ✅ Good
   <Image src={url} width={50} height={50} />

   // ❌ Avoid
   <img src={url} style={{ width: '50px' }} />
   ```

4. **Memoize expensive renders**
   ```tsx
   const MemoizedCard = memo(Card);
   ```

---

## Resources

- Main styles: `src/app/(dashboard)/auth/style.scss`
- Utilities: `src/app/(dashboard)/_utils/dashboard-utilities.scss`
- Components: `src/app/(dashboard)/_components/`
- Documentation: `DASHBOARD_UI_IMPROVEMENTS.md`

---

## Version
**v1.0** - Initial implementation guide (January 2026)

---

*For more information, see DASHBOARD_UI_IMPROVEMENTS.md*
