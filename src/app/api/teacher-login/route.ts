import { NextRequest, NextResponse } from 'next/server';
import { getLatestSchoolData } from '@/lib/db';
import { readFromSheet, getSystemServiceAccountCreds } from '@/lib/sheets';
import { generateTeacherToken } from '@/lib/session-token';
import { deduplicateClasses, getClassBaseKey } from '@/lib/pdf-parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schoolKey, username, password, requestedClass } = body;

    if (!schoolKey || (!username && !requestedClass)) {
      return NextResponse.json(
        { error: 'Lütfen Kurum Kodu ve Öğretmen kullanıcı bilgilerinizi giriniz.' },
        { status: 400 }
      );
    }

    const school = await getLatestSchoolData(schoolKey);
    if (!school) {
      return NextResponse.json(
        { error: `Girdiğiniz Kurum Kodu (${schoolKey}) ile kayıtlı bir okul bulunamadı.` },
        { status: 404 }
      );
    }

    if (!school.spreadsheetId) {
      return NextResponse.json(
        { error: 'Okul E-Tablosu henüz yapılandırılmamış.' },
        { status: 400 }
      );
    }

    const sysCreds = getSystemServiceAccountCreds();
    const serverAuth =
      school.serviceAccountKey ||
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
      (sysCreds ? JSON.stringify(sysCreds) : '') ||
      school.accessToken;

    if (!serverAuth) {
      return NextResponse.json(
        { error: 'Sunucu E-Tablo erişim anahtarı yapılandırılmamış.' },
        { status: 500 }
      );
    }

    const [teachersRows, studentsRows] = await Promise.all([
      readFromSheet(serverAuth, school.spreadsheetId, 'Öğretmenler!A2:E').catch(() => []),
      readFromSheet(serverAuth, school.spreadsheetId, 'Öğrenciler!A2:C').catch(() => []),
    ]);

    const cleanUsername = (username || '').trim();
    const cleanPassword = (password || '').trim();

    if (!teachersRows || teachersRows.length === 0) {
      return NextResponse.json(
        { error: 'Öğretmen listesi E-Tabloda bulunamadı.' },
        { status: 404 }
      );
    }

    let matchedTeacher: any = null;
    for (const row of teachersRows) {
      const rowUsername = (row[2] || '').trim();
      const rowPassword = (row[3] || '').trim();
      if (rowUsername && rowUsername.toLowerCase() === cleanUsername.toLowerCase()) {
        matchedTeacher = {
          name: (row[0] || '').trim(),
          classesStr: (row[1] || '').trim(),
          username: rowUsername,
          password: rowPassword,
          role: (row[4] || 'Sınıf Öğretmeni').trim(),
        };
        break;
      }
    }

    if (!matchedTeacher) {
      return NextResponse.json(
        { error: 'Girdiğiniz Kullanıcı Adı okul kayıtlarında bulunamadı.' },
        { status: 401 }
      );
    }

    if (!cleanPassword || matchedTeacher.password !== cleanPassword) {
      return NextResponse.json({ error: 'Şifreniz hatalı!' }, { status: 401 });
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

    const rawTeacherClasses = matchedTeacher.classesStr
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const allStudentClassesSet = new Set<string>();
    for (const row of studentsRows || []) {
      const clsName = (row[0] || '').trim();
      if (clsName) allStudentClassesSet.add(clsName);
    }
    const allStudentClasses = deduplicateClasses(Array.from(allStudentClassesSet));

    let effectiveClasses = deduplicateClasses(rawTeacherClasses);
    if (isAdmin && allStudentClasses.length > 0) {
      effectiveClasses = deduplicateClasses([...effectiveClasses, ...allStudentClasses]);
    } else if (effectiveClasses.length > 0 && allStudentClasses.length > 0) {
      const baseToCanonical = new Map<string, string>();
      for (const sc of allStudentClasses) baseToCanonical.set(getClassBaseKey(sc), sc);
      effectiveClasses = deduplicateClasses(
        effectiveClasses.map((tc) => baseToCanonical.get(getClassBaseKey(tc)) || tc)
      );
    }

    const sessionToken = generateTeacherToken(school.schoolKey, matchedTeacher.username);

    return NextResponse.json({
      success: true,
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
  } catch (err: any) {
    console.error('Teacher Login Error:', err);
    return NextResponse.json(
      { error: 'Giriş sırasında sunucu hatası: ' + err.message },
      { status: 500 }
    );
  }
}
