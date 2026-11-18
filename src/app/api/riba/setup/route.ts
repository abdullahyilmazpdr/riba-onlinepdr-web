import { NextRequest, NextResponse } from 'next/server';
import {
  extractAuthFromRequest,
  getPublicOrigin,
  resolveServerAccessToken,
} from '@/lib/request-helpers';
import { buildRibaFormUrl, isAuthorizedSchoolRequest } from '@/lib/session-token';
import {
  readRibaConfig,
  saveRibaConfig,
  readSchoolClassesAndTeachers,
  RibaSchoolConfig,
} from '@/lib/riba-sheets';
import { RIBA_LEVELS, RibaLevel } from '@/lib/riba-data';
import { buildWhatsAppLink, deduplicateClasses, generatePassword, generateUsername } from '@/lib/pdf-parser';
import { ensureSheetExists, updateSheetRange, readFromSheet } from '@/lib/sheets';

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

    const origin = getPublicOrigin(req);
    const teacherFormUrls: Record<string, { level: RibaLevel; label: string; url: string }> = {};
    for (const lvl of effectiveConfig.enabledLevels) {
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

    const primaryTeacherFormUrl =
      teacherFormUrls[effectiveConfig.primaryLevel]?.url ||
      Object.values(teacherFormUrls)[0]?.url ||
      '';

    const enrichedTeachers = teachers.map((t) => ({
      ...t,
      whatsappLink: buildWhatsAppLink(
        t.name,
        t.username,
        t.password,
        t.classes,
        t.role,
        primaryTeacherFormUrl
      ),
    }));

    return NextResponse.json({
      success: true,
      origin,
      school: {
        schoolKey: school.schoolKey,
        schoolName: school.schoolName || 'Okul RİBA',
        district: school.district || '',
        academicYear: school.academicYear || '2026-2027',
        spreadsheetId,
      },
      detection,
      config: effectiveConfig,
      classes,
      teachers: enrichedTeachers,
      teacherFormUrls,
    });
  } catch (err: any) {
    console.error('RIBA setup GET error:', err);
    return NextResponse.json(
      { error: err.message || 'RİBA yapılandırması yüklenemedi.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = extractAuthFromRequest(req, body);
    const check = await isAuthorizedSchoolRequest(auth);
    if (!check.authorized || !check.isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için okul rehberlik/yönetici yetkisi gereklidir.' },
        { status: 403 }
      );
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

    const action = body.action || 'save-config';
    const existingConfig =
      (await readRibaConfig(accessToken, spreadsheetId)) ||
      ({
        confirmed: false,
        primaryLevel: 'ortaokul',
        enabledLevels: ['ortaokul'],
      } as RibaSchoolConfig);

    if (action === 'save-config') {
      const enabledLevels: RibaLevel[] = Array.isArray(body.enabledLevels)
        ? body.enabledLevels.filter((l: string) =>
            ['okuloncesi', 'ilkokul', 'ortaokul', 'lise'].includes(l)
          )
        : existingConfig.enabledLevels;

      if (enabledLevels.length === 0) {
        return NextResponse.json(
          { error: 'En az bir okul kademesi seçmelisiniz.' },
          { status: 400 }
        );
      }

      const primaryLevel: RibaLevel = enabledLevels.includes(body.primaryLevel)
        ? body.primaryLevel
        : enabledLevels[0];

      const nextConfig: RibaSchoolConfig = {
        ...existingConfig,
        confirmed: true,
        primaryLevel,
        enabledLevels,
        classLevelOverrides: body.classLevelOverrides || existingConfig.classLevelOverrides,
        counselorName:
          typeof body.counselorName === 'string'
            ? body.counselorName.trim()
            : existingConfig.counselorName,
      };

      await saveRibaConfig(accessToken, spreadsheetId, nextConfig);
      await ensureSheetExists(accessToken, spreadsheetId, 'RIBA_Yanitlar', [
        'YanitID',
        'Tarih',
        'Kademe',
        'FormTuru',
        'SinifAnahtari',
        'SinifAdi',
        'Cinsiyet',
        'CevapKodu',
        'Kaynak',
        'EkBilgi',
      ]);

      return NextResponse.json({ success: true, config: nextConfig });
    }

    if (action === 'add-manual-class') {
      const className = String(body.className || '').trim();
      const level = body.level as RibaLevel | undefined;
      if (!className) {
        return NextResponse.json({ error: 'Sınıf adı boş olamaz.' }, { status: 400 });
      }
      const nextCustom = deduplicateClasses([
        ...(existingConfig.customClasses || []),
        className,
      ]);
      const nextOverrides = { ...(existingConfig.classLevelOverrides || {}) };
      if (level && ['okuloncesi', 'ilkokul', 'ortaokul', 'lise'].includes(level)) {
        const { getClassBaseKey } = await import('@/lib/pdf-parser');
        const ck = getClassBaseKey(className);
        if (ck) nextOverrides[ck] = level;
      }

      const nextConfig: RibaSchoolConfig = {
        ...existingConfig,
        customClasses: nextCustom,
        classLevelOverrides: nextOverrides,
      };
      await saveRibaConfig(accessToken, spreadsheetId, nextConfig);
      return NextResponse.json({ success: true, config: nextConfig });
    }

    if (action === 'add-manual-teacher') {
      const name = String(body.name || '').trim();
      const classNames: string[] = Array.isArray(body.classes)
        ? body.classes.map((c: string) => c.trim()).filter(Boolean)
        : [];
      const role = String(body.role || 'Sınıf Öğretmeni').trim();
      if (!name) {
        return NextResponse.json({ error: 'Öğretmen adı gereklidir.' }, { status: 400 });
      }
      await ensureSheetExists(accessToken, spreadsheetId, 'Öğretmenler', [
        'Öğretmen Adı',
        'Girdiği Sınıflar',
        'Kullanıcı Adı',
        'Şifre',
        'Görev/Branş',
      ]);
      const rows = await readFromSheet(accessToken, spreadsheetId, 'Öğretmenler!A2:E').catch(() => []);
      const username = String(body.username || '').trim() || generateUsername(name);
      const password = String(body.password || '').trim() || generatePassword();
      const nextRows = [
        ...(rows || []).filter((r: any[]) => r && r[0]),
        [name, classNames.join(', '), username, password, role],
      ];
      await updateSheetRange(
        accessToken,
        spreadsheetId,
        `Öğretmenler!A2:E${Math.max(50, nextRows.length + 5)}`,
        nextRows
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'save-special-targets') {
      const level = body.level as RibaLevel;
      const targets = body.targets as [string, string];
      if (!['okuloncesi', 'ilkokul', 'ortaokul', 'lise'].includes(level) || !Array.isArray(targets)) {
        return NextResponse.json({ error: 'Geçersiz özel hedef verisi.' }, { status: 400 });
      }
      const nextConfig: RibaSchoolConfig = {
        ...existingConfig,
        specialTargets: {
          ...(existingConfig.specialTargets || {}),
          [level]: [String(targets[0] || '').trim(), String(targets[1] || '').trim()],
        },
      };
      await saveRibaConfig(accessToken, spreadsheetId, nextConfig);
      return NextResponse.json({ success: true, config: nextConfig });
    }

    return NextResponse.json({ error: 'Geçersiz işlem.' }, { status: 400 });
  } catch (err: any) {
    console.error('RIBA setup POST error:', err);
    return NextResponse.json(
      { error: err.message || 'Ayarlar kaydedilemedi.' },
      { status: 500 }
    );
  }
}
