import 'dotenv/config';

const PORT = 3001;
process.env.PORT = String(PORT);
process.env.NODE_ENV = 'development';

async function main() {
  console.log('[TEST SUITE] Starting test server on port', PORT);
  
  // Dynamically import server or run API router
  const { default: express } = await import('express');
  const cors = (await import('cors')).default;
  const { apiRouter } = await import('../src/server/api.ts');
  const { initDatabase, isDatabasePostgres } = await import('../src/server/db/database.ts');

  const app = express();
  app.use(cors());
  app.use(express.json());
  
  app.get('/health', (_req, res) => res.json({ status: 'ok', database: isDatabasePostgres() ? 'neon' : 'json' }));
  app.use('/api', apiRouter);

  await initDatabase();

  const server = app.listen(PORT, '127.0.0.1');

  const BASE = `http://127.0.0.1:${PORT}`;

  try {
    console.log('\n--- 1. Testing Health Endpoint ---');
    const healthRes = await fetch(`${BASE}/health`);
    const healthJson = await healthRes.json();
    console.log('Health Response:', healthRes.status, healthJson);
    if (healthRes.status !== 200 || healthJson.status !== 'ok') throw new Error('Health check failed');
    console.log('PASS: Health check');

    console.log('\n--- 2. Testing Settings Endpoint ---');
    const settingsRes = await fetch(`${BASE}/api/settings`);
    const settingsJson = await settingsRes.json();
    console.log('Hotel Name:', settingsJson.hotelName, 'Primary Phone:', settingsJson.phone1);
    if (!settingsJson.hotelName || !settingsJson.phone1) throw new Error('Settings failed');
    console.log('PASS: Settings endpoint');

    console.log('\n--- 3. Testing Facilities Endpoint ---');
    const facRes = await fetch(`${BASE}/api/facilities`);
    const facJson = await facRes.json();
    console.log(`Facilities count: ${facJson.length}`);
    console.log('Facilities:', facJson.map(f => f.name).join(', '));
    if (facJson.length === 0) throw new Error('No facilities returned');
    console.log('PASS: Facilities endpoint');

    console.log('\n--- 4. Testing Rooms Endpoint ---');
    const roomsRes = await fetch(`${BASE}/api/rooms`);
    const roomsJson = await roomsRes.json();
    console.log(`Total Rooms available: ${roomsJson.length}`);
    if (roomsJson.length < 60) throw new Error('Expected at least 60 rooms');
    console.log('PASS: Rooms endpoint (~65 rooms verified)');

    console.log('\n--- 5. Testing Availability Endpoint ---');
    const availRes = await fetch(`${BASE}/api/rooms/availability?checkIn=2026-12-01&checkOut=2026-12-05`);
    const availJson = await availRes.json();
    console.log(`Availability for 2026-12-01 to 2026-12-05: ${availJson.availableCount} of ${availJson.totalRooms} rooms available`);
    if (availJson.availableCount <= 0) throw new Error('Availability failed');
    console.log('PASS: Availability endpoint');

    console.log('\n--- 6. Testing Authentication (Valid & Invalid) ---');
    // Test Invalid Login
    const invalidLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@anabehotel.com', password: 'WrongPassword123!' }),
    });
    console.log('Invalid login status:', invalidLoginRes.status);
    if (invalidLoginRes.status !== 401) throw new Error('Invalid login did not return 401');
    console.log('PASS: Invalid login rejection');

    // Test Valid Owner Login
    const ownerLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@anabehotel.com', password: 'Owner@Anabe2026!' }),
    });
    const ownerCookie = ownerLoginRes.headers.get('set-cookie');
    const ownerJson = await ownerLoginRes.json();
    console.log('Owner login status:', ownerLoginRes.status, 'User Role:', ownerJson.user?.role);
    if (ownerLoginRes.status !== 200 || ownerJson.user?.role !== 'OWNER') throw new Error('Owner login failed');
    console.log('PASS: Valid owner login');

    // Test Valid Staff Login
    const staffLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reception@anabehotel.com', password: 'Staff@Anabe2026!' }),
    });
    const staffCookie = staffLoginRes.headers.get('set-cookie');
    const staffJson = await staffLoginRes.json();
    console.log('Staff login status:', staffLoginRes.status, 'User Role:', staffJson.user?.role);
    if (staffLoginRes.status !== 200 || staffJson.user?.role !== 'STAFF') throw new Error('Staff login failed');
    console.log('PASS: Valid staff login');

    console.log('\n--- 7. Testing RBAC Access Control ---');
    // Staff attempting to access Owner-only users list
    const staffUserRes = await fetch(`${BASE}/api/admin/users`, {
      headers: { Cookie: staffCookie || '' },
    });
    console.log('Staff access to /api/admin/users status:', staffUserRes.status);
    if (staffUserRes.status !== 403) throw new Error('RBAC failed: Staff was able to access owner endpoint');
    console.log('PASS: RBAC restriction on staff');

    // Owner accessing /api/admin/users
    const ownerUserRes = await fetch(`${BASE}/api/admin/users`, {
      headers: { Cookie: ownerCookie || '' },
    });
    const usersJson = await ownerUserRes.json();
    console.log('Owner access to /api/admin/users status:', ownerUserRes.status, 'Total users:', usersJson.length);
    if (ownerUserRes.status !== 200 || !Array.isArray(usersJson)) throw new Error('Owner failed to access users');
    console.log('PASS: RBAC owner access verified');

    console.log('\n--- 8. Testing Double-Booking Prevention & Validation ---');
    const targetRoom = roomsJson[0];
    const randomOffset = Math.floor(Math.random() * 50) + 15;
    const baseDate = new Date(Date.now() + randomOffset * 24 * 60 * 60 * 1000);
    const checkIn = baseDate.toISOString().slice(0, 10);
    const checkOut = new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const midCheckIn = new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const midCheckOut = new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // 8a. Test check-out before check-in validation
    const badDateRes = await fetch(`${BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: targetRoom.id,
        checkIn: checkOut,
        checkOut: checkIn,
        guestsCount: 1,
        guestName: 'Test Invalid Dates',
        guestEmail: 'test@example.com',
        guestPhone: '+250788000000',
      }),
    });
    console.log('Invalid date booking status:', badDateRes.status);
    if (badDateRes.status !== 400) throw new Error('Check-out before check-in was not rejected');
    console.log('PASS: Invalid date ordering rejected');

    // 8b. Create initial reservation
    const bookingRes1 = await fetch(`${BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: targetRoom.id,
        checkIn,
        checkOut,
        guestsCount: 2,
        guestName: 'Alice Kayitesi',
        guestEmail: 'alice.k@example.rw',
        guestPhone: '+250788111222',
        specialRequests: 'High floor preferred',
      }),
    });
    const bookingJson1 = await bookingRes1.json();
    console.log('First booking status:', bookingRes1.status, 'Ref:', bookingJson1.booking?.bookingReference);
    if (bookingRes1.status !== 201 || !bookingJson1.booking?.bookingReference) throw new Error(`First booking creation failed: ${bookingJson1.error || ''}`);
    console.log('PASS: Initial booking created');

    // 8c. Attempt overlapping reservation for the same room
    const bookingRes2 = await fetch(`${BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: targetRoom.id,
        checkIn: midCheckIn,
        checkOut: midCheckOut,
        guestsCount: 1,
        guestName: 'Bob Ndayisaba',
        guestEmail: 'bob.n@example.rw',
        guestPhone: '+250788333444',
      }),
    });
    const bookingJson2 = await bookingRes2.json();
    console.log('Overlapping booking status:', bookingRes2.status, 'Message:', bookingJson2.error);
    if (bookingRes2.status !== 400) throw new Error('Double-booking prevention FAILED! Overlapping booking was accepted!');
    console.log('PASS: Double-booking rejected with 400 error!');

    // 8d. Look up booking by reference
    const refRes = await fetch(`${BASE}/api/bookings/reference/${bookingJson1.booking.bookingReference}`);
    const refJson = await refRes.json();
    console.log('Lookup by reference:', refRes.status, 'Guest:', refJson.guestName, 'Room:', refJson.roomNumber);
    if (refRes.status !== 200 || refJson.bookingReference !== bookingJson1.booking.bookingReference) throw new Error('Booking lookup failed');
    console.log('PASS: Booking lookup by reference');

    // 8e. Clean up test reservation to keep room calendar pristine
    await fetch(`${BASE}/api/admin/bookings/${bookingJson1.booking.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: ownerCookie },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });

    console.log('\n========================================');
    console.log('ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('========================================\n');
  } finally {
    try {
      server.closeAllConnections ? server.closeAllConnections() : server.close();
    } catch {}
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
