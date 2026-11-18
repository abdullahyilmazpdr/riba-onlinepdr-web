import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSchoolsByAdmin, getLatestSchoolData } from '@/lib/db';
import { readFromSheet, getSystemServiceAccountCreds } from '@/lib/sheets';
import { deduplicateClasses, getClassBaseKey } from '@/lib/pdf-parser';
import { generateTeacherToken } from '@/lib/session-token';

const SSO_SECRET =
  process.env.SSO_SECRET || 'meram-oeuo-risk-sso-bridge-key-2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, role, ts, sig, schoolKey: requestedSchoolKey } = body;

    if (!uid || !role || !ts || !sig) {
      return NextResponse.json({ error: 'Geçersiz SSO parametreleri.' }, { status: 400 });
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const tsNum = Number(ts);
    if (isNaN(tsNum) || Math.abs(nowSec - tsNum) > 300) {
      return NextResponse.json(
        { error: 'SSO bağlantısının süresi dolmuş. Lütfen tekrar giriş yapın.' },
        { status: 401 }
      );
    }

    const expectedSig = crypto
      .createHash('sha256')
      .update(`${uid}:${role}:${ts}:${SSO_SECRET}`)
      .digest('hex');

    if (sig !== expectedSig) {
      return NextResponse.json({ error: 'Geçersiz SSO güvenlik imzası.' }, { status: 403 });
    }

    if (role === 'admin' || role === 'counselor') {
      const schools = await getSchoolsByAdmin(uid);
      if (!schools || schools.length === 0) {
        return NextResponse.json(
          { error: 'Bu yönetici hesabına kayıtlı okul bulunamadı.' },
          { status: 404 }
        );
      }

      const activeSchool =
        (requestedSchoolKey && schools.find((s) => s.schoolKey === requestedSchoolKey)) ||
        schools[0];

      return NextResponse.json({
        success: true,
        redirectUrl: '/admin',
        sessionType: 'admin',
        activeSchoolKey: activeSchool.schoolKey,
        activeSpreadsheetId: activeSchool.spreadsheetId,
        schoolName: activeSchool.schoolName,
        academicYear: activeSchool.academicYear || '2026-2027',
        adminUid: uid,
      });
    }

    if (role === 'teacher') {
      const targetSchoolKey = (requestedSchoolKey || uid.split(':')[0] || '').trim();
      const targetUsername = (uid.includes(':') ? uid.split(':').slice(1).join(':') : uid).trim();

      const school = await getLatestSchoolData(targetSchoolKey || undefined);
      if (!school || !school.spreadsheetId) {
        return NextResponse.json(
          { error: 'Öğretmen için okul kaydı veya E-Tablo bulunamadı.' },
          { status: 404 }
        );
      }

      const sysCreds = getSystemServiceAccountCreds();
      const serverAuth =
        school.serviceAccountKey ||
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
        (sysCreds ? JSON.stringify(sysCreds) : '') ||
        school.accessToken;

      if (!serverAuth) {
        return NextResponse.json({ error: 'Sunucu E-Tablo erişim anahtarı eksik.' }, { status: 500 });
      }

      const [teachersRows, studentsRows] = await Promise.all([
        readFromSheet(serverAuth, school.spreadsheetId, 'Öğretmenler!A2:E').catch(() => []),
        readFromSheet(serverAuth, school.spreadsheetId, 'Öğrenciler!A2:C').catch(() => []),
      ]);

      let matchedTeacher: any = null;
      for (const row of teachersRows || []) {
        const u = String(row?.[2] || '').trim();
        if (u && u.toLowerCase() === targetUsername.toLowerCase()) {
          matchedTeacher = {
            name: String(row?.[0] || '').trim(),
            classesStr: String(row?.[1] || '').trim(),
            username: u,
            role: String(row?.[4] || 'Sınıf Öğretmeni').trim(),
          };
          break;
        }
      }

      if (!matchedTeacher) {
        return NextResponse.json({ error: 'Öğretmen E-Tabloda bulunamadı.' }, { status: 404 });
      }

      const roleLower = matchedTeacher.role
        .replace(/İ/g, 'i')
        .replace(/I/g, 'ı')
        .toLowerCase();
      const isAdmin =
        roleLower.includes('rehber') ||
        roleLower.includes('psikolojik') ||
        roleLower.includes('pdr') ||
        roleLower.includes('müdür') ||
        roleLower.includes('idare');

      const allStudentClasses = deduplicateClasses(
        (studentsRows || []).map((r: any[]) => String(r?.[0] || '').trim()).filter(Boolean)
      );
      let effectiveClasses = deduplicateClasses(
        matchedTeacher.classesStr.split(',').map((s: string) => s.trim()).filter(Boolean)
      );
      if (isAdmin && allStudentClasses.length > 0) {
        effectiveClasses = deduplicateClasses([...effectiveClasses, ...allStudentClasses]);
      } else if (effectiveClasses.length > 0 && allStudentClasses.length > 0) {
        const map = new Map<string, string>();
        for (const sc of allStudentClasses) map.set(getClassBaseKey(sc), sc);
        effectiveClasses = deduplicateClasses(effectiveClasses.map((tc) => map.get(getClassBaseKey(tc)) || tc));
      }

      const sessionToken = generateTeacherToken(school.schoolKey, matchedTeacher.username);

      return NextResponse.json({
        success: true,
        redirectUrl: '/teacher',
        sessionType: 'teacher',
        sessionToken,
        schoolKey: school.schoolKey,
        spreadsheetId: school.spreadsheetId,
        schoolName: school.schoolName || 'Okul RİBA Sistemi',
        academicYear: school.academicYear || '2026-2027',
        teacher: {
          name: matchedTeacher.name,
          username: matchedTeacher.username,
          role: matchedTeacher.role,
          isAdmin,
          classes: effectiveClasses,
        },
      });
    }

    return NextResponse.json({ error: 'Tanımsız SSO rolü.' }, { status: 400 });
  } catch (err: any) {
    console.error('SSO Error:', err);
    return NextResponse.json(
      { error: 'SSO doğrulama hatası: ' + err.message },
      { status: 500 }
    );
  }
}
