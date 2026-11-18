import crypto from 'crypto';
import { getLatestSchoolData } from './db';
import { RibaLevel, RibaRole } from './riba-data';

const SECRET_SALT =
  process.env.SESSION_SECRET || 'okul-risk-meram-secret-hmac-salt-2026-v1';

export function generateTeacherToken(schoolKey: string, username: string): string {
  const issuedAt = Date.now();
  const payload = `${schoolKey}:${username}:${issuedAt}`;
  const hmac = crypto
    .createHmac('sha256', SECRET_SALT)
    .update(payload)
    .digest('hex')
    .slice(0, 32);
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

export function verifyTeacherToken(
  token: string,
  expectedSchoolKey?: string
): { valid: boolean; schoolKey?: string; username?: string } {
  if (!token) return { valid: false };
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return { valid: false };

    const [schoolKey, username, issuedAtStr, sig] = parts;
    const issuedAt = parseInt(issuedAtStr, 10);
    if (!schoolKey || !username || isNaN(issuedAt)) return { valid: false };

    if (Date.now() - issuedAt > 30 * 24 * 60 * 60 * 1000) {
      return { valid: false };
    }
    if (expectedSchoolKey && schoolKey !== expectedSchoolKey) {
      return { valid: false };
    }

    const expectedSig = crypto
      .createHmac('sha256', SECRET_SALT)
      .update(`${schoolKey}:${username}:${issuedAtStr}`)
      .digest('hex')
      .slice(0, 32);

    if (sig !== expectedSig) return { valid: false };
    return { valid: true, schoolKey, username };
  } catch {
    return { valid: false };
  }
}

export async function isAuthorizedSchoolRequest(req: {
  schoolKey: string;
  spreadsheetId?: string;
  adminUid?: string;
  teacherToken?: string;
  googleToken?: string;
}): Promise<{ authorized: boolean; isTeacher?: boolean; isAdmin?: boolean; username?: string }> {
  const { schoolKey, spreadsheetId, adminUid, teacherToken, googleToken } = req;
  if (!schoolKey) return { authorized: false };

  if (teacherToken) {
    const res = verifyTeacherToken(teacherToken, schoolKey);
    if (res.valid) {
      return { authorized: true, isTeacher: true, username: res.username };
    }
  }

  if (adminUid) {
    const school = await getLatestSchoolData(schoolKey);
    if (
      school &&
      school.adminUid === adminUid &&
      (!spreadsheetId || school.spreadsheetId === spreadsheetId)
    ) {
      return { authorized: true, isAdmin: true };
    }
  }

  if (googleToken && googleToken.length > 20) {
    const school = await getLatestSchoolData(schoolKey);
    if (school && (!spreadsheetId || school.spreadsheetId === spreadsheetId)) {
      return { authorized: true, isAdmin: true };
    }
  }

  return { authorized: false };
}

// ============================================================
// SIGNED PUBLIC FORM TOKENS (ZERO-PII URL CONTRACT)
// ============================================================

export interface RibaFormTokenPayload {
  s: string; // schoolKey
  l: RibaLevel; // level
  r: RibaRole; // role: ogrenci | veli | ogretmen
  ck: string; // classKey or 'SCHOOL_POOL'
  cn: string; // className display (e.g. '7. Sınıf / A Şubesi' or 'Tüm Sınıflar')
}

export function slugifyFormPart(text: string): string {
  const trMap: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', I: 'i', İ: 'i',
    ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  };
  return (text || '')
    .split('')
    .map((c) => trMap[c] || c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function signRibaFormToken(payload: RibaFormTokenPayload): {
  slug: string;
  d: string;
  sig: string;
} {
  const canonical = JSON.stringify({
    s: payload.s,
    l: payload.l,
    r: payload.r,
    ck: payload.ck,
    cn: payload.cn,
  });
  const d = Buffer.from(canonical, 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', `${SECRET_SALT}:riba-form-v1`)
    .update(d)
    .digest('hex')
    .slice(0, 24);
  const classSlug = payload.ck === 'SCHOOL_POOL' ? payload.l : slugifyFormPart(payload.cn) || payload.l;
  // Unmistakable role prefix right in the URL path so teachers NEVER mix up Student vs Parent vs Teacher URLs!
  const slug = `${payload.r}-${classSlug}`;
  return { slug, d, sig };
}

export function verifyRibaFormToken(d: string, sig: string): RibaFormTokenPayload | null {
  if (!d || !sig) return null;
  try {
    const expectedSig = crypto
      .createHmac('sha256', `${SECRET_SALT}:riba-form-v1`)
      .update(d)
      .digest('hex')
      .slice(0, 24);
    if (sig !== expectedSig) return null;
    const parsed = JSON.parse(Buffer.from(d, 'base64url').toString('utf8'));
    if (!parsed?.s || !parsed?.l || !parsed?.r) return null;
    return parsed as RibaFormTokenPayload;
  } catch {
    return null;
  }
}

export function buildRibaFormUrl(origin: string, payload: RibaFormTokenPayload): string {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const { slug, d, sig } = signRibaFormToken(payload);
  return `${cleanOrigin}/f/${encodeURIComponent(payload.s)}/${encodeURIComponent(slug)}?d=${encodeURIComponent(d)}&sig=${encodeURIComponent(sig)}`;
}
