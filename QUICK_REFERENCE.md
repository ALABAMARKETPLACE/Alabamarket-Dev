# Quick Reference Guide - Admin & Seller Panel

## 🎯 Quick Links

| Component      | File                               | Class                         |
| -------------- | ---------------------------------- | ----------------------------- |
| **Header**     | `_components/header/index.tsx`     | `.dashboard-Header`           |
| **Sidebar**    | `_components/sideBar/`             | `.dashboard-SideBarContainer` |
| **Page Title** | `_components/pageHeader/index.tsx` | `.dashboard-pageHeader`       |
| **Cards**      | `auth/style.scss`                  | `.DashboardAdmin-card`        |
| **Tables**     | `auth/style.scss`                  | `.ant-table-wrapper`          |
| **Filters**    | `auth/style.scss`                  | `.products-filterControls`    |
| **Utilities**  | `_utils/dashboard-utilities.scss`  | Helper classes                |

---

## 🎨 Color Palette

```
Primary Orange:  #FF9500
Light Orange:    rgba(255, 149, 0, 0.08)

Text Primary:    #1A202C  (Dark Gray)
Text Secondary:  #718096  (Medium Gray)
Text Tertiary:   #A0AEC0  (Light Gray)

Border:          #E5E7EB
Background:      #F8FAFC
White:           #FFFFFF

Success:         #10B981 (Green)
Warning:         #F59E0B (Amber)
Danger:          #EF4444 (Red)
```

---

## 📏 Spacing System

| Value | Size | Use Case         |
| ----- | ---- | ---------------- |
| `xs`  | 4px  | Micro spacing    |
| `sm`  | 8px  | Compact elements |
| `md`  | 12px | Normal spacing   |
| `lg`  | 16px | Standard gaps    |
| `xl`  | 24px | Large sections   |
| `2xl` | 32px | Major sections   |

---

## 📐 Border Radius

| Size | Value | Use Case          |
| ---- | ----- | ----------------- |
| `sm` | 6px   | Small inputs      |
| `md` | 8px   | Buttons, inputs   |
| `lg` | 12px  | Cards, containers |
| `xl` | 16px  | Large containers  |

---

## 🔤 Typography

| Element | Size | Weight   | Use Case       |
| ------- | ---- | -------- | -------------- |
| H1      | 28px | Bold     | Page titles    |
| H2      | 20px | SemiBold | Section titles |
| Body    | 14px | Regular  | Text content   |
| Small   | 12px | Regular  | Secondary info |
| Label   | 11px | SemiBold | Field labels   |

---

## 📱 Responsive Breakpoints

```scss
// Mobile First Approach

// Mobile (≤480px)
@media (max-width: 480px) // Tablet (481px - 768px) @media (max-width: 768px) // Tablet Large (769px - 1024px) @media (max-width: 1024px); // Desktop (≥1025px)
// Base styles (no query needed)
```

---

## 🔲 Component Classes

### Header

```
.dashboard-Header              // Main header
.dashboard-HeaderBox5          // Logo section
.dashboard-HeaderBox1          // Controls section
.dashboard-HeaderBox2          // Profile section
.dashboard-HeaderBox3          // Icon button
.dashboard-MobileMenuToggle    // Mobile menu button
```

### Sidebar

```
.dashboard-SideBarContainer    // Sidebar wrapper
.dashboard-SideBar             // Sidebar content
.dashboard-SideBarItem         // Menu item
.dashboard-SideBarDevider      // Section divider
.dashboard-SideBarOverlay      // Mobile backdrop
```

### Page Header

```
.dashboard-pageHeader          // Main header
.dashboard-pageHeadertxt1      // Title text
.dashboard-pageHeadertxt2      // Breadcrumb text
.dashboard-pageHeaderBox       // Action buttons
.dashboard-pageHeaderBox2      // Back button
```

### Cards

```
.DashboardAdmin-card           // Main card
.DashboardAdmin-card-header    // Header section
.DashboardAdmin-card-icons     // Icon wrapper
.DashboardAdmin-card-text1     // Label
.DashboardAdmin-card-text2     // Value
.DashboardAdmin-card-text3     // Subtext
```

### Tables

```
.ant-table-wrapper             // Table container
.ant-table-thead               // Header row
.ant-table-tbody               // Body rows
.products-tableMobile          // Mobile card layout
.products-tableMobileCard      // Individual card
```

### Filters

```
.products-filterControls       // Filter container
.dashboard-filterControls      // Alternative style
.ant-input                     // Input fields
.ant-select-selector           // Dropdown
.ant-btn                       // Buttons
```

---

## 🎯 Common Patterns

### Create a Card

```html
<div class="DashboardAdmin-card">
  <div class="DashboardAdmin-card-icons">📊</div>
  <div class="DashboardAdmin-card-text1">Label</div>
  <div class="DashboardAdmin-card-text2">1,234</div>
  <div class="DashboardAdmin-card-text3">Subtitle</div>
</div>
```

### Create a Grid

```html
<div class="dashboard-grid">
  <!-- Cards automatically arrange -->
</div>
```

### Create a Page Header

```tsx
<PageHeader title="Page Title" bredcume="Breadcrumb">
  <Button>Action</Button>
</PageHeader>
```

### Create a Filter Bar

```html
<div class="products-filterControls">
  <input type="text" placeholder="Search..." />
  <select>
    <option>Category</option>
  </select>
  <button>Filter</button>
</div>
```

---

## 🎭 Status Badges

```html
<!-- Success -->
<span class="dashboard-badge badge-success">✓ Active</span>

<!-- Warning -->
<span class="dashboard-badge badge-warning">⏳ Pending</span>

<!-- Danger -->
<span class="dashboard-badge badge-danger">✗ Inactive</span>

<!-- Info -->
<span class="dashboard-badge badge-info">ℹ Info</span>

<!-- Primary -->
<span class="dashboard-badge badge-primary">★ Featured</span>
```

---

## 🚨 Status Indicators

```html
<!-- Active -->
<div class="dashboard-status status-active">Active</div>

<!-- Pending -->
<div class="dashboard-status status-pending">Pending</div>

<!-- Inactive -->
<div class="dashboard-status status-inactive">Inactive</div>

<!-- Processing (animated) -->
<div class="dashboard-status status-processing">Processing</div>
```

---

## 📊 Empty & Loading States

### Empty State

```html
<div class="dashboard-empty-state">
  <div class="icon">📭</div>
  <div class="title">No Data Found</div>
  <div class="description">Try different filters</div>
  <button>Create New</button>
</div>
```

### Loading State

```html
<div class="dashboard-loading">
  <div class="spinner"></div>
  <span>Loading...</span>
</div>
```

---

## 🎨 Spacing Utilities

```html
<!-- Padding -->
<div class="p-lg">Content</div>
<!-- 16px -->
<div class="p-2xl">Content</div>
<!-- 32px -->

<!-- Margin -->
<div class="m-lg">Content</div>
<!-- 16px -->

<!-- Gap (flex/grid) -->
<div class="gap-lg">Content</div>
<!-- 16px -->
```

---

## 👁️ Display Utilities

```html
<!-- Hide on mobile -->
<div class="hide-mobile">Visible on tablet/desktop</div>

<!-- Hide on tablet -->
<div class="hide-tablet">Visible on mobile/desktop</div>

<!-- Show only on mobile -->
<div class="show-mobile">Only on mobile</div>

<!-- Hide on desktop -->
<div class="hide-desktop">Visible on mobile</div>
```

---

## 🔗 Important Files

| File                              | Purpose               |
| --------------------------------- | --------------------- |
| `auth/style.scss`                 | Main dashboard styles |
| `seller/style.scss`               | Seller panel styles   |
| `_utils/dashboard-utilities.scss` | Helper classes        |
| `_components/header/`             | Header component      |
| `_components/sideBar/`            | Sidebar component     |
| `_components/pageHeader/`         | Page header component |

---

## 📖 Documentation Files

| File                           | Content                |
| ------------------------------ | ---------------------- |
| `IMPROVEMENTS_SUMMARY.md`      | Overview of changes    |
| `DASHBOARD_UI_IMPROVEMENTS.md` | Detailed design system |
| `IMPLEMENTATION_GUIDE.md`      | Code examples          |
| This file                      | Quick reference        |

---

## 🐛 Common Issues

| Issue                    | Solution                           |
| ------------------------ | ---------------------------------- |
| Cards not stacking       | Use `.dashboard-grid` class        |
| Table overflowing        | Check `.ant-table-wrapper` padding |
| Sidebar not sliding      | Verify `transform` on mobile       |
| Buttons wrapping badly   | Use `.dashboard-btn-group`         |
| Text too small on mobile | Check media query sizes            |

---

## ⚡ Performance Tips

1. **Lazy load images**

   ```tsx
   <img loading="lazy" src={url} />
   ```

2. **Use CSS for animations**

   ```scss
   transition: all 200ms ease;
   ```

3. **Memoize components**

   ```tsx
   const Card = memo(CardComponent);
   ```

4. **Optimize selectors**

   ```scss
   // Good
   .card {
   }

   // Avoid deep nesting
   .dashboard .container .card {
   }
   ```

---

## 🎓 Learning Resources

1. Start with `IMPROVEMENTS_SUMMARY.md` for overview
2. Read `DASHBOARD_UI_IMPROVEMENTS.md` for details
3. Check `IMPLEMENTATION_GUIDE.md` for code examples
4. Use this file as quick reference

---

## 📞 Need Help?

1. Check the documentation files
2. Look for similar components in codebase
3. Review inline CSS comments
4. Check component usage examples

---

## 🔄 Responsive Design Flow

```
Mobile (320px)
    ↓ (481px)
Tablet (768px)
    ↓ (769px)
Desktop (1024px)
    ↓ (1025px)
Large Desktop (1920px)
```

Each breakpoint includes all features of previous,
with enhanced layout and spacing.

---

## 🎯 CSS Variable System

```scss
// Colors
$primary-color: vars.$primary;
$text-color-primary: #1a202c;
$border-color: #e5e7eb;

// Spacing
$space-lg: 16px;
$space-xl: 24px;

// Shadows
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

// Transitions
$transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🚀 Quick Start

1. **Import styles** in your layout

   ```tsx
   import "./auth/style.scss";
   ```

2. **Use components**

   ```tsx
   <div className="dashboard-grid">
     <div className="DashboardAdmin-card">...</div>
   </div>
   ```

3. **Test responsiveness** at all breakpoints

4. **Reference docs** when needed

---

## ✅ Checklist for New Pages

- [ ] Import main styles
- [ ] Add PageHeader with title
- [ ] Use .dashboard-grid for cards
- [ ] Use .ant-table-wrapper for tables
- [ ] Use .products-filterControls for filters
- [ ] Test on mobile/tablet/desktop
- [ ] Check contrast and accessibility
- [ ] Verify all responsive breakpoints

---

## Version: v1.0

**Last Updated:** January 20, 2026

---

For detailed information, see the main documentation files.
