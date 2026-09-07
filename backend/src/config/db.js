/**
 * MongoDB connection management via Mongoose.
 */
import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

// Ensure MongoDB Atlas SRV records resolve reliably on Windows networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if cannot override
}

mongoose.set('strictQuery', true);

let isConnected = false;

/**
 * Connect to MongoDB. Resolves once the connection is open.
 * @param {string} [uri] Optional override (used by tests).
 */
export async function connectDB(uri = env.MONGODB_URI) {
  if (isConnected) return mongoose.connection;

  mongoose.connection.on('connected', () => {
    isConnected = true;
    logger.info('🗄️  MongoDB connected');
  });
  mongoose.connection.on('error', (err) => logger.error(`MongoDB error: ${err.message}`));
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected');
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: !env.isProd,
  });

  return mongoose.connection;
}

/** Gracefully close the connection. */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    isConnected = false;
  }
}

/** Human-readable connection state, used by the health endpoint. */
export function dbStatus() {
  return ['disconnected', 'connected', 'connecting', 'disconnecting'][
    mongoose.connection.readyState
  ];
}

export default connectDB;
