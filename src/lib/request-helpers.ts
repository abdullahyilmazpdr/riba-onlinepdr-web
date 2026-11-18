import { NextRequest } from 'next/server';
import { getLatestSchoolData } from './db';
import { getSystemServiceAccountCreds } from './sheets';

export function getPublicOrigin(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const host = req.headers.get('host') || '';
  if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    return `${proto}://${host}`;
  }
  if (configured) return configured.replace(/\/+$/, '');
  return req.nextUrl.origin.replace(/\/+$/, '');
}

export function extractAuthFromRequest(req: NextRequest, body?: any) {
  const sp = req.nextUrl.searchParams;
  return {
    schoolKey: (body?.schoolKey || sp.get('schoolKey') || '').trim(),
    spreadsheetId: (body?.spreadsheetId || sp.get('spreadsheetId') || '').trim(),
    adminUid: (body?.adminUid || sp.get('adminUid') || '').trim(),
    googleToken:
      req.headers.get('Authorization')?.split('Bearer ')[1]?.trim() ||
      body?.googleToken ||
      '',
    teacherToken:
      req.headers.get('x-session-token')?.trim() ||
      body?.sessionToken ||
      sp.get('sessionToken') ||
      '',
  };
}

export async function resolveServerAccessToken(
  schoolKey: string,
  headerGoogleToken?: string,
  explicitSpreadsheetId?: string
): Promise<{
  school: Awaited<ReturnType<typeof getLatestSchoolData>>;
  spreadsheetId: string;
  accessToken: string;
}> {
  const school = await getLatestSchoolData(schoolKey);
  const spreadsheetId = explicitSpreadsheetId || school?.spreadsheetId || '';
  const sysCreds = getSystemServiceAccountCreds();
  const serverFallbackToken =
    school?.serviceAccountKey ||
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
    (sysCreds ? JSON.stringify(sysCreds) : '') ||
    school?.accessToken ||
    '';

  return {
    school,
    spreadsheetId,
    accessToken: serverFallbackToken || headerGoogleToken || '',
  };
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    if (rateLimitMap.size > 5000) rateLimitMap.clear();
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}
