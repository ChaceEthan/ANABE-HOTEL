import 'dotenv/config';
import { getDefaultSeedData, saveDatabase } from './db/database.ts';
import { getPostgresPool, seedPostgres } from './db/postgres.ts';

async function seed() {
  console.log('[ANABE HOTEL] Seeding ANABE HOTEL database with 65 rooms, staff accounts, facilities, and settings...');
  const data = getDefaultSeedData();
  saveDatabase(data);

  if (process.env.DATABASE_URL) {
    try {
      console.log('[ANABE HOTEL] Connecting to Neon PostgreSQL for database seeding...');
      await seedPostgres(data);
      console.log('[ANABE HOTEL] Neon PostgreSQL database populated successfully!');
      const pool = getPostgresPool();
      if (pool) await pool.end();
    } catch (err: any) {
      console.error('[ANABE HOTEL] PostgreSQL seed error:', err.message);
    }
  }

  console.log('[ANABE HOTEL] Database successfully seeded!');
  console.log(`- Total Rooms: ${data.rooms.length}`);
  console.log(`- Total Users: ${data.users.length}`);
  console.log(`- Default Owner: owner@anabehotel.com`);
  console.log(`- Default Manager: manager@anabehotel.com`);
  console.log(`- Default Reception: reception@anabehotel.com`);
  console.log(`- Default Housekeeping: housekeeping@anabehotel.com`);
}

seed().catch((err) => {
  console.error('[ANABE HOTEL] Seeding failed:', err);
  process.exit(1);
});
