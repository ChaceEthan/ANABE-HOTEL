import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import type { Room, RoomType } from '../types/hotel.ts';
import {
  Search,
  Filter,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  BedDouble
} from 'lucide-react';

interface RoomsPageProps {
  initialSearch?: { checkIn: string; checkOut: string; guests: number };
  onSelectRoom: (room: Room, dates?: { checkIn: string; checkOut: string; guests: number }) => void;
  onViewRoomDetails: (room: Room) => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({
  initialSearch,
  onSelectRoom,
  onViewRoomDetails,
}) => {
  const getToday = () => new Date().toISOString().split('T')[0];
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(initialSearch?.checkIn || getToday());
  const [checkOut, setCheckOut] = useState(initialSearch?.checkOut || getTomorrow());
  const [guests, setGuests] = useState(initialSearch?.guests || 1);

  const [rooms, setRooms] = useState<(Room & { isAvailableForDates?: boolean })[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [floorFilter, setFloorFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Load rooms and availability
  useEffect(() => {
    async function fetchRoomsAndTypes() {
      setLoading(true);
      try {
        const types = await api.getRoomTypes();
        setRoomTypes(types);

        // Fetch real availability for current date range
        const availData = await api.checkAvailability(checkIn, checkOut, guests);
        setRooms(availData.rooms);
      } catch (err) {
        console.error('Error fetching availability:', err);
        // Fallback to plain rooms list if date error
        const fallbackRooms = await api.getRooms();
        setRooms(fallbackRooms);
      } finally {
        setLoading(false);
      }
    }
    fetchRoomsAndTypes();
  }, [checkIn, checkOut, guests]);

  const handleDateChange = async () => {
    if (checkIn >= checkOut) return;
    setLoading(true);
    try {
      const availData = await api.checkAvailability(checkIn, checkOut, guests);
      setRooms(availData.rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter in memory for instantaneous search/type/price/floor responsiveness
  const filteredRooms = rooms.filter((room) => {
    if (selectedType !== 'ALL' && room.typeId !== selectedType) {
      return false;
    }
    if (floorFilter !== 'ALL' && room.floor !== Number(floorFilter)) {
      return false;
    }
    if (room.pricePerNight > maxPrice) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        room.name.toLowerCase().includes(q) ||
        room.roomNumber.includes(q) ||
        room.typeName.toLowerCase().includes(q) ||
        room.amenities.some((a) => a.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const availableCount = filteredRooms.filter((r) => r.isAvailableForDates !== false).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#E8E4DA] pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B89667] mb-1">
          ANABE HOTEL Accommodations
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A18]">
              Browse & Reserve Rooms
            </h1>
            <p className="text-xs sm:text-sm text-[#66655E] mt-1">
              Select your stay dates to view live availability across all 65 rooms and suites.
            </p>
          </div>
          <div className="text-xs text-[#52514C] bg-[#FAF6EF] border border-[#E6D4B7] px-3.5 py-2 rounded">
            Showing <span className="font-bold text-[#1A1A18] tabular-nums">{availableCount}</span> available of <span className="font-bold text-[#1A1A18] tabular-nums">{filteredRooms.length}</span> rooms for {checkIn} → {checkOut}
          </div>
        </div>
      </div>

      {/* Real-time Dates & Availability Filter Panel */}
      <div className="bg-white p-5 rounded-lg border border-[#E2DED4] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
              Check-In Date
            </label>
            <input
              type="date"
              value={checkIn}
              min={getToday()}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (e.target.value >= checkOut) {
                  const next = new Date(e.target.value);
                  next.setDate(next.getDate() + 1);
                  setCheckOut(next.toISOString().split('T')[0]);
                }
              }}
              className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
              Check-Out Date
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
            >
              <option value={1}>1 Guest</option>
              <option value={2}>2 Guests</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4 Guests</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
              Search by Room or Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 204, Suite, King..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
              />
              <Search className="w-3.5 h-3.5 text-[#888780] absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Category Filters (Clean Segmented Tabs) */}
        <div className="pt-3 border-t border-[#ECE8DE] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#7A7870] mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Type:
            </span>
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                selectedType === 'ALL'
                  ? 'bg-[#1A1A18] text-white'
                  : 'bg-[#F2EFE8] text-[#4A4944] hover:bg-[#E6E2D8]'
              }`}
            >
              All Types
            </button>
            {roomTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                  selectedType === t.id
                    ? 'bg-[#1A1A18] text-white'
                    : 'bg-[#F2EFE8] text-[#4A4944] hover:bg-[#E6E2D8]'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Floor filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#7A7870]">Floor:</span>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="px-2 py-1 bg-[#F2EFE8] border border-[#D5D0C5] rounded text-xs"
              >
                <option value="ALL">All Floors (1-4)</option>
                <option value="1">Floor 1 (Rooms 101-116)</option>
                <option value="2">Floor 2 (Rooms 201-216)</option>
                <option value="3">Floor 3 (Rooms 301-316)</option>
                <option value="4">Floor 4 (Rooms 401-417)</option>
              </select>
            </div>

            {/* Price cap slider */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#7A7870]">Max Price:</span>
              <span className="font-semibold tabular-nums text-[#1A1A18]">
                {maxPrice.toLocaleString()} RWF
              </span>
              <input
                type="range"
                min={60000}
                max={250000}
                step={10000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-[#B89667] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-[#EFECE4] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-[#E2DED4] p-8">
          <BedDouble className="w-12 h-12 text-[#9A9890] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#1A1A18]">No Rooms Match Your Criteria</h3>
          <p className="text-xs text-[#6B6A64] mt-1 max-w-md mx-auto">
            Try adjusting your check-in/check-out dates or resetting your filters to view available accommodations.
          </p>
          <button
            onClick={() => {
              setSelectedType('ALL');
              setFloorFilter('ALL');
              setMaxPrice(300000);
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-[#1A1A18] text-white text-xs font-semibold rounded uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const isAvailable = room.isAvailableForDates !== false;

            return (
              <div
                key={room.id}
                className={`bg-white rounded-lg border overflow-hidden flex flex-col transition-all duration-200 ${
                  isAvailable
                    ? 'border-[#E2DED4] hover:shadow-md hover:border-[#B89667]/50'
                    : 'border-red-200 opacity-85 bg-red-50/10'
                }`}
              >
                {/* Photo & Availability Indicator */}
                <div className="relative h-52 bg-neutral-100 overflow-hidden">
                  <img
                    src={room.images[0] || '/src/assets/images/hotel_deluxe_room_1791471905013.jpg'}
                    alt={room.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Room Number tag */}
                  <div className="absolute top-3 left-3 bg-[#1A1A18]/90 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded font-mono">
                    Room {room.roomNumber}
                  </div>

                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-700/90 text-white backdrop-blur-xs shadow-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Available for Dates
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-rose-700/95 text-white backdrop-blur-xs shadow-xs tracking-wide">
                        <XCircle className="w-3.5 h-3.5" />
                        BOOKED for Selected Dates
                      </span>
                    )}
                  </div>

                  {/* Floor indicator */}
                  <div className="absolute bottom-3 left-3 bg-black/50 text-white/90 text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                    Floor {room.floor}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#737169] mb-1">
                      <span>{room.typeName}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#B89667]" />
                        Max {room.maxGuests} Guests
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#1A1A18] mb-2 line-clamp-1">
                      {room.name}
                    </h3>

                    <p className="text-xs text-[#66655E] line-clamp-2 leading-relaxed mb-3">
                      {room.description}
                    </p>

                    {/* Unboxed Metadata Amenities list */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#6E6C64]">
                      {room.amenities.slice(0, 3).map((amenity, idx) => (
                        <React.Fragment key={amenity}>
                          <span>{amenity}</span>
                          {idx < 2 && <span aria-hidden="true" className="text-[#B89667]">·</span>}
                        </React.Fragment>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-[#8E8C82]">+{room.amenities.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="pt-4 border-t border-[#ECE8DE] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#7A7870] uppercase block">Nightly Rate</span>
                      <div className="text-lg font-serif font-bold text-[#1A1A18] tabular-nums">
                        {room.pricePerNight.toLocaleString()} <span className="text-xs font-sans font-normal text-[#66655E]">RWF</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewRoomDetails(room)}
                        className="p-2 border border-[#D5D0C5] hover:bg-[#FAF9F5] text-[#1A1A18] rounded transition-colors cursor-pointer"
                        title="View details and amenities"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isAvailable ? (
                        <button
                          onClick={() => onSelectRoom(room, { checkIn, checkOut, guests })}
                          className="px-4 py-2 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer shadow-xs"
                        >
                          Book Now
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-3.5 py-2 bg-neutral-200 text-neutral-500 text-xs font-semibold uppercase tracking-wider rounded cursor-not-allowed"
                        >
                          Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
