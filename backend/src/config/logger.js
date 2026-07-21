/**
 * Centralized Winston logger. Pretty, colorized output in development; JSON in
 * production for log aggregators.
 */
import winston from 'winston';
import { env } from './env.js';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => `${ts} ${level}: ${stack || message}`)
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: env.isProd ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
  silent: env.isTest,
});

/** Morgan-compatible stream so HTTP logs flow through Winston. */
export const httpLogStream = {
  write: (message) => logger.http?.(message.trim()) ?? logger.info(message.trim()),
};

export default logger;
