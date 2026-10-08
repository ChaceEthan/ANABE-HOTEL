import type {
  HotelSettings,
  Facility,
  GalleryItem,
  Room,
  Booking,
  DashboardMetrics,
  User,
  RoomType,
  ActivityLog,
  ContactMessage,
} from '../types/hotel.ts';

const TOKEN_KEY = 'anabe_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Public
  getSettings: () => request<HotelSettings>('/api/settings'),
  getFacilities: () => request<Facility[]>('/api/facilities'),
  getGallery: () => request<GalleryItem[]>('/api/gallery'),
  getRooms: (params?: { type?: string; maxPrice?: number; guests?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.maxPrice) q.set('maxPrice', params.maxPrice.toString());
    if (params?.guests) q.set('guests', params.guests.toString());
    if (params?.search) q.set('search', params.search);
    return request<Room[]>(`/api/rooms?${q.toString()}`);
  },
  checkAvailability: (checkIn: string, checkOut: string, guests?: number, typeId?: string) => {
    const q = new URLSearchParams({ checkIn, checkOut });
    if (guests) q.set('guests', guests.toString());
    if (typeId) q.set('typeId', typeId);
    return request<{
      checkIn: string;
      checkOut: string;
      totalRooms: number;
      availableCount: number;
      rooms: (Room & { isAvailableForDates: boolean })[];
    }>(`/api/rooms/availability?${q.toString()}`);
  },
  getRoom: (id: string) => request<Room & { bookedRanges: { checkIn: string; checkOut: string }[] }>(`/api/rooms/${id}`),
  createBooking: (bookingData: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequests?: string;
    paymentMethod?: string;
  }) => request<{ success: boolean; message: string; booking: Booking }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  }),
  getBookingByReference: (ref: string) => request<Booking>(`/api/bookings/reference/${ref}`),
  submitContact: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    request<{ success: boolean; message: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<User>('/api/auth/me'),

  // Admin
  getMetrics: () => request<DashboardMetrics>('/api/admin/metrics'),
  getAdminBookings: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    return request<Booking[]>(`/api/admin/bookings?${q.toString()}`);
  },
  updateBookingStatus: (id: string, status: string) =>
    request<Booking>(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updateBookingPayment: (id: string, paymentData: {
    paymentStatus?: string;
    paymentMethod?: string;
    transactionReference?: string;
    amountPaid?: number;
  }) =>
    request<Booking>(`/api/admin/bookings/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(paymentData),
    }),
  createAdminBooking: (data: any) =>
    request<Booking>('/api/admin/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAdminRooms: () => request<Room[]>('/api/admin/rooms'),
  createRoom: (roomData: Partial<Room>) =>
    request<Room>('/api/admin/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    }),
  updateRoom: (id: string, roomData: Partial<Room>) =>
    request<Room>(`/api/admin/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    }),
  updateRoomStatus: (id: string, status: string) =>
    request<Room>(`/api/admin/rooms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteRoom: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/rooms/${id}`, {
      method: 'DELETE',
    }),
  getRoomTypes: () => request<RoomType[]>('/api/admin/room-types'),
  createRoomType: (data: Partial<RoomType>) =>
    request<RoomType>('/api/admin/room-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getUsers: () => request<User[]>('/api/admin/users'),
  createUser: (userData: any) =>
    request<User>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  updateUser: (id: string, userData: any) =>
    request<User>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }),
  deleteUser: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    }),
  updateSettings: (settings: Partial<HotelSettings>) =>
    request<HotelSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  createFacility: (facility: Partial<Facility>) =>
    request<Facility>('/api/admin/facilities', {
      method: 'POST',
      body: JSON.stringify(facility),
    }),
  deleteFacility: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/facilities/${id}`, {
      method: 'DELETE',
    }),
  addGalleryItem: (item: Partial<GalleryItem>) =>
    request<GalleryItem>('/api/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  deleteGalleryItem: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/gallery/${id}`, {
      method: 'DELETE',
    }),
  getLogs: () => request<ActivityLog[]>('/api/admin/logs'),
  getContactMessages: () => request<ContactMessage[]>('/api/admin/contact-messages'),
};
