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

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const TOKEN_KEY = 'anabe_auth_token';

function getStoredToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function storeToken(token: string): void {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* SSR / private browsing */ }
}

function clearToken(): void {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* SSR / private browsing */ }
}

function resolveUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return BASE_URL ? `${BASE_URL}${clean}` : clean;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = resolveUrl(endpoint);
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  // Attach Bearer token for cross-origin auth (cookie may not be sent cross-site)
  const token = getStoredToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.endsWith('/auth/login')) {
      clearToken();
      window.dispatchEvent(new Event('anabe:session-expired'));
    }
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
  login: async (credentials: { email: string; password: string }) => {
    const res = await request<{ token?: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.token) storeToken(res.token);
    return res;
  },
  getMe: () => request<User>('/api/auth/me'),
  logout: async () => {
    clearToken();
    return request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
  },

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
  updateFacility: (id: string, facility: Partial<Facility>) =>
    request<Facility>(`/api/admin/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(facility),
    }),
  deleteFacility: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/facilities/${id}`, {
      method: 'DELETE',
    }),
  uploadImage: async (file: File, folder: 'rooms' | 'facilities' | 'gallery' = 'rooms'): Promise<{ url: string; publicId?: string; format: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await request<{ url: string; publicId?: string; format: string }>('/api/admin/upload', {
            method: 'POST',
            body: JSON.stringify({ data: reader.result, folder }),
          });
          resolve(res);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed reading file for upload.'));
      reader.readAsDataURL(file);
    });
  },
  addGalleryItem: (item: Partial<GalleryItem>) =>
    request<GalleryItem>('/api/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  deleteGalleryItem: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/gallery/${id}`, {
      method: 'DELETE',
    }),
  getAdminGallery: () => request<GalleryItem[]>('/api/admin/gallery'),
  getGalleryItem: (id: string) => request<GalleryItem>(`/api/gallery/${encodeURIComponent(id)}`),
  uploadGalleryMedia: async (file: File, details: {
    title: string;
    description: string;
    category: string;
    altText: string;
    published: boolean;
  }) => {
    const query = new URLSearchParams(details as unknown as Record<string, string>);
    const uploadUrl = resolveUrl(`/api/admin/gallery/upload?${query.toString()}`);
    const hdrs: Record<string, string> = { 'Content-Type': file.type || 'application/octet-stream' };
    const tk = getStoredToken();
    if (tk) hdrs['Authorization'] = `Bearer ${tk}`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      credentials: 'include',
      headers: hdrs,
      body: file,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
    return data as GalleryItem;
  },
  updateGalleryItem: (id: string, details: Partial<GalleryItem>) =>
    request<GalleryItem>(`/api/admin/gallery/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(details),
    }),
  getLogs: () => request<ActivityLog[]>('/api/admin/logs'),
  getContactMessages: () => request<ContactMessage[]>('/api/admin/contact-messages'),
};
