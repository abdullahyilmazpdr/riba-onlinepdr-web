import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getLatestSchoolData, getSchoolsByAdmin } from '@/lib/db';
import { isAuthorizedSchoolRequest } from '@/lib/session-token';
import { getSystemServiceAccountCreds, readFromSheet } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

const SSO_SECRET =
  process.env.SSO_SECRET || 'meram-oeuo-risk-sso-bridge-key-2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role = body?.role === 'teacher' ? 'teacher' : 'admin';
    const requestedSchoolKey = String(body?.schoolKey || '').trim();
    const adminUid = String(body?.adminUid || '').trim();
    const adminName = String(body?.adminName || '').trim();
    const adminEmail = String(body?.adminEmail || '').trim();
    const sessionToken =
      req.headers.get('x-session-token')?.trim() ||
      String(body?.sessionToken || '').trim();
    const googleToken =
      req.headers.get('Authorization')?.split('Bearer ')[1]?.trim() || '';

    const riskBaseUrl =
      process.env.NEXT_PUBLIC_RISK_URL?.replace(/\/+$/, '') ||
      'https://risk.onlinepdr.com';

    let uidForSso = '';
    let resolvedSchoolKey = requestedSchoolKey;
    let displayName = '';
    let emailForSso = adminEmail;

    if (role === 'admin') {
      if (!adminUid) {
        return NextResponse.json(
          { error: 'Yönetici oturumu gereklidir.' },
          { status: 401 }
        );
      }

      let school = resolvedSchoolKey
        ? await getLatestSchoolData(resolvedSchoolKey)
        : null;

      if (resolvedSchoolKey) {
        const authCheck = await isAuthorizedSchoolRequest({
          schoolKey: resolvedSchoolKey,
          adminUid,
          googleToken,
        });
        if (!authCheck.authorized) {
          return NextResponse.json(
            { error: 'Okul erişim yetkisi doğrulanamadı.' },
            { status: 403 }
          );
        }
      } else {
        const list = await getSchoolsByAdmin(adminUid);
        if (!list || list.length === 0) {
          return NextResponse.json(
            { error: 'Bu hesaba kayıtlı okul bulunamadı.' },
            { status: 404 }
          );
        }
        school = list[0];
        resolvedSchoolKey = school.schoolKey;
      }

      uidForSso = adminUid;
      displayName =
        adminName || school?.schoolName || 'Okul Rehberlik / İdare';
      emailForSso = emailForSso || '';
    } else {
      if (!resolvedSchoolKey || !sessionToken) {
        return NextResponse.json(
          { error: 'Öğretmen oturumu doğrulanamadı.' },
          { status: 401 }
        );
      }

      const authCheck = await isAuthorizedSchoolRequest({
        schoolKey: resolvedSchoolKey,
        teacherToken: sessionToken,
      });

      const username = authCheck.username;
      if (!authCheck.authorized || !username) {
        return NextResponse.json(
          { error: 'Öğretmen oturumu doğrulanamadı.' },
          { status: 403 }
        );
      }

      const school = await getLatestSchoolData(resolvedSchoolKey);
      if (!school || !school.spreadsheetId) {
        return NextResponse.json(
          { error: 'Okul E-Tablo kaydı bulunamadı.' },
          { status: 404 }
        );
      }

      // Risk /api/sso isim üzerinden eşleşme yaptığı için öğretmen tam adını sunucudaki E-Tablodan doğrula
      let authoritativeName = String(body?.teacherName || '').trim();
      const sysCreds = getSystemServiceAccountCreds();
      const serverAuth =
        school.serviceAccountKey ||
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
        (sysCreds ? JSON.stringify(sysCreds) : '') ||
        school.accessToken;

      if (serverAuth) {
        try {
          const rows = await readFromSheet(
            serverAuth,
            school.spreadsheetId,
            'Öğretmenler!A2:E'
          );
          const match = (rows || []).find(
            (r) => String(r?.[2] || '').trim().toLowerCase() === username.toLowerCase()
          );
          if (match?.[0]) {
            authoritativeName = String(match[0]).trim();
          }
        } catch {}
      }

      uidForSso = `${resolvedSchoolKey}:${username}`;
      displayName = authoritativeName || username;
    }

    // okul-risk-web /api/sso zaman damgasını milisaniye (Date.now()) bekler
    const ts = Date.now().toString();
    const sig = crypto
      .createHash('sha256')
      .update(`${uidForSso}:${role}:${ts}:${SSO_SECRET}`)
      .digest('hex');

    const url = new URL('/sso', riskBaseUrl);
    url.searchParams.set('uid', uidForSso);
    url.searchParams.set('role', role);
    url.searchParams.set('ts', ts);
    url.searchParams.set('sig', sig);
    url.searchParams.set('name', displayName);
    url.searchParams.set('source', 'riba-onlinepdr');
    if (resolvedSchoolKey) url.searchParams.set('schoolKey', resolvedSchoolKey);
    if (emailForSso) url.searchParams.set('email', emailForSso);

    return NextResponse.json({ success: true, url: url.toString() });
  } catch (err: any) {
    console.error('Risk SSO link error:', err);
    return NextResponse.json(
      { error: 'Risk Haritası geçiş bağlantısı oluşturulamadı.' },
      { status: 500 }
    );
  }
}
