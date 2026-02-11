# News & Blogs Feature - Backend Requirements

This document outlines the backend API endpoints required to support the News & Updates feature.

---

## Overview

The News & Blogs feature allows administrators to create, manage, and publish news articles with support for images and videos. Public users can browse, search, and view news articles.

---

## Base URL

```
/newsandblogs
```

---

## 1. Get Paginated News List (Public)

### Endpoint
```
GET /newsandblogs/pgn
```

### Authentication
**Not Required** - Public endpoint

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `limit` | integer | No | 12 | Items per page |
| `category` | string | No | - | Filter by category |
| `search` | string | No | - | Search in title/description |

### Example Request
```
GET /newsandblogs/pgn?page=1&limit=12&category=News&search=marketplace
```

### Success Response (200 OK)
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "title": "New Feature Launch",
      "description": "We are excited to announce our latest feature...",
      "content": "Full article content here...",
      "category": "News",
      "image": "https://storage.example.com/news/image1.jpg",
      "video": null,
      "thumbnail": null,
      "author": "Admin",
      "views": 150,
      "createdAt": "2026-02-10T10:00:00Z",
      "updatedAt": "2026-02-10T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 12,
  "totalPages": 4
}
```

### Implementation Notes
- Results should be ordered by `createdAt` DESC (newest first)
- Search should be case-insensitive
- Consider full-text search for better performance

---

## 2. Get Single News Article (Public)

### Endpoint
```
GET /newsandblogs/:id
```

### Authentication
**Not Required** - Public endpoint

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer/string | News article ID |

### Example Request
```
GET /newsandblogs/123
```

### Success Response (200 OK)
```json
{
  "status": true,
  "data": {
    "id": 123,
    "title": "New Feature Launch",
    "description": "We are excited to announce our latest feature...",
    "content": "Full article content with all details...",
    "category": "News",
    "image": "https://storage.example.com/news/image1.jpg",
    "video": "https://storage.example.com/news/video1.mp4",
    "thumbnail": "https://storage.example.com/news/thumb1.jpg",
    "author": "Admin",
    "views": 151,
    "createdAt": "2026-02-10T10:00:00Z",
    "updatedAt": "2026-02-10T10:00:00Z"
  }
}
```

### Error Response (404 Not Found)
```json
{
  "status": false,
  "message": "News article not found"
}
```

### Implementation Notes
- Increment `views` counter on each request
- Consider rate limiting view count updates (e.g., 1 per IP per hour)

---

## 3. Create News Article (Admin)

### Endpoint
```
POST /newsandblogs/
```

### Authentication
**Required** - Admin only

### Headers
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### Request Body (FormData)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Article title (max 255 chars) |
| `description` | string | Yes | Short description/summary (max 500 chars) |
| `content` | string | No | Full article content (HTML or plain text) |
| `category` | string | No | Category (News, Updates, Events, Blog, Press Release) |
| `author` | string | No | Author name (default: "Admin") |
| `image` | file | No | Featured image (jpg, png, webp - max 5MB) |
| `video` | file | No | Video file (mp4, webm - max 100MB) |
| `thumbnail` | file | No | Video thumbnail (jpg, png - max 2MB) |

### Example Request (cURL)
```bash
curl -X POST https://api.example.com/newsandblogs/ \
  -H "Authorization: Bearer <token>" \
  -F "title=New Feature Announcement" \
  -F "description=Short summary of the news" \
  -F "content=Full article content..." \
  -F "category=News" \
  -F "author=Admin" \
  -F "image=@/path/to/image.jpg" \
  -F "video=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumb.jpg"
```

### Success Response (201 Created)
```json
{
  "status": true,
  "message": "News article created successfully",
  "data": {
    "id": 124,
    "title": "New Feature Announcement",
    "description": "Short summary of the news",
    "content": "Full article content...",
    "category": "News",
    "image": "https://storage.example.com/news/image124.jpg",
    "video": "https://storage.example.com/news/video124.mp4",
    "thumbnail": "https://storage.example.com/news/thumb124.jpg",
    "author": "Admin",
    "views": 0,
    "createdAt": "2026-02-10T12:00:00Z",
    "updatedAt": "2026-02-10T12:00:00Z"
  }
}
```

### Error Responses

**400 Bad Request**
```json
{
  "status": false,
  "message": "Title is required"
}
```

**401 Unauthorized**
```json
{
  "status": false,
  "message": "Authentication required"
}
```

**403 Forbidden**
```json
{
  "status": false,
  "message": "Admin access required"
}
```

### Implementation Notes
- Validate file types and sizes
- Compress/optimize images before storage
- Consider video transcoding for web compatibility
- Store files in cloud storage (S3, Google Cloud Storage)
- Generate unique filenames to prevent conflicts

---

## 4. Update News Article (Admin)

### Endpoint
```
PUT /newsandblogs/:id
```

### Authentication
**Required** - Admin only

### Headers
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer/string | News article ID |

### Request Body (FormData)
Same as Create endpoint - all fields are optional for update

### Example Request
```
PUT /newsandblogs/123
```

### Success Response (200 OK)
```json
{
  "status": true,
  "message": "News article updated successfully",
  "data": {
    "id": 123,
    "title": "Updated Title",
    "description": "Updated description",
    "content": "Updated content...",
    "category": "Updates",
    "image": "https://storage.example.com/news/newimage.jpg",
    "video": "https://storage.example.com/news/video123.mp4",
    "thumbnail": "https://storage.example.com/news/thumb123.jpg",
    "author": "Admin",
    "views": 150,
    "createdAt": "2026-02-10T10:00:00Z",
    "updatedAt": "2026-02-10T14:00:00Z"
  }
}
```

### Implementation Notes
- Only update fields that are provided
- Delete old files from storage when replacing
- Preserve `views` count on update

---

## 5. Delete News Article (Admin)

### Endpoint
```
DELETE /newsandblogs/:id
```

### Authentication
**Required** - Admin only

### Headers
```
Authorization: Bearer <admin_token>
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer/string | News article ID |

### Success Response (200 OK)
```json
{
  "status": true,
  "message": "News article deleted successfully"
}
```

### Error Response (404 Not Found)
```json
{
  "status": false,
  "message": "News article not found"
}
```

### Implementation Notes
- Delete associated files from storage
- Consider soft delete for recovery purposes
- Log deletion for audit trail

---

## Database Schema

### News/Blogs Table

```sql
CREATE TABLE news_and_blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(500) NOT NULL,
  content TEXT,
  category VARCHAR(50) DEFAULT 'News',
  image VARCHAR(512),
  video VARCHAR(512),
  thumbnail VARCHAR(512),
  author VARCHAR(100) DEFAULT 'Admin',
  views INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_news_category ON news_and_blogs(category);
CREATE INDEX idx_news_created_at ON news_and_blogs(created_at DESC);
CREATE INDEX idx_news_published ON news_and_blogs(is_published);

-- Full-text search index (PostgreSQL)
CREATE INDEX idx_news_search ON news_and_blogs USING gin(
  to_tsvector('english', title || ' ' || description)
);
```

---

## File Storage Requirements

### Image Storage
- **Allowed Types**: jpg, jpeg, png, webp, gif
- **Max Size**: 5MB
- **Recommended Dimensions**: 1200x630px (social media optimized)
- **Storage Path**: `/news/images/{id}_{timestamp}.{ext}`

### Video Storage
- **Allowed Types**: mp4, webm, mov
- **Max Size**: 100MB
- **Recommended**: MP4 with H.264 codec
- **Storage Path**: `/news/videos/{id}_{timestamp}.{ext}`

### Thumbnail Storage
- **Allowed Types**: jpg, jpeg, png, webp
- **Max Size**: 2MB
- **Recommended Dimensions**: 640x360px
- **Storage Path**: `/news/thumbnails/{id}_{timestamp}.{ext}`

---

## Category Values

The frontend expects these category options:

```typescript
const categories = [
  "News",
  "Updates",
  "Events",
  "Blog",
  "Press Release"
];
```

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/newsandblogs/pgn` | No | Get paginated news list |
| GET | `/newsandblogs/:id` | No | Get single news article |
| POST | `/newsandblogs/` | Admin | Create news article |
| PUT | `/newsandblogs/:id` | Admin | Update news article |
| DELETE | `/newsandblogs/:id` | Admin | Delete news article |

---

## Validation Rules

### Title
- Required
- Min length: 5 characters
- Max length: 255 characters
- No HTML allowed

### Description
- Required
- Min length: 10 characters
- Max length: 500 characters
- No HTML allowed

### Content
- Optional
- Max length: 50,000 characters
- May contain HTML (sanitize before storage)

### Category
- Optional
- Must be one of: News, Updates, Events, Blog, Press Release
- Default: "News"

### Author
- Optional
- Max length: 100 characters
- Default: "Admin"

---

## Security Considerations

1. **Authentication**: All write operations require admin authentication
2. **File Validation**: Validate file types on server, not just extension
3. **File Size**: Enforce size limits server-side
4. **Sanitization**: Sanitize HTML content to prevent XSS
5. **Rate Limiting**: Implement rate limiting for file uploads
6. **CORS**: Configure appropriate CORS headers for file URLs

---

## Caching Recommendations

- **News List**: Cache for 5 minutes, invalidate on create/update/delete
- **Single Article**: Cache for 10 minutes (views count can be slightly stale)
- **CDN**: Serve images and videos through CDN for better performance

---

## Testing Checklist

- [ ] GET paginated news returns correct structure
- [ ] Pagination works correctly
- [ ] Search filters results properly
- [ ] Category filtering works
- [ ] Single article retrieval works
- [ ] Views counter increments
- [ ] Create news with all fields
- [ ] Create news with minimum fields (title, description)
- [ ] Image upload works
- [ ] Video upload works
- [ ] Thumbnail upload works
- [ ] Update existing news
- [ ] Delete news removes associated files
- [ ] Unauthorized users cannot create/edit/delete
- [ ] Non-admin users cannot create/edit/delete
- [ ] File type validation works
- [ ] File size validation works

---

## Frontend API Configuration

The frontend uses these endpoint constants:

```typescript
// src/config/API.ts
{
  NEWS_AND_BLOGS_GETPGN: "newsandblogs/pgn",
  NEWS_AND_BLOGS: "newsandblogs/"
}
```

All requests are prefixed with the base URL: `https://development.alabamarketplace.ng/backend/`
