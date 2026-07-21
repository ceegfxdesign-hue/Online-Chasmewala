/**
 * Database seed entrypoint.
 *
 * Usage:
 *   npm run seed            # import demo data
 *   npm run seed:destroy    # wipe seeded collections
 *
 * The concrete dataset (categories, brands, products, users, banners, offers,
 * reviews) is registered in Phase 3 once the Mongoose models exist. This runner
 * owns the connection lifecycle and CLI flags.
 */
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './config/logger.js';

async function run() {
  const destroy = process.argv.includes('--destroy');
  await connectDB();

  try {
    const { seedAll, destroyAll } = await loadSeeder();
    if (destroy) {
      await destroyAll();
      logger.info('🧹 Seed data destroyed.');
    } else {
      await seedAll();
      logger.info('🌱 Seed data imported.');
    }
  } finally {
    await disconnectDB();
  }
}

/**
 * Lazily loads the seeder module. Returns no-op implementations until the data
 * module is added in Phase 3, so `npm run seed` never crashes.
 */
async function loadSeeder() {
  try {
    return await import('./utils/seedData.js');
  } catch {
    logger.warn('No seed dataset registered yet (added in Phase 3).');
    return { seedAll: async () => {}, destroyAll: async () => {} };
  }
}

run().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
