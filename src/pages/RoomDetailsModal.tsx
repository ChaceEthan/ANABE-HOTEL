import React, { useState } from 'react';
import { X, Users, Calendar, Check, BedDouble, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Room } from '../types/hotel.ts';

interface RoomDetailsModalProps {
  room: Room | null;
  onClose: () => void;
  onBookRoom: (room: Room) => void;
}

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  room,
  onClose,
  onBookRoom,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!room) return null;

  const images = room.images && room.images.length > 0
    ? room.images
    : ['/src/assets/images/hotel_deluxe_room_1791471905013.jpg'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF9F5] rounded-xl max-w-3xl w-full my-8 shadow-2xl border border-[#E2DED4] overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Large Photo Gallery */}
        <div className="relative bg-black h-80 sm:h-96">
          <img
            src={images[activePhotoIdx]}
            alt={room.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded font-mono">
              Room {room.roomNumber} · Floor {room.floor}
            </div>
            {images.length > 1 && (
              <div className="flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      activePhotoIdx === idx ? 'bg-[#B89667] w-6' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail gallery strip */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 bg-[#F0ECE2] overflow-x-auto border-b border-[#E0DCD2]">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative h-16 w-24 rounded overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  activePhotoIdx === idx ? 'border-[#B89667] scale-102' : 'border-transparent opacity-70'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Room Information */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B89667]">
                {room.typeName} · Floor {room.floor}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18] mt-1">
                {room.name}
              </h2>
              <div className="flex items-center gap-4 text-xs text-[#5C5B55] mt-2">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#B89667]" />
                  Accommodates up to {room.maxGuests} guests
                </span>
                <span className="flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-[#B89667]" />
                  Room Number: {room.roomNumber}
                </span>
              </div>
            </div>

            <div className="sm:text-right bg-[#FAF6EF] p-4 rounded border border-[#E6D4B7]">
              <span className="text-[10px] text-[#7A7870] uppercase block">Rate Per Night</span>
              <div className="text-2xl font-serif font-bold text-[#1A1A18] tabular-nums">
                {room.pricePerNight.toLocaleString()} <span className="text-xs font-sans font-normal text-[#66655E]">RWF</span>
              </div>
              <span className="text-[10px] text-[#8C8A82]">Taxes & service fee included</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A18] mb-2">
              Description & Ambiance
            </h3>
            <p className="text-sm text-[#5C5B55] leading-relaxed">
              {room.description}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A18] mb-3">
              Room Amenities & Features
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {room.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 text-xs text-[#4A4944]">
                  <Check className="w-3.5 h-3.5 text-[#B89667] shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-[#E6E2D8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#7A7870]">
              Instant confirmation · Flexible cancellation policy
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 border border-[#D5D0C5] hover:bg-neutral-100 text-xs font-semibold uppercase tracking-wider rounded transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onBookRoom(room);
                }}
                className="flex-1 sm:flex-none px-7 py-2.5 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Book This Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
