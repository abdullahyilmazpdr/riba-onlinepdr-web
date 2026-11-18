import {
  ensureSheetExists,
  readFromSheet,
  appendToSheet,
  updateSheetRange,
} from './sheets';
import { getClassBaseKey, deduplicateClasses } from './pdf-parser';
import {
  RibaLevel,
  RibaRole,
  detectSchoolProfile,
  classifyClassForRiba,
} from './riba-data';
import { RibaSubmissionRecord } from './riba-scoring';

export const RIBA_SETTINGS_TAB = 'RIBA_Ayarlar';
export const RIBA_RESPONSES_TAB = 'RIBA_Yanitlar';

const SETTINGS_HEADERS = ['AyarAnahtari', 'DegerJSON', 'GuncellemeTarihi'];
const RESPONSES_HEADERS = [
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
];

export interface RibaSchoolConfig {
  confirmed: boolean;
  primaryLevel: RibaLevel;
  enabledLevels: RibaLevel[];
  customClasses?: string[]; // Manuel eklenen veya düzenlenmiş ekstra sınıflar
  classLevelOverrides?: Record<string, RibaLevel>;
  specialTargets?: Partial<Record<RibaLevel, [string, string]>>; // Okulun 1. ve 2. özel hedefleri
  counselorName?: string;
  updatedAt?: string;
}

export interface SheetTeacherItem {
  name: string;
  classes: string[];
  username: string;
  password: string;
  role: string;
}

export interface SheetClassSummary {
  classKey: string;
  className: string;
  studentCount: number;
  level: RibaLevel;
  studentEligible: boolean;
  eligibilityReason: string;
  assignedTeachers: string[];
}

// Kısa ömürlü bellek içi yanıt önbelleği (anlık form gönderimlerinde invalidate edilir)
const responsesCache = new Map<string, { data: RibaSubmissionRecord[]; expiresAt: number }>();

export function invalidateRibaResponsesCache(spreadsheetId?: string) {
  if (spreadsheetId) responsesCache.delete(spreadsheetId);
  else responsesCache.clear();
}

export async function readRibaConfig(
  accessToken: string | object,
  spreadsheetId: string
): Promise<RibaSchoolConfig | null> {
  try {
    const rows = await readFromSheet(
      accessToken,
      spreadsheetId,
      `${RIBA_SETTINGS_TAB}!A2:C20`
    );
    const cfgRow = rows.find((r: any[]) => String(r?.[0] || '').trim() === 'RIBA_CONFIG');
    if (cfgRow && cfgRow[1]) {
      return JSON.parse(String(cfgRow[1])) as RibaSchoolConfig;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveRibaConfig(
  accessToken: string | object,
  spreadsheetId: string,
  config: RibaSchoolConfig
): Promise<void> {
  await ensureSheetExists(accessToken, spreadsheetId, RIBA_SETTINGS_TAB, SETTINGS_HEADERS);
  const now = new Date().toISOString();
  const payload = { ...config, updatedAt: now };

  const existing = await readFromSheet(
    accessToken,
    spreadsheetId,
    `${RIBA_SETTINGS_TAB}!A2:C20`
  ).catch(() => []);

  const filtered = (existing || []).filter(
    (r: any[]) => r?.[0] && String(r[0]).trim() !== 'RIBA_CONFIG'
  );
  filtered.unshift(['RIBA_CONFIG', JSON.stringify(payload), now]);

  await updateSheetRange(
    accessToken,
    spreadsheetId,
    `${RIBA_SETTINGS_TAB}!A2:C${Math.max(20, filtered.length + 2)}`,
    filtered
  );
}

export async function readRibaSubmissions(
  accessToken: string | object,
  spreadsheetId: string,
  _bypassCache = true
): Promise<RibaSubmissionRecord[]> {
  // Vercel sunucusuz (serverless) ortamlarda birden fazla bellek örneği çalıştığından
  // daima E-Tablodan canlı okunur; böylece Excel çıktısı ile ekran sayıları birebir aynı kalır.
  let rows: any[][] = [];
  try {
    rows = await readFromSheet(
      accessToken,
      spreadsheetId,
      `${RIBA_RESPONSES_TAB}!A2:J`
    );
  } catch (err: any) {
    const msg = String(err?.message || '').toLowerCase();
    // Henüz RIBA_Yanitlar sekmesi oluşturulmamışsa sıfır yanıt döndür
    if (msg.includes('unable to parse range') || msg.includes('not found')) {
      return [];
    }
    throw err;
  }

  const parsed: RibaSubmissionRecord[] = [];
  for (const r of rows) {
    if (!r || !r[0] || !r[2] || !r[3] || !r[7]) continue;
    const level = String(r[2]).trim() as RibaLevel;
    const role = String(r[3]).trim() as RibaRole;
    if (!['okuloncesi', 'ilkokul', 'ortaokul', 'lise'].includes(level)) continue;
    if (!['ogrenci', 'veli', 'ogretmen'].includes(role)) continue;

    parsed.push({
      id: String(r[0]).trim(),
      createdAt: String(r[1] || '').trim(),
      level,
      role,
      classKey: String(r[4] || 'SCHOOL_POOL').trim(),
      className: String(r[5] || '').trim(),
      gender: (['K', 'E'].includes(String(r[6] || '').trim().toUpperCase())
        ? String(r[6]).trim().toUpperCase()
        : '') as 'K' | 'E' | '',
      answerCode: String(r[7] || '').trim().toUpperCase(),
      source: String(r[8] || 'web').trim() === 'manual' ? 'manual' : 'web',
      extra: r[9] ? String(r[9]) : '',
    });
  }

  responsesCache.set(spreadsheetId, {
    data: parsed,
    expiresAt: Date.now() + 15 * 1000,
  });

  return parsed;
}

export async function appendRibaSubmission(
  accessToken: string | object,
  spreadsheetId: string,
  submission: RibaSubmissionRecord
): Promise<void> {
  await ensureSheetExists(accessToken, spreadsheetId, RIBA_RESPONSES_TAB, RESPONSES_HEADERS);
  await appendToSheet(accessToken, spreadsheetId, `${RIBA_RESPONSES_TAB}!A:J`, [
    [
      submission.id,
      submission.createdAt,
      submission.level,
      submission.role,
      submission.classKey,
      submission.className,
      submission.gender,
      submission.answerCode,
      submission.source,
      submission.extra || '',
    ],
  ]);
  invalidateRibaResponsesCache(spreadsheetId);
}

export async function readSchoolClassesAndTeachers(
  accessToken: string | object,
  spreadsheetId: string,
  schoolName: string,
  config: RibaSchoolConfig | null
): Promise<{
  classes: SheetClassSummary[];
  teachers: SheetTeacherItem[];
  detection: ReturnType<typeof detectSchoolProfile>;
  effectiveConfig: RibaSchoolConfig;
}> {
  const [studentRows, teacherRows] = await Promise.all([
    readFromSheet(accessToken, spreadsheetId, 'Öğrenciler!A2:C').catch(() => []),
    readFromSheet(accessToken, spreadsheetId, 'Öğretmenler!A2:E').catch(() => []),
  ]);

  const teachers: SheetTeacherItem[] = (teacherRows || [])
    .filter((r: any[]) => r && r[0])
    .map((r: any[]) => ({
      name: String(r[0] || '').trim(),
      classes: String(r[1] || '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      username: String(r[2] || '').trim(),
      password: String(r[3] || '').trim(),
      role: String(r[4] || 'Sınıf Öğretmeni').trim(),
    }));

  const studentCountsByKey = new Map<string, { displayName: string; count: number }>();
  for (const row of studentRows || []) {
    const rawCls = String(row?.[0] || '').trim();
    if (!rawCls) continue;
    const key = getClassBaseKey(rawCls);
    if (!key) continue;
    const existing = studentCountsByKey.get(key);
    if (existing) {
      existing.count += 1;
      if (rawCls.length > existing.displayName.length) existing.displayName = rawCls;
    } else {
      studentCountsByKey.set(key, { displayName: rawCls, count: 1 });
    }
  }

  // Also include classes from teachers and config.customClasses
  const allRawClasses: string[] = [];
  for (const [, val] of studentCountsByKey) allRawClasses.push(val.displayName);
  for (const t of teachers) allRawClasses.push(...t.classes);
  if (config?.customClasses) allRawClasses.push(...config.customClasses);

  // Ders programı PDF satır kayması kaynaklı '<->' ile biten sahte ders adı artıklarını ele
  const cleanedRawClasses = allRawClasses.filter((raw) => {
    const t = (raw || '').trim();
    return Boolean(t) && !t.endsWith('<->');
  });

  const uniqueClassNames = deduplicateClasses(cleanedRawClasses).sort((a, b) =>
    a.localeCompare(b, 'tr', { numeric: true })
  );

  const detection = detectSchoolProfile(schoolName, uniqueClassNames);
  const effectiveConfig: RibaSchoolConfig = config || {
    confirmed: false,
    primaryLevel: detection.primaryLevel,
    enabledLevels: detection.recommendedLevels,
  };

  const classes: SheetClassSummary[] = uniqueClassNames.map((cn) => {
    const ck = getClassBaseKey(cn);
    const overrideLevel = effectiveConfig.classLevelOverrides?.[ck];
    const elig = classifyClassForRiba(
      cn,
      effectiveConfig.enabledLevels,
      effectiveConfig.primaryLevel
    );
    const resolvedLevel = overrideLevel || elig.level;
    const assignedTeachers = teachers
      .filter((t) => t.classes.some((tc) => getClassBaseKey(tc) === ck))
      .map((t) => t.name);

    return {
      classKey: ck,
      className: cn,
      studentCount: studentCountsByKey.get(ck)?.count || 0,
      level: resolvedLevel,
      studentEligible:
        resolvedLevel === 'okuloncesi'
          ? false
          : resolvedLevel === 'ilkokul'
          ? elig.studentEligible
          : true,
      eligibilityReason: elig.reason,
      assignedTeachers,
    };
  });

  return {
    classes,
    teachers,
    detection,
    effectiveConfig,
  };
}
