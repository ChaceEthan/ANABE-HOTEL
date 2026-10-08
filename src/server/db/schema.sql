-- ==============================================================================
-- ANABE HOTEL Database Schema (PostgreSQL)
-- Compatible with PostgreSQL 13+, Supabase, AWS RDS, Neon, or Cloud SQL
-- ==============================================================================

-- 1. Users & RBAC
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('OWNER', 'MANAGER', 'STAFF')),
    permissions JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 2. Hotel Settings (Single-Row configuration)
CREATE TABLE IF NOT EXISTS hotel_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'primary',
    hotel_name VARCHAR(255) NOT NULL DEFAULT 'ANABE HOTEL',
    phone_1 VARCHAR(64) NOT NULL DEFAULT '0788 845 520',
    phone_2 VARCHAR(64) NOT NULL DEFAULT '0783 218 170',
    email VARCHAR(255) DEFAULT 'contact@anabehotel.com',
    address TEXT DEFAULT 'Kigali, Rwanda',
    city VARCHAR(128) DEFAULT 'Kigali',
    country VARCHAR(128) DEFAULT 'Rwanda',
    description TEXT,
    check_in_time VARCHAR(16) DEFAULT '14:00',
    check_out_time VARCHAR(16) DEFAULT '11:00',
    currency VARCHAR(16) DEFAULT 'RWF',
    currency_symbol VARCHAR(8) DEFAULT 'FRw',
    cancellation_policy TEXT,
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Room Types
CREATE TABLE IF NOT EXISTS room_types (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL,
    max_guests INT NOT NULL DEFAULT 2,
    default_amenities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Rooms
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(64) PRIMARY KEY,
    room_number VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type_id VARCHAR(64) REFERENCES room_types(id) ON DELETE RESTRICT,
    description TEXT,
    price_per_night NUMERIC(12, 2) NOT NULL,
    max_guests INT NOT NULL DEFAULT 2,
    floor INT NOT NULL DEFAULT 1,
    status VARCHAR(32) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BOOKED', 'CHECKED_IN', 'CLEANING', 'MAINTENANCE', 'OUT_OF_SERVICE')),
    amenities JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    booking_reference VARCHAR(64) UNIQUE NOT NULL,
    room_id VARCHAR(64) REFERENCES rooms(id) ON DELETE RESTRICT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT NOT NULL,
    guests_count INT NOT NULL DEFAULT 1,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(64) NOT NULL,
    special_requests TEXT,
    price_per_night NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW')),
    payment_status VARCHAR(32) DEFAULT 'PAYMENT_PENDING' CHECK (payment_status IN ('PAYMENT_PENDING', 'PAID', 'PARTIAL', 'REFUNDED')),
    payment_method VARCHAR(64),
    transaction_reference VARCHAR(128),
    amount_paid NUMERIC(12, 2) DEFAULT 0,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (check_out > check_in)
);

-- 6. Facilities
CREATE TABLE IF NOT EXISTS facilities (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT,
    icon VARCHAR(64) DEFAULT 'Sparkles',
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE')),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Gallery
CREATE TABLE IF NOT EXISTS gallery (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    caption TEXT,
    category VARCHAR(64) NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    user_name VARCHAR(255),
    user_role VARCHAR(32),
    action VARCHAR(128) NOT NULL,
    details TEXT,
    resource_type VARCHAR(64),
    resource_id VARCHAR(64),
    ip VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'NEW' CHECK (status IN ('NEW', 'REPLIED', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Critical Overlap Index for Double-Booking Prevention Query Optimization
CREATE INDEX IF NOT EXISTS idx_bookings_overlap
ON bookings (room_id, check_in, check_out)
WHERE status NOT IN ('CANCELLED');

CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms (status);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings (booking_reference);
