# Resvo — Smart Scheduling Made Simple

Resvo is a multi-tenant scheduling platform that helps organizations manage shared meeting rooms and banquet/community halls. It eliminates double-bookings, manual back-and-forth coordination, and utilization blind spots by providing an intelligent, conflict-free booking experience.

## The Problem

Small organizations today manage shared rooms and halls using WhatsApp groups, spreadsheets, or verbal coordination. This consistently leads to:
- **Double bookings:** Two people believe they have the same room at the same time.
- **Manual back-and-forth:** Someone has to manually check and confirm availability.
- **Poor utilization visibility:** No one knows which rooms are overused or sitting idle.
- **Last-minute confusion:** Conflicts are discovered only when people physically show up.
- **No structured approval process:** Important bookings and casual ones are treated identically.

## Core Design Philosophy

**"Suggest. Never decide."**
The platform never automatically moves, cancels, or reassigns anyone's booking. Whenever a conflict is detected, it presents ranked, explainable alternatives — and a human (the member or the admin) always makes the final decision. This keeps the system simple to reason about and mirrors how real approval-based business systems are actually built.

## Key Features

- **Conflict-Free Booking:** Structural prevention of double-bookings using PostgreSQL exclusion constraints (`EXCLUDE USING gist`), making race conditions impossible regardless of backend concurrency.
- **Intelligent Recommendation Engine:** When a conflict occurs, a rule-based recommendation engine filters and ranks alternatives based on capacity fit, equipment match, location proximity, and utilization load balancing.
- **Explicit Booking Lifecycle:** Bookings move through defined states (Requested → Approved → Active → Completed/Rejected) modeled as a finite state machine.
- **Multi-Tenant Architecture:** Fully isolated workspaces for different organizations (e.g., housing societies, startups, coworking spaces).
- **Role-Based Access Control:** Distinct capabilities for Admins (manage rooms, approve bookings, view analytics) and Members (browse and request bookings).
- **Analytics Dashboard:** Actionable metrics including utilization percentage, peak booking hours, and frequently rejected requests.

## Technology Stack

- **Frontend:** Next.js + Tailwind CSS
- **Backend:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Deployment:** Docker, Vercel (frontend), Railway/Render (backend + DB)

## Why Resvo?

This is not just another booking app. It tackles legitimate engineering problems directly applicable to real-world software development:
- Interval-overlap conflict detection.
- Preventing race conditions using database-level constraints instead of application code.
- A weighted, explainable recommendation/ranking algorithm (deliberately chosen over an ML model for explainability and lack of initial training data).
- Relational schema design and indexing for a non-trivial domain.
- Multi-tenant data isolation and role-based authorization.
