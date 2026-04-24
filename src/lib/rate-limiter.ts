import { headers } from 'next/headers';

const WINDOW_MS = 60_000; // 1 minute window
const MAX_REQUESTS = 5;   // max 5 AI calls per IP per minute

const store = new Map<string, { count: number; resetAt: number }>();

export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headersList.get('x-real-ip') ?? 'unknown';
}

export function checkRateLimit(ip: string): { allowed: boolean; resetIn: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, resetIn: 0 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, resetIn: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, resetIn: 0 };
}

export async function enforceRateLimit(): Promise<void> {
  const ip = await getClientIp();
  const { allowed, resetIn } = checkRateLimit(ip);
  if (!allowed) {
    throw new Error(`Rate limit exceeded. Please wait ${resetIn} seconds before trying again.`);
  }
}
