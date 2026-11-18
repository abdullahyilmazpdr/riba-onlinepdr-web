import {
  RIBA_LEVELS,
  RibaLevel,
  RibaRole,
  classifyClassForRiba,
} from './riba-data';

export interface RibaSubmissionRecord {
  id: string;
  createdAt: string;
  level: RibaLevel;
  role: RibaRole;
  classKey: string; // 'SCHOOL_POOL' for non-class-specific teacher submissions
  className: string;
  gender: 'K' | 'E' | '';
  answerCode: string; // e.g. "AABBA..." (1 char per question, length === questionCount)
  source: 'web' | 'manual';
  extra?: string; // JSON string (e.g. teacherName, appliedClassKeys)
}

export interface TargetScoreRow {
  targetId: number;
  title: string;
  freqStudent: number;
  freqParent: number;
  freqTeacher: number;
  zStudent: number | null;
  zParent: number | null;
  zTeacher: number | null;
  asp: number;
  rank: number;
}

export interface ClassRibaResult {
  classKey: string;
  className: string;
  level: RibaLevel;
  studentEligible: boolean;
  eligibilityReason: string;
  counts: {
    ogrenci: number;
    veli: number;
    ogretmenDirect: number;
    ogretmenPool: number;
    ogretmenEffective: number;
  };
  stats: {
    meanStudent: number;
    stdevStudent: number;
    meanParent: number;
    stdevParent: number;
    meanTeacher: number;
    stdevTeacher: number;
  };
  rows: TargetScoreRow[];
  hasAnyData: boolean;
}

export interface SchoolLevelResult {
  level: RibaLevel;
  levelName: string;
  participatingClasses: {
    classKey: string;
    className: string;
    counts: ClassRibaResult['counts'];
  }[];
  targets: {
    targetId: number;
    title: string;
    classAsps: Record<string, number>;
    averageAsp: number;
    rank: number;
    isTopPriority: boolean;
  }[];
}

/**
 * Sample mean and sample standard deviation (ddof = 1, matches Excel AVERAGE and STDEV).
 */
export function meanAndSampleStdev(values: number[]): { mean: number; stdev: number } {
  const n = values.length;
  if (n === 0) return { mean: 0, stdev: 0 };
  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;
  if (n < 2) return { mean, stdev: 0 };
  const sqDiff = values.reduce((acc, v) => {
    const d = v - mean;
    return acc + d * d;
  }, 0);
  return { mean, stdev: Math.sqrt(sqDiff / (n - 1)) };
}

/**
 * Validates and normalizes an answer string (e.g. "AAB...") for a specific (level, role).
 */
export function validateAnswerCode(
  level: RibaLevel,
  role: RibaRole,
  answerCode: string
): { valid: boolean; normalized: string; error?: string } {
  const spec = RIBA_LEVELS[level];
  const form = spec?.forms?.[role];
  if (!form) {
    return { valid: false, normalized: '', error: `${spec?.name || level} kademesinde ${role} formu bulunmuyor.` };
  }
  const clean = (answerCode || '').toUpperCase().replace(/[^AB]/g, '');
  if (clean.length !== form.questionCount) {
    return {
      valid: false,
      normalized: '',
      error: `Tüm soruları yanıtlamalısınız (${clean.length}/${form.questionCount}).`,
    };
  }
  return { valid: true, normalized: clean };
}

/**
 * Parses teacher `extra` metadata safely (supporting class-specific + multi-class + level-pool).
 */
export function parseTeacherAppliedKeys(sub: RibaSubmissionRecord): {
  isPool: boolean;
  appliedClassKeys: string[];
} {
  if (sub.role !== 'ogretmen') {
    return { isPool: false, appliedClassKeys: sub.classKey ? [sub.classKey] : [] };
  }
  if (sub.extra) {
    try {
      const parsed = JSON.parse(sub.extra);
      if (Array.isArray(parsed?.classKeys) && parsed.classKeys.length > 0) {
        const isAll = parsed.classKeys.includes('SCHOOL_POOL') || parsed.scope === 'all_in_level';
        return {
          isPool: isAll,
          appliedClassKeys: parsed.classKeys.map(String),
        };
      }
      if (parsed?.scope === 'all_in_level') {
        return { isPool: true, appliedClassKeys: [] };
      }
    } catch {
      // ignore non-JSON note
    }
  }
  if (!sub.classKey || sub.classKey === 'SCHOOL_POOL') {
    return { isPool: true, appliedClassKeys: [] };
  }
  return { isPool: false, appliedClassKeys: [sub.classKey] };
}

/**
 * Computes raw frequencies for a given stakeholder's submissions on a level.
 */
function accumulateFrequencies(
  level: RibaLevel,
  role: RibaRole,
  submissions: RibaSubmissionRecord[]
): number[] {
  const levelSpec = RIBA_LEVELS[level];
  const form = levelSpec.forms[role];
  const freqs = new Array<number>(levelSpec.targetCount).fill(0);
  if (!form || submissions.length === 0) return freqs;

  for (const sub of submissions) {
    const code = sub.answerCode || '';
    for (let i = 0; i < form.questions.length; i++) {
      const ch = code.charAt(i);
      if (ch !== 'A' && ch !== 'B') continue;
      const tid = form.questions[i][ch].targetId;
      if (tid >= 1 && tid <= levelSpec.targetCount) {
        freqs[tid - 1] += 1;
      }
    }
  }
  return freqs;
}

/**
 * Assigns standard competition rank (Excel RANK.EQ descending: 1 = highest value).
 */
export function assignDescendingRanks(values: number[]): number[] {
  const rounded = values.map((v) => Math.round(v * 10000) / 10000);
  return rounded.map((v) => {
    let higher = 0;
    for (const other of rounded) {
      if (other > v) higher++;
    }
    return higher + 1;
  });
}

/**
 * Calculates full Sınıf Sonuç Çizelgesi metrics for one class.
 */
export function computeClassRibaResult(params: {
  classKey: string;
  className: string;
  level: RibaLevel;
  enabledLevels: RibaLevel[];
  primaryLevel: RibaLevel;
  submissions: RibaSubmissionRecord[];
}): ClassRibaResult {
  const { classKey, className, level, enabledLevels, primaryLevel, submissions } = params;
  const levelSpec = RIBA_LEVELS[level];
  const elig = classifyClassForRiba(className, enabledLevels, primaryLevel);

  const studentSubs = submissions.filter(
    (s) => s.level === level && s.role === 'ogrenci' && s.classKey === classKey
  );
  const parentSubs = submissions.filter(
    (s) => s.level === level && s.role === 'veli' && s.classKey === classKey
  );

  const directTeacherSubs: RibaSubmissionRecord[] = [];
  const poolTeacherSubs: RibaSubmissionRecord[] = [];
  for (const s of submissions) {
    if (s.level !== level || s.role !== 'ogretmen') continue;
    const { isPool, appliedClassKeys } = parseTeacherAppliedKeys(s);
    if (appliedClassKeys.includes(classKey)) {
      directTeacherSubs.push(s);
    } else if (isPool) {
      poolTeacherSubs.push(s);
    }
  }

  // Prefer direct class teacher evaluations if available; include pool/school-wide teachers too
  // Note: If directTeacherSubs exist AND poolTeacherSubs exist, combine both unique teachers so school-wide teachers contribute to every class!
  const effectiveTeacherMap = new Map<string, RibaSubmissionRecord>();
  for (const s of poolTeacherSubs) effectiveTeacherMap.set(s.id, s);
  for (const s of directTeacherSubs) effectiveTeacherMap.set(s.id, s);
  const effectiveTeacherSubs = Array.from(effectiveTeacherMap.values());

  const fSt = accumulateFrequencies(level, 'ogrenci', studentSubs);
  const fPa = accumulateFrequencies(level, 'veli', parentSubs);
  const fTe = accumulateFrequencies(level, 'ogretmen', effectiveTeacherSubs);

  const stStats = meanAndSampleStdev(fSt);
  const paStats = meanAndSampleStdev(fPa);
  const teStats = meanAndSampleStdev(fTe);

  const stActive = levelSpec.weights.ogrenci > 0 && studentSubs.length > 0 && stStats.stdev > 0;
  const paActive = levelSpec.weights.veli > 0 && parentSubs.length > 0 && paStats.stdev > 0;
  const teActive = levelSpec.weights.ogretmen > 0 && effectiveTeacherSubs.length > 0 && teStats.stdev > 0;

  const expectedActiveCount =
    (levelSpec.weights.ogrenci > 0 ? 1 : 0) +
    (levelSpec.weights.veli > 0 ? 1 : 0) +
    (levelSpec.weights.ogretmen > 0 ? 1 : 0);
  const actualActiveCount = (stActive ? 1 : 0) + (paActive ? 1 : 0) + (teActive ? 1 : 0);
  const activeWeightSum =
    (stActive ? levelSpec.weights.ogrenci : 0) +
    (paActive ? levelSpec.weights.veli : 0) +
    (teActive ? levelSpec.weights.ogretmen : 0);

  // Use literal MEB Excel weights when all expected stakeholders are active (exact Excel parity, even Ilkokul 0.27+0.36+0.38=1.01).
  // When a stakeholder has 0 responses (e.g. İlkokul 1.-2. sınıf Ogrenci=0 or partial mid-collection), normalize by activeWeightSum so ASP stays T-scaled around 50.
  const useLiteralWeights = actualActiveCount === expectedActiveCount && expectedActiveCount > 0;

  const rawRows: Omit<TargetScoreRow, 'rank'>[] = levelSpec.targets.map((target, idx) => {
    const zSt = stActive ? (((fSt[idx] - stStats.mean) / stStats.stdev) * 10 + 50) : null;
    const zPa = paActive ? (((fPa[idx] - paStats.mean) / paStats.stdev) * 10 + 50) : null;
    const zTe = teActive ? (((fTe[idx] - teStats.mean) / teStats.stdev) * 10 + 50) : null;

    let asp = 0;
    if (actualActiveCount > 0) {
      const weighted =
        (stActive && zSt !== null ? zSt * levelSpec.weights.ogrenci : 0) +
        (paActive && zPa !== null ? zPa * levelSpec.weights.veli : 0) +
        (teActive && zTe !== null ? zTe * levelSpec.weights.ogretmen : 0);
      asp = useLiteralWeights ? weighted : weighted / activeWeightSum;
    }

    return {
      targetId: target.id,
      title: target.title,
      freqStudent: fSt[idx],
      freqParent: fPa[idx],
      freqTeacher: fTe[idx],
      zStudent: zSt,
      zParent: zPa,
      zTeacher: zTe,
      asp: Math.round(asp * 100) / 100,
    };
  });

  const ranks = assignDescendingRanks(rawRows.map((r) => r.asp));
  const rows: TargetScoreRow[] = rawRows.map((r, i) => ({
    ...r,
    rank: actualActiveCount > 0 ? ranks[i] : 0,
  }));

  const hasAnyData =
    studentSubs.length > 0 || parentSubs.length > 0 || directTeacherSubs.length > 0 || poolTeacherSubs.length > 0;

  return {
    classKey,
    className,
    level,
    studentEligible: elig.studentEligible,
    eligibilityReason: elig.reason,
    counts: {
      ogrenci: studentSubs.length,
      veli: parentSubs.length,
      ogretmenDirect: directTeacherSubs.length,
      ogretmenPool: poolTeacherSubs.length,
      ogretmenEffective: effectiveTeacherSubs.length,
    },
    stats: {
      meanStudent: Math.round(stStats.mean * 100) / 100,
      stdevStudent: Math.round(stStats.stdev * 100) / 100,
      meanParent: Math.round(paStats.mean * 100) / 100,
      stdevParent: Math.round(paStats.stdev * 100) / 100,
      meanTeacher: Math.round(teStats.mean * 100) / 100,
      stdevTeacher: Math.round(teStats.stdev * 100) / 100,
    },
    rows,
    hasAnyData,
  };
}

/**
 * Consolidates class results into Okul Sonuç Çizelgesi for a specific level.
 */
export function computeSchoolLevelResult(
  level: RibaLevel,
  classResults: ClassRibaResult[]
): SchoolLevelResult {
  const levelSpec = RIBA_LEVELS[level];
  // Only include classes belonging to this level that have valid ASP scores (at least one stakeholder active)
  const participating = classResults.filter(
    (cr) =>
      cr.level === level &&
      (cr.counts.ogrenci > 0 || cr.counts.veli > 0 || cr.counts.ogretmenEffective > 0)
  );

  const avgValues: number[] = levelSpec.targets.map((t, idx) => {
    if (participating.length === 0) return 0;
    const sum = participating.reduce((acc, cr) => acc + (cr.rows[idx]?.asp || 0), 0);
    return Math.round((sum / participating.length) * 100) / 100;
  });

  const ranks = assignDescendingRanks(avgValues);
  // Highlight top ~3 highest-priority targets (or rank <= 3) just like MEB red highlights
  const targets = levelSpec.targets.map((t, idx) => {
    const classAsps: Record<string, number> = {};
    for (const cr of participating) {
      classAsps[cr.classKey] = cr.rows[idx]?.asp || 0;
    }
    const r = participating.length > 0 ? ranks[idx] : 0;
    return {
      targetId: t.id,
      title: t.title,
      classAsps,
      averageAsp: avgValues[idx],
      rank: r,
      isTopPriority: participating.length > 0 && r > 0 && r <= 3,
    };
  });

  return {
    level,
    levelName: levelSpec.name,
    participatingClasses: participating.map((cr) => ({
      classKey: cr.classKey,
      className: cr.className,
      counts: cr.counts,
    })),
    targets,
  };
}
