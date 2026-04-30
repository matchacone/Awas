# AWAS

## Project Overview

**AWAS** is a community-driven water outage monitoring application inspired by Waze.  
Instead of traffic data, AWAS focuses on **real-time reporting and visualization of water outages and shortages**.

The core idea is simple:  
Users report outages → data is aggregated → a **heatmap visualizes affected areas**.

---

## MVP Scope

The Minimum Viable Product (MVP) includes:

### 1. Outage Reporting
Users can submit reports indicating:
- Location (via map or GPS)
- Type: outage or low pressure
- Optional description  

Reports are stored and processed in real-time (or near real-time).

---

### 2. Heatmap Visualization
- Reports are converted into a **GeoJSON dataset**
- Displayed using **Google Maps API Heatmap Layer**
- Areas with more reports = higher intensity (hotter zones)

---

### 3. Announcements Feed
Display official updates from **Metropolitan Cebu Water District (MCWD)**.

Sources:
- Manually input (admin panel)
- Scraped/API-based (future improvement)

---

## Core Features

### Reporting System
- Lightweight form submission
- Prevent spam (rate limiting / validation)
- Timestamp all reports

### Map System
- Google Maps API integration
- Heatmap overlay using GeoJSON
- Dynamic updates based on latest reports

### Announcement System
- Centralized feed
- Sorted by most recent
- Tagged by urgency (optional)

---

## Future Features (Planned)

### Subscription Model

Premium features may include:
- Real-time push notifications
- Personalized alerts (based on saved locations)
- Historical outage analytics
- Priority visibility for reports

---

### Smart Insights
- Predict outage-prone areas
- Trend analysis using historical data

---

### Verification System
- Upvote/downvote reports
- Trust score for users

## Architecture

This project follows a **feature-based architecture**.

## Database Schema

The system uses a relational database to manage users, outage reports, interactions, and discussions.

---

### 1. `api_user`
Stores user account information.

| Column        | Type        | Description |
|--------------|------------|------------|
| id           | int8 (PK)   | Unique user ID |
| username     | varchar     | Unique username |
| password     | varchar     | Hashed password |
| email        | varchar     | User email |
| first_name   | varchar     | First name |
| last_name    | varchar     | Last name |
| is_superuser | bool        | Admin privileges |
| is_staff     | bool        | Staff role |
| is_active    | bool        | Account status |
| last_login   | timestamptz | Last login timestamp |
| date_joined  | timestamptz | Registration date |
| created_at   | timestamptz | Record creation timestamp |

---

### 2. `api_outagereport`
Stores reported water outages and issues.

| Column       | Type        | Description |
|-------------|------------|------------|
| id          | int4 (PK)   | Unique report ID |
| location    | varchar     | Text-based location |
| description | text        | Optional details |
| issuetype   | varchar     | (e.g., outage, low pressure) |
| latitude    | float8      | Latitude coordinate |
| longitude   | float8      | Longitude coordinate |
| created_at  | timestamptz | Report timestamp |
| reporter_id | int8 (FK)   | References `api_user.id` |

---

### 3. `api_comment`
Stores comments on outage reports.

| Column       | Type        | Description |
|-------------|------------|------------|
| id          | int8 (PK)   | Unique comment ID |
| description | text        | Comment content |
| created_at  | timestamptz | Timestamp |
| user_id     | int8 (FK)   | References `api_user.id` |
| outage_id   | int4 (FK)   | References `api_outagereport.id` |

---

### 4. `api_reaction`
Stores user reactions (e.g., upvote/downvote).

| Column         | Type        | Description |
|---------------|------------|------------|
| id            | int8 (PK)   | Unique reaction ID |
| reaction_type | varchar     | Type (e.g., upvote, downvote) |
| created_at    | timestamptz | Timestamp |
| outage_id     | int4 (FK)   | References `api_outagereport.id` |
| user_id       | int8 (FK)   | References `api_user.id` |
| comment_id    | int8 (FK)   | References `api_comment.id` (optional) |

---

## Relationships

- **User → Outage Reports**: One-to-Many  
  A user can create multiple outage reports.

- **User → Comments**: One-to-Many  
  A user can post multiple comments.

- **Outage Report → Comments**: One-to-Many  
  Each report can have multiple comments.

- **User → Reactions**: One-to-Many  
  A user can react to multiple reports/comments.

- **Outage Report / Comment → Reactions**: One-to-Many  
  Reactions can be tied to either a report or a comment.

---

## Notes & Design Considerations

- `latitude` and `longitude` enable **heatmap visualization**.
- `reaction_type` supports future expansion (e.g., “confirmed”, “resolved”).
- `comment_id` in reactions is optional, allowing reactions on either:
  - a report OR
  - a comment
- Recommended indexes:
  - `created_at`
  - `latitude`, `longitude`
  - foreign keys (`user_id`, `outage_id`)

### Key Principle
Code is organized by **feature/domain**, not by file type.