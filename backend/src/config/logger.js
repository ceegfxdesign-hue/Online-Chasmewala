/**
 * Centralized Winston logger. Pretty, colorized output in development; JSON in
 * production for log aggregators.
 */
import winston from 'winston';
import { env } from './env.js';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const SENSITIVE_KEY_PATTERN = /^(password|currentPassword|newPassword|token|accessToken|refreshToken|secret|authorization|cookie|apiKey|otp|code)$/i;

function redactDeep(key, value) {
  if (typeof key === 'string' && SENSITIVE_KEY_PATTERN.test(key)) {
    return '[REDACTED]';
  }
  if (typeof value === 'string') {
    return value
      .replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, 'Bearer [REDACTED]')
      .replace(/((?:password|secret|token)\s*[:=]\s*)['"][^'"]+['"]/gi, '$1"[REDACTED]"');
  }
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) return value.map((item) => redactDeep(null, item));
    const cleansed = {};
    for (const [k, v] of Object.entries(value)) {
      cleansed[k] = redactDeep(k, v);
    }
    return cleansed;
  }
  return value;
}

const redactFormat = winston.format((info) => {
  if (typeof info.message === 'string') {
    info.message = info.message
      .replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, 'Bearer [REDACTED]')
      .replace(/((?:password|secret|token)\s*[:=]\s*)['"][^'"]+['"]/gi, '$1"[REDACTED]"');
  }
  for (const [k, v] of Object.entries(info)) {
    if (SENSITIVE_KEY_PATTERN.test(k)) {
      info[k] = '[REDACTED]';
    } else if (v && typeof v === 'object' && k !== 'level') {
      info[k] = redactDeep(k, v);
    }
  }
  return info;
});

const devFormat = combine(
  redactFormat(),
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => `${ts} ${level}: ${stack || message}`)
);

const prodFormat = combine(redactFormat(), timestamp(), errors({ stack: true }), json());

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
