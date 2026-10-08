import React, { useEffect, useMemo } from 'react';
import type { HotelSettings, Room } from '../types/hotel.ts';

export interface HeadProps {
  title?: string;
  description?: string;
  image?: string;
  route?: string;
  settings?: HotelSettings | null;
  room?: Room | null;
  type?: 'website' | 'article' | 'profile';
  schema?: Record<string, any>;
}

interface RouteMeta {
  title: string;
  description: string;
  image: string;
  schemaType?: string;
}

const DEFAULT_EXTERIOR_IMAGE = '/src/assets/images/hero_hotel_exterior_1791471883513.jpg';
const DEFAULT_POOL_IMAGE = '/src/assets/images/hotel_swimming_pool_1791471894050.jpg';
const DEFAULT_ROOM_IMAGE = '/src/assets/images/hotel_deluxe_room_1791471905013.jpg';
const DEFAULT_LOBBY_IMAGE = '/src/assets/images/hotel_lobby_escalator_1791471914533.jpg';

const ROUTE_META_MAP: Record<string, RouteMeta> = {
  '/': {
    title: 'ANABE HOTEL | Luxury Stays & Hospitality in Rwanda',
    description: 'Experience refined hospitality at ANABE HOTEL. Featuring 65 guest rooms, outdoor pool, modern elevators, escalators, and 24/7 guest service. Book online today.',
    image: DEFAULT_EXTERIOR_IMAGE,
    schemaType: 'Hotel',
  },
  '/rooms': {
    title: 'Rooms & Suites | 65 Premium Accommodations at ANABE HOTEL',
    description: 'Browse all 65 rooms and suites at ANABE HOTEL. Compare room types, real-time availability, amenities, and secure your reservation with instant confirmation.',
    image: DEFAULT_ROOM_IMAGE,
    schemaType: 'ItemPage',
  },
  '/booking': {
    title: 'Book Your Stay | Guaranteed Direct Reservation | ANABE HOTEL',
    description: 'Reserve your luxury stay directly with ANABE HOTEL. Transparent pricing, instant availability verification, flexible payment options, and immediate booking reference.',
    image: DEFAULT_ROOM_IMAGE,
    schemaType: 'CheckoutPage',
  },
  '/facilities': {
    title: 'Hotel Facilities | Pool, Elevators & Escalators | ANABE HOTEL',
    description: 'Explore ANABE HOTEL amenities including our outdoor swimming pool, sun terrace, spacious guest lounges, accessible elevators, escalators, and 24/7 concierge.',
    image: DEFAULT_POOL_IMAGE,
    schemaType: 'AboutPage',
  },
  '/gallery': {
    title: 'Photographic Showcase | Experience ANABE HOTEL',
    description: 'Discover photographs of ANABE HOTEL guest suites, relaxing swimming pool, grand interior lobby, and twilight architecture before your visit.',
    image: DEFAULT_LOBBY_IMAGE,
    schemaType: 'ImageGallery',
  },
  '/about': {
    title: 'About ANABE HOTEL | Dedicated Hospitality & Comfort',
    description: 'Learn about ANABE HOTEL, our commitment to hospitality excellence, modern facilities across multiple floors, and premier guest experiences.',
    image: DEFAULT_EXTERIOR_IMAGE,
    schemaType: 'AboutPage',
  },
  '/contact': {
    title: 'Contact ANABE HOTEL | Front Desk & Reservations',
    description: 'Connect with ANABE HOTEL reservations desk. Call 0788 845 520 or 0783 218 170 for room bookings, inquiries, and customer support 24/7.',
    image: DEFAULT_EXTERIOR_IMAGE,
    schemaType: 'ContactPage',
  },
  '/admin/login': {
    title: 'Staff & Owner Portal | ANABE HOTEL Management',
    description: 'Secure management portal for ANABE HOTEL front desk staff, managers, and property owners.',
    image: DEFAULT_EXTERIOR_IMAGE,
  },
};

/**
 * Head Component
 * Provides dynamic document title, meta descriptions, OpenGraph tags,
 * Twitter cards, canonical link, and structured Schema.org JSON-LD data
 * adhering to search engine optimization best practices for hotel discoverability.
 */
export const Head: React.FC<HeadProps> = ({
  title: customTitle,
  description: customDescription,
  image: customImage,
  route = typeof window !== 'undefined' ? window.location.pathname : '/',
  settings,
  room,
  type = 'website',
  schema: customSchema,
}) => {
  // Resolve base URL safely
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://anabehotel.com';
  const canonicalUrl = `${origin}${route}`;

  // Resolve metadata based on route defaults or explicit overrides
  const routeMeta = ROUTE_META_MAP[route] || ROUTE_META_MAP['/'];

  const finalTitle = customTitle
    ? `${customTitle} | ANABE HOTEL`
    : room
    ? `Room ${room.roomNumber} - ${room.name} | ANABE HOTEL`
    : routeMeta.title;

  const finalDescription = customDescription
    ? customDescription
    : room
    ? `Book Room ${room.roomNumber} (${room.typeName}) at ANABE HOTEL. ${room.description.slice(0, 110)}... Best rate guaranteed.`
    : routeMeta.description;

  const rawImage = customImage || (room && room.images?.length > 0 ? room.images[0] : routeMeta.image);
  const absoluteImage = rawImage.startsWith('http') ? rawImage : `${origin}${rawImage}`;

  const hotelName = settings?.hotelName || 'ANABE HOTEL';
  const phones = [
    settings?.phone1 || '0788 845 520',
    settings?.phone2 || '0783 218 170',
  ].filter(Boolean);
  const email = settings?.email || 'info@anabehotel.com';
  const address = settings?.address || 'ANABE HOTEL, Rwanda';

  // Construct comprehensive Schema.org JSON-LD graph for Hotel discoverability
  const structuredData = useMemo(() => {
    if (customSchema) {
      return customSchema;
    }

    const hotelEntity: Record<string, any> = {
      '@type': ['Hotel', 'LodgingBusiness'],
      '@id': `${origin}/#hotel`,
      name: hotelName,
      legalName: hotelName,
      url: origin,
      logo: `${origin}/favicon.ico`,
      image: [
        `${origin}${DEFAULT_EXTERIOR_IMAGE}`,
        `${origin}${DEFAULT_POOL_IMAGE}`,
        `${origin}${DEFAULT_ROOM_IMAGE}`,
        `${origin}${DEFAULT_LOBBY_IMAGE}`,
      ],
      description: 'Luxury hotel in Rwanda offering approximately 65 guest rooms, outdoor swimming pool, elevators, escalators, and 24-hour reception desk.',
      telephone: phones,
      email: email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: address,
        addressCountry: 'RW',
      },
      numberOfRooms: 65,
      checkinTime: '14:00',
      checkoutTime: '11:00',
      priceRange: '$$',
      currenciesAccepted: 'RWF, USD',
      paymentAccepted: 'Cash, Credit Card, MTN Mobile Money, Airtel Money, Bank Transfer',
      petsAllowed: false,
      amenityFeature: [
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Outdoor Swimming Pool',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Elevators and Escalators',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: '65 Accommodation Rooms',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Complimentary High-Speed Wi-Fi',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: '24/7 Front Desk & Concierge',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Daily Housekeeping',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Soundproofed Guest Rooms',
          value: true,
        },
      ],
      potentialAction: {
        '@type': 'ReserveAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${origin}/booking`,
          inLanguage: 'en',
          actionPlatform: [
            'http://schema.org/DesktopWebPlatform',
            'http://schema.org/MobileWebPlatform',
          ],
        },
        result: {
          '@type': 'LodgingReservation',
          name: 'Direct Room Reservation at ANABE HOTEL',
        },
      },
    };

    const webSiteEntity = {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: origin,
      name: hotelName,
      description: finalDescription,
      publisher: {
        '@id': `${origin}/#hotel`,
      },
    };

    const webPageEntity = {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: finalTitle,
      description: finalDescription,
      isPartOf: {
        '@id': `${origin}/#website`,
      },
      about: {
        '@id': `${origin}/#hotel`,
      },
    };

    const graph: any[] = [hotelEntity, webSiteEntity, webPageEntity];

    // Room-specific schema extension
    if (room) {
      const roomEntity = {
        '@type': 'HotelRoom',
        '@id': `${canonicalUrl}#room-${room.roomNumber}`,
        name: room.name,
        roomNumber: room.roomNumber,
        description: room.description,
        occupancy: {
          '@type': 'QuantitativeValue',
          value: room.maxGuests || 2,
          unitCode: 'C62',
        },
        offers: {
          '@type': 'Offer',
          price: room.pricePerNight,
          priceCurrency: 'RWF',
          availability: 'https://schema.org/InStock',
          url: `${origin}/booking?room=${room.id}`,
        },
        amenityFeature: (room.amenities || []).map((amenity) => ({
          '@type': 'LocationFeatureSpecification',
          name: amenity,
          value: true,
        })),
      };
      graph.push(roomEntity);
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graph,
    };
  }, [
    customSchema,
    origin,
    hotelName,
    phones,
    email,
    address,
    finalDescription,
    finalTitle,
    canonicalUrl,
    room,
  ]);

  // Synchronize dynamic head tags in the browser DOM for immediate scraper & crawler accessibility
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Update Title
    document.title = finalTitle;

    // Helper to set or create meta elements
    const setMeta = (attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set or create link elements
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Standard SEO Tags
    setMeta('name', 'description', finalDescription);

    // OpenGraph Tags
    setMeta('property', 'og:site_name', hotelName);
    setMeta('property', 'og:title', finalTitle);
    setMeta('property', 'og:description', finalDescription);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', absoluteImage);
    setMeta('property', 'og:image:alt', `${hotelName} - Luxury Hospitality`);
    setMeta('property', 'og:locale', 'en_US');

    // Twitter Card Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', finalTitle);
    setMeta('name', 'twitter:description', finalDescription);
    setMeta('name', 'twitter:image', absoluteImage);

    // Canonical Link
    setLink('canonical', canonicalUrl);

    // Schema.org JSON-LD Script Tag
    const scriptId = 'anabe-hotel-schema-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(structuredData);

    return () => {
      // Clean up script on unmount if appropriate
    };
  }, [finalTitle, finalDescription, hotelName, type, canonicalUrl, absoluteImage, structuredData]);

  // Also render hoisted tags for React 19 document metadata compatibility
  return (
    <>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph */}
      <meta property="og:site_name" content={hotelName} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:alt" content={`${hotelName} - Luxury Hospitality`} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
};
