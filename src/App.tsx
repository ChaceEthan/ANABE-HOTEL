import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { BookingLookupModal } from './components/BookingLookupModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { RoomsPage } from './pages/RoomsPage.tsx';
import { RoomDetailsModal } from './pages/RoomDetailsModal.tsx';
import { BookingPage } from './pages/BookingPage.tsx';
import { FacilitiesPage } from './pages/FacilitiesPage.tsx';
import { GalleryPage } from './pages/GalleryPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { FaqPage } from './pages/FaqPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { TermsPage } from './pages/TermsPage.tsx';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { api } from './lib/api.ts';
import type { HotelSettings, Room, User } from './types/hotel.ts';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [settings, setSettings] = useState<HotelSettings | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Selected room & dates for booking
  const [selectedBookingRoom, setSelectedBookingRoom] = useState<Room | null>(null);
  const [selectedBookingDates, setSelectedBookingDates] = useState<{
    checkIn: string;
    checkOut: string;
    guests: number;
  } | undefined>(undefined);

  // Modals
  const [inspectRoom, setInspectRoom] = useState<Room | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  // Load hotel settings and restore session if token exists
  useEffect(() => {
    async function init() {
      try {
        const s = await api.getSettings();
        setSettings(s);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }

      try {
        const user = await api.getMe();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
      setAuthChecked(true);
    }
    init();

    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    const handleSessionExpired = () => {
      setCurrentUser(null);
      setCurrentRoute((route) => {
        if (route.startsWith('/admin') && route !== '/admin/login') {
          window.history.replaceState({}, '', '/admin/login');
          return '/admin/login';
        }
        return route;
      });
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('anabe:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('anabe:session-expired', handleSessionExpired);
    };
  }, []);

  // Inspect direct /rooms/:id deep links on load or route change
  useEffect(() => {
    if (currentRoute.startsWith('/rooms/') && currentRoute.length > 7) {
      const roomIdOrNum = decodeURIComponent(currentRoute.slice(7));
      api.getRoom(roomIdOrNum)
        .then((room) => {
          if (room) setInspectRoom(room);
        })
        .catch(() => {
          // If room not found, smoothly revert to /rooms
          window.history.replaceState({}, '', '/rooms');
          setCurrentRoute('/rooms');
        });
    }
  }, [currentRoute]);

  const navigate = (route: string, state?: any) => {
    if (route === '/rooms' && state) {
      setSelectedBookingDates(state);
    }
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRoomForBooking = (
    room: Room,
    dates?: { checkIn: string; checkOut: string; guests: number }
  ) => {
    setSelectedBookingRoom(room);
    if (dates) setSelectedBookingDates(dates);
    navigate('/booking');
  };

  const isAdminRoute = currentRoute.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#1A1A18] font-sans">
      {/* Show Public Navbar on non-dashboard routes */}
      {(!isAdminRoute || currentRoute === '/admin/login') && (
        <Navbar
          settings={settings}
          currentRoute={currentRoute}
          onNavigate={navigate}
          onOpenLookup={() => setIsLookupOpen(true)}
        />
      )}

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentRoute === '/' && (
          <HomePage
            settings={settings}
            onNavigate={navigate}
            onSelectRoom={handleSelectRoomForBooking}
          />
        )}

        {(currentRoute === '/rooms' || currentRoute.startsWith('/rooms/')) && (
          <RoomsPage
            initialSearch={selectedBookingDates}
            onSelectRoom={handleSelectRoomForBooking}
            onViewRoomDetails={(room) => {
              setInspectRoom(room);
              window.history.pushState({}, '', `/rooms/${encodeURIComponent(room.roomNumber)}`);
              setCurrentRoute(`/rooms/${encodeURIComponent(room.roomNumber)}`);
            }}
          />
        )}

        {currentRoute === '/booking' && (
          <BookingPage
            initialRoom={selectedBookingRoom}
            initialDates={selectedBookingDates}
            settings={settings}
            onNavigateHome={() => navigate('/')}
          />
        )}

        {currentRoute === '/facilities' && (
          <FacilitiesPage onBookClick={() => navigate('/booking')} />
        )}

        {currentRoute === '/gallery' && <GalleryPage />}

        {currentRoute === '/about' && (
          <AboutPage settings={settings} onBookClick={() => navigate('/booking')} />
        )}

        {currentRoute === '/contact' && <ContactPage settings={settings} />}

        {currentRoute === '/faq' && (
          <FaqPage checkInTime={settings?.checkInTime} checkOutTime={settings?.checkOutTime} onNavigate={navigate} />
        )}

        {currentRoute === '/privacy' && <PrivacyPage />}

        {currentRoute === '/terms' && <TermsPage />}

        {currentRoute === '/admin/login' && (
          <AdminLoginPage
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              navigate('/admin/dashboard');
            }}
            onNavigateHome={() => navigate('/')}
          />
        )}

        {currentRoute.startsWith('/admin') && currentRoute !== '/admin/login' && (
          currentUser ? (
            <AdminDashboard
              user={currentUser}
              onLogout={() => {
                setCurrentUser(null);
                navigate('/admin/login');
              }}
              onNavigateHome={() => navigate('/')}
            />
          ) : (
            <AdminLoginPage
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                navigate('/admin/dashboard');
              }}
              onNavigateHome={() => navigate('/')}
            />
          )
        )}
      </main>

      {/* Show Public Footer on non-dashboard routes */}
      {(!isAdminRoute || currentRoute === '/admin/login') && (
        <Footer
          settings={settings}
          onNavigate={navigate}
          onOpenLookup={() => setIsLookupOpen(true)}
        />
      )}

      {/* Room Details Modal */}
      <RoomDetailsModal
        room={inspectRoom}
        onClose={() => {
          setInspectRoom(null);
          if (currentRoute.startsWith('/rooms/')) {
            window.history.pushState({}, '', '/rooms');
            setCurrentRoute('/rooms');
          }
        }}
        onBookRoom={handleSelectRoomForBooking}
      />

      {/* Booking Reference Lookup Modal */}
      <BookingLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
      />
    </div>
  );
}
