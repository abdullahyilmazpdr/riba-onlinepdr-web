import { NextRequest, NextResponse } from 'next/server';
import {
  parseStudentList,
  parseTeacherSchedule,
  Teacher,
  Student,
  slugifyTr,
  generateUsername,
  generatePassword,
  buildWhatsAppLink,
  deduplicateClasses,
  getClassBaseKey,
} from '@/lib/pdf-parser';
import { updateSheetRange, readFromSheet, ensureSheetExists, getSystemServiceAccountCreds } from '@/lib/sheets';
import { getLatestSchoolData } from '@/lib/db';
import { getPublicOrigin } from '@/lib/request-helpers';

function normalizeTeacherKey(name: string): string {
  return slugifyTr(name || '').replace(/[^a-z0-9]/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const studentFile = formData.get('studentFile') as File | null;
    const scheduleFile = formData.get('scheduleFile') as File | null;
    const regeneratePasswords = formData.get('regeneratePasswords') === 'true';
    const existingTeachersJson = formData.get('existingTeachersJson') as string | null;
    const schoolKey = (formData.get('schoolKey') as string | null) || '';
    const adminUid = (formData.get('adminUid') as string | null) || '';

    let spreadsheetId = (formData.get('spreadsheetId') as string | null) || '';
    const headerToken = req.headers.get('Authorization')?.split('Bearer ')[1]?.trim() || '';

    const latestSchool = await getLatestSchoolData(schoolKey || undefined).catch(() => null);
    const isAuthorizedAdmin = Boolean(
      headerToken || (adminUid && latestSchool?.adminUid && adminUid === latestSchool.adminUid)
    );

    if (!isAuthorizedAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için okul yöneticisi oturumu gereklidir.' },
        { status: 403 }
      );
    }

    const sysCreds = getSystemServiceAccountCreds();
    const serverFallbackToken =
      latestSchool?.serviceAccountKey ||
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
      (sysCreds ? JSON.stringify(sysCreds) : '') ||
      latestSchool?.accessToken ||
      '';

    if (!spreadsheetId && latestSchool?.spreadsheetId) {
      spreadsheetId = latestSchool.spreadsheetId;
    }
    const accessToken = serverFallbackToken || headerToken;

    if ((!studentFile && !scheduleFile) || !spreadsheetId || !accessToken) {
      return NextResponse.json(
        { error: 'Lütfen en az bir E-Okul PDF dosyası (Öğrenci Listesi veya Ders Programı) seçiniz.' },
        { status: 400 }
      );
    }

    const [existingStudentRows, existingTeacherRows] = await Promise.all([
      readFromSheet(accessToken, spreadsheetId, 'Öğrenciler!A2:C').catch(() => []),
      readFromSheet(accessToken, spreadsheetId, 'Öğretmenler!A2:E').catch(() => []),
    ]);

    const existingStudents: Student[] = (existingStudentRows || [])
      .map((row: any[]) => ({
        className: String(row?.[0] || '').trim(),
        number: String(row?.[1] || '').trim(),
        name: String(row?.[2] || '').trim(),
      }))
      .filter((s: Student) => s.number || s.name);

    const existingCredentialsMap = new Map<
      string,
      { username: string; password: string; classes: string[]; roleOrBranch: string; name: string }
    >();

    if (existingTeachersJson) {
      try {
        const parsed = JSON.parse(existingTeachersJson);
        if (Array.isArray(parsed)) {
          for (const t of parsed) {
            if (!t?.name) continue;
            const key = normalizeTeacherKey(t.name);
            if (!key) continue;
            const prev = existingCredentialsMap.get(key);
            existingCredentialsMap.set(key, {
              name: t.name.trim(),
              username: (t.username || prev?.username || '').trim(),
              password: (t.password || prev?.password || '').trim(),
              classes: deduplicateClasses([...(prev?.classes || []), ...(Array.isArray(t.classes) ? t.classes : [])]),
              roleOrBranch: (t.role || t.branch || prev?.roleOrBranch || 'Öğretmen').trim(),
            });
          }
        }
      } catch {}
    }

    for (const row of existingTeacherRows || []) {
      const rName = String(row?.[0] || '').trim();
      if (!rName) continue;
      const key = normalizeTeacherKey(rName);
      if (!key) continue;
      const prev = existingCredentialsMap.get(key);
      const rClasses = String(row?.[1] || '').split(',').map((c) => c.trim()).filter(Boolean);
      existingCredentialsMap.set(key, {
        name: prev?.name || rName,
        username: String(row?.[2] || prev?.username || '').trim(),
        password: String(row?.[3] || prev?.password || '').trim(),
        classes: deduplicateClasses([...(prev?.classes || []), ...rClasses]),
        roleOrBranch: String(row?.[4] || prev?.roleOrBranch || 'Öğretmen').trim(),
      });
    }

    let parsedStudents: Student[] = [];
    let studentListTeachers: Teacher[] = [];
    if (studentFile) {
      const buf = Buffer.from(await studentFile.arrayBuffer());
      const res = await parseStudentList(buf);
      parsedStudents = res.students;
      studentListTeachers = res.teachers;
    }

    let scheduleTeachers: Teacher[] = [];
    if (scheduleFile) {
      const buf = Buffer.from(await scheduleFile.arrayBuffer());
      scheduleTeachers = await parseTeacherSchedule(buf);
    }

    const finalStudents = parsedStudents.length > 0 ? parsedStudents : existingStudents;

    const mergedTeachersMap = new Map<string, Teacher>();
    const addOrMergeTeacher = (t: Teacher) => {
      const key = normalizeTeacherKey(t.name);
      if (!key) return;
      const prev = mergedTeachersMap.get(key);
      const savedCreds = existingCredentialsMap.get(key);
      const username = (!regeneratePasswords && savedCreds?.username) || prev?.username || t.username || generateUsername(t.name);
      const password = (!regeneratePasswords && savedCreds?.password) || prev?.password || t.password || generatePassword();

      const combinedClasses = deduplicateClasses([
        ...(savedCreds?.classes || []),
        ...(prev?.classes || []),
        ...(t.classes || []),
      ]);

      const role =
        prev?.role === 'Sınıf Öğretmeni' || t.role === 'Sınıf Öğretmeni'
          ? 'Sınıf Öğretmeni'
          : t.role || prev?.role || 'Ders Öğretmeni';

      mergedTeachersMap.set(key, {
        name: prev?.name || t.name,
        role,
        branch: t.branch || prev?.branch || role,
        classes: combinedClasses,
        username,
        password,
        whatsappLink: buildWhatsAppLink(t.name, username, password, combinedClasses, role),
      });
    };

    for (const [, saved] of existingCredentialsMap) {
      addOrMergeTeacher({
        name: saved.name,
        classes: saved.classes,
        username: saved.username,
        password: saved.password,
        role: saved.roleOrBranch,
      });
    }
    for (const t of studentListTeachers) addOrMergeTeacher(t);
    for (const t of scheduleTeachers) addOrMergeTeacher(t);

    const finalTeachers = Array.from(mergedTeachersMap.values());

    if (finalStudents.length > 0) {
      await ensureSheetExists(accessToken, spreadsheetId, 'Öğrenciler', [
        'Sınıf/Şube',
        'Okul No',
        'Adı Soyadı',
        'Cinsiyet',
      ]);
      const stValues = finalStudents.map((s) => [s.className, s.number, s.name, s.gender || '']);
      await updateSheetRange(
        accessToken,
        spreadsheetId,
        `Öğrenciler!A2:D${Math.max(100, stValues.length + 5)}`,
        stValues
      );
    }

    if (finalTeachers.length > 0) {
      await ensureSheetExists(accessToken, spreadsheetId, 'Öğretmenler', [
        'Öğretmen Adı',
        'Girdiği Sınıflar',
        'Kullanıcı Adı',
        'Şifre',
        'Görev/Branş',
      ]);
      const tValues = finalTeachers.map((t) => [
        t.name,
        t.classes.join(', '),
        t.username || '',
        t.password || '',
        t.role || t.branch || 'Öğretmen',
      ]);
      await updateSheetRange(
        accessToken,
        spreadsheetId,
        `Öğretmenler!A2:E${Math.max(50, tValues.length + 5)}`,
        tValues
      );
    }

    const origin = getPublicOrigin(req);
    const uniqueClassNames = deduplicateClasses([
      ...finalStudents.map((s) => s.className),
      ...finalTeachers.flatMap((t) => t.classes),
    ]);

    return NextResponse.json({
      success: true,
      origin,
      studentCount: finalStudents.length,
      teacherCount: finalTeachers.length,
      classCount: uniqueClassNames.length,
      classes: uniqueClassNames.map((cn) => ({ classKey: getClassBaseKey(cn), className: cn })),
      teachers: finalTeachers,
    });
  } catch (err: any) {
    console.error('Parse upload error:', err);
    return NextResponse.json(
      { error: err.message || 'PDF işlenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
