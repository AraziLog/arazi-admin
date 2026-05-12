# Arazi Logistics — React Admin Dashboard

A full-featured admin dashboard that mirrors the Wanhub interface.
Connects to your WordPress site via the Arazi Logistics REST API.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env — set VITE_WP_URL to your WordPress site URL
npm run dev       # Development server on http://localhost:3001
npm run build     # Production build → dist/
```

## Pages
- **Dashboard** — Stats, growth charts, revenue trends, location breakdown
- **Shipments** — Full table with search, filters, edit modal, carrier sync
- **Quotes** — Quote requests with respond-with-price workflow
- **Calculator** — Shipping rate estimator (sea/air/express/last-mile + GCT)
- **Carriers** — API slot status overview
- **Webhooks** — Live ShipAve/ShipBiz event log

## Authentication
Uses WordPress Application Passwords.
1. Log in with your WP username/password (one-time, establishes identity)
2. Enter your Application Password (WP Admin → Profile → Application Passwords)
3. Credentials stored in localStorage for the session

## Deploy
Build produces a static `dist/` folder — deploy to any static host:
- Netlify, Vercel, Cloudflare Pages (free)
- Or serve from your WordPress hosting under a subdirectory

## API Base
All calls go to: `{VITE_WP_URL}/wp-json/arazi/v1`
