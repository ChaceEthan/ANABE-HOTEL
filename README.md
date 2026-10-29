# ANABE HOTEL — Full-Stack Hotel Website & Property Management System (PMS)

A production-quality hotel guest portal, real-time booking engine, and role-based property management system (PMS) designed for **ANABE HOTEL**.

---

## 1. Project Overview

- **Hotel Name:** ANABE HOTEL
- **Direct Owner Contact Lines:** `0788 845 520` · `0783 218 170`
- **Room Capacity:** 65 initial rooms across 4 floors, dynamically expandable via the Admin Dashboard.
- **Hotel Facilities:**
  - Outdoor Swimming Pool & Solarium
  - High-Speed Elevators
  - Central Escalators
  - 65 Private Accommodation Rooms & Suites
  - Expandable facility management via Owner/Manager dashboards

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend:** Node.js, Express, TypeScript (`tsx` runtime), esbuild
- **Database Engine:**
  - **Production:** Live Neon PostgreSQL database with connection pooling, SSL, automated schema migrations, and concurrency locks (`src/server/db/postgres.ts`).
  - **Local/Fallback:** File-persisted JSON database (`data/hotel_data.json`) that continuously syncs with PostgreSQL.
- **Image & Media Storage:** Cloudinary cloud storage (`src/server/cloudinary.ts`) for room photos and public gallery uploads with local disk fallback (`src/server/mediaStorage.ts`).
- **Authentication:** Scrypt password hashing with HMAC-SHA256 JWT sessions and strict role-based access control (OWNER, MANAGER, STAFF).
- **Deployment Targets:** Backend configured for Render (`render.yaml`), Frontend configured for Vercel (`vercel.json`).

The frontend and backend currently run from one root package: Express mounts Vite in development and serves its build in production. They have not been moved into separate packages because this workspace has no Git metadata and differs from the current remote branch; a directory migration here cannot be safely reconciled with local-only changes.

---

## 3. Project Structure

```
├── .env                      # Local values (ignored by Git)
├── .env.example              # Safe environment template
├── public/logo/              # ANABE HOTEL monochrome SVG logo and favicon
├── index.html                # Entry point with SEO and Google Fonts
├── metadata.json             # Applet metadata
├── package.json              # Full stack dependencies and scripts
├── server.ts                 # Express server mounting Vite & API router
├── tsconfig.json             # TypeScript compiler configuration
├── vite.config.ts            # Vite bundler configuration
│
├── data/
│   └── hotel_data.json       # Persisted database records (auto-created on first run)
│
├── src/
│   ├── assets/
│   │   └── images/           # High-resolution architectural & room photography
│   ├── components/
│   │   ├── Navbar.tsx        # Top Bar Contract navigation
│   │   ├── Footer.tsx        # Footer with owner contact lines
│   │   ├── QuickBookingBar.tsx # Instant availability search bar
│   │   └── BookingLookupModal.tsx # Guest reservation reference finder
│   ├── lib/
│   │   └── api.ts            # Type-safe frontend API client
│   ├── pages/
│   │   ├── HomePage.tsx      # Public landing page with hero, bento, and contact
│   │   ├── RoomsPage.tsx     # Rooms browser with real-time date availability badges
│   │   ├── RoomDetailsModal.tsx # Room gallery, specs, and amenities
│   │   ├── BookingPage.tsx   # 5-step booking flow with double-booking prevention
│   │   ├── FacilitiesPage.tsx # Swimming pool, escalators, and elevators overview
│   │   ├── GalleryPage.tsx   # Categorized photo gallery with lightbox
│   │   ├── AboutPage.tsx     # Hotel narrative and core values
│   │   ├── ContactPage.tsx   # Direct owner numbers and inquiry form
│   │   └── admin/
│   │       ├── AdminLoginPage.tsx # Staff/Manager/Owner login with quick demo roles
│   │       └── AdminDashboard.tsx # Comprehensive PMS dashboard with RBAC
│   ├── server/
│   │   ├── api.ts            # REST endpoints for public and admin features
│   │   ├── auth.ts           # Password hashing & JWT token verification
│   │   ├── seed.ts           # Standalone database seed script
│   │   └── db/
│   │       ├── database.ts   # Database CRUD, transactions, and date overlap math
│   │       └── schema.sql    # PostgreSQL relational schema for production
│   └── types/
│       └── hotel.ts          # Shared TypeScript interfaces
```

---

## 4. How to Run Locally

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation & Startup
```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Create local environment configuration
Copy-Item .env.example .env
# Set JWT_SECRET in .env to a private random value of at least 32 bytes.

# 3. Seed database (initializes rooms, users, facilities, and settings)
npm run seed

# 4. Start the integrated development server (Port 3000)
npm run dev
```

Open your browser at `http://localhost:3000`.
The server loads root `.env` for backend settings and the seed command. `VITE_APP_URL` is public metadata configuration; never put secrets under a `VITE_` name.

---

## 5. Pre-Seeded Accounts & Role-Based Access Control (RBAC)

The system supports OWNER, MANAGER, and STAFF roles with server-side permissions. Seeded development accounts use known demo credentials in the source and must be replaced or disabled before deployment. Do not use the quick-login workflow or seeded passwords on a public production instance.

---

## 6. How Double-Booking Prevention Works

The reservation engine enforces strict date overlap mathematics on the server before confirming any booking:

A requested date range `[ReqCheckIn, ReqCheckOut)` overlaps with an existing booking `[BookCheckIn, BookCheckOut)` if and only if:
$$\text{BookCheckIn} < \text{ReqCheckOut} \quad\text{AND}\quad \text{BookCheckOut} > \text{ReqCheckIn}$$

### Example:
- **Client A** reserves Room 204 from `10 October` to `15 October`.
- **Client B** searching `12 October` to `14 October` sees Room 204 flagged as **`BOOKED for Selected Dates`** and the server rejects any attempt to double-book it.
- **Client C** searching `16 October` to `20 October` sees Room 204 as **`Available for Dates`**.
- Standard same-day turnovers (e.g. check-out on the 10th morning, check-in on the 10th afternoon) are supported seamlessly.

---

## 7. Database, Media, and Logo

- **Neon PostgreSQL Database:** When `DATABASE_URL` is set, the application automatically connects via a pooled SSL client (`src/server/db/postgres.ts`), executes schema verification and table creation (`schema.sql`), and handles bookings with row-level transaction locks (`FOR UPDATE`). When running without a database URL, it falls back cleanly to persistent JSON storage.
- **Cloudinary Image Storage:** High-resolution room photography and public gallery uploads are routed through Cloudinary when `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are present (`src/server/cloudinary.ts`). If unconfigured, uploads fall back safely to local storage or reject oversized buffers.
- **Brand Assets:** Premium SVG logo assets and favicons are stored in `public/logo/` (`/logo/anabe-hotel-logo.svg`, `/logo/anabe-hotel-header.svg`, `/logo/anabe-hotel-monogram.svg`, `/logo/favicon.svg`) and root `/favicon.ico`.

---

## 8. WhatsApp Direct Booking Workflow

Upon booking submission:
1. The server atomically validates availability and creates the booking record with status `PENDING` and a unique reference (e.g. `ANB-YYYYMMDD-XXXX`).
2. The user is redirected/prompted with a pre-filled WhatsApp click-to-chat message to the official ANABE HOTEL lines:
   - Primary: `https://wa.me/250788845520?text=...` (`0788 845 520`)
   - Secondary: `https://wa.me/250783218170?text=...` (`0783 218 170`)
3. The guest taps "Send" in WhatsApp to deliver the exact reservation details directly to ANABE HOTEL reception for confirmation.

---

## 9. Testing & Quality Assurance

Run the comprehensive integration test suite:
```bash
npm test
```
The test suite (`scripts/test_suite.js`) validates:
1. System health check (`GET /health`)
2. Hotel settings (`GET /api/settings`)
3. Facilities catalog (`GET /api/facilities`)
4. 65 Rooms inventory and pagination (`GET /api/rooms`)
5. Room date-availability query (`GET /api/rooms/availability`)
6. Authentication & role verification (Owner, Manager, Staff)
7. RBAC permissions (staff cannot access owner-only user administration)
8. Double-booking prevention (overlapping reservation rejected with 400 error)
9. Guest reservation lookup by reference (`GET /api/bookings/lookup?reference=...`)

---

## 10. Build & Cloud Deployment

### TypeScript Typecheck & Linting
```bash
npm run lint
```

### Full Production Build
```bash
npm run build
```
Builds the Vite client to `dist/` and compiles the Node.js server to `dist/server.js` using esbuild.

### Render Deployment (Backend Web Service)
1. Link repository to Render.
2. Select **Web Service** or use the included `render.yaml` blueprint.
3. Build command: `npm install --legacy-peer-deps && npm run build`
4. Start command: `npm start`
5. Set environment variables: `NODE_ENV=production`, `PORT=10000`, `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `FRONTEND_URL`.

### Vercel Deployment (Frontend SPA)
1. Import repository to Vercel.
2. Build command: `vite build`
3. Output directory: `dist`
4. Uses `vercel.json` for SPA routing rewrites.
5. Set environment variable: `VITE_API_URL=https://anabe-hotel.onrender.com`

---

## 11. Opening and Continuing in VS Code

You can export or download the entire repository as a folder or ZIP file:
1. Download or clone the folder.
2. Open with VS Code: `code .`
3. Follow the environment setup above, then run `npm run dev`
4. The codebase contains no proprietary dependencies or locked runtimes—it is standard React 19, TypeScript, and Express.
