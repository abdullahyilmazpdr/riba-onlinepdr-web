import { NextRequest, NextResponse } from 'next/server';
import { verifyRibaFormToken } from '@/lib/session-token';
import { getLatestSchoolData } from '@/lib/db';
import { getSystemServiceAccountCreds } from '@/lib/sheets';
import {
  readRibaConfig,
  readSchoolClassesAndTeachers,
} from '@/lib/riba-sheets';
import { RIBA_LEVELS, RIBA_ROLE_META } from '@/lib/riba-data';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const schoolKey = (sp.get('schoolKey') || '').trim();
    const d = (sp.get('d') || '').trim();
    const sig = (sp.get('sig') || '').trim();

    const payload = verifyRibaFormToken(d, sig);
    if (!payload || (schoolKey && payload.s !== schoolKey)) {
      return NextResponse.json(
        { error: 'Anket bağlantısı geçersiz veya bozulmuş. Lütfen öğretmeninizden yeni bağlantı isteyiniz.' },
        { status: 403 }
      );
    }

    const levelSpec = RIBA_LEVELS[payload.l];
    const formSpec = levelSpec?.forms?.[payload.r];
    if (!levelSpec || !formSpec) {
      return NextResponse.json(
        { error: 'Bu kademe için talep edilen RİBA formu tanımlı değil.' },
        { status: 400 }
      );
    }

    const school = await getLatestSchoolData(payload.s);
    if (!school) {
      return NextResponse.json({ error: 'Okul kaydı bulunamadı.' }, { status: 404 });
    }

    // Öğretmen formunda sınıflar seçilebilsin diye yalnızca şube adlarını (PII olmadan) döndür;
    // Öğrenci ve Veli formlarında ek sınıf listesi veya herhangi bir öğrenci bilgisi KESİNLİKLE dönülmez.
    let classesInLevel: { classKey: string; className: string }[] = [];
    if (payload.r === 'ogretmen' && school.spreadsheetId) {
      const sysCreds = getSystemServiceAccountCreds();
      const serverAuth =
        school.serviceAccountKey ||
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
        (sysCreds ? JSON.stringify(sysCreds) : '') ||
        school.accessToken;

      if (serverAuth) {
        const cfg = await readRibaConfig(serverAuth, school.spreadsheetId).catch(() => null);
        const { classes } = await readSchoolClassesAndTeachers(
          serverAuth,
          school.spreadsheetId,
          school.schoolName || '',
          cfg
        );
        classesInLevel = classes
          .filter((c) => c.level === payload.l)
          .map((c) => ({ classKey: c.classKey, className: c.className }));
      }
    }

    return NextResponse.json({
      success: true,
      meta: {
        schoolKey: school.schoolKey,
        schoolName: school.schoolName || 'Okul RİBA',
        academicYear: school.academicYear || '2026-2027',
        level: payload.l,
        levelName: levelSpec.name,
        role: payload.r,
        roleLabel: RIBA_ROLE_META[payload.r].label,
        badgeText: RIBA_ROLE_META[payload.r].badgeText,
        classKey: payload.ck,
        className: payload.cn,
        classesInLevel,
      },
    });
  } catch (err: any) {
    console.error('Form meta error:', err);
    return NextResponse.json(
      { error: 'Form bilgileri yüklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
