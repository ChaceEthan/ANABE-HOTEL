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
  schemaType: string;
  breadcrumbName: string;
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
    breadcrumbName: 'Home',
  },
  '/rooms': {
    title: 'Rooms & Suites | 65 Premium Accommodations at ANABE HOTEL',
    description: 'Browse all 65 rooms and suites at ANABE HOTEL. Compare room types, real-time availability, amenities, and secure your reservation with instant confirmation.',
    image: DEFAULT_ROOM_IMAGE,
    schemaType: 'CollectionPage',
    breadcrumbName: 'Rooms & Suites',
  },
  '/booking': {
    title: 'Book Your Stay | Guaranteed Direct Reservation | ANABE HOTEL',
    description: 'Reserve your luxury stay directly with ANABE HOTEL. Transparent pricing, instant availability verification, flexible payment options, and immediate booking reference.',
    image: DEFAULT_ROOM_IMAGE,
    schemaType: 'CheckoutPage',
    breadcrumbName: 'Direct Reservation',
  },
  '/facilities': {
    title: 'Hotel Facilities | Pool, Elevators & Escalators | ANABE HOTEL',
    description: 'Explore ANABE HOTEL amenities including our outdoor swimming pool, sun terrace, spacious guest lounges, accessible elevators, escalators, and 24/7 concierge.',
    image: DEFAULT_POOL_IMAGE,
    schemaType: 'AboutPage',
    breadcrumbName: 'Facilities & Amenities',
  },
  '/gallery': {
    title: 'Photographic Showcase | Experience ANABE HOTEL',
    description: 'Discover photographs of ANABE HOTEL guest suites, relaxing swimming pool, grand interior lobby, and twilight architecture before your visit.',
    image: DEFAULT_LOBBY_IMAGE,
    schemaType: 'ImageGallery',
    breadcrumbName: 'Photographic Gallery',
  },
  '/about': {
    title: 'About ANABE HOTEL | Dedicated Hospitality & Comfort',
    description: 'Learn about ANABE HOTEL, our commitment to hospitality excellence, modern facilities across multiple floors, and premier guest experiences in Rwanda.',
    image: DEFAULT_EXTERIOR_IMAGE,
    schemaType: 'AboutPage',
    breadcrumbName: 'About Us',
  },
  '/contact': {
    title: 'Contact ANABE HOTEL | Front Desk & Reservations',
    description: 'Connect with ANABE HOTEL reservations desk. Call 0788 845 520 or 0783 218 170 for room bookings, inquiries, and customer support 24/7.',
    image: DEFAULT_EXTERIOR_IMAGE,
    schemaType: 'ContactPage',
    breadcrumbName: 'Contact & Support',
  },
  '/admin/login': {
    title: 'Staff & Owner Portal | ANABE HOTEL Management',
    description: 'Secure management portal for ANABE HOTEL front desk staff, managers, and property owners.',
    image: DEFAULT_EXTERIOR_IMAGE,
    schemaType: 'WebPage',
    breadcrumbName: 'Staff Portal',
  },
  '/privacy': {
    title: 'Privacy Policy | Guest Data Protection | ANABE HOTEL',
    description: 'Learn how ANABE HOTEL collects, uses, and safeguards guest information and booking details. Transparent data handling and guest confidentiality.',
    image: DEFAULT_EXTERIOR_IMAGE,
    schemaType: 'AboutPage',
    breadcrumbName: 'Privacy Policy',
  },
  '/terms': {
    title: 'Terms & Conditions | Reservation Policy | ANABE HOTEL',
    description: 'Review ANABE HOTEL reservation terms, check-in and check-out procedures, cancellation policies, guest responsibilities, and hotel guidelines.',
    image: DEFAULT_EXTERIOR_IMAGE,
    schemaType: 'AboutPage',
    breadcrumbName: 'Terms & Conditions',
  },
};

/**
 * Head Component
 * Dynamically injects OpenGraph tags, Twitter cards, canonical tags,
 * robot directives, and Schema.org JSON-LD structured data blocks
 * tailored to current page state and hotel industry schema standards.
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
  const isAdmin = route.startsWith('/admin');

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
    ? `Book Room ${room.roomNumber} (${room.typeName}) at ANABE HOTEL. ${room.description ? room.description.slice(0, 110) : 'Refined comfort and luxury' }... Best rate guaranteed.`
    : routeMeta.description;

  const rawImage = customImage || (room && room.images?.length > 0 ? room.images[0] : routeMeta.image);
  const absoluteImage = rawImage.startsWith('http') ? rawImage : `${origin}${rawImage}`;

  const hotelName = settings?.hotelName || 'ANABE HOTEL';
  const phones = [
    settings?.phone1 || '0788 845 520',
    settings?.phone2 || '0783 218 170',
  ].filter(Boolean);
  const email = settings?.email || 'info@anabehotel.com';
  const address = settings?.address || 'ANABE HOTEL, Kigali, Rwanda';

  // Construct comprehensive Schema.org JSON-LD graph for Hotel discoverability
  const structuredData = useMemo(() => {
    if (customSchema) {
      return customSchema;
    }

    // 1. Core Hotel Entity
    const hotelEntity: Record<string, any> = {
      '@type': ['Hotel', 'LodgingBusiness'],
      '@id': `${origin}/#hotel`,
      name: hotelName,
      legalName: hotelName,
      alternateName: 'Hôtel Anabe',
      url: origin,
      logo: `${origin}/favicon.ico`,
      image: [
        `${origin}${DEFAULT_EXTERIOR_IMAGE}`,
        `${origin}${DEFAULT_POOL_IMAGE}`,
        `${origin}${DEFAULT_ROOM_IMAGE}`,
        `${origin}${DEFAULT_LOBBY_IMAGE}`,
      ],
      description: 'Luxury hotel in Rwanda offering 65 guest rooms and suites, outdoor swimming pool, modern elevators, escalators, and 24-hour reception desk.',
      telephone: phones,
      email: email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: address,
        addressLocality: 'Kigali',
        addressRegion: 'Kigali',
        postalCode: '00000',
        addressCountry: 'RW',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -1.9536,
        longitude: 30.0605,
      },
      hasMap: 'https://maps.google.com/?q=-1.9536,30.0605',
      starRating: {
        '@type': 'Rating',
        ratingValue: '4',
        bestRating: '5',
      },
      numberOfRooms: 65,
      checkinTime: '14:00',
      checkoutTime: '11:00',
      priceRange: '$$ (RWF 35,000 - 80,000)',
      currenciesAccepted: 'RWF, USD',
      paymentAccepted: 'Cash, Credit Card, MTN Mobile Money, Airtel Money, Bank Transfer',
      petsAllowed: false,
      smokingAllowed: false,
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '00:00',
          closes: '23:59',
        },
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: phones[0] || '0788 845 520',
          contactType: 'reservations',
          areaServed: 'RW',
          availableLanguage: ['en', 'rw', 'fr'],
        },
        {
          '@type': 'ContactPoint',
          telephone: phones[1] || '0783 218 170',
          contactType: 'customer support',
          areaServed: 'RW',
          availableLanguage: ['en', 'rw', 'fr'],
        },
      ],
      amenityFeature: [
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Outdoor Swimming Pool & Sun Terrace',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Elevators and Escalators across Floors',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: '65 Accommodation Rooms & Suites',
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
          name: 'Daily Housekeeping & Turndown',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Soundproofed Guest Rooms',
          value: true,
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Complimentary Secure Parking',
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

    // 2. WebSite Entity
    const webSiteEntity = {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: origin,
      name: hotelName,
      description: 'Official direct booking and luxury accommodations portal for ANABE HOTEL in Rwanda.',
      publisher: {
        '@id': `${origin}/#hotel`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/rooms?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    // 3. Dynamic BreadcrumbList based on current route
    const breadcrumbItems = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: origin,
      },
    ];

    if (route !== '/') {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 2,
        name: routeMeta.breadcrumbName,
        item: canonicalUrl,
      });

      if (room) {
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: 3,
          name: `Room ${room.roomNumber} (${room.name})`,
          item: `${canonicalUrl}#room-${room.roomNumber}`,
        });
      }
    }

    const breadcrumbEntity = {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: breadcrumbItems,
    };

    // 4. Dynamic Page-Specific Structured Data Entity
    const webPageEntity: Record<string, any> = {
      '@type': routeMeta.schemaType,
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
      breadcrumb: {
        '@id': `${canonicalUrl}#breadcrumb`,
      },
    };

    // Enhance specific pages with domain-rich entities
    if (route === '/') {
      // FAQ schema for Home page to achieve rich snippet accordions on search results
      webPageEntity.mainEntity = {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What are the check-in and check-out times at ANABE HOTEL?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Check-in begins at 14:00 (2:00 PM) and check-out is until 11:00 (11:00 AM). 24-hour reception is available for late arrivals.',
            },
          },
          {
            '@type': 'Question',
            name: 'How many rooms does ANABE HOTEL have?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ANABE HOTEL features 65 fully furnished guest rooms and suites across multiple floors with modern elevators and escalators.',
            },
          },
          {
            '@type': 'Question',
            name: 'What payment methods are accepted for bookings?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We accept Cash at front desk, MTN Mobile Money, Airtel Money, Bank Transfer, and major Credit Cards.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does ANABE HOTEL have an outdoor swimming pool?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, ANABE HOTEL offers an outdoor swimming pool with sun loungers and terrace service available to all guests.',
            },
          },
        ],
      };
    } else if (route === '/rooms') {
      // ItemList of Room tiers for search engine room carousel
      webPageEntity.mainEntity = {
        '@type': 'ItemList',
        name: 'Room & Suite Accommodations at ANABE HOTEL',
        numberOfItems: 4,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@type': 'HotelRoom',
              name: 'Standard Room',
              description: 'Comfortable guest room with queen bed, modern ensuite bathroom, smart TV, and high-speed Wi-Fi.',
              occupancy: { '@type': 'QuantitativeValue', value: 2 },
              offers: {
                '@type': 'Offer',
                price: 35000,
                priceCurrency: 'RWF',
                availability: 'https://schema.org/InStock',
                url: `${origin}/booking`,
              },
            },
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@type': 'HotelRoom',
              name: 'Deluxe Double',
              description: 'Spacious deluxe room with twin beds or king bed, private balcony view, workstation, and minibar.',
              occupancy: { '@type': 'QuantitativeValue', value: 2 },
              offers: {
                '@type': 'Offer',
                price: 45000,
                priceCurrency: 'RWF',
                availability: 'https://schema.org/InStock',
                url: `${origin}/booking`,
              },
            },
          },
          {
            '@type': 'ListItem',
            position: 3,
            item: {
              '@type': 'HotelRoom',
              name: 'Executive Suite',
              description: 'Executive suite featuring separate lounge area, panoramic terrace, premium amenities, and personalized service.',
              occupancy: { '@type': 'QuantitativeValue', value: 3 },
              offers: {
                '@type': 'Offer',
                price: 65000,
                priceCurrency: 'RWF',
                availability: 'https://schema.org/InStock',
                url: `${origin}/booking`,
              },
            },
          },
          {
            '@type': 'ListItem',
            position: 4,
            item: {
              '@type': 'HotelRoom',
              name: 'Presidential Suite',
              description: 'The ultimate luxury stay with expansive living room, dining area, deluxe master bedroom, jacuzzi, and dedicated VIP host.',
              occupancy: { '@type': 'QuantitativeValue', value: 4 },
              offers: {
                '@type': 'Offer',
                price: 80000,
                priceCurrency: 'RWF',
                availability: 'https://schema.org/InStock',
                url: `${origin}/booking`,
              },
            },
          },
        ],
      };
    } else if (route === '/facilities') {
      webPageEntity.mainEntity = {
        '@type': 'ItemList',
        name: 'ANABE HOTEL Facilities and Amenities',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Outdoor Swimming Pool & Sun Deck',
            description: 'Heated outdoor swimming pool surrounded by comfortable sun loungers and refreshing drinks.',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Modern Elevators & Multi-Floor Escalators',
            description: 'Fast, accessible, and seamless mobility across all 65 rooms and public amenity floors.',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: '24/7 Concierge and Front Desk',
            description: 'Round-the-clock guest reception, local touring advice, luggage storage, and WhatsApp support.',
          },
        ],
      };
    } else if (route === '/gallery') {
      webPageEntity.mainEntity = {
        '@type': 'ItemList',
        name: 'ANABE HOTEL Photographic Showcase',
        itemListElement: [
          {
            '@type': 'Photograph',
            position: 1,
            name: 'Hotel Exterior Architecture',
            contentUrl: `${origin}${DEFAULT_EXTERIOR_IMAGE}`,
            caption: 'Exterior facade and architectural grandeur of ANABE HOTEL at golden hour.',
          },
          {
            '@type': 'Photograph',
            position: 2,
            name: 'Outdoor Swimming Pool & Deck',
            contentUrl: `${origin}${DEFAULT_POOL_IMAGE}`,
            caption: 'Inviting crystal-clear outdoor swimming pool with comfortable loungers.',
          },
          {
            '@type': 'Photograph',
            position: 3,
            name: 'Deluxe Guest Suite',
            contentUrl: `${origin}${DEFAULT_ROOM_IMAGE}`,
            caption: 'Elegantly appointed bedroom suite with plush bedding and ambient lighting.',
          },
          {
            '@type': 'Photograph',
            position: 4,
            name: 'Grand Lobby & Escalators',
            contentUrl: `${origin}${DEFAULT_LOBBY_IMAGE}`,
            caption: 'Spacious hotel foyer featuring architectural escalators and guest lounges.',
          },
        ],
      };
    } else if (route === '/contact') {
      webPageEntity.mainEntity = {
        '@type': 'ContactPoint',
        telephone: phones[0] || '0788 845 520',
        contactType: 'reservations & front desk',
        email: email,
        availableLanguage: ['en', 'rw', 'fr'],
        hoursAvailable: 'Mo-Su 00:00-24:00',
      };
    }

    const graph: any[] = [hotelEntity, webSiteEntity, breadcrumbEntity, webPageEntity];

    // 5. Room-specific schema extension if a room is actively selected or inspected
    if (room) {
      const roomEntity = {
        '@type': 'HotelRoom',
        '@id': `${canonicalUrl}#room-${room.roomNumber}`,
        name: room.name,
        roomNumber: room.roomNumber,
        floor: room.floor,
        description: room.description || `Luxury accommodation room ${room.roomNumber} at ANABE HOTEL.`,
        image: room.images && room.images.length > 0 ? (room.images[0].startsWith('http') ? room.images[0] : `${origin}${room.images[0]}`) : absoluteImage,
        occupancy: {
          '@type': 'QuantitativeValue',
          value: room.maxGuests || 2,
          unitCode: 'C62',
        },
        bed: {
          '@type': 'BedDetails',
          numberOfBeds: room.typeName?.toLowerCase().includes('double') ? 2 : 1,
          typeOfBed: 'King Size Comfort Bed',
        },
        offers: {
          '@type': 'Offer',
          price: room.pricePerNight,
          priceCurrency: 'RWF',
          availability: 'https://schema.org/InStock',
          validFrom: new Date().toISOString().split('T')[0],
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
    route,
    routeMeta,
    room,
    absoluteImage,
  ]);

  // Synchronize dynamic head tags in the browser DOM for immediate scraper & crawler accessibility
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Update Title
    document.title = finalTitle;

    // Helper to set or create meta elements
    const setMeta = (attrName: 'name' | 'property', attrVal: string, content: string) => {
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
    setMeta(
      'name',
      'robots',
      isAdmin ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // OpenGraph Tags
    setMeta('property', 'og:site_name', hotelName);
    setMeta('property', 'og:title', finalTitle);
    setMeta('property', 'og:description', finalDescription);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', absoluteImage);
    setMeta('property', 'og:image:secure_url', absoluteImage);
    setMeta('property', 'og:image:alt', `${finalTitle} - ${hotelName}`);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:image:type', 'image/jpeg');
    setMeta('property', 'og:locale', 'en_US');
    setMeta('property', 'og:locale:alternate', 'rw_RW');

    // Twitter Card Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', finalTitle);
    setMeta('name', 'twitter:description', finalDescription);
    setMeta('name', 'twitter:image', absoluteImage);
    setMeta('name', 'twitter:image:alt', `${finalTitle} - ${hotelName}`);
    setMeta('name', 'twitter:site', '@AnabeHotel');

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
  }, [
    finalTitle,
    finalDescription,
    hotelName,
    type,
    canonicalUrl,
    absoluteImage,
    isAdmin,
    structuredData,
  ]);

  // Also render hoisted tags for React document metadata compatibility
  return (
    <>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta
        name="robots"
        content={
          isAdmin
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />
      <link rel="canonical" href={canonicalUrl} />

      {/* Dynamic OpenGraph tags */}
      <meta property="og:site_name" content={hotelName} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:secure_url" content={absoluteImage} />
      <meta property="og:image:alt" content={`${finalTitle} - ${hotelName}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="rw_RW" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:image:alt" content={`${finalTitle} - ${hotelName}`} />
      <meta name="twitter:site" content="@AnabeHotel" />

      {/* Complete Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
};
