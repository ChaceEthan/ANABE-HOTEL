import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from '../auth.ts';
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
  RoomOperationalStatus,
} from '../../types/hotel.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'hotel_data.json');

interface StoredUser extends User {
  passwordHash: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  hotelSettings: HotelSettings;
  roomTypes: RoomType[];
  rooms: Room[];
  bookings: Booking[];
  facilities: Facility[];
  gallery: GalleryItem[];
  activityLogs: ActivityLog[];
  contactMessages: ContactMessage[];
}

let dbInstance: DatabaseSchema | null = null;
let writeLock = false;

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getDefaultSeedData(): DatabaseSchema {
  const defaultSettings: HotelSettings = {
    hotelName: 'ANABE HOTEL',
    phone1: '0788 845 520',
    phone2: '0783 218 170',
    email: 'info@anabehotel.com',
    address: 'KG 15 Avenue, Luxury Boulevard',
    city: 'Kigali',
    country: 'Rwanda',
    description:
      'ANABE HOTEL is a premier hospitality destination featuring 65 thoughtfully curated rooms, a serene swimming pool, modern escalator and elevator infrastructure, and refined personalized service for both international business travelers and leisure guests.',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    currency: 'RWF',
    currencySymbol: 'FRw',
    cancellationPolicy:
      'Free cancellation up to 48 hours prior to check-in. Cancellations made within 48 hours are subject to a one-night room charge.',
    logoUrl: '',
  };

  const defaultRoomTypes: RoomType[] = [
    {
      id: 'rt_standard_single',
      name: 'Standard Single Room',
      description: 'Ideal for solo business travelers with dedicated workspace, high-speed Wi-Fi, and plush bedding.',
      basePrice: 65000,
      maxGuests: 1,
      defaultAmenities: ['High-speed Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Work Desk', 'En-suite Bathroom', 'Electronic Safe'],
    },
    {
      id: 'rt_standard_double',
      name: 'Standard Double Room',
      description: 'Comfortable double accommodations featuring queen-size bed, city or courtyard views, and modern comforts.',
      basePrice: 90000,
      maxGuests: 2,
      defaultAmenities: ['High-speed Wi-Fi', 'Air Conditioning', 'Smart TV', 'Tea & Coffee Maker', 'En-suite Bathroom', 'Electronic Safe', 'Hairdryer'],
    },
    {
      id: 'rt_twin_comfort',
      name: 'Twin Comfort Room',
      description: 'Two twin beds with premium linens, soundproofing, and ensuite bath, ideal for colleagues or friends.',
      basePrice: 95000,
      maxGuests: 2,
      defaultAmenities: ['High-speed Wi-Fi', 'Air Conditioning', 'Smart TV', 'Work Desk', 'En-suite Bathroom', 'Mini Fridge', 'Electronic Safe'],
    },
    {
      id: 'rt_deluxe_king',
      name: 'Deluxe King Room',
      description: 'Spacious retreat featuring an oversized king bed, lounge seating, floor-to-ceiling windows, and luxury bathroom amenities.',
      basePrice: 135000,
      maxGuests: 2,
      defaultAmenities: ['High-speed Wi-Fi', 'Air Conditioning', '55-inch 4K Smart TV', 'Private Balcony', 'Mini Bar', 'Bathrobes & Slippers', 'Premium Toiletries', 'Nespresso Coffee Machine'],
    },
    {
      id: 'rt_executive_suite',
      name: 'Executive Suite',
      description: 'Expansive two-room layout with separate living salon, dining table, panoramic views, and personalized turndown service.',
      basePrice: 220000,
      maxGuests: 3,
      defaultAmenities: ['High-speed Wi-Fi', 'Individual Climate Control', 'Living Room & Dining Area', 'Walk-in Closet', 'Soaking Bathtub & Rain Shower', 'Complimentary Mini Bar', 'Executive Lounge Access', 'Private Balcony'],
    },
  ];

  // Generate 65 rooms across floors 1 to 4
  const generatedRooms: Room[] = [];
  let roomCount = 0;
  const floors = [
    { floor: 1, count: 16 },
    { floor: 2, count: 16 },
    { floor: 3, count: 16 },
    { floor: 4, count: 17 },
  ];

  for (const f of floors) {
    for (let i = 1; i <= f.count; i++) {
      roomCount++;
      const roomNum = `${f.floor}${i < 10 ? '0' + i : i}`;
      let type: RoomType;
      let status: RoomOperationalStatus = 'AVAILABLE';

      if (f.floor === 4 && i >= 13) {
        type = defaultRoomTypes[4]; // Executive Suite
      } else if (f.floor >= 3 || (f.floor === 2 && i >= 11)) {
        type = defaultRoomTypes[3]; // Deluxe King
      } else if (i % 3 === 0) {
        type = defaultRoomTypes[2]; // Twin Comfort
      } else if (i % 2 === 0) {
        type = defaultRoomTypes[1]; // Standard Double
      } else {
        type = defaultRoomTypes[0]; // Standard Single
      }

      // Set realistic initial operational statuses
      if (roomCount === 104 || roomCount === 208) status = 'CLEANING';
      if (roomCount === 306) status = 'MAINTENANCE';

      generatedRooms.push({
        id: `room_${roomNum}`,
        roomNumber: roomNum,
        name: `${type.name} ${roomNum}`,
        typeId: type.id,
        typeName: type.name,
        description: type.description,
        pricePerNight: type.basePrice,
        maxGuests: type.maxGuests,
        amenities: [...type.defaultAmenities],
        images: [
          '/src/assets/images/hotel_deluxe_room_1791471905013.jpg',
          '/src/assets/images/hotel_swimming_pool_1791471894050.jpg',
          '/src/assets/images/hero_hotel_exterior_1791471883513.jpg',
        ],
        status,
        floor: f.floor,
        featured: roomCount === 101 || roomCount === 205 || roomCount === 310 || roomCount === 415,
      });
    }
  }

  const defaultFacilities: Facility[] = [
    {
      id: 'fac_pool',
      name: 'Swimming Pool',
      description: 'Lush outdoor swimming pool with crystal clear water, comfortable sun loungers, and tranquil evening illumination.',
      image: '/src/assets/images/hotel_swimming_pool_1791471894050.jpg',
      icon: 'Waves',
      status: 'ACTIVE',
      displayOrder: 1,
    },
    {
      id: 'fac_elevator',
      name: 'High-Speed Elevators',
      description: 'Smooth and modern elevators serving all four floors and accommodation wings for effortless accessibility.',
      image: '/src/assets/images/hotel_lobby_escalator_1791471914533.jpg',
      icon: 'Building',
      status: 'ACTIVE',
      displayOrder: 2,
    },
    {
      id: 'fac_escalator',
      name: 'Central Escalators',
      description: 'Convenient escalator systems connecting the grand ground lobby, reception, and upper mezzanine areas seamlessly.',
      image: '/src/assets/images/hotel_lobby_escalator_1791471914533.jpg',
      icon: 'ArrowUpRight',
      status: 'ACTIVE',
      displayOrder: 3,
    },
    {
      id: 'fac_rooms',
      name: 'Accommodation Rooms',
      description: '65 private rooms and suites featuring soundproofing, premium bedding, climate control, and en-suite bathrooms.',
      image: '/src/assets/images/hotel_deluxe_room_1791471905013.jpg',
      icon: 'BedDouble',
      status: 'ACTIVE',
      displayOrder: 4,
    },
  ];

  const defaultGallery: GalleryItem[] = [
    {
      id: 'gal_1',
      title: 'ANABE HOTEL Grand Twilight View',
      caption: 'Architectural front facade of ANABE HOTEL at evening with welcoming ambient entrance.',
      category: 'Exterior',
      imageUrl: '/src/assets/images/hero_hotel_exterior_1791471883513.jpg',
      createdAt: '2026-03-01T10:00:00Z',
    },
    {
      id: 'gal_2',
      title: 'Serene Swimming Pool',
      caption: 'The outdoor turquoise swimming pool and sun terrace surrounded by tropical garden greenery.',
      category: 'Swimming Pool',
      imageUrl: '/src/assets/images/hotel_swimming_pool_1791471894050.jpg',
      createdAt: '2026-03-02T11:00:00Z',
    },
    {
      id: 'gal_3',
      title: 'Deluxe Guest Room',
      caption: 'Carefully appointed king guest room with plush linens, warm oak finishes, and reading armchairs.',
      category: 'Rooms',
      imageUrl: '/src/assets/images/hotel_deluxe_room_1791471905013.jpg',
      createdAt: '2026-03-03T14:30:00Z',
    },
    {
      id: 'gal_4',
      title: 'Grand Lobby & Escalators',
      caption: 'Spacious hotel atrium featuring marble floors, escalator connection, glass elevators, and reception.',
      category: 'Lobby',
      imageUrl: '/src/assets/images/hotel_lobby_escalator_1791471914533.jpg',
      createdAt: '2026-03-04T16:00:00Z',
    },
  ];

  const defaultUsers: StoredUser[] = [
    {
      id: 'usr_owner_01',
      name: 'Hotel Owner',
      email: 'owner@anabehotel.com',
      passwordHash: hashPassword('Owner@Anabe2026!'),
      role: 'OWNER',
      permissions: [
        'manage_rooms',
        'manage_bookings',
        'checkin_checkout',
        'manage_users',
        'manage_settings',
        'view_finances',
        'manage_facilities',
        'manage_gallery',
        'cleaning_updates',
        'delete_records',
      ],
      status: 'ACTIVE',
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'usr_manager_01',
      name: 'Operations Manager',
      email: 'manager@anabehotel.com',
      passwordHash: hashPassword('Manager@Anabe2026!'),
      role: 'MANAGER',
      permissions: [
        'manage_rooms',
        'manage_bookings',
        'checkin_checkout',
        'manage_facilities',
        'manage_gallery',
        'cleaning_updates',
      ],
      status: 'ACTIVE',
      createdAt: '2026-01-10T09:00:00Z',
    },
    {
      id: 'usr_staff_reception',
      name: 'Front Desk Reception',
      email: 'reception@anabehotel.com',
      passwordHash: hashPassword('Staff@Anabe2026!'),
      role: 'STAFF',
      permissions: [
        'manage_bookings',
        'checkin_checkout',
      ],
      status: 'ACTIVE',
      createdAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'usr_staff_housekeeping',
      name: 'Housekeeping Supervisor',
      email: 'housekeeping@anabehotel.com',
      passwordHash: hashPassword('Clean@Anabe2026!'),
      role: 'STAFF',
      permissions: [
        'cleaning_updates',
      ],
      status: 'ACTIVE',
      createdAt: '2026-01-20T11:00:00Z',
    },
  ];

  // Initial Sample Bookings to verify double-booking detection and financial metrics
  const sampleBookings: Booking[] = [
    {
      id: 'bkg_101_sample',
      bookingReference: 'ANB-2026-8812',
      roomId: 'room_204',
      roomNumber: '204',
      roomName: 'Standard Double 204',
      typeName: 'Standard Double Room',
      checkIn: '2026-10-10',
      checkOut: '2026-10-15',
      nights: 5,
      guestsCount: 2,
      guestName: 'Aimable Mugisha',
      guestEmail: 'aimable.m@example.com',
      guestPhone: '+250 788 123 456',
      specialRequests: 'Quiet room away from elevators if possible.',
      pricePerNight: 90000,
      totalPrice: 450000,
      status: 'CONFIRMED',
      paymentStatus: 'PAYMENT_PENDING',
      paymentMethod: 'MTN MoMo',
      transactionReference: 'MOMO-REF-992144',
      createdAt: '2026-10-01T12:00:00Z',
      updatedAt: '2026-10-01T12:00:00Z',
    },
    {
      id: 'bkg_102_sample',
      bookingReference: 'ANB-2026-4491',
      roomId: 'room_415',
      roomNumber: '415',
      roomName: 'Executive Suite 415',
      typeName: 'Executive Suite',
      checkIn: '2026-10-08',
      checkOut: '2026-10-11',
      nights: 3,
      guestsCount: 2,
      guestName: 'Claire Uwera',
      guestEmail: 'claire.u@example.com',
      guestPhone: '+250 783 987 654',
      pricePerNight: 220000,
      totalPrice: 660000,
      status: 'CHECKED_IN',
      paymentStatus: 'PAID',
      paymentMethod: 'Bank / Card',
      transactionReference: 'CARD-TX-551029',
      amountPaid: 660000,
      paidAt: '2026-10-08T09:00:00Z',
      createdAt: '2026-10-02T15:30:00Z',
      updatedAt: '2026-10-08T09:15:00Z',
    },
  ];

  const defaultActivityLogs: ActivityLog[] = [
    {
      id: 'log_01',
      userId: 'usr_owner_01',
      userName: 'Hotel Owner',
      userRole: 'OWNER',
      action: 'SYSTEM_INITIALIZED',
      details: 'ANABE HOTEL system initialized with 65 rooms across 4 floors.',
      timestamp: '2026-01-01T08:00:00Z',
    },
    {
      id: 'log_02',
      userId: 'usr_staff_reception',
      userName: 'Front Desk Reception',
      userRole: 'STAFF',
      action: 'GUEST_CHECKED_IN',
      details: 'Guest Claire Uwera checked into Executive Suite 415 (Ref: ANB-2026-4491).',
      resourceType: 'booking',
      resourceId: 'bkg_102_sample',
      timestamp: '2026-10-08T09:15:00Z',
    },
  ];

  return {
    users: defaultUsers,
    hotelSettings: defaultSettings,
    roomTypes: defaultRoomTypes,
    rooms: generatedRooms,
    bookings: sampleBookings,
    facilities: defaultFacilities,
    gallery: defaultGallery,
    activityLogs: defaultActivityLogs,
    contactMessages: [],
  };
}

export function getDatabase(): DatabaseSchema {
  if (dbInstance) return dbInstance;
  ensureDataDirectory();

  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      dbInstance = JSON.parse(content) as DatabaseSchema;
      return dbInstance;
    } catch (err) {
      console.error('Failed reading database file, reinitializing default seed:', err);
    }
  }

  const seed = getDefaultSeedData();
  saveDatabase(seed);
  dbInstance = seed;
  return dbInstance;
}

export function saveDatabase(data?: DatabaseSchema) {
  ensureDataDirectory();
  const toSave = data || dbInstance;
  if (!toSave) return;

  const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(toSave, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
    dbInstance = toSave;
  } catch (err) {
    if (fs.existsSync(tempFile)) {
      try { fs.unlinkSync(tempFile); } catch {}
    }
    console.error('Error writing database to disk:', err);
  }
}

// -------------------------------------------------------------
// Real Double-Booking Prevention & Date Overlap Mathematics
// -------------------------------------------------------------
export function isDateRangeOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  // A room booking from startA to endA overlaps with startB to endB if:
  // (startA < endB) and (endA > startB)
  return startA < endB && endA > startB;
}

export function isRoomAvailableForDates(
  roomId: string,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: string
): boolean {
  const db = getDatabase();
  const room = db.rooms.find((r) => r.id === roomId);
  if (!room) return false;
  if (room.status === 'OUT_OF_SERVICE') return false;

  // Search bookings for this room that are active (not cancelled)
  const overlappingBooking = db.bookings.find((b) => {
    if (b.roomId !== roomId) return false;
    if (b.status === 'CANCELLED') return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    return isDateRangeOverlapping(b.checkIn, b.checkOut, checkIn, checkOut);
  });

  return !overlappingBooking;
}

// Atomic Booking Creation with Server-side Availability Lock
export function createBookingWithLock(bookingData: Omit<Booking, 'id' | 'bookingReference' | 'createdAt' | 'updatedAt'>): Booking {
  const db = getDatabase();

  // Validate dates
  const todayStr = new Date().toISOString().slice(0, 10);
  if (bookingData.checkIn < todayStr) {
    throw new Error('Check-in date cannot be in the past.');
  }
  if (bookingData.checkIn >= bookingData.checkOut) {
    throw new Error('Check-out date must be strictly after check-in date.');
  }

  const room = db.rooms.find((r) => r.id === bookingData.roomId);
  if (!room) {
    throw new Error(`Room with ID ${bookingData.roomId} does not exist.`);
  }

  // Atomic re-check
  const available = isRoomAvailableForDates(bookingData.roomId, bookingData.checkIn, bookingData.checkOut);
  if (!available) {
    throw new Error('This room is no longer available for the selected dates.');
  }

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const hexPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bookingReference = `ANB-${dateStr}-${hexPart}`;
  const now = new Date().toISOString();

  const newBooking: Booking = {
    ...bookingData,
    id: `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    bookingReference,
    roomNumber: room.roomNumber,
    roomName: room.name,
    typeName: room.typeName,
    createdAt: now,
    updatedAt: now,
  };

  db.bookings.unshift(newBooking);
  saveDatabase(db);

  // Log activity
  logActivity({
    userId: 'guest_portal',
    userName: bookingData.guestName,
    userRole: 'STAFF',
    action: 'BOOKING_CREATED',
    details: `Booking ${bookingReference} created for Room ${room.roomNumber} (${bookingData.checkIn} to ${bookingData.checkOut}). Total: ${bookingData.totalPrice} RWF.`,
    resourceType: 'booking',
    resourceId: newBooking.id,
  });

  return newBooking;
}

export function logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
  const db = getDatabase();
  const entry: ActivityLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  db.activityLogs.unshift(entry);
  if (db.activityLogs.length > 500) {
    db.activityLogs = db.activityLogs.slice(0, 500);
  }
  saveDatabase(db);
}
