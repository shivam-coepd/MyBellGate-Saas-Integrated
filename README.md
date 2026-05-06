# Greenwood Heights — Society Management Platform

## Overview
A production-ready, full-stack Society Management SaaS application built with **Hono** (backend) and vanilla JavaScript SPA (frontend), deployed on Cloudflare Workers/Pages.

## Live App
- **URL**: https://3000-i1o43li1tdftfzz5e156j-5c13a017.sandbox.novita.ai
- **Status**: ✅ Running

## Demo Login Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 🛡️ Admin | admin@greenwood.com | admin123 | Full dashboard + all modules |
| 👮 Guard | guard@greenwood.com | guard123 | Security panel + visitor log |
| 🏠 Resident | priya@greenwood.com | resident123 | Personal portal (Flat A-101) |

## Features Implemented

### 🔐 Authentication
- Email + Password login with JWT-like session tokens
- Role-based access control (Admin / Guard / Resident)
- Session persistence via localStorage
- Smooth login with role-selector UI

### 📊 Admin Dashboard
- Real-time stat cards (residents, visitors, complaints, revenue)
- Chart.js bar chart (weekly visitor traffic)
- Chart.js doughnut chart (complaint category breakdown)
- Recent visitors activity feed
- Recent complaints overview
- Active notices summary

### 👮 Security Panel (Guard Dashboard)
- Inline visitor logging form (name, phone, flat, purpose, vehicle)
- One-click Direct Entry or Request Approval
- Live pending approvals queue with Approve/Reject
- Today's visitor log with Exit logging
- Real-time gate management UI optimized for tablets

### 🏠 Resident Dashboard
- Personal visitor history
- Notices overview
- Quick stats (bills, complaints)
- Pre-approve visitor flow

### 👥 Visitor Management
- Log walk-in visitors
- Pre-approved visitor bypass
- Approve / Reject / Exit workflow
- Search & filter by status, flat, date
- Full visitor history with timestamps

### 🏢 Flat & Resident Management
- Visual flat card grid with block/floor/type info
- Owner vs Tenant tagging
- Vehicle info display
- Add/Edit/Delete flats
- Add/Edit/Delete residents
- Filter by block, status
- Occupancy tracking

### 📋 Complaint Helpdesk
- Raise complaints with category + priority
- 7 categories: Plumbing, Electrical, Security, Cleaning, Parking, Lift, Other
- Status tracking: Open → In Progress → Resolved → Closed
- Admin assignment system
- Comment thread on each complaint
- Filter by status, category, search

### 📢 Notice Board
- Post notices with category + priority (Urgent / Important / Normal)
- Residents acknowledge notices
- Filter by priority tabs
- Full notice detail modal

### 💰 Maintenance Billing
- Revenue & pending stats
- Generate monthly bills for all occupied flats
- Automatic parking charge detection
- Record payments (UPI, Net Banking, Cash, etc.)
- Bill status: Paid / Unpaid / Overdue
- Filter by month, status

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Hono v4 (TypeScript) |
| Frontend | Vanilla JavaScript SPA |
| Styling | Custom CSS Design System |
| Charts | Chart.js v4 |
| Icons | Font Awesome 6 |
| Fonts | Inter + Poppins (Google Fonts) |
| Runtime | Cloudflare Workers |
| Dev Server | Wrangler + Vite |

## API Endpoints

```
POST /api/auth/login           - Login
POST /api/auth/logout          - Logout
GET  /api/auth/me              - Get current user

GET  /api/dashboard/stats      - Dashboard statistics
GET  /api/dashboard/recent-activity - Recent activity

GET/POST /api/residents        - Resident list / add
GET/PUT/DELETE /api/residents/:id - Manage residents
GET/POST /api/residents/flats/all - Flat list / add
PUT/DELETE /api/residents/flats/:id - Manage flats

GET/POST /api/visitors         - Visitor list / add
GET /api/visitors/today        - Today's visitors
GET /api/visitors/pending      - Pending approvals
PUT /api/visitors/:id/approve  - Approve visitor
PUT /api/visitors/:id/reject   - Reject visitor
PUT /api/visitors/:id/exit     - Log exit

GET/POST /api/complaints       - Complaint list / raise
PUT /api/complaints/:id        - Update status/assign
POST /api/complaints/:id/comments - Add comment

GET/POST /api/notices          - Notice list / post
POST /api/notices/:id/acknowledge - Acknowledge notice

GET/POST /api/billing          - Bill list / info
GET /api/billing/stats         - Revenue stats
POST /api/billing/generate     - Generate monthly bills
PUT /api/billing/:id/pay       - Record payment
```

## Data Seed (Pre-loaded)
- **8 Residents** (6 active with flats, realistic Indian names)
- **8 Flats** (Blocks A/B/C, 1BHK-3BHK mix, 6 occupied / 2 vacant)
- **7 Visitors** (Mix of statuses: pending, approved, rejected, exited)
- **5 Complaints** (Various categories and priorities)
- **4 Notices** (AGM, water interruption, billing, event)
- **8 Bills** (April + March, mix of paid/unpaid/overdue)

## Project Structure
```
webapp/
├── src/
│   ├── index.tsx          # Main Hono app + static serving
│   ├── data/
│   │   └── store.ts       # In-memory data store + seed data
│   └── routes/
│       ├── auth.ts        # Authentication
│       ├── residents.ts   # Residents + Flats CRUD
│       ├── visitors.ts    # Visitor management
│       ├── complaints.ts  # Complaint helpdesk
│       ├── notices.ts     # Notice board
│       ├── billing.ts     # Maintenance billing
│       └── dashboard.ts   # Dashboard analytics
├── public/static/
│   ├── style.css          # 1500+ line CSS design system
│   └── app.js             # 2500+ line SPA frontend
├── ecosystem.config.cjs   # PM2 configuration
├── wrangler.jsonc          # Cloudflare Pages config
├── vite.config.ts         # Vite build config
└── package.json
```

## Deployment

### Local Dev
```bash
npm run build
pm2 start ecosystem.config.cjs
```

### Cloudflare Pages
```bash
npm run build
npx wrangler pages deploy dist --project-name greenwood-society
```

## Last Updated
April 2024 — Initial production build
