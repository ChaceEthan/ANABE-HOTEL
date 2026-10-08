import { getDefaultSeedData, saveDatabase } from './db/database.ts';

console.log('Seeding ANABE HOTEL database with 65 rooms, staff accounts, facilities, and settings...');
const data = getDefaultSeedData();
saveDatabase(data);
console.log('ANABE HOTEL database successfully seeded!');
console.log(`- Total Rooms: ${data.rooms.length}`);
console.log(`- Total Users: ${data.users.length}`);
console.log(`- Default Owner: owner@anabehotel.com (Password: Owner@Anabe2026!)`);
console.log(`- Default Manager: manager@anabehotel.com (Password: Manager@Anabe2026!)`);
console.log(`- Default Reception: reception@anabehotel.com (Password: Staff@Anabe2026!)`);
console.log(`- Default Housekeeping: housekeeping@anabehotel.com (Password: Clean@Anabe2026!)`);
