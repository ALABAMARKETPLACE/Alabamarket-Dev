# News & Updates Feature Documentation

## Overview

A complete news management system where administrators can create, edit, and delete news articles with photo and video support. Users can browse, search, and view news articles on the public news page.

## File Structure

### Public News Page

- **File**: `/src/app/(screens)/news/page.tsx`
- **Route**: `/news`
- **Features**:
  - Display news articles in a grid layout (12 items per page)
  - Search functionality by title and description
  - Pagination support
  - Responsive design (desktop, tablet, mobile)
  - Quick access link to admin panel

### News Detail Page

- **File**: `/src/app/(screens)/news/[id]/page.tsx`
- **Route**: `/news/[id]`
- **Features**:
  - Full news article view
  - Display featured image or video with controls
  - Show metadata (date, author, views)
  - Back navigation button
  - Responsive layout

### News Card Component

- **File**: `/src/app/(screens)/news/_components/newsCard.tsx`
- **Features**:
  - Reusable card component for displaying news items
  - Supports images and videos with play overlay
  - Shows category, title, description, date, author, and view count
  - Hover effects and animations

### Admin Management Page

- **File**: `/src/app/(dashboard)/auth/news/manage/page.tsx`
- **Route**: `/auth/news/manage` (Protected - Admin only)
- **Features**:
  - Create new news articles
  - Edit existing news
  - Delete news articles
  - Upload featured images
  - Upload video files
  - Upload video thumbnails
  - Set category, author, and full content
  - Image preview in grid

### Styles

- **File**: `/src/app/(screens)/news/styles.scss`
- **Features**:
  - Grid layout styling
  - Card hover effects
  - Search bar styling
  - Responsive media queries
  - Video overlay styling

## API Endpoints Used

```typescript
// Fetch all news (paginated)
GET /newsandblogs/pgn?page={page}&limit={limit}

// Create news
POST /newsandblogs/

// Get news details
GET /newsandblogs/{id}

// Update news
PUT /newsandblogs/{id}

// Delete news
DELETE /newsandblogs/{id}
```

## Data Structure

### NewsItem Interface

```typescript
interface NewsItem {
  id: string | number;
  title: string;
  description: string;
  content?: string;
  category?: string;
  image?: string; // Featured image URL
  video?: string; // Video file URL
  thumbnail?: string; // Video thumbnail URL
  author?: string;
  createdAt: string;
  views?: number;
}
```

## Features & Capabilities

### For Users

✅ Browse news articles in grid layout
✅ Search news by title or description
✅ View full news article details
✅ Watch embedded videos with controls
✅ See publication date and author
✅ View article metadata (author, date, views)
✅ Responsive design for all devices

### For Administrators

✅ Create new news articles
✅ Edit existing articles
✅ Delete articles with confirmation
✅ Upload featured images
✅ Upload video files
✅ Upload video thumbnails
✅ Categorize news (News, Updates, Events, Blog, Press Release)
✅ Set author and full content
✅ Preview all articles in grid

## Usage Guide

### Creating a News Article (Admin)

1. Navigate to `/auth/news/manage`
2. Click "Add New News" button
3. Fill in the form:
   - **Title**: Article headline
   - **Description**: Short summary (shown on cards)
   - **Full Content**: Complete article text
   - **Category**: Select from predefined categories
   - **Author**: Creator name (defaults to "Admin")
4. Upload media:
   - **Featured Image**: Main article image
   - **Video**: Video file (optional)
   - **Video Thumbnail**: Preview image for video (optional)
5. Click "Create News"

### Editing a News Article (Admin)

1. Go to `/auth/news/manage`
2. Find the article in the list
3. Click the edit (pencil) icon
4. Modify the details
5. Upload new media if needed
6. Click "Update News"

### Deleting a News Article (Admin)

1. Go to `/auth/news/manage`
2. Find the article in the list
3. Click the delete (trash) icon
4. Confirm the deletion

### Viewing News (Public)

1. Navigate to `/news`
2. Browse articles in grid (12 per page)
3. Use search to find specific articles
4. Click on any article to view full details
5. Watch videos with native video player controls

## Styling Details

### News Card

- Image/video container: 200px height with cover fit
- Title: Bold, capitalized, 2-line clamp
- Description: Dimmed text, 2-line clamp
- Metadata: Icons with date, author, views
- Hover effect: Slight lift animation with shadow

### Grid Layout

- Desktop: 4 columns (lg=4)
- Tablet: 2 columns (md=6)
- Mobile: 1 column (sm=12)
- Gap: 16px between cards

### Search Bar

- Full width input with icon
- Clear button for easy reset
- Box shadow for depth
- Responsive padding

## Database Considerations

The following fields should be indexed for performance:

- `title` - for search functionality
- `category` - for filtering
- `createdAt` - for sorting by date
- `author` - for filtering by author

## Security Notes

⚠️ **Admin Routes**: The `/auth/news/manage` route should be protected by middleware to ensure only authenticated admin users can access it.

⚠️ **File Upload**: Ensure proper validation on the backend:

- Check file sizes
- Validate file types (jpg, png for images, mp4, webm for videos)
- Scan for malicious content
- Store files securely (S3, cloud storage)

## Future Enhancements

- [ ] Featured news carousel on homepage
- [ ] News by category page
- [ ] Social media sharing buttons
- [ ] Comment system
- [ ] Newsletter subscription
- [ ] News archives by date
- [ ] Related news suggestions
- [ ] SEO optimization (meta tags)
- [ ] Email notifications for new articles
- [ ] Multi-language support
- [ ] Rich text editor for content
- [ ] Draft/publish status

## Performance Optimization

1. **Image Optimization**:
   - Use next/image component for automatic optimization
   - Lazy load images
   - Use appropriate formats (WebP with fallback)

2. **Video Optimization**:
   - Use video thumbnails to avoid loading full videos
   - Implement lazy loading
   - Consider using video hosting service (Vimeo, YouTube)

3. **Query Optimization**:
   - Implement caching with React Query
   - Use pagination (12 items per page)
   - Add infinite scroll option

4. **SEO**:
   - Add meta tags to news pages
   - Create sitemap entries
   - Add structured data (JSON-LD)

## Build Status

✅ Build successful
✅ All TypeScript types validated
✅ No compilation errors
✅ Routes properly configured:

- `/news` - Public news listing
- `/news/[id]` - News detail view
- `/auth/news/manage` - Admin management panel
