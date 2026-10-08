export type UserRole = 'OWNER' | 'MANAGER' | 'STAFF';

export type RoomOperationalStatus =
  | 'AVAILABLE'
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';

export type PaymentStatus =
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PARTIAL'
  | 'REFUNDED';

export type PaymentMethod =
  | 'MTN MoMo'
  | 'Airtel Money'
  | 'Bank / Card'
  | 'Cash at Front Desk'
  | 'Direct Transfer'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  lastLoginAt?: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  defaultAmenities: string[];
}

export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  typeId: string;
  typeName: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  status: RoomOperationalStatus;
  floor: number;
  featured?: boolean;
}

export interface Booking {
  id: string;
  bookingReference: string;
  roomId: string;
  roomNumber: string;
  roomName: string;
  typeName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  guestsCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  pricePerNight: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionReference?: string;
  amountPaid?: number;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  status: 'ACTIVE' | 'MAINTENANCE';
  displayOrder: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  category: 'Hotel' | 'Rooms' | 'Swimming Pool' | 'Facilities' | 'Exterior' | 'Lobby';
  imageUrl: string;
  createdAt: string;
}

export interface HotelSettings {
  hotelName: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  city: string;
  country: string;
  description: string;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  currencySymbol: string;
  cancellationPolicy: string;
  logoUrl?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  resourceType?: string;
  resourceId?: string;
  timestamp: string;
  ip?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'NEW' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
}

export interface DashboardMetrics {
  totalRooms: number;
  availableRoomsNow: number;
  bookedRoomsNow: number;
  occupiedRoomsNow: number;
  cleaningRoomsNow: number;
  maintenanceRoomsNow: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  monthlyRevenue: number;
  totalRevenue: number;
  occupancyRatePercent: number;
}
