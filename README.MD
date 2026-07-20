# 🏰 Resvo

> **A Verified Banquet Hall Booking Marketplace**

**🔗 Live Deployment:** [https://resvo-wine.vercel.app/](https://resvo-wine.vercel.app/)

Resvo is a verified banquet hall booking marketplace. Hall owners list their venues, a platform admin reviews and approves each one before it goes live, and the public can then discover and book halls directly, with strict database-level guarantees that no hall can ever be double-booked.

---

## 🎯 Project Overview

Resvo is a deliberately-scoped marketplace for booking banquet halls. The engineering value of this project focuses on doing three things perfectly:
1. A trustworthy, multi-role approval layer.
2. A database structure that makes double-booking impossible.
3. A caching/rate-limiting layer that mirrors real, high-scale production systems.

### MVP Scope
- **One resource type**: Banquet Halls only.
- **Three roles**: Super Admin, Organization Admin, Normal User.
- **One core flow**: list → verify → discover → request → approve/reject → complete.
- **One booking guarantee**: Enforced natively by the database, not application code.
- **One resolution mechanism**: Rule-based alternatives offered upon conflicting requests (requires explicit user acceptance).

---

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: Next.js (Browse/search UI, booking flow, three distinct role-based dashboards)
- **API Layer**: Express (Node.js) (Auth, middleware, rate limiting, approval logic, suggestion cascade)
- **Primary Database**: PostgreSQL (Exclusion constraints and row-level security)
- **Cache / Ephemeral Store**: Redis (Hall/search caching, OTP storage, sliding-window rate limiting)
- **Cloud Infrastructure**: Vercel (Frontend), Render (Backend API), Neon (Serverless Postgres), Upstash (Serverless Redis)

### Request Path Example
- **Browsing halls**: Next.js → Express → Redis *(cache hit)* → Postgres *(on miss)*.
- **Submitting a booking**: Next.js → Express *(rate-limit check)* → Postgres insert.
- **Org Admin approving**: Express → Postgres transaction → exclusion constraint check → success or conflict cascade.

---

## ⚙️ Core Technical Features

### 1. The Exclusion Constraint (Double-Booking Prevention)
The centerpiece of the booking guarantee is a PostgreSQL exclusion constraint:
```sql
EXCLUDE USING GIST (
  hall_id WITH =,
  time_range WITH &&
) WHERE (status IN ('approved','active'))
```
This guarantees atomically at the database layer that two simultaneous approval attempts for overlapping time ranges cannot both succeed, avoiding race conditions inherent to application-level checks.

### 2. Multi-Tenancy & Row-Level Security
PostgreSQL Row-Level Security (RLS) enforces isolation between different hall owners at the database layer. This ensures that one missed `WHERE` filter in an API endpoint doesn't leak booking data to another organization's admin.

### 3. Rule-Based Suggestion Engine
When a booking hits a conflict, a deterministic suggestion engine runs rather than instantly rejecting the request:
1. **Rule 1**: Same Hall, Free Time, Same Day.
2. **Rule 2**: Same Hall, Nearby Dates, Same Time.
3. **Rule 3 (Last Resort)**: Similar Halls, Same Date & Time (Requires tier match and tight capacity band).

*"Suggest, never decide"* — the system never silently reassigns a user; every alternative requires explicit user acceptance.

### 4. Redis Layer (Cache & Ephemeral State)
Redis is never the source of truth and is strictly used for:
- **Caching Hall Listings**: High-traffic read paths (home page, searches) with a 5-minute TTL.
- **OTP Storage**: Short-lived verification codes without polluting the permanent database.
- **Sliding-Window Rate Limiting**: Preventing credential stuffing, spam, and API abuse using Redis sorted sets for accurate window tracking.

---
*Built to redefine venue booking reliability and aesthetics.*