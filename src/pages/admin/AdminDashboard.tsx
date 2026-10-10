import React, { useState, useEffect } from 'react';
import { api, clearStoredToken } from '../../lib/api.ts';
import type {
  User,
  DashboardMetrics,
  Room,
  Booking,
  HotelSettings,
  Facility,
  GalleryItem,
  ActivityLog,
  ContactMessage,
  RoomType,
  RoomOperationalStatus,
  BookingStatus,
  PaymentMethod,
  PaymentStatus
} from '../../types/hotel.ts';
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  CheckSquare,
  Users,
  Settings,
  History,
  Sparkles,
  Image,
  Mail,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Phone,
  Edit,
  Trash2,
  Lock
} from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotelSettings, setHotelSettings] = useState<HotelSettings | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals & sub-state
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('ALL');

  // Add/Edit Room Modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomFormNumber, setRoomFormNumber] = useState('');
  const [roomFormName, setRoomFormName] = useState('');
  const [roomFormTypeId, setRoomFormTypeId] = useState('');
  const [roomFormPrice, setRoomFormPrice] = useState(90000);
  const [roomFormMaxGuests, setRoomFormMaxGuests] = useState(2);
  const [roomFormFloor, setRoomFormFloor] = useState(1);
  const [roomFormDescription, setRoomFormDescription] = useState('');

  // Add User Modal (Owner)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormRole, setUserFormRole] = useState<'MANAGER' | 'STAFF'>('STAFF');
  const [userFormPermissions, setUserFormPermissions] = useState<string[]>(['manage_bookings', 'checkin_checkout']);

  // Settings form (Owner)
  const [settingsForm, setSettingsForm] = useState<Partial<HotelSettings>>({});

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    try {
      const [m, r, rt, b, s, f, g] = await Promise.all([
        api.getMetrics().catch(() => null),
        api.getAdminRooms().catch(() => []),
        api.getRoomTypes().catch(() => []),
        api.getAdminBookings().catch(() => []),
        api.getSettings().catch(() => null),
        api.getFacilities().catch(() => []),
        api.getGallery().catch(() => []),
      ]);

      if (m) setMetrics(m);
      if (r) setRooms(r);
      if (rt) {
        setRoomTypes(rt);
        if (rt.length > 0 && !roomFormTypeId) setRoomFormTypeId(rt[0].id);
      }
      if (b) setBookings(b);
      if (s) {
        setHotelSettings(s);
        setSettingsForm(s);
      }
      if (f) setFacilities(f);
      if (g) setGallery(g);

      if (user.role === 'OWNER') {
        const [u, l, msg] = await Promise.all([
          api.getUsers().catch(() => []),
          api.getLogs().catch(() => []),
          api.getContactMessages().catch(() => []),
        ]);
        if (u) setUsersList(u);
        if (l) setLogs(l);
        if (msg) setMessages(msg);
      }
    } catch (err) {
      console.error('Error refreshing admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper permission checks
  const canManageRooms = user.role === 'OWNER' || user.permissions.includes('manage_rooms');
  const canUpdateCleaning = user.role === 'OWNER' || user.permissions.includes('cleaning_updates') || canManageRooms;
  const canManageBookings = user.role === 'OWNER' || user.permissions.includes('manage_bookings');
  const canCheckInOut = user.role === 'OWNER' || user.permissions.includes('checkin_checkout');
  const isOwner = user.role === 'OWNER';

  // Room status quick toggle
  const handleRoomStatusChange = async (roomId: string, newStatus: RoomOperationalStatus) => {
    try {
      await api.updateRoomStatus(roomId, newStatus);
      notify(`Room status updated to ${newStatus}.`);
      refreshData();
    } catch (err: any) {
      notify(err.message || 'Failed to update status.');
    }
  };

  // Save room (Create or Edit)
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.updateRoom(editingRoom.id, {
          name: roomFormName,
          typeId: roomFormTypeId,
          pricePerNight: roomFormPrice,
          maxGuests: roomFormMaxGuests,
          floor: roomFormFloor,
          description: roomFormDescription,
        });
        notify(`Room ${editingRoom.roomNumber} updated successfully.`);
      } else {
        await api.createRoom({
          roomNumber: roomFormNumber,
          name: roomFormName,
          typeId: roomFormTypeId,
          pricePerNight: roomFormPrice,
          maxGuests: roomFormMaxGuests,
          floor: roomFormFloor,
          description: roomFormDescription,
        });
        notify(`Room ${roomFormNumber} created successfully.`);
      }
      setIsRoomModalOpen(false);
      setEditingRoom(null);
      refreshData();
    } catch (err: any) {
      notify(err.message || 'Failed to save room.');
    }
  };

  // Delete Room (Owner only)
  const handleDeleteRoom = async (id: string, num: string) => {
    if (!window.confirm(`Are you sure you want to delete Room ${num}?`)) return;
    try {
      await api.deleteRoom(id);
      notify(`Room ${num} deleted.`);
      refreshData();
    } catch (err: any) {
      notify(err.message || 'Failed to delete room.');
    }
  };

  // Update Booking Status
  const handleBookingStatusChange = async (bookingId: string, status: BookingStatus) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      notify(`Booking status changed to ${status}.`);
      refreshData();
    } catch (err: any) {
      notify(err.message || 'Failed to update booking.');
    }
  };

  // Mark Booking Paid
  const handleMarkBookingPaid = async (booking: Booking) => {
    try {
      await api.updateBookingPayment(booking.id, {
        paymentStatus: 'PAID',
        amountPaid: booking.totalPrice,
        paymentMethod: booking.paymentMethod || 'Cash at Front Desk',
      });
      notify(`Booking ${booking.bookingReference} marked as PAID.`);
      refreshData();
    } catch (err: any) {
      notify(err.message || 'Failed to update payment.');
    }
  };

  // Save Hotel Settings (Owner only)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settingsForm);
      notify('Hotel configuration updated successfully.');
      refreshData();
    } catch (err: any) {
      notify(err.message || 'Failed to update settings.');
    }
  };

  // Create User (Owner only)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({
        name: userFormName,
        email: userFormEmail,
        password: userFormPassword,
        role: userFormRole,
        permissions: userFormPermissions,
      });
      notify(`User ${userFormEmail} created successfully.`);
      setIsUserModalOpen(false);
      setUserFormName('');
      setUserFormEmail('');
      setUserFormPassword('');
      refreshData();
    } catch (err: any) {
      notify(err.message || 'Failed to create user.');
    }
  };

  // Delete User (Owner only)
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Delete user ${userName}?`)) return;
    try {
      await api.deleteUser(userId);
      notify(`User ${userName} deleted.`);
      refreshData();
    } catch (err: any) {
      notify(err.message || 'Failed to delete user.');
    }
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingStatusFilter !== 'ALL' && b.status !== bookingStatusFilter) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      return (
        b.bookingReference.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        b.roomNumber.includes(q) ||
        b.guestPhone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F4EE] flex flex-col">
      {/* Top Bar for Admin */}
      <header className="bg-[#121316] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer"
            title="Return to ANABE HOTEL Homepage"
          >
            <div className="p-1 bg-[#FAF8F5] rounded-md border border-[#2D3039]">
              <img
                src="/anabe-hotel-logo.png"
                alt="ANABE HOTEL Logo"
                className="h-7 w-auto object-contain"
                width={70}
                height={28}
              />
            </div>
            <span className="font-serif text-base sm:text-lg font-bold tracking-widest uppercase hidden md:inline">
              {hotelSettings?.hotelName || 'ANABE HOTEL'}
            </span>
          </button>
          <span className="text-xs text-neutral-400 hidden sm:inline">|</span>
          <span className="text-xs text-[#D8BD90] font-medium hidden sm:inline">
            Property Management System
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-white block">{user.name}</span>
            <span className="text-[10px] text-[#B89667] uppercase font-mono tracking-wider">
              {user.role}
            </span>
          </div>

          <button
            onClick={refreshData}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#B89667]' : ''}`} />
          </button>

          <button
            onClick={() => {
              clearStoredToken();
              onLogout();
            }}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-red-950/80 hover:text-red-200 text-neutral-300 text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 bg-[#1A1A18] text-white px-4 py-2.5 rounded shadow-lg text-xs flex items-center gap-2 border border-[#B89667] animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#B89667]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-[#E2DED4] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <div className="p-2.5 mb-3 bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl flex items-center justify-center">
              <img
                src="/anabe-hotel-logo.png"
                alt="ANABE HOTEL Logo"
                className="h-10 w-auto object-contain"
                width={100}
                height={40}
              />
            </div>
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C8A82]">
              Management Modules
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#1A1A18] text-white font-semibold'
                  : 'text-[#4A4944] hover:bg-[#F0ECE2]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#B89667]" />
              <span>Dashboard Overview</span>
            </button>

            {canUpdateCleaning && (
              <button
                onClick={() => setActiveTab('rooms')}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'rooms'
                    ? 'bg-[#1A1A18] text-white font-semibold'
                    : 'text-[#4A4944] hover:bg-[#F0ECE2]'
                }`}
              >
                <BedDouble className="w-4 h-4 text-[#B89667]" />
                <span>65 Rooms & Floor Grid</span>
              </button>
            )}

            {canManageBookings && (
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-[#1A1A18] text-white font-semibold'
                    : 'text-[#4A4944] hover:bg-[#F0ECE2]'
                }`}
              >
                <CalendarDays className="w-4 h-4 text-[#B89667]" />
                <span>Bookings & Payments</span>
              </button>
            )}

            {canCheckInOut && (
              <button
                onClick={() => setActiveTab('frontdesk')}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'frontdesk'
                    ? 'bg-[#1A1A18] text-white font-semibold'
                    : 'text-[#4A4944] hover:bg-[#F0ECE2]'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-[#B89667]" />
                <span>Check-in / Check-out Desk</span>
              </button>
            )}

            {(user.role === 'OWNER' || user.role === 'MANAGER') && (
              <button
                onClick={() => setActiveTab('facilities')}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'facilities'
                    ? 'bg-[#1A1A18] text-white font-semibold'
                    : 'text-[#4A4944] hover:bg-[#F0ECE2]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#B89667]" />
                <span>Facilities Management</span>
              </button>
            )}

            {(user.role === 'OWNER' || user.role === 'MANAGER') && (
              <button
                onClick={() => setActiveTab('gallery')}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'gallery'
                    ? 'bg-[#1A1A18] text-white font-semibold'
                    : 'text-[#4A4944] hover:bg-[#F0ECE2]'
                }`}
              >
                <Image className="w-4 h-4 text-[#B89667]" />
                <span>Photo Gallery</span>
              </button>
            )}

            {isOwner && (
              <>
                <div className="pt-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#8C8A82]">
                  Owner Governance
                </div>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-[#1A1A18] text-white font-semibold'
                      : 'text-[#4A4944] hover:bg-[#F0ECE2]'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#B89667]" />
                  <span>Staff & Managers (RBAC)</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-[#1A1A18] text-white font-semibold'
                      : 'text-[#4A4944] hover:bg-[#F0ECE2]'
                  }`}
                >
                  <Settings className="w-4 h-4 text-[#B89667]" />
                  <span>Hotel Settings</span>
                </button>

                <button
                  onClick={() => setActiveTab('logs')}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'logs'
                      ? 'bg-[#1A1A18] text-white font-semibold'
                      : 'text-[#4A4944] hover:bg-[#F0ECE2]'
                  }`}
                >
                  <History className="w-4 h-4 text-[#B89667]" />
                  <span>Activity Logs</span>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'messages'
                      ? 'bg-[#1A1A18] text-white font-semibold'
                      : 'text-[#4A4944] hover:bg-[#F0ECE2]'
                  }`}
                >
                  <Mail className="w-4 h-4 text-[#B89667]" />
                  <span>Guest Inquiries</span>
                </button>
              </>
            )}
          </div>

          {/* Quick info in sidebar */}
          <div className="pt-4 border-t border-[#E8E4DA] text-[11px] text-[#7A7870] space-y-1">
            <div className="font-semibold text-[#1A1A18]">ANABE HOTEL Contact</div>
            <div>0788 845 520</div>
            <div>0783 218 170</div>
          </div>
        </aside>

        {/* Tab Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && metrics && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18]">
                    Property Overview & Metrics
                  </h1>
                  <p className="text-xs text-[#66655E]">
                    Real database analytics for ANABE HOTEL. Total tracked rooms: {metrics.totalRooms}.
                  </p>
                </div>
                <div className="text-xs text-[#7A7870] bg-white px-3 py-1.5 rounded border border-[#E2DED4]">
                  Active Role: <strong className="text-[#1A1A18]">{user.role}</strong>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#E2DED4] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#7A7870] block">Total Rooms</span>
                  <div className="text-2xl font-serif font-bold text-[#1A1A18] tabular-nums mt-1">
                    {metrics.totalRooms}
                  </div>
                  <span className="text-[10px] text-neutral-500">Spread across 4 floors</span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2DED4] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Available Now</span>
                  <div className="text-2xl font-serif font-bold text-emerald-800 tabular-nums mt-1">
                    {metrics.availableRoomsNow}
                  </div>
                  <span className="text-[10px] text-emerald-600">Ready for check-in</span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2DED4] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block">Occupied Rooms</span>
                  <div className="text-2xl font-serif font-bold text-indigo-900 tabular-nums mt-1">
                    {metrics.occupiedRoomsNow}
                  </div>
                  <span className="text-[10px] text-indigo-600">Guests checked in</span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2DED4] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Cleaning / Turnover</span>
                  <div className="text-2xl font-serif font-bold text-amber-800 tabular-nums mt-1">
                    {metrics.cleaningRoomsNow}
                  </div>
                  <span className="text-[10px] text-amber-600">Housekeeping active</span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2DED4] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Maintenance / Out</span>
                  <div className="text-2xl font-serif font-bold text-rose-800 tabular-nums mt-1">
                    {metrics.maintenanceRoomsNow}
                  </div>
                  <span className="text-[10px] text-rose-600">Under inspection</span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2DED4] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#7A7870] block">Today's Check-ins</span>
                  <div className="text-2xl font-serif font-bold text-[#1A1A18] tabular-nums mt-1">
                    {metrics.todayCheckIns}
                  </div>
                  <span className="text-[10px] text-[#7A7870]">Arrivals scheduled</span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2DED4] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#7A7870] block">Today's Check-outs</span>
                  <div className="text-2xl font-serif font-bold text-[#1A1A18] tabular-nums mt-1">
                    {metrics.todayCheckOuts}
                  </div>
                  <span className="text-[10px] text-[#7A7870]">Departures scheduled</span>
                </div>

                {isOwner && (
                  <div className="bg-white p-4 rounded-lg border border-[#E2DED4] shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#B89667] block">Recorded Revenue</span>
                    <div className="text-2xl font-serif font-bold text-[#1A1A18] tabular-nums mt-1">
                      {metrics.totalRevenue.toLocaleString()} <span className="text-xs font-sans font-normal text-[#7A7870]">RWF</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium">Owner financial view</span>
                  </div>
                )}
              </div>

              {/* Quick Status Bar & Quick Actions */}
              <div className="bg-white p-6 rounded-lg border border-[#E2DED4] space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1A1A18]">
                  Operational Quick Links
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className="px-4 py-2 bg-[#1A1A18] text-white hover:bg-[#B89667] text-xs font-semibold rounded uppercase tracking-wider cursor-pointer"
                  >
                    View 65-Room Floor Grid
                  </button>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="px-4 py-2 bg-[#F0ECE2] hover:bg-[#E2DED4] text-[#1A1A18] text-xs font-semibold rounded uppercase tracking-wider cursor-pointer"
                  >
                    Manage Bookings ({bookings.length})
                  </button>
                  {canManageRooms && (
                    <button
                      onClick={() => {
                        setEditingRoom(null);
                        setRoomFormNumber('');
                        setRoomFormName('');
                        setRoomFormDescription('');
                        setIsRoomModalOpen(true);
                      }}
                      className="px-4 py-2 border border-[#B89667] text-[#B89667] hover:bg-[#FAF6EF] text-xs font-semibold rounded uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Room Beyond 65
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 65 ROOMS & FLOOR GRID */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18]">
                    Room Operational Grid & Cleaning
                  </h1>
                  <p className="text-xs text-[#66655E]">
                    Real-time operational status for all 65 rooms. Reception and housekeeping staff can update status directly.
                  </p>
                </div>

                {canManageRooms && (
                  <button
                    onClick={() => {
                      setEditingRoom(null);
                      setRoomFormNumber('');
                      setRoomFormName('');
                      setRoomFormDescription('');
                      setIsRoomModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Room</span>
                  </button>
                )}
              </div>

              {/* Floor Switcher */}
              <div className="flex items-center gap-2 border-b border-[#E0DCD2] pb-3">
                {[1, 2, 3, 4].map((fl) => {
                  const count = rooms.filter((r) => r.floor === fl).length;
                  return (
                    <button
                      key={fl}
                      onClick={() => setSelectedFloor(fl)}
                      className={`px-4 py-2 text-xs font-semibold rounded transition-colors cursor-pointer ${
                        selectedFloor === fl
                          ? 'bg-[#1A1A18] text-white shadow-xs'
                          : 'bg-white text-[#4A4944] hover:bg-[#F2ECE0] border border-[#E0DCD2]'
                      }`}
                    >
                      Floor {fl} ({count} Rooms)
                    </button>
                  );
                })}
              </div>

              {/* Floor Rooms Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {rooms
                  .filter((r) => r.floor === selectedFloor)
                  .map((room) => {
                    const statusColors: Record<RoomOperationalStatus, { bg: string; text: string; border: string }> = {
                      AVAILABLE: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
                      BOOKED: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
                      CHECKED_IN: { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-300' },
                      CLEANING: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
                      MAINTENANCE: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },
                      OUT_OF_SERVICE: { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-300' },
                    };

                    const style = statusColors[room.status] || statusColors.AVAILABLE;

                    return (
                      <div
                        key={room.id}
                        className={`bg-white rounded-lg border ${style.border} p-3 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-base font-bold text-[#1A1A18]">
                              {room.roomNumber}
                            </span>
                            {canManageRooms && (
                              <button
                                onClick={() => {
                                  setEditingRoom(room);
                                  setRoomFormNumber(room.roomNumber);
                                  setRoomFormName(room.name);
                                  setRoomFormTypeId(room.typeId);
                                  setRoomFormPrice(room.pricePerNight);
                                  setRoomFormMaxGuests(room.maxGuests);
                                  setRoomFormFloor(room.floor);
                                  setRoomFormDescription(room.description);
                                  setIsRoomModalOpen(true);
                                }}
                                className="p-1 text-[#7A7870] hover:text-[#1A1A18] rounded cursor-pointer"
                                title="Edit Room"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <span className="text-[11px] text-[#66655E] line-clamp-1 block mb-2">
                            {room.typeName}
                          </span>
                        </div>

                        {/* Operational Status Selector */}
                        <div className="space-y-1.5 pt-2 border-t border-[#F0ECE2]">
                          <select
                            value={room.status}
                            disabled={!canUpdateCleaning}
                            onChange={(e) =>
                              handleRoomStatusChange(room.id, e.target.value as RoomOperationalStatus)
                            }
                            className={`w-full text-[10px] font-bold uppercase rounded py-1 px-1.5 border ${style.border} ${style.bg} ${style.text} cursor-pointer focus:outline-none`}
                          >
                            <option value="AVAILABLE">AVAILABLE</option>
                            <option value="CLEANING">CLEANING</option>
                            <option value="CHECKED_IN">CHECKED_IN</option>
                            <option value="BOOKED">BOOKED</option>
                            <option value="MAINTENANCE">MAINTENANCE</option>
                            <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                          </select>

                          <div className="text-[10px] text-[#7A7870] text-center tabular-nums">
                            {room.pricePerNight.toLocaleString()} RWF
                          </div>

                          {isOwner && (
                            <button
                              onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                              className="w-full text-[10px] text-red-600 hover:text-red-800 text-center cursor-pointer pt-1"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: BOOKINGS & PAYMENTS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18]">
                    Bookings & Reservations
                  </h1>
                  <p className="text-xs text-[#66655E]">
                    View all guest reservations, verify payments (MTN MoMo, Airtel, Cards), and manage statuses.
                  </p>
                </div>
              </div>

              {/* Filter and search bar */}
              <div className="bg-white p-4 rounded-lg border border-[#E2DED4] flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search ref, guest name, room..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#888780] absolute left-2.5 top-2.5" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-[#7A7870]">Status:</span>
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="CHECKED_IN">CHECKED_IN</option>
                    <option value="CHECKED_OUT">CHECKED_OUT</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white rounded-lg border border-[#E2DED4] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F5] text-[#6E6C64] uppercase text-[10px] tracking-wider border-b border-[#E2DED4]">
                      <tr>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Room</th>
                        <th className="py-3 px-4">Guest</th>
                        <th className="py-3 px-4">Dates</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE4]">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-[#7A7870]">
                            No bookings match your search query.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-[#FAF9F5] transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[#1A1A18]">
                              {b.bookingReference}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-[#1A1A18]">Room {b.roomNumber}</span>
                              <span className="text-[10px] text-[#7A7870] block">{b.typeName}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-[#1A1A18]">{b.guestName}</span>
                              <span className="text-[10px] text-[#7A7870] block tabular-nums">{b.guestPhone}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="tabular-nums">{b.checkIn} → {b.checkOut}</span>
                              <span className="text-[10px] text-[#7A7870] block">({b.nights} nights)</span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-[#1A1A18] tabular-nums">
                              {b.totalPrice.toLocaleString()} RWF
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                b.paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {b.paymentStatus}
                              </span>
                              <span className="text-[10px] text-[#7A7870] block">{b.paymentMethod || 'Unselected'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={b.status}
                                onChange={(e) =>
                                  handleBookingStatusChange(b.id, e.target.value as BookingStatus)
                                }
                                className="text-[11px] font-medium bg-[#F0ECE2] border border-[#D5D0C5] rounded px-2 py-1 cursor-pointer"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="CHECKED_IN">CHECKED_IN</option>
                                <option value="CHECKED_OUT">CHECKED_OUT</option>
                                <option value="CANCELLED">CANCELLED</option>
                                <option value="NO_SHOW">NO_SHOW</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {b.paymentStatus !== 'PAID' && (
                                <button
                                  onClick={() => handleMarkBookingPaid(b)}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECK-IN / CHECK-OUT DESK */}
          {activeTab === 'frontdesk' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18]">
                  Front Desk Check-in / Check-out Desk
                </h1>
                <p className="text-xs text-[#66655E]">
                  Fast arrivals and departures workflow for reception staff.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Check-ins Queue */}
                <div className="bg-white p-5 rounded-lg border border-[#E2DED4] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DE]">
                    <h3 className="font-serif text-lg font-bold text-[#1A1A18] flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Pending Arrivals & Check-ins
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {bookings
                      .filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING')
                      .slice(0, 10)
                      .map((b) => (
                        <div
                          key={b.id}
                          className="p-3 bg-[#FAF9F5] border border-[#E6E2D8] rounded flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#1A1A18]">{b.guestName}</div>
                            <span className="text-[11px] text-[#7A7870]">
                              Room {b.roomNumber} ({b.typeName}) · Ref: <span className="font-mono">{b.bookingReference}</span>
                            </span>
                            <div className="text-[10px] text-[#7A7870] tabular-nums mt-0.5">
                              Check-in: {b.checkIn} · {b.nights} night(s)
                            </div>
                          </div>

                          <button
                            onClick={() => handleBookingStatusChange(b.id, 'CHECKED_IN')}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            Check In Guest
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Check-outs Queue */}
                <div className="bg-white p-5 rounded-lg border border-[#E2DED4] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DE]">
                    <h3 className="font-serif text-lg font-bold text-[#1A1A18] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Currently In-House (Check-out Queue)
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {bookings
                      .filter((b) => b.status === 'CHECKED_IN')
                      .map((b) => (
                        <div
                          key={b.id}
                          className="p-3 bg-[#FAF9F5] border border-[#E6E2D8] rounded flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#1A1A18]">{b.guestName}</div>
                            <span className="text-[11px] text-[#7A7870]">
                              Room {b.roomNumber} · Due check-out: {b.checkOut}
                            </span>
                          </div>

                          <button
                            onClick={() => handleBookingStatusChange(b.id, 'CHECKED_OUT')}
                            className="px-3.5 py-1.5 bg-[#1A1A18] hover:bg-[#B89667] text-white font-bold rounded text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            Check Out Guest
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STAFF & USERS (Owner Only) */}
          {activeTab === 'users' && isOwner && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18]">
                    Staff & Access Control (RBAC)
                  </h1>
                  <p className="text-xs text-[#66655E]">
                    Owner-only governance: Add managers, receptionists, housekeeping, and assign specific permissions.
                  </p>
                </div>
                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="px-4 py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create User Account</span>
                </button>
              </div>

              <div className="bg-white rounded-lg border border-[#E2DED4] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F5] text-[#6E6C64] uppercase text-[10px] tracking-wider border-b border-[#E2DED4]">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Permissions</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE4]">
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 px-4 font-semibold text-[#1A1A18]">{u.name}</td>
                        <td className="py-3 px-4 text-[#66655E]">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'OWNER'
                              ? 'bg-[#FAF6EF] text-[#B89667] border border-[#E6D4B7]'
                              : u.role === 'MANAGER'
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[10px] text-[#7A7870]">
                          {u.permissions.join(', ')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-700 font-semibold">{u.status}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {u.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="text-red-600 hover:text-red-800 text-xs cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: HOTEL SETTINGS (Owner Only) */}
          {activeTab === 'settings' && isOwner && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18]">
                  Hotel Settings & Contact Information
                </h1>
                <p className="text-xs text-[#66655E]">
                  Configure official hotel phone numbers, check-in schedules, currency, and policies.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-lg border border-[#E2DED4] shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                      Hotel Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.hotelName || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hotelName: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.email || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                      Owner Contact Phone 1
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone1 || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone1: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                      Owner Contact Phone 2
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone2 || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone2: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                      Check-In Time
                    </label>
                    <input
                      type="text"
                      value={settingsForm.checkInTime || '14:00'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, checkInTime: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                      Check-Out Time
                    </label>
                    <input
                      type="text"
                      value={settingsForm.checkOutTime || '11:00'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, checkOutTime: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                    Hotel Description
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.description || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                >
                  Save Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: ACTIVITY LOGS (Owner Only) */}
          {activeTab === 'logs' && isOwner && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18]">
                  Activity & Audit Logs
                </h1>
                <p className="text-xs text-[#66655E]">
                  Complete chronological audit trail of all staff and guest actions.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-[#E2DED4] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F5] text-[#6E6C64] uppercase text-[10px] tracking-wider border-b border-[#E2DED4]">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE4]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FAF9F5]">
                        <td className="py-3 px-4 text-[#7A7870] font-mono text-[10px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#1A1A18]">{log.userName}</td>
                        <td className="py-3 px-4 font-mono text-[10px] text-[#B89667]">{log.userRole}</td>
                        <td className="py-3 px-4 font-mono text-[10px] font-bold text-[#1A1A18]">{log.action}</td>
                        <td className="py-3 px-4 text-[#5C5B55]">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: GUEST INQUIRIES */}
          {activeTab === 'messages' && isOwner && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18]">
                  Guest Contact Inquiries
                </h1>
                <p className="text-xs text-[#66655E]">
                  Messages submitted by clients via public website.
                </p>
              </div>

              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="bg-white p-8 text-center text-xs text-[#7A7870] rounded-lg border border-[#E2DED4]">
                    No contact messages yet.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="bg-white p-5 rounded-lg border border-[#E2DED4] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#1A1A18]">{m.name}</span>
                        <span className="text-[10px] font-mono text-[#7A7870]">{new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-[#7A7870]">
                        Email: <a href={`mailto:${m.email}`} className="text-[#1A1A18] underline">{m.email}</a> · Phone: {m.phone || 'N/A'}
                      </div>
                      <div className="text-xs font-medium text-[#B89667]">{m.subject}</div>
                      <p className="text-xs text-[#4A4944] pt-2 border-t border-[#F0ECE2] leading-relaxed">
                        {m.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-[#E2DED4]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl font-bold text-[#1A1A18]">
                {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Room'}
              </h3>
              <button onClick={() => setIsRoomModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  value={roomFormNumber}
                  onChange={(e) => setRoomFormNumber(e.target.value)}
                  disabled={!!editingRoom}
                  required
                  placeholder="e.g. 501"
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomFormName}
                  onChange={(e) => setRoomFormName(e.target.value)}
                  placeholder="e.g. Penthouse Suite 501"
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                    Room Type
                  </label>
                  <select
                    value={roomFormTypeId}
                    onChange={(e) => setRoomFormTypeId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                  >
                    {roomTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                    Floor
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={roomFormFloor}
                    onChange={(e) => setRoomFormFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                    Nightly Price (RWF)
                  </label>
                  <input
                    type="number"
                    value={roomFormPrice}
                    onChange={(e) => setRoomFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={roomFormMaxGuests}
                    onChange={(e) => setRoomFormMaxGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={roomFormDescription}
                  onChange={(e) => setRoomFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Save Room
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal (Owner Only) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-[#E2DED4]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl font-bold text-[#1A1A18]">
                Create Staff / Manager Account
              </h3>
              <button onClick={() => setIsUserModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userFormName}
                  onChange={(e) => setUserFormName(e.target.value)}
                  required
                  placeholder="e.g. Eric Manzi"
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userFormEmail}
                  onChange={(e) => setUserFormEmail(e.target.value)}
                  required
                  placeholder="e.g. e.manzi@anabehotel.com"
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={userFormPassword}
                  onChange={(e) => setUserFormPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
                  Role
                </label>
                <select
                  value={userFormRole}
                  onChange={(e) => setUserFormRole(e.target.value as 'MANAGER' | 'STAFF')}
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded"
                >
                  <option value="STAFF">STAFF (Reception or Housekeeping)</option>
                  <option value="MANAGER">MANAGER (Operations)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
