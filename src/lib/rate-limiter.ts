import { RATE_LIMIT_CONFIG } from '@/config/ai';
import { RateLimitResult } from './types';

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window store
const ipTracker = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function performCleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  const cutoff = now - RATE_LIMIT_CONFIG.windowMs;

  ipTracker.forEach((record, ip) => {
    record.timestamps = record.timestamps.filter((ts) => ts > cutoff);
    if (record.timestamps.length === 0) {
      ipTracker.delete(ip);
    }
  });
}

/**
 * Check if a client IP is within the allowed rate limit
 */
export function checkRateLimit(ip: string): RateLimitResult {
  performCleanup();

  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.windowMs;

  let record = ipTracker.get(ip);
  if (!record) {
    record = { timestamps: [] };
    ipTracker.set(ip, record);
  }

  // Filter timestamps to only keep those within current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxRequests - record.timestamps.length);
  const reset = Math.ceil((windowStart + RATE_LIMIT_CONFIG.windowMs) / 1000);

  if (record.timestamps.length >= RATE_LIMIT_CONFIG.maxRequests) {
    return {
      success: false,
      limit: RATE_LIMIT_CONFIG.maxRequests,
      remaining: 0,
      reset,
    };
  }

  // Add current request timestamp
  record.timestamps.push(now);

  return {
    success: true,
    limit: RATE_LIMIT_CONFIG.maxRequests,
    remaining: remaining - 1,
    reset,
  };
}

/**
 * Extract Client IP from Request Headers
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }

  return '127.0.0.1';
}
