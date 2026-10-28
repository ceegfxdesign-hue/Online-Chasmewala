/**
 * Jest global setup: spin up an in-memory MongoDB for the test run so the full
 * data layer is exercised without a real database. Collections are cleared
 * between tests for isolation.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from '@jest/globals';

let mongo;

// Integration tests must never send real emails or charge real gateways, even with a configured local .env.
process.env.SMTP_HOST = '';
process.env.SMTP_USER = '';
process.env.PAYMENT_PROVIDER = 'mock';
process.env.RAZORPAY_KEY_ID = '';
process.env.RAZORPAY_KEY_SECRET = '';

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
