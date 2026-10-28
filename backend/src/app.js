/**
 * Express application factory. Wires security, parsing, logging, routes and the
 * centralized error handler. Kept free of side effects (no DB connect / listen)
 * so it can be imported directly by the test suite.
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { env } from './config/env.js';
import { httpLogStream } from './config/logger.js';
import { xssSanitizer } from './middlewares/sanitize.middleware.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { registerEventHandlers } from './events/handlers.js';
import v1Routes from './routes/v1/index.js';

export function createApp() {
  registerEventHandlers();
  const app = express();

  app.set('trust proxy', 1);

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=*');
    next();
  });
  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin / server-to-server (no Origin header) and allow-listed origins.
        if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
      },
      credentials: true,
    })
  );

  // ── Parsing ───────────────────────────────────────────────────────────────
  // Admin product galleries are submitted as compressed data URLs. Keep the
  // request below MongoDB's 16 MB document ceiling while allowing a practical
  // multi-image edit payload.
  // Admin product creation/updates, lens media, cart prescriptions, and order submissions
  // can contain compressed images and PDF data URLs. Scope the 12mb limit to those routes.
  // Sensitive public routes (auth, coupons, contact) remain capped at 200kb to protect
  // against memory exhaustion attacks.
  const largeJsonParser = express.json({ limit: '12mb' });
  app.use(`${env.API_PREFIX}/products`, (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PATCH') {
      return largeJsonParser(req, res, next);
    }
    next();
  });
  app.use(`${env.API_PREFIX}/admin`, largeJsonParser);
  app.use(`${env.API_PREFIX}/cart`, largeJsonParser);
  app.use(`${env.API_PREFIX}/orders`, largeJsonParser);
  app.use(`${env.API_PREFIX}/account`, largeJsonParser);

  // Global low limit for all other routes
  app.use(express.json({ limit: '200kb' }));
  app.use(express.urlencoded({ extended: true, limit: '50kb' }));
  app.use(cookieParser());

  // ── Hardening ─────────────────────────────────────────────────────────────
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(xssSanitizer);
  app.use(compression());

  // ── Logging ───────────────────────────────────────────────────────────────
  if (!env.isTest) {
    app.use(morgan(env.isProd ? 'combined' : 'dev', { stream: httpLogStream }));
  }

  // ── Global rate limiting ─────────────────────────────────────────────────
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests, please try again later.' },
    })
  );

  // ── Routes ────────────────────────────────────────────────────────────────
  app.get('/', (req, res) =>
    res.json({ success: true, message: 'Online Chasmewala API', docs: `${env.API_PREFIX}/health` })
  );
  app.use(env.API_PREFIX, v1Routes);

  // ── 404 + error handling ──────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
