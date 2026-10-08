import express, { Request, Response, NextFunction } from 'express';
import {
  getDatabase,
  saveDatabase,
  isRoomAvailableForDates,
  createBookingWithLock,
  logActivity,
} from './db/database.ts';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  TokenPayload,
} from './auth.ts';
import type {
  UserRole,
  RoomOperationalStatus,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  Room,
} from '../types/hotel.ts';

export const apiRouter = express.Router();

// -------------------------------------------------------------
// Authentication Middleware
// -------------------------------------------------------------
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token.' });
  }

  req.user = payload;
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
      });
    }
    next();
  };
}

export function requirePermission(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // OWNER has all permissions
    if (req.user.role === 'OWNER') {
      return next();
    }
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: `Forbidden: Missing required permission '${permission}'.`,
      });
    }
    next();
  };
}

// -------------------------------------------------------------
// PUBLIC ENDPOINTS
// -------------------------------------------------------------

// Hotel settings (Name, phone numbers 0788 845 520, 0783 218 170, etc.)
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.hotelSettings);
});

// Facilities (Swimming Pool, Elevators, Escalators, Accommodation rooms)
apiRouter.get('/facilities', (_req: Request, res: Response) => {
  const db = getDatabase();
  const sorted = [...db.facilities].sort((a, b) => a.displayOrder - b.displayOrder);
  res.json(sorted);
});

// Gallery preview and full collection
apiRouter.get('/gallery', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.gallery);
});

// Public rooms list
apiRouter.get('/rooms', (req: Request, res: Response) => {
  const db = getDatabase();
  let rooms = [...db.rooms];

  const type = req.query.type as string;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const guests = req.query.guests ? Number(req.query.guests) : undefined;
  const search = req.query.search as string;

  if (type) {
    rooms = rooms.filter((r) => r.typeId === type || r.typeName.toLowerCase() === type.toLowerCase());
  }
  if (maxPrice && !isNaN(maxPrice)) {
    rooms = rooms.filter((r) => r.pricePerNight <= maxPrice);
  }
  if (guests && !isNaN(guests)) {
    rooms = rooms.filter((r) => r.maxGuests >= guests);
  }
  if (search) {
    const q = search.toLowerCase();
    rooms = rooms.filter((r) => r.name.toLowerCase().includes(q) || r.roomNumber.includes(q) || r.typeName.toLowerCase().includes(q));
  }

  res.json(rooms);
});

// Real Database Room Availability Query for Selected Dates
apiRouter.get('/rooms/availability', (req: Request, res: Response) => {
  const checkIn = req.query.checkIn as string;
  const checkOut = req.query.checkOut as string;
  const guests = req.query.guests ? Number(req.query.guests) : 1;
  const typeId = req.query.typeId as string;

  if (!checkIn || !checkOut) {
    return res.status(400).json({ error: 'Both checkIn and checkOut dates are required.' });
  }

  if (checkIn >= checkOut) {
    return res.status(400).json({ error: 'Check-out date must be strictly after check-in date.' });
  }

  const db = getDatabase();
  const results = db.rooms.map((room) => {
    const isAvailable = isRoomAvailableForDates(room.id, checkIn, checkOut);
    return {
      ...room,
      isAvailableForDates: isAvailable,
    };
  });

  let filtered = results;
  if (guests) {
    filtered = filtered.filter((r) => r.maxGuests >= guests);
  }
  if (typeId) {
    filtered = filtered.filter((r) => r.typeId === typeId);
  }

  res.json({
    checkIn,
    checkOut,
    totalRooms: db.rooms.length,
    availableCount: filtered.filter((r) => r.isAvailableForDates).length,
    rooms: filtered,
  });
});

// Single Room Details
apiRouter.get('/rooms/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const room = db.rooms.find((r) => r.id === req.params.id || r.roomNumber === req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Active bookings for availability calendar visualization
  const activeBookings = db.bookings
    .filter((b) => b.roomId === room.id && b.status !== 'CANCELLED')
    .map((b) => ({ checkIn: b.checkIn, checkOut: b.checkOut }));

  res.json({
    ...room,
    bookedRanges: activeBookings,
  });
});

// Create Public Booking (Enforcing Server-Side Double-Booking Protection)
apiRouter.post('/bookings', (req: Request, res: Response) => {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      guestsCount,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
      paymentMethod,
    } = req.body;

    if (!roomId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({ error: 'Missing required booking fields.' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date.' });
    }

    const db = getDatabase();
    const room = db.rooms.find((r) => r.id === roomId);
    if (!room) {
      return res.status(404).json({ error: 'Selected room not found.' });
    }

    const pricePerNight = room.pricePerNight;
    const totalPrice = pricePerNight * nights;

    const newBooking = createBookingWithLock({
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomName: room.name,
      typeName: room.typeName,
      checkIn,
      checkOut,
      nights,
      guestsCount: Number(guestsCount) || 1,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone.trim(),
      specialRequests: specialRequests ? specialRequests.trim() : undefined,
      pricePerNight,
      totalPrice,
      status: 'PENDING',
      paymentStatus: 'PAYMENT_PENDING',
      paymentMethod: (paymentMethod as PaymentMethod) || 'MTN MoMo',
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: newBooking,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to process booking.' });
  }
});

// Look up booking by reference
apiRouter.get('/bookings/reference/:ref', (req: Request, res: Response) => {
  const db = getDatabase();
  const booking = db.bookings.find(
    (b) => b.bookingReference.toLowerCase() === req.params.ref.toLowerCase().trim()
  );
  if (!booking) {
    return res.status(404).json({ error: 'No booking found with this reference.' });
  }
  res.json(booking);
});

// Contact Form Submission
apiRouter.post('/contact', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const db = getDatabase();
  const contactEntry = {
    id: `msg_${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    phone: (phone || '').trim(),
    subject: (subject || 'General Inquiry').trim(),
    message: message.trim(),
    status: 'NEW' as const,
    createdAt: new Date().toISOString(),
  };

  db.contactMessages.unshift(contactEntry);
  saveDatabase(db);

  res.status(201).json({ success: true, message: 'Message sent successfully.' });
});

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = getDatabase();
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user || user.status === 'DISABLED') {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  user.lastLoginAt = new Date().toISOString();
  saveDatabase(db);

  logActivity({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'USER_LOGIN',
    details: `${user.name} (${user.role}) logged in successfully.`,
    ip: req.ip,
  });

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
    },
  });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const user = db.users.find((u) => u.id === req.user?.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    status: user.status,
  });
});

// -------------------------------------------------------------
// ADMIN PROTECTED ENDPOINTS
// -------------------------------------------------------------

// Real Metrics from Database
apiRouter.get('/admin/metrics', requireAuth, (_req: AuthRequest, res: Response) => {
  const db = getDatabase();

  const totalRooms = db.rooms.length;
  const availableRoomsNow = db.rooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupiedRoomsNow = db.rooms.filter((r) => r.status === 'CHECKED_IN').length;
  const cleaningRoomsNow = db.rooms.filter((r) => r.status === 'CLEANING').length;
  const maintenanceRoomsNow = db.rooms.filter((r) => r.status === 'MAINTENANCE' || r.status === 'OUT_OF_SERVICE').length;
  const bookedRoomsNow = db.rooms.filter((r) => r.status === 'BOOKED').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckIns = db.bookings.filter((b) => b.checkIn === todayStr && b.status !== 'CANCELLED').length;
  const todayCheckOuts = db.bookings.filter((b) => b.checkOut === todayStr && b.status !== 'CANCELLED').length;

  const totalBookings = db.bookings.length;
  const pendingBookings = db.bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedBookings = db.bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length;

  const totalRevenue = db.bookings
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + (b.amountPaid || (b.paymentStatus === 'PAID' ? b.totalPrice : 0)), 0);

  // Month-to-date revenue
  const currentMonth = todayStr.substring(0, 7);
  const monthlyRevenue = db.bookings
    .filter((b) => b.status !== 'CANCELLED' && b.checkIn.startsWith(currentMonth))
    .reduce((sum, b) => sum + (b.amountPaid || (b.paymentStatus === 'PAID' ? b.totalPrice : 0)), 0);

  const occupancyRatePercent = totalRooms > 0 ? Math.round((occupiedRoomsNow / totalRooms) * 100) : 0;

  res.json({
    totalRooms,
    availableRoomsNow,
    bookedRoomsNow,
    occupiedRoomsNow,
    cleaningRoomsNow,
    maintenanceRoomsNow,
    todayCheckIns,
    todayCheckOuts,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    monthlyRevenue,
    totalRevenue,
    occupancyRatePercent,
  });
});

// Bookings List (Staff/Manager/Owner)
apiRouter.get('/admin/bookings', requireAuth, requirePermission('manage_bookings'), (req: Request, res: Response) => {
  const db = getDatabase();
  let bookings = [...db.bookings];

  const status = req.query.status as string;
  const search = req.query.search as string;

  if (status) {
    bookings = bookings.filter((b) => b.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    bookings = bookings.filter(
      (b) =>
        b.bookingReference.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        b.roomNumber.includes(q) ||
        b.guestPhone.includes(q)
    );
  }

  res.json(bookings);
});

// Update Booking Status
apiRouter.patch('/admin/bookings/:id/status', requireAuth, (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const validStatuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid booking status.' });
  }

  const db = getDatabase();
  const booking = db.bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const oldStatus = booking.status;
  booking.status = status;
  booking.updatedAt = new Date().toISOString();

  // If checked in, sync room operational status
  const room = db.rooms.find((r) => r.id === booking.roomId);
  if (room) {
    if (status === 'CHECKED_IN') {
      room.status = 'CHECKED_IN';
    } else if (status === 'CHECKED_OUT') {
      room.status = 'CLEANING';
    }
  }

  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'BOOKING_STATUS_CHANGED',
    details: `Booking ${booking.bookingReference} status changed from ${oldStatus} to ${status}.`,
    resourceType: 'booking',
    resourceId: booking.id,
  });

  res.json(booking);
});

// Update Payment Info (Owner/Manager)
apiRouter.patch('/admin/bookings/:id/payment', requireAuth, (req: AuthRequest, res: Response) => {
  const { paymentStatus, paymentMethod, transactionReference, amountPaid } = req.body;
  const db = getDatabase();
  const booking = db.bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (paymentStatus) booking.paymentStatus = paymentStatus as PaymentStatus;
  if (paymentMethod) booking.paymentMethod = paymentMethod as PaymentMethod;
  if (transactionReference !== undefined) booking.transactionReference = transactionReference;
  if (amountPaid !== undefined) {
    booking.amountPaid = Number(amountPaid);
    if (booking.amountPaid >= booking.totalPrice) {
      booking.paymentStatus = 'PAID';
      booking.paidAt = new Date().toISOString();
    }
  }
  booking.updatedAt = new Date().toISOString();

  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'PAYMENT_UPDATED',
    details: `Payment updated for booking ${booking.bookingReference}: Status=${booking.paymentStatus}, Method=${booking.paymentMethod || 'N/A'}, Amount=${booking.amountPaid || 0}.`,
    resourceType: 'booking',
    resourceId: booking.id,
  });

  res.json(booking);
});

// Admin create manual reservation
apiRouter.post('/admin/bookings', requireAuth, requirePermission('manage_bookings'), (req: AuthRequest, res: Response) => {
  try {
    const { roomId, checkIn, checkOut, guestName, guestEmail, guestPhone, guestsCount, notes, paymentMethod, paymentStatus } = req.body;
    const db = getDatabase();
    const room = db.rooms.find((r) => r.id === roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return res.status(400).json({ error: 'Invalid dates' });

    const newBooking = createBookingWithLock({
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomName: room.name,
      typeName: room.typeName,
      checkIn,
      checkOut,
      nights,
      guestsCount: Number(guestsCount) || 1,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone.trim(),
      pricePerNight: room.pricePerNight,
      totalPrice: room.pricePerNight * nights,
      status: 'CONFIRMED',
      paymentStatus: (paymentStatus as PaymentStatus) || 'PAYMENT_PENDING',
      paymentMethod: (paymentMethod as PaymentMethod) || 'Cash at Front Desk',
      notes,
    });

    res.status(201).json(newBooking);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Rooms Management
apiRouter.get('/admin/rooms', requireAuth, (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.rooms);
});

// Create Room (Expand beyond initial 65 rooms!)
apiRouter.post('/admin/rooms', requireAuth, requirePermission('manage_rooms'), (req: AuthRequest, res: Response) => {
  const { roomNumber, name, typeId, pricePerNight, maxGuests, floor, description, amenities, images } = req.body;
  const db = getDatabase();

  if (!roomNumber || !typeId || !pricePerNight) {
    return res.status(400).json({ error: 'Room number, type, and price are required.' });
  }

  const existing = db.rooms.find((r) => r.roomNumber.toLowerCase() === roomNumber.toString().toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: `Room number ${roomNumber} already exists.` });
  }

  const type = db.roomTypes.find((t) => t.id === typeId);
  const typeName = type ? type.name : 'Standard Room';

  const newRoom: Room = {
    id: `room_${roomNumber}`,
    roomNumber: roomNumber.toString().trim(),
    name: name ? name.trim() : `${typeName} ${roomNumber}`,
    typeId,
    typeName,
    description: description || (type ? type.description : ''),
    pricePerNight: Number(pricePerNight),
    maxGuests: Number(maxGuests) || (type ? type.maxGuests : 2),
    floor: Number(floor) || 1,
    status: 'AVAILABLE',
    amenities: Array.isArray(amenities) ? amenities : (type?.defaultAmenities || []),
    images: Array.isArray(images) && images.length > 0 ? images : ['/src/assets/images/hotel_deluxe_room_1791471905013.jpg'],
  };

  db.rooms.push(newRoom);
  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'ROOM_CREATED',
    details: `Room ${newRoom.roomNumber} (${newRoom.name}) created. Total rooms now: ${db.rooms.length}.`,
    resourceType: 'room',
    resourceId: newRoom.id,
  });

  res.status(201).json(newRoom);
});

// Edit Room
apiRouter.put('/admin/rooms/:id', requireAuth, requirePermission('manage_rooms'), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const index = db.rooms.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const current = db.rooms[index];
  const { name, typeId, pricePerNight, maxGuests, floor, description, amenities, images, status, featured } = req.body;

  if (typeId && typeId !== current.typeId) {
    const type = db.roomTypes.find((t) => t.id === typeId);
    if (type) current.typeName = type.name;
    current.typeId = typeId;
  }

  if (name !== undefined) current.name = name;
  if (pricePerNight !== undefined) current.pricePerNight = Number(pricePerNight);
  if (maxGuests !== undefined) current.maxGuests = Number(maxGuests);
  if (floor !== undefined) current.floor = Number(floor);
  if (description !== undefined) current.description = description;
  if (amenities !== undefined) current.amenities = amenities;
  if (images !== undefined) current.images = images;
  if (status !== undefined) current.status = status;
  if (featured !== undefined) current.featured = Boolean(featured);

  db.rooms[index] = current;
  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'ROOM_UPDATED',
    details: `Room ${current.roomNumber} updated by ${req.user!.name}.`,
    resourceType: 'room',
    resourceId: current.id,
  });

  res.json(current);
});

// Update Room Status (Accessible to Housekeeping & Reception too!)
apiRouter.patch('/admin/rooms/:id/status', requireAuth, requirePermission('cleaning_updates'), (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const validStatuses: RoomOperationalStatus[] = [
    'AVAILABLE',
    'BOOKED',
    'CHECKED_IN',
    'CLEANING',
    'MAINTENANCE',
    'OUT_OF_SERVICE',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid room status' });
  }

  const db = getDatabase();
  const room = db.rooms.find((r) => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const old = room.status;
  room.status = status;
  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'ROOM_STATUS_CHANGED',
    details: `Room ${room.roomNumber} operational status changed from ${old} to ${status}.`,
    resourceType: 'room',
    resourceId: room.id,
  });

  res.json(room);
});

// Delete Room (Owner only)
apiRouter.delete('/admin/rooms/:id', requireAuth, requireRole(['OWNER']), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const roomIndex = db.rooms.findIndex((r) => r.id === req.params.id);
  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = db.rooms[roomIndex];
  db.rooms.splice(roomIndex, 1);
  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'ROOM_DELETED',
    details: `Room ${room.roomNumber} (${room.name}) deleted by Owner.`,
    resourceType: 'room',
    resourceId: room.id,
  });

  res.json({ success: true, message: `Room ${room.roomNumber} deleted.` });
});

// Room Types (List, Create, Update)
apiRouter.get('/admin/room-types', requireAuth, (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.roomTypes);
});

apiRouter.post('/admin/room-types', requireAuth, requireRole(['OWNER', 'MANAGER']), (req: AuthRequest, res: Response) => {
  const { name, description, basePrice, maxGuests, defaultAmenities } = req.body;
  if (!name || !basePrice) {
    return res.status(400).json({ error: 'Name and base price are required.' });
  }
  const db = getDatabase();
  const newType = {
    id: `rt_${Date.now()}`,
    name: name.trim(),
    description: description || '',
    basePrice: Number(basePrice),
    maxGuests: Number(maxGuests) || 2,
    defaultAmenities: defaultAmenities || [],
  };
  db.roomTypes.push(newType);
  saveDatabase(db);
  res.status(201).json(newType);
});

// Users Management (Owner Only)
apiRouter.get('/admin/users', requireAuth, requireRole(['OWNER']), (_req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const sanitized = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    permissions: u.permissions,
    status: u.status,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  }));
  res.json(sanitized);
});

apiRouter.post('/admin/users', requireAuth, requireRole(['OWNER']), (req: AuthRequest, res: Response) => {
  const { name, email, password, role, permissions } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }

  const db = getDatabase();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'A user with this email already exists.' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    role: role as UserRole,
    permissions: Array.isArray(permissions) ? permissions : ['manage_bookings'],
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'USER_CREATED',
    details: `User ${newUser.name} (${newUser.email}) created with role ${newUser.role}.`,
    resourceType: 'user',
    resourceId: newUser.id,
  });

  res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    permissions: newUser.permissions,
    status: newUser.status,
  });
});

apiRouter.patch('/admin/users/:id', requireAuth, requireRole(['OWNER']), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, role, permissions, status, password } = req.body;

  // Prevent modifying the last OWNER into a non-owner
  if (user.role === 'OWNER' && role && role !== 'OWNER') {
    const ownerCount = db.users.filter((u) => u.role === 'OWNER').length;
    if (ownerCount <= 1) {
      return res.status(400).json({ error: 'Cannot demote the sole system OWNER.' });
    }
  }

  if (name) user.name = name.trim();
  if (role) user.role = role as UserRole;
  if (permissions) user.permissions = permissions;
  if (status) user.status = status;
  if (password && password.length >= 6) {
    user.passwordHash = hashPassword(password);
  }

  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'USER_UPDATED',
    details: `User ${user.email} updated by Owner.`,
    resourceType: 'user',
    resourceId: user.id,
  });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    status: user.status,
  });
});

apiRouter.delete('/admin/users/:id', requireAuth, requireRole(['OWNER']), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const userIndex = db.users.findIndex((u) => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = db.users[userIndex];
  if (user.id === req.user!.userId) {
    return res.status(400).json({ error: 'You cannot delete your own active account.' });
  }

  db.users.splice(userIndex, 1);
  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'USER_DELETED',
    details: `User ${user.email} deleted by Owner.`,
    resourceType: 'user',
    resourceId: user.id,
  });

  res.json({ success: true, message: `User ${user.name} removed.` });
});

// Hotel Settings (Owner Only)
apiRouter.put('/admin/settings', requireAuth, requireRole(['OWNER']), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const { hotelName, phone1, phone2, email, address, city, country, description, checkInTime, checkOutTime, currency, cancellationPolicy } = req.body;

  if (hotelName) db.hotelSettings.hotelName = hotelName;
  if (phone1) db.hotelSettings.phone1 = phone1;
  if (phone2) db.hotelSettings.phone2 = phone2;
  if (email) db.hotelSettings.email = email;
  if (address) db.hotelSettings.address = address;
  if (city) db.hotelSettings.city = city;
  if (country) db.hotelSettings.country = country;
  if (description) db.hotelSettings.description = description;
  if (checkInTime) db.hotelSettings.checkInTime = checkInTime;
  if (checkOutTime) db.hotelSettings.checkOutTime = checkOutTime;
  if (currency) db.hotelSettings.currency = currency;
  if (cancellationPolicy) db.hotelSettings.cancellationPolicy = cancellationPolicy;

  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'SETTINGS_UPDATED',
    details: `Hotel configuration updated by Owner.`,
    resourceType: 'settings',
  });

  res.json(db.hotelSettings);
});

// Facilities (Add / Edit / Delete)
apiRouter.post('/admin/facilities', requireAuth, requirePermission('manage_facilities'), (req: AuthRequest, res: Response) => {
  const { name, description, image, icon, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Facility name is required.' });

  const db = getDatabase();
  const newFacility = {
    id: `fac_${Date.now()}`,
    name: name.trim(),
    description: description || '',
    image: image || '/src/assets/images/hotel_swimming_pool_1791471894050.jpg',
    icon: icon || 'Sparkles',
    status: status || 'ACTIVE',
    displayOrder: db.facilities.length + 1,
  };

  db.facilities.push(newFacility);
  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'FACILITY_CREATED',
    details: `Facility '${newFacility.name}' created.`,
    resourceType: 'facility',
    resourceId: newFacility.id,
  });

  res.status(201).json(newFacility);
});

apiRouter.delete('/admin/facilities/:id', requireAuth, requireRole(['OWNER', 'MANAGER']), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const idx = db.facilities.findIndex((f) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Facility not found' });

  const deleted = db.facilities[idx];
  db.facilities.splice(idx, 1);
  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'FACILITY_DELETED',
    details: `Facility '${deleted.name}' deleted.`,
    resourceType: 'facility',
    resourceId: deleted.id,
  });

  res.json({ success: true, message: `Facility '${deleted.name}' removed.` });
});

// Gallery Management (Add / Delete)
apiRouter.post('/admin/gallery', requireAuth, requirePermission('manage_gallery'), (req: AuthRequest, res: Response) => {
  const { title, caption, category, imageUrl } = req.body;
  if (!title || !imageUrl) {
    return res.status(400).json({ error: 'Title and image URL are required.' });
  }

  const db = getDatabase();
  const newItem = {
    id: `gal_${Date.now()}`,
    title: title.trim(),
    caption: caption || '',
    category: category || 'Hotel',
    imageUrl: imageUrl.trim(),
    createdAt: new Date().toISOString(),
  };

  db.gallery.unshift(newItem);
  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'GALLERY_ITEM_ADDED',
    details: `Gallery photo '${newItem.title}' added under '${newItem.category}'.`,
    resourceType: 'gallery',
    resourceId: newItem.id,
  });

  res.status(201).json(newItem);
});

apiRouter.delete('/admin/gallery/:id', requireAuth, requirePermission('manage_gallery'), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const idx = db.gallery.findIndex((g) => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Gallery item not found' });

  const item = db.gallery[idx];
  db.gallery.splice(idx, 1);
  saveDatabase(db);

  logActivity({
    userId: req.user!.userId,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'GALLERY_ITEM_DELETED',
    details: `Gallery photo '${item.title}' removed.`,
    resourceType: 'gallery',
    resourceId: item.id,
  });

  res.json({ success: true, message: 'Gallery item removed.' });
});

// Activity Logs (Owner Only)
apiRouter.get('/admin/logs', requireAuth, requireRole(['OWNER']), (_req: AuthRequest, res: Response) => {
  const db = getDatabase();
  res.json(db.activityLogs);
});

// Contact Messages (Admin)
apiRouter.get('/admin/contact-messages', requireAuth, (_req: AuthRequest, res: Response) => {
  const db = getDatabase();
  res.json(db.contactMessages);
});

apiRouter.patch('/admin/contact-messages/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const db = getDatabase();
  const msg = db.contactMessages.find((m) => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  msg.status = status;
  saveDatabase(db);
  res.json(msg);
});
