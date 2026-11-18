import { NextRequest, NextResponse } from 'next/server';
import {
  extractAuthFromRequest,
  resolveServerAccessToken,
} from '@/lib/request-helpers';
import { isAuthorizedSchoolRequest } from '@/lib/session-token';
import {
  readRibaConfig,
  readRibaSubmissions,
  readSchoolClassesAndTeachers,
} from '@/lib/riba-sheets';
import {
  computeClassRibaResult,
  computeSchoolLevelResult,
} from '@/lib/riba-scoring';
import {
  generateClassResultWorkbook,
  generateSchoolResultWorkbook,
} from '@/lib/riba-excel';
import { getClassBaseKey, slugifyTr } from '@/lib/pdf-parser';
import { RibaLevel } from '@/lib/riba-data';

export async function GET(req: NextRequest) {
  try {
    const auth = extractAuthFromRequest(req);
    const check = await isAuthorizedSchoolRequest(auth);
    if (!check.authorized) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const sp = req.nextUrl.searchParams;
    const type = sp.get('type') || 'class';
    const classKey = (sp.get('classKey') || '').trim();
    const levelParam = (sp.get('level') || '').trim() as RibaLevel;

    const { school, spreadsheetId, accessToken } = await resolveServerAccessToken(
      auth.schoolKey,
      auth.googleToken,
      auth.spreadsheetId
    );
    if (!school || !spreadsheetId || !accessToken) {
      return NextResponse.json({ error: 'Okul E-Tablosu bulunamadı.' }, { status: 404 });
    }

    const storedConfig = await readRibaConfig(accessToken, spreadsheetId);
    const { classes, teachers, effectiveConfig } = await readSchoolClassesAndTeachers(
      accessToken,
      spreadsheetId,
      school.schoolName || '',
      storedConfig
    );
    const submissions = await readRibaSubmissions(accessToken, spreadsheetId, true);

    const schoolName = school.schoolName || 'Okul';
    const academicYear = school.academicYear || '2026-2027';

    if (type === 'school') {
      // Sadece yönetici/rehber öğretmen okul geneli çizelgesini indirebilir
      let isRoleAdmin = Boolean(check.isAdmin);
      if (check.isTeacher && check.username) {
        const t = teachers.find((x) => x.username.toLowerCase() === check.username!.toLowerCase());
        if (t && /rehber|psikolojik|pdr|müdür|idare/i.test(t.role)) {
          isRoleAdmin = true;
        }
      }
      if (!isRoleAdmin) {
        return NextResponse.json(
          { error: 'Okul Sonuç Çizelgesi yalnızca Rehber Öğretmen/Yönetici tarafından indirilebilir.' },
          { status: 403 }
        );
      }

      const targetLevel = effectiveConfig.enabledLevels.includes(levelParam)
        ? levelParam
        : effectiveConfig.primaryLevel;

      const allClassResults = classes.map((cls) =>
        computeClassRibaResult({
          classKey: cls.classKey,
          className: cls.className,
          level: cls.level,
          enabledLevels: effectiveConfig.enabledLevels,
          primaryLevel: effectiveConfig.primaryLevel,
          submissions,
        })
      );
      const schoolRes = computeSchoolLevelResult(targetLevel, allClassResults);
      const buf = await generateSchoolResultWorkbook({
        schoolName,
        academicYear,
        level: targetLevel,
        schoolResult: schoolRes,
        specialTargets: effectiveConfig.specialTargets?.[targetLevel],
      });

      const fname = `RIBA-Okul-Sonuc-${slugifyTr(schoolName)}-${targetLevel}.xlsx`;
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fname}"`,
        },
      });
    }

    // Class export
    const targetCls = classes.find((c) => c.classKey === classKey);
    if (!targetCls) {
      return NextResponse.json({ error: 'Belirtilen sınıf bulunamadı.' }, { status: 404 });
    }

    // Teacher ownership guard
    if (check.isTeacher && check.username && !check.isAdmin) {
      const t = teachers.find((x) => x.username.toLowerCase() === check.username!.toLowerCase());
      const isRoleAdmin = t && /rehber|psikolojik|pdr|müdür|idare/i.test(t.role);
      const allowed = new Set((t?.classes || []).map((c) => getClassBaseKey(c)));
      if (!isRoleAdmin && !allowed.has(targetCls.classKey)) {
        return NextResponse.json({ error: 'Bu sınıfa erişim yetkiniz yok.' }, { status: 403 });
      }
    }

    const classRes = computeClassRibaResult({
      classKey: targetCls.classKey,
      className: targetCls.className,
      level: targetCls.level,
      enabledLevels: effectiveConfig.enabledLevels,
      primaryLevel: effectiveConfig.primaryLevel,
      submissions,
    });

    const buf = await generateClassResultWorkbook({
      schoolName,
      academicYear,
      classResult: classRes,
    });

    const fname = `RIBA-Sinif-Sonuc-${slugifyTr(targetCls.className)}.xlsx`;
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fname}"`,
      },
    });
  } catch (err: any) {
    console.error('RIBA export error:', err);
    return NextResponse.json(
      { error: err.message || 'Excel oluşturulamadı.' },
      { status: 500 }
    );
  }
}
