/**
 * Jest global setup: spin up an in-memory MongoDB for the test run so the full
 * data layer is exercised without a real database. Collections are cleared
 * between tests for isolation.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from '@jest/globals';

let mongo;

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
