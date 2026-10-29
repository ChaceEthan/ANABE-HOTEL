import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import type {
  User,
  HotelSettings,
  RoomType,
  Room,
  Booking,
  Facility,
  GalleryItem,
  ActivityLog,
  ContactMessage,
} from '../../types/hotel.ts';

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;
let isMigrated = false;

export function getPostgresPool(): pg.Pool | null {
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) return null;

  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
      max: 10,
    });

    poolInstance.on('error', (err) => {
      console.error('[ANABE HOTEL] Unexpected idle PostgreSQL client error:', err.message);
    });
  }

  return poolInstance;
}

export async function testPostgresConnection(): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out after 25s')), 25000)
    );
    const queryPromise = pool.query('SELECT NOW() AS current_time');
    const res = await Promise.race([queryPromise, timeoutPromise]);
    return Boolean(res.rows[0]?.current_time);
  } catch (err: any) {
    console.warn('[ANABE HOTEL] PostgreSQL connection probe notice:', err.message);
    return false;
  }
}

export async function runPostgresMigrations(): Promise<void> {
  if (isMigrated) return;
  const pool = getPostgresPool();
  if (!pool) return;

  const schemaPath = path.resolve(process.cwd(), 'src/server/db/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.warn('[ANABE HOTEL] schema.sql not found at', schemaPath);
    return;
  }

  const sql = fs.readFileSync(schemaPath, 'utf-8');
  const client = await pool.connect();
  try {
    await client.query(sql);
    isMigrated = true;
    console.log('[ANABE HOTEL] PostgreSQL schema & indexes verified/migrated successfully.');
  } finally {
    client.release();
  }
}

export async function loadPostgresData(): Promise<{
  users: (User & { passwordHash: string })[];
  hotelSettings: HotelSettings;
  roomTypes: RoomType[];
  rooms: Room[];
  bookings: Booking[];
  facilities: Facility[];
  gallery: GalleryItem[];
  activityLogs: ActivityLog[];
  contactMessages: ContactMessage[];
} | null> {
  const pool = getPostgresPool();
  if (!pool) return null;

  try {
    await runPostgresMigrations();

    const [
      usersRes,
      settingsRes,
      typesRes,
      roomsRes,
      bookingsRes,
      facilitiesRes,
      galleryRes,
      logsRes,
      messagesRes,
    ] = await Promise.all([
      pool.query('SELECT * FROM users ORDER BY created_at ASC'),
      pool.query('SELECT * FROM hotel_settings WHERE id = $1', ['primary']),
      pool.query('SELECT * FROM room_types ORDER BY created_at ASC'),
      pool.query('SELECT * FROM rooms ORDER BY room_number ASC'),
      pool.query('SELECT * FROM bookings ORDER BY created_at DESC'),
      pool.query('SELECT * FROM facilities ORDER BY display_order ASC, created_at ASC'),
      pool.query('SELECT * FROM gallery ORDER BY display_order DESC, created_at DESC'),
      pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 500'),
      pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC'),
    ]);

    // If database has no rooms yet, return null to trigger safe initial seeding
    if (roomsRes.rowCount === 0) {
      return null;
    }

    const users = usersRes.rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      passwordHash: r.password_hash,
      role: r.role,
      permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions || [],
      status: r.status,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : undefined,
    }));

    const settingsRow = settingsRes.rows[0];
    const hotelSettings: HotelSettings = settingsRow
      ? {
          hotelName: settingsRow.hotel_name,
          phone1: settingsRow.phone_1,
          phone2: settingsRow.phone_2,
          email: settingsRow.email,
          address: settingsRow.address,
          city: settingsRow.city,
          country: settingsRow.country,
          description: settingsRow.description,
          checkInTime: settingsRow.check_in_time,
          checkOutTime: settingsRow.check_out_time,
          currency: settingsRow.currency,
          currencySymbol: settingsRow.currency_symbol,
          cancellationPolicy: settingsRow.cancellation_policy,
          logoUrl: settingsRow.logo_url || '',
        }
      : {
          hotelName: 'ANABE HOTEL',
          phone1: '0788 845 520',
          phone2: '0783 218 170',
          email: 'owneranabehotel@gmail.com',
          address: 'KG 15 Avenue, Luxury Boulevard',
          city: 'Kigali',
          country: 'Rwanda',
          description: 'Premier hospitality destination featuring 65 rooms, swimming pool, elevators, and escalators.',
          checkInTime: '14:00',
          checkOutTime: '11:00',
          currency: 'RWF',
          currencySymbol: 'FRw',
          cancellationPolicy: 'Free cancellation up to 48 hours prior to check-in.',
          logoUrl: '',
        };

    const roomTypes: RoomType[] = typesRes.rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      basePrice: Number(r.base_price),
      maxGuests: Number(r.max_guests),
      defaultAmenities: typeof r.default_amenities === 'string' ? JSON.parse(r.default_amenities) : r.default_amenities || [],
    }));

    const rooms: Room[] = roomsRes.rows.map((r) => {
      const type = roomTypes.find((t) => t.id === r.type_id);
      return {
        id: r.id,
        roomNumber: r.room_number,
        name: r.name,
        typeId: r.type_id,
        typeName: type ? type.name : 'Standard Room',
        description: r.description || '',
        pricePerNight: Number(r.price_per_night),
        maxGuests: Number(r.max_guests),
        floor: Number(r.floor),
        status: r.status,
        amenities: typeof r.amenities === 'string' ? JSON.parse(r.amenities) : r.amenities || [],
        images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images || [],
        featured: Boolean(r.featured),
      };
    });

    const bookings: Booking[] = bookingsRes.rows.map((r) => {
      const room = rooms.find((rm) => rm.id === r.room_id);
      return {
        id: r.id,
        bookingReference: r.booking_reference,
        roomId: r.room_id,
        roomNumber: room ? room.roomNumber : '',
        roomName: room ? room.name : '',
        typeName: room ? room.typeName : '',
        checkIn: typeof r.check_in === 'object' ? r.check_in.toISOString().slice(0, 10) : String(r.check_in).slice(0, 10),
        checkOut: typeof r.check_out === 'object' ? r.check_out.toISOString().slice(0, 10) : String(r.check_out).slice(0, 10),
        nights: Number(r.nights),
        guestsCount: Number(r.guests_count),
        guestName: r.guest_name,
        guestEmail: r.guest_email,
        guestPhone: r.guest_phone,
        specialRequests: r.special_requests || undefined,
        pricePerNight: Number(r.price_per_night),
        totalPrice: Number(r.total_price),
        status: r.status,
        paymentStatus: r.payment_status,
        paymentMethod: r.payment_method,
        transactionReference: r.transaction_reference,
        amountPaid: Number(r.amount_paid || 0),
        paidAt: r.paid_at ? new Date(r.paid_at).toISOString() : undefined,
        notes: r.notes || undefined,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    });

    const facilities: Facility[] = facilitiesRes.rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      image: r.image || '',
      icon: r.icon || 'Sparkles',
      status: r.status,
      displayOrder: Number(r.display_order || 0),
    }));

    const gallery: GalleryItem[] = galleryRes.rows.map((r) => ({
      id: r.id,
      title: r.title,
      caption: r.caption || '',
      description: r.description || r.caption || '',
      category: r.category,
      imageUrl: r.image_url,
      mediaType: r.media_type || 'IMAGE',
      altText: r.alt_text || r.title,
      published: r.published ?? true,
      storageKey: r.storage_key || undefined,
      displayOrder: Number(r.display_order || 0),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));

    const activityLogs: ActivityLog[] = logsRes.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userRole: r.user_role,
      action: r.action,
      details: r.details,
      resourceType: r.resource_type,
      resourceId: r.resource_id,
      ip: r.ip,
      timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
    }));

    const contactMessages: ContactMessage[] = messagesRes.rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone || '',
      subject: r.subject || '',
      message: r.message,
      status: r.status,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return {
      users,
      hotelSettings,
      roomTypes,
      rooms,
      bookings,
      facilities,
      gallery,
      activityLogs,
      contactMessages,
    };
  } catch (err: any) {
    console.error('[ANABE HOTEL] Error reading from PostgreSQL database:', err.message);
    return null;
  }
}

export async function seedPostgres(data: {
  users: (User & { passwordHash: string })[];
  hotelSettings: HotelSettings;
  roomTypes: RoomType[];
  rooms: Room[];
  bookings: Booking[];
  facilities: Facility[];
  gallery: GalleryItem[];
  activityLogs: ActivityLog[];
  contactMessages: ContactMessage[];
}): Promise<void> {
  const pool = getPostgresPool();
  if (!pool) return;

  await runPostgresMigrations();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Hotel Settings
    const s = data.hotelSettings;
    await client.query(
      `INSERT INTO hotel_settings (id, hotel_name, phone_1, phone_2, email, address, city, country, description, check_in_time, check_out_time, currency, currency_symbol, cancellation_policy, logo_url)
       VALUES ('primary', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         hotel_name = EXCLUDED.hotel_name,
         phone_1 = EXCLUDED.phone_1,
         phone_2 = EXCLUDED.phone_2,
         email = EXCLUDED.email,
         address = EXCLUDED.address,
         city = EXCLUDED.city,
         country = EXCLUDED.country,
         description = EXCLUDED.description,
         check_in_time = EXCLUDED.check_in_time,
         check_out_time = EXCLUDED.check_out_time,
         currency = EXCLUDED.currency,
         currency_symbol = EXCLUDED.currency_symbol,
         cancellation_policy = EXCLUDED.cancellation_policy,
         logo_url = EXCLUDED.logo_url,
         updated_at = CURRENT_TIMESTAMP`,
      [
        s.hotelName,
        s.phone1,
        s.phone2,
        s.email,
        s.address,
        s.city,
        s.country,
        s.description,
        s.checkInTime,
        s.checkOutTime,
        s.currency,
        s.currencySymbol,
        s.cancellationPolicy,
        s.logoUrl,
      ]
    );

    // 2. Room Types
    for (const rt of data.roomTypes) {
      await client.query(
        `INSERT INTO room_types (id, name, description, base_price, max_guests, default_amenities)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           base_price = EXCLUDED.base_price,
           max_guests = EXCLUDED.max_guests,
           default_amenities = EXCLUDED.default_amenities`,
        [rt.id, rt.name, rt.description, rt.basePrice, rt.maxGuests, JSON.stringify(rt.defaultAmenities)]
      );
    }

    // 3. Rooms
    for (const r of data.rooms) {
      await client.query(
        `INSERT INTO rooms (id, room_number, name, type_id, description, price_per_night, max_guests, floor, status, amenities, images, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           room_number = EXCLUDED.room_number,
           name = EXCLUDED.name,
           type_id = EXCLUDED.type_id,
           description = EXCLUDED.description,
           price_per_night = EXCLUDED.price_per_night,
           max_guests = EXCLUDED.max_guests,
           floor = EXCLUDED.floor,
           status = EXCLUDED.status,
           amenities = EXCLUDED.amenities,
           images = EXCLUDED.images,
           featured = EXCLUDED.featured`,
        [
          r.id,
          r.roomNumber,
          r.name,
          r.typeId,
          r.description,
          r.pricePerNight,
          r.maxGuests,
          r.floor,
          r.status,
          JSON.stringify(r.amenities),
          JSON.stringify(r.images),
          r.featured,
        ]
      );
    }

    // 4. Users
    for (const u of data.users) {
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, permissions, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           permissions = EXCLUDED.permissions,
           status = EXCLUDED.status`,
        [u.id, u.name, u.email, u.passwordHash, u.role, JSON.stringify(u.permissions), u.status]
      );
    }

    // 5. Facilities
    for (const f of data.facilities) {
      await client.query(
        `INSERT INTO facilities (id, name, description, image, icon, status, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           image = EXCLUDED.image,
           icon = EXCLUDED.icon,
           status = EXCLUDED.status,
           display_order = EXCLUDED.display_order`,
        [f.id, f.name, f.description, f.image, f.icon, f.status, f.displayOrder]
      );
    }

    // 6. Gallery
    for (const g of data.gallery) {
      await client.query(
        `INSERT INTO gallery (id, title, caption, description, category, image_url, media_type, alt_text, published, storage_key, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           caption = EXCLUDED.caption,
           description = EXCLUDED.description,
           category = EXCLUDED.category,
           image_url = EXCLUDED.image_url,
           media_type = EXCLUDED.media_type,
           alt_text = EXCLUDED.alt_text,
           published = EXCLUDED.published,
           storage_key = EXCLUDED.storage_key,
           display_order = EXCLUDED.display_order,
           updated_at = CURRENT_TIMESTAMP`,
        [
          g.id,
          g.title,
          g.caption || '',
          g.description || g.caption || '',
          g.category,
          g.imageUrl,
          g.mediaType || 'IMAGE',
          g.altText || g.title,
          g.published ?? true,
          g.storageKey || null,
          g.displayOrder || 0,
        ]
      );
    }

    // 7. Initial Bookings
    for (const b of data.bookings) {
      await client.query(
        `INSERT INTO bookings (id, booking_reference, room_id, check_in, check_out, nights, guests_count, guest_name, guest_email, guest_phone, special_requests, price_per_night, total_price, status, payment_status, payment_method, transaction_reference, amount_paid, paid_at, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         ON CONFLICT (id) DO NOTHING`,
        [
          b.id,
          b.bookingReference,
          b.roomId,
          b.checkIn,
          b.checkOut,
          b.nights,
          b.guestsCount,
          b.guestName,
          b.guestEmail,
          b.guestPhone,
          b.specialRequests || null,
          b.pricePerNight,
          b.totalPrice,
          b.status,
          b.paymentStatus,
          b.paymentMethod || null,
          b.transactionReference || null,
          b.amountPaid || 0,
          b.paidAt || null,
          b.notes || null,
        ]
      );
    }

    await client.query('COMMIT');
    console.log('[ANABE HOTEL] PostgreSQL database successfully populated with initial data.');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[ANABE HOTEL] Failed to seed PostgreSQL database:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

export async function createBookingPostgresWithLock(
  bookingData: Omit<Booking, 'id' | 'bookingReference' | 'createdAt' | 'updatedAt'>
): Promise<Booking> {
  const pool = getPostgresPool();
  if (!pool) {
    throw new Error('Database pool not available.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Lock room and check operational status
    const roomRes = await client.query('SELECT * FROM rooms WHERE id = $1 FOR UPDATE', [bookingData.roomId]);
    if (roomRes.rowCount === 0) {
      throw new Error(`Room with ID ${bookingData.roomId} does not exist.`);
    }
    const roomRow = roomRes.rows[0];
    if (roomRow.status === 'OUT_OF_SERVICE') {
      throw new Error('This room is currently out of service.');
    }

    // 2. Prevent double-booking using date overlap lock
    // A booking overlaps if: existing.check_in < new.check_out AND existing.check_out > new.check_in
    const overlapRes = await client.query(
      `SELECT id, booking_reference FROM bookings
       WHERE room_id = $1
         AND status NOT IN ('CANCELLED')
         AND check_in < $3
         AND check_out > $2
       FOR UPDATE`,
      [bookingData.roomId, bookingData.checkIn, bookingData.checkOut]
    );

    if (overlapRes.rowCount && overlapRes.rowCount > 0) {
      throw new Error('This room is no longer available for the selected dates.');
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const hexPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingReference = `ANB-${dateStr}-${hexPart}`;
    const now = new Date().toISOString();
    const bookingId = `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await client.query(
      `INSERT INTO bookings (
         id, booking_reference, room_id, check_in, check_out, nights,
         guests_count, guest_name, guest_email, guest_phone, special_requests,
         price_per_night, total_price, status, payment_status, payment_method,
         notes, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        bookingId,
        bookingReference,
        bookingData.roomId,
        bookingData.checkIn,
        bookingData.checkOut,
        bookingData.nights,
        bookingData.guestsCount,
        bookingData.guestName,
        bookingData.guestEmail,
        bookingData.guestPhone,
        bookingData.specialRequests || null,
        bookingData.pricePerNight,
        bookingData.totalPrice,
        bookingData.status || 'PENDING',
        bookingData.paymentStatus || 'PAYMENT_PENDING',
        bookingData.paymentMethod || 'MTN MoMo',
        bookingData.notes || null,
        now,
        now,
      ]
    );

    // Activity log entry
    await client.query(
      `INSERT INTO activity_logs (id, user_id, user_name, user_role, action, details, resource_type, resource_id, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        'guest_portal',
        bookingData.guestName,
        'STAFF',
        'BOOKING_CREATED',
        `Booking ${bookingReference} created for Room ${roomRow.room_number} (${bookingData.checkIn} to ${bookingData.checkOut}). Total: ${bookingData.totalPrice} RWF.`,
        'booking',
        bookingId,
        now,
      ]
    );

    await client.query('COMMIT');

    return {
      ...bookingData,
      id: bookingId,
      bookingReference,
      roomNumber: roomRow.room_number,
      roomName: roomRow.name,
      typeName: bookingData.typeName || roomRow.name,
      createdAt: now,
      updatedAt: now,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
