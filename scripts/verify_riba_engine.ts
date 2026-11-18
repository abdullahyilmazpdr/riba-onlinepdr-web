import assert from 'node:assert/strict';
import {
  RIBA_LEVELS,
  detectSchoolProfile,
  classifyClassForRiba,
  isPreschoolClassName,
} from '../src/lib/riba-data';
import {
  computeClassRibaResult,
  computeSchoolLevelResult,
  meanAndSampleStdev,
  validateAnswerCode,
} from '../src/lib/riba-scoring';
import {
  signRibaFormToken,
  verifyRibaFormToken,
  buildRibaFormUrl,
  generateTeacherToken,
  verifyTeacherToken,
} from '../src/lib/session-token';
import {
  generateClassResultWorkbook,
  generateSchoolResultWorkbook,
} from '../src/lib/riba-excel';

async function main() {
  console.log('1. Testing all 11 official MEB RIBA forms completeness...');
  const expectedCounts: Record<string, Record<string, number>> = {
    okuloncesi: { veli: 13, ogretmen: 13 },
    ilkokul: { ogrenci: 15, veli: 13, ogretmen: 16 },
    ortaokul: { ogrenci: 18, veli: 16, ogretmen: 18 },
    lise: { ogrenci: 20, veli: 19, ogretmen: 19 },
  };
  for (const [lvl, roles] of Object.entries(expectedCounts)) {
    const spec = RIBA_LEVELS[lvl as keyof typeof RIBA_LEVELS];
    assert.ok(spec, `Missing level ${lvl}`);
    for (const [role, qCount] of Object.entries(roles)) {
      const form = spec.forms[role as 'ogrenci' | 'veli' | 'ogretmen'];
      assert.ok(form, `Missing form ${lvl}/${role}`);
      assert.equal(form.questionCount, qCount);
      assert.equal(form.questions.length, qCount);
      for (const q of form.questions) {
        assert.ok(q.A.text.length > 5 && q.A.targetId >= 1 && q.A.targetId <= spec.targetCount);
        assert.ok(q.B.text.length > 5 && q.B.targetId >= 1 && q.B.targetId <= spec.targetCount);
      }
    }
  }
  console.log('   OK: All 11 forms & 352 options verified.');

  console.log('2. Testing school type auto-detection & grade eligibility rules...');
  assert.deepEqual(detectSchoolProfile('Atatürk Anaokulu', []).recommendedLevels, ['okuloncesi']);
  assert.deepEqual(
    detectSchoolProfile('Meram İlkokulu', ['1. Sınıf / A', '3. Sınıf / A']).recommendedLevels,
    ['ilkokul']
  );
  assert.deepEqual(
    detectSchoolProfile('Meram İlkokulu', ['Anasınıfı / A', '1. Sınıf / A', '4. Sınıf / B'])
      .recommendedLevels,
    ['okuloncesi', 'ilkokul']
  );
  assert.deepEqual(
    detectSchoolProfile('Selçuklu İmam Hatip Ortaokulu', []).recommendedLevels,
    ['ortaokul']
  );
  assert.deepEqual(detectSchoolProfile('Konya Anadolu Lisesi', []).recommendedLevels, ['lise']);
  assert.deepEqual(
    detectSchoolProfile('Meram Özel Eğitim Uygulama Okulu III. Kademe', []).recommendedLevels,
    ['lise']
  );
  assert.deepEqual(
    detectSchoolProfile('Özel Eğitim Uygulama Okulu II. Kademe', []).recommendedLevels,
    ['ortaokul']
  );
  assert.deepEqual(
    detectSchoolProfile('Özel Eğitim Uygulama Okulu I. Kademe', []).recommendedLevels,
    ['ilkokul']
  );
  assert.equal(isPreschoolClassName('Özel Eğitim Uygulama Sınıfı A'), false);
  assert.equal(isPreschoolClassName('Anasınıfı A'), true);

  assert.equal(
    classifyClassForRiba('1. Sınıf / A Şubesi', ['ilkokul'], 'ilkokul').studentEligible,
    false
  );
  assert.equal(classifyClassForRiba('2/B', ['ilkokul'], 'ilkokul').studentEligible, false);
  assert.equal(
    classifyClassForRiba('3. Sınıf / A Şubesi', ['ilkokul'], 'ilkokul').studentEligible,
    true
  );
  assert.equal(classifyClassForRiba('4-C', ['ilkokul'], 'ilkokul').studentEligible, true);
  assert.equal(
    classifyClassForRiba('Anasınıfı - Sabah', ['okuloncesi', 'ilkokul'], 'ilkokul').level,
    'okuloncesi'
  );
  assert.equal(
    classifyClassForRiba('Anasınıfı - Sabah', ['okuloncesi', 'ilkokul'], 'ilkokul')
      .studentEligible,
    false
  );
  console.log('   OK: School & class eligibility rules verified.');

  console.log('3. Testing exact T-score & ASP calculation parity...');
  const stCode1 = 'AAAAAAAAAAAAAAAAAA';
  const stCode2 = 'ABABABABABABABABAB';
  const paCode1 = 'BBBBBBBBBBBBBBBB';
  const teCode1 = 'AABBAABBAABBAABBAA';

  assert.equal(validateAnswerCode('ortaokul', 'ogrenci', stCode1).valid, true);
  assert.equal(validateAnswerCode('ortaokul', 'ogrenci', 'AAA').valid, false);

  const res7A = computeClassRibaResult({
    classKey: '7sinifasubesi',
    className: '7. Sınıf / A Şubesi',
    level: 'ortaokul',
    enabledLevels: ['ortaokul'],
    primaryLevel: 'ortaokul',
    submissions: [
      {
        id: '1',
        createdAt: '2026-11-18',
        level: 'ortaokul',
        role: 'ogrenci',
        classKey: '7sinifasubesi',
        className: '7/A',
        gender: 'K',
        answerCode: stCode1,
        source: 'web',
      },
      {
        id: '2',
        createdAt: '2026-11-18',
        level: 'ortaokul',
        role: 'ogrenci',
        classKey: '7sinifasubesi',
        className: '7/A',
        gender: 'E',
        answerCode: stCode2,
        source: 'web',
      },
      {
        id: '3',
        createdAt: '2026-11-18',
        level: 'ortaokul',
        role: 'veli',
        classKey: '7sinifasubesi',
        className: '7/A',
        gender: 'K',
        answerCode: paCode1,
        source: 'web',
      },
      {
        id: '4',
        createdAt: '2026-11-18',
        level: 'ortaokul',
        role: 'ogretmen',
        classKey: 'SCHOOL_POOL',
        className: 'Genel',
        gender: 'E',
        answerCode: teCode1,
        source: 'web',
        extra: JSON.stringify({ scope: 'all_in_level' }),
      },
    ],
  });

  assert.equal(res7A.counts.ogrenci, 2);
  assert.equal(res7A.counts.veli, 1);
  assert.equal(res7A.counts.ogretmenPool, 1);
  const meanAsp7A = res7A.rows.reduce((a, b) => a + b.asp, 0) / res7A.rows.length;
  assert.ok(Math.abs(meanAsp7A - 50) < 0.05, `Expected ASP mean ~50, got ${meanAsp7A}`);

  const fStArr = res7A.rows.map((r) => r.freqStudent);
  const { mean: mSt, stdev: sdSt } = meanAndSampleStdev(fStArr);
  const expectedZ1 = ((fStArr[0] - mSt) / sdSt) * 10 + 50;
  assert.ok(Math.abs((res7A.rows[0].zStudent ?? 0) - expectedZ1) < 1e-9);

  // Check İlkokul Grade 1-2 re-normalization when Ogrenci = 0
  const res1A = computeClassRibaResult({
    classKey: '1sinifasubesi',
    className: '1. Sınıf / A Şubesi',
    level: 'ilkokul',
    enabledLevels: ['ilkokul'],
    primaryLevel: 'ilkokul',
    submissions: [
      {
        id: '10',
        createdAt: '2026-11-18',
        level: 'ilkokul',
        role: 'veli',
        classKey: '1sinifasubesi',
        className: '1/A',
        gender: 'K',
        answerCode: 'ABABABABABABA',
        source: 'web',
      },
      {
        id: '11',
        createdAt: '2026-11-18',
        level: 'ilkokul',
        role: 'ogretmen',
        classKey: '1sinifasubesi',
        className: '1/A',
        gender: 'E',
        answerCode: 'ABABABABABABABAB',
        source: 'web',
      },
    ],
  });
  assert.equal(res1A.studentEligible, false);
  const meanAsp1A = res1A.rows.reduce((a, b) => a + b.asp, 0) / res1A.rows.length;
  assert.ok(Math.abs(meanAsp1A - 50) < 0.05, `Grade 1-2 ASP mean must be ~50, got ${meanAsp1A}`);

  const schoolOrta = computeSchoolLevelResult('ortaokul', [res7A]);
  assert.equal(schoolOrta.participatingClasses.length, 1);
  assert.equal(schoolOrta.targets.length, 39);
  assert.ok(schoolOrta.targets.some((t) => t.isTopPriority));
  console.log('   OK: T-score, ASP, Grade 1-2 renormalization, and Okul Sonuç rank checks passed.');

  console.log('4. Testing HMAC signed tokens & Excel binary export...');
  const urlSt = buildRibaFormUrl('https://riba.onlinepdr.com', {
    s: '712345',
    l: 'ortaokul',
    r: 'ogrenci',
    ck: '7a',
    cn: '7. Sınıf / A',
  });
  const urlPa = buildRibaFormUrl('https://riba.onlinepdr.com', {
    s: '712345',
    l: 'ortaokul',
    r: 'veli',
    ck: '7a',
    cn: '7. Sınıf / A',
  });
  assert.ok(urlSt.includes('/ogrenci-'));
  assert.ok(urlPa.includes('/veli-'));
  const signed = signRibaFormToken({
    s: '712345',
    l: 'ortaokul',
    r: 'veli',
    ck: '7a',
    cn: '7. Sınıf / A',
  });
  assert.ok(verifyRibaFormToken(signed.d, signed.sig)?.r === 'veli');
  assert.equal(verifyRibaFormToken(signed.d, 'tampered_signature'), null);

  const tTok = generateTeacherToken('712345', 'ahmet1234');
  assert.equal(verifyTeacherToken(tTok, '712345').valid, true);
  assert.equal(verifyTeacherToken(tTok, '999999').valid, false);

  const xlsClass = await generateClassResultWorkbook({
    schoolName: 'Test Ortaokulu',
    academicYear: '2026-2027',
    classResult: res7A,
  });
  const xlsSchool = await generateSchoolResultWorkbook({
    schoolName: 'Test Ortaokulu',
    academicYear: '2026-2027',
    level: 'ortaokul',
    schoolResult: schoolOrta,
    specialTargets: ['Akran Zorbalığı', 'Sınav Kaygısı'],
  });
  assert.ok(xlsClass.byteLength > 3000 && xlsClass[0] === 0x50 && xlsClass[1] === 0x4b);
  assert.ok(xlsSchool.byteLength > 3000 && xlsSchool[0] === 0x50 && xlsSchool[1] === 0x4b);
  console.log('   OK: Tokens, tamper rejection, and Excel .xlsx generation verified.');
  console.log('ALL TESTS PASSED!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
