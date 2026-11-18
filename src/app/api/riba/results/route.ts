import { NextRequest, NextResponse } from 'next/server';
import {
  extractAuthFromRequest,
  getPublicOrigin,
  resolveServerAccessToken,
} from '@/lib/request-helpers';
import { buildRibaFormUrl, isAuthorizedSchoolRequest } from '@/lib/session-token';
import {
  readRibaConfig,
  readRibaSubmissions,
  readSchoolClassesAndTeachers,
} from '@/lib/riba-sheets';
import {
  computeClassRibaResult,
  computeSchoolLevelResult,
  ClassRibaResult,
  SchoolLevelResult,
} from '@/lib/riba-scoring';
import { getClassBaseKey } from '@/lib/pdf-parser';
import { RIBA_LEVELS, RibaLevel } from '@/lib/riba-data';

export async function GET(req: NextRequest) {
  try {
    const auth = extractAuthFromRequest(req);
    const check = await isAuthorizedSchoolRequest(auth);
    if (!check.authorized) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { school, spreadsheetId, accessToken } = await resolveServerAccessToken(
      auth.schoolKey,
      auth.googleToken,
      auth.spreadsheetId
    );
    if (!school || !spreadsheetId || !accessToken) {
      return NextResponse.json(
        { error: 'Okul E-Tablosu veya erişim yetkisi bulunamadı.' },
        { status: 404 }
      );
    }

    const storedConfig = await readRibaConfig(accessToken, spreadsheetId);
    const { classes, teachers, detection, effectiveConfig } =
      await readSchoolClassesAndTeachers(
        accessToken,
        spreadsheetId,
        school.schoolName || '',
        storedConfig
      );

    const bypassCache = req.nextUrl.searchParams.get('fresh') === '1';
    const submissions = await readRibaSubmissions(accessToken, spreadsheetId, bypassCache);

    const origin = getPublicOrigin(req);

    // If caller is Teacher (not Admin), restrict class view to their assigned classes in Öğretmenler!A2:E
    let visibleClasses = classes;
    let isTeacherAdmin = Boolean(check.isAdmin);
    let currentTeacherName = '';

    if (check.isTeacher && check.username) {
      const matched = teachers.find(
        (t) => t.username.toLowerCase() === check.username!.toLowerCase()
      );
      if (matched) {
        currentTeacherName = matched.name;
        const roleLower = matched.role
          .replace(/İ/g, 'i')
          .replace(/I/g, 'ı')
          .toLowerCase();
        const roleIsAdmin =
          roleLower.includes('rehber') ||
          roleLower.includes('psikolojik') ||
          roleLower.includes('pdr') ||
          roleLower.includes('müdür') ||
          roleLower.includes('idare');
        if (roleIsAdmin) {
          isTeacherAdmin = true;
        } else {
          const allowedKeys = new Set(matched.classes.map((c) => getClassBaseKey(c)));
          visibleClasses = classes.filter((c) => allowedKeys.has(c.classKey));
        }
      }
    }

    const classCards = visibleClasses.map((cls) => {
      const result: ClassRibaResult = computeClassRibaResult({
        classKey: cls.classKey,
        className: cls.className,
        level: cls.level,
        enabledLevels: effectiveConfig.enabledLevels,
        primaryLevel: effectiveConfig.primaryLevel,
        submissions,
      });

      const studentFormUrl = cls.studentEligible
        ? buildRibaFormUrl(origin, {
            s: school.schoolKey,
            l: cls.level,
            r: 'ogrenci',
            ck: cls.classKey,
            cn: cls.className,
          })
        : null;

      const parentFormUrl = buildRibaFormUrl(origin, {
        s: school.schoolKey,
        l: cls.level,
        r: 'veli',
        ck: cls.classKey,
        cn: cls.className,
      });

      const waStudentLink = studentFormUrl
        ? `https://wa.me/?text=${encodeURIComponent(
            `📢 *ÖĞRENCİ RİBA ANKETİ (${cls.className})*\n\nSevgili öğrenciler, ${school.schoolName || 'okulumuz'} rehberlik ihtiyaçlarını belirlemek için lütfen aşağıdaki SADECE ÖĞRENCİLERE ÖZEL anketi doldurunuz:\n\n🔗 ${studentFormUrl}`
          )}`
        : null;

      const waParentLink = `https://wa.me/?text=${encodeURIComponent(
        `🏡 *VELİ RİBA ANKETİ (${cls.className})*\n\nSayın veliler, ${school.schoolName || 'okulumuz'} rehberlik hizmetlerini planlamak için lütfen aşağıdaki SADECE VELİLERE ÖZEL anketi doldurunuz:\n\n🔗 ${parentFormUrl}`
      )}`;

      return {
        ...cls,
        levelName: RIBA_LEVELS[cls.level].name,
        studentFormUrl,
        parentFormUrl,
        waStudentLink,
        waParentLink,
        result,
      };
    });

    // Compute school-level summaries ONLY if admin/counselor
    const schoolResults: Partial<Record<RibaLevel, SchoolLevelResult>> = {};
    const teacherFormUrls: Record<string, { level: RibaLevel; label: string; url: string }> = {};

    if (isTeacherAdmin) {
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

      for (const lvl of effectiveConfig.enabledLevels) {
        schoolResults[lvl] = computeSchoolLevelResult(lvl, allClassResults);
        teacherFormUrls[lvl] = {
          level: lvl,
          label: `${RIBA_LEVELS[lvl].name} Öğretmen RİBA Formu`,
          url: buildRibaFormUrl(origin, {
            s: school.schoolKey,
            l: lvl,
            r: 'ogretmen',
            ck: 'SCHOOL_POOL',
            cn: `${RIBA_LEVELS[lvl].name} Öğretmenleri`,
          }),
        };
      }
    }

    return NextResponse.json({
      success: true,
      origin,
      isAdmin: isTeacherAdmin,
      teacherName: currentTeacherName,
      school: {
        schoolKey: school.schoolKey,
        schoolName: school.schoolName || 'Okul RİBA',
        academicYear: school.academicYear || '2026-2027',
      },
      detection,
      config: effectiveConfig,
      totalSubmissions: submissions.length,
      classCards,
      schoolResults,
      teacherFormUrls,
      specialTargets: effectiveConfig.specialTargets || {},
    });
  } catch (err: any) {
    console.error('RIBA results error:', err);
    return NextResponse.json(
      { error: err.message || 'RİBA sonuçları hesaplanırken hata oluştu.' },
      { status: 500 }
    );
  }
}
