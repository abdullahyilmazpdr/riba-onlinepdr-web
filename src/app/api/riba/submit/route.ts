import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyRibaFormToken, isAuthorizedSchoolRequest } from '@/lib/session-token';
import {
  extractAuthFromRequest,
  resolveServerAccessToken,
  checkRateLimit,
} from '@/lib/request-helpers';
import { appendRibaSubmission, readRibaSubmissions } from '@/lib/riba-sheets';
import { validateAnswerCode } from '@/lib/riba-scoring';
import { RibaLevel, RibaRole } from '@/lib/riba-data';

const recentNonces = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(`riba_submit:${ip}`, 40, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Çok hızlı form gönderimi algılandı. Lütfen 1 dakika bekleyiniz.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { d, sig, schoolKey: bodySchoolKey, gender, answerCode, source, selectedClassKeys, teacherNote, nonce } =
      body;

    let schoolKey = '';
    let level: RibaLevel;
    let role: RibaRole;
    let classKey = 'SCHOOL_POOL';
    let className = '';
    const submitSource: 'web' | 'manual' = source === 'manual' ? 'manual' : 'web';

    if (submitSource === 'manual') {
      const auth = extractAuthFromRequest(req, body);
      const check = await isAuthorizedSchoolRequest(auth);
      if (!check.authorized) {
        return NextResponse.json({ error: 'Yetkisiz manuel giriş.' }, { status: 403 });
      }
      schoolKey = auth.schoolKey;
      level = body.level as RibaLevel;
      role = body.role as RibaRole;
      classKey = String(body.classKey || 'SCHOOL_POOL').trim();
      className = String(body.className || '').trim();
    } else {
      const payload = verifyRibaFormToken(String(d || ''), String(sig || ''));
      if (!payload || (bodySchoolKey && payload.s !== bodySchoolKey)) {
        return NextResponse.json(
          { error: 'Geçersiz veya doğrulanamayan anket bağlantısı.' },
          { status: 403 }
        );
      }
      schoolKey = payload.s;
      level = payload.l;
      role = payload.r;
      classKey = payload.ck;
      className = payload.cn;
    }

    if (nonce && typeof nonce === 'string') {
      if (recentNonces.has(nonce)) {
        return NextResponse.json({
          success: true,
          duplicate: true,
          message: 'Anket yanıtınız zaten kaydedildi.',
        });
      }
    }

    const validCheck = validateAnswerCode(level, role, String(answerCode || ''));
    if (!validCheck.valid) {
      return NextResponse.json({ error: validCheck.error }, { status: 400 });
    }

    const { school, spreadsheetId, accessToken } = await resolveServerAccessToken(schoolKey);
    if (!school || !spreadsheetId || !accessToken) {
      return NextResponse.json(
        { error: 'Okul E-Tablosu veya sunucu yazma yetkisi bulunamadı.' },
        { status: 404 }
      );
    }

    // Öğretmen formunda seçilen sınıfları temizle
    let finalClassKey = classKey;
    let finalClassName = className;
    let extra = '';

    if (role === 'ogretmen') {
      const picked = Array.isArray(selectedClassKeys)
        ? selectedClassKeys.map(String).filter(Boolean)
        : [];
      if (picked.length === 1 && picked[0] !== 'SCHOOL_POOL') {
        finalClassKey = picked[0];
      } else {
        finalClassKey = 'SCHOOL_POOL';
      }
      extra = JSON.stringify({
        scope: picked.length === 0 || picked.includes('SCHOOL_POOL') ? 'all_in_level' : 'selected',
        classKeys: picked.filter((k) => k !== 'SCHOOL_POOL'),
        note: typeof teacherNote === 'string' ? teacherNote.slice(0, 120) : '',
      });
    } else if (submitSource === 'manual' && teacherNote) {
      extra = String(teacherNote).slice(0, 120);
    }

    const cleanGender = ['K', 'E'].includes(String(gender || '').toUpperCase())
      ? (String(gender).toUpperCase() as 'K' | 'E')
      : '';

    const submissionId = `RB-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;

    await appendRibaSubmission(accessToken, spreadsheetId, {
      id: submissionId,
      createdAt: new Date().toISOString(),
      level,
      role,
      classKey: finalClassKey,
      className: finalClassName,
      gender: cleanGender,
      answerCode: validCheck.normalized,
      source: submitSource,
      extra,
    });

    if (nonce && typeof nonce === 'string') {
      if (recentNonces.size > 5000) recentNonces.clear();
      recentNonces.add(nonce);
    }

    return NextResponse.json({
      success: true,
      submissionId,
      message: 'RİBA yanıtınız başarıyla okul rehberlik sistemine kaydedildi.',
    });
  } catch (err: any) {
    console.error('RIBA submit error:', err);
    return NextResponse.json(
      { error: err.message || 'Anket kaydedilirken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
