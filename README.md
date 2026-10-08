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
- **Backend:** Node.js, Express, TypeScript (`tsx` runtime)
- **Database Engine:**
  - **Local Development / Out-of-the-Box:** File-persisted ACID transactional JSON database in `./data/hotel_data.json` with write-locking and atomic swapping. Zero external database daemon needed to clone and run immediately.
  - **Production Relational Database:** Full PostgreSQL schema provided in `src/server/db/schema.sql` (compatible with PostgreSQL, Supabase, Neon, AWS RDS, Google Cloud SQL).
- **Authentication:** Standard cryptographic PBKDF2/scrypt password hashing with HMAC-SHA256 JWT bearer sessions.

---

## 3. Project Structure

```
├── .env.example              # Environment variable template
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
npm install

# 2. Seed database (Initializes 65 rooms, 4 default roles, facilities, and settings)
npm run seed

# 3. Start development server (Port 3000)
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 5. Pre-Seeded Accounts & Role-Based Access Control (RBAC)

The system includes 3 hierarchical roles:

| Role | Email | Password | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **OWNER** | `owner@anabehotel.com` | `Owner@Anabe2026!` | Highest authority. Full financial metrics, user management, hotel settings, room creation/deletion beyond 65, facilities, gallery, activity audit logs. |
| **MANAGER** | `manager@anabehotel.com` | `Manager@Anabe2026!` | Operational control. Manages rooms, bookings, guest arrivals, facilities, and gallery. Cannot alter owner accounts or sensitive owner settings. |
| **RECEPTION (STAFF)** | `reception@anabehotel.com` | `Staff@Anabe2026!` | Front-desk operations. Manages guest bookings, walk-ins, check-in, and check-out queue. |
| **HOUSEKEEPING (STAFF)** | `housekeeping@anabehotel.com` | `Clean@Anabe2026!` | Floor-by-floor cleaning grid. Can toggle room status between `CLEANING`, `AVAILABLE`, and `MAINTENANCE`. |

*Note: On the `/admin/login` page, click any of the "Quick Login" buttons to test each role instantly.*

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

## 7. Connecting a Production PostgreSQL Database

To migrate from the default local JSON database to a PostgreSQL instance (Supabase, Neon, AWS RDS, Cloud SQL):

1. Run the migration script in `src/server/db/schema.sql`:
   ```bash
   psql -h <HOST> -U <USER> -d <DB_NAME> -f src/server/db/schema.sql
   ```
2. Configure `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:5432/<DB_NAME>"
   ```

---

## 8. WhatsApp Direct Booking Workflow

Upon booking submission:
1. The server atomically validates availability and creates the booking record with status `PENDING` and a unique reference (e.g. `ANB-YYYYMMDD-XXXX`).
2. The user is redirected/prompted with a pre-filled WhatsApp click-to-chat message to the official ANABE HOTEL lines:
   - Primary: `https://wa.me/250788845520?text=...` (`0788 845 520`)
   - Secondary: `https://wa.me/250783218170?text=...` (`0783 218 170`)
3. The guest taps "Send" in WhatsApp to deliver the exact reservation details directly to ANABE HOTEL reception for confirmation.

---

## 9. Payment Gateway Integration (Future-Ready Architecture)

The system records all payment fields in the database:
- `paymentStatus`: `PAYMENT_PENDING`, `PAID`, `PARTIAL`, `REFUNDED`
- `paymentMethod`: `MTN MoMo`, `Airtel Money`, `Bank / Card`, `Cash at Front Desk`
- `transactionReference`, `amountPaid`, `paidAt`

To connect real MTN MoMo or Airtel Money webhooks later:
1. Provide API credentials in your environment (`MTN_MOMO_API_KEY`, `MTN_MOMO_PRIMARY_KEY`).
2. Add your webhook handler in `src/server/api.ts` under `/api/payments/webhook`.

---

## 10. Opening and Continuing in VS Code

You can export or download the entire repository as a folder or ZIP file:
1. Download or clone the folder.
2. Open with VS Code: `code .`
3. Run `npm install && npm run dev`
4. The codebase contains no proprietary dependencies or locked runtimes—it is standard React 19, TypeScript, and Express.
