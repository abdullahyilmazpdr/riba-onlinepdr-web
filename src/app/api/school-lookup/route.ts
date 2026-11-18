import { NextRequest, NextResponse } from 'next/server';
import { getLatestSchoolData } from '@/lib/db';
import { checkRateLimit } from '@/lib/request-helpers';

function maskTurkishName(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      if (word.length <= 2) return word[0] + '*';
      return word.slice(0, 2) + '*'.repeat(Math.min(5, word.length - 2));
    })
    .join(' ');
}

export async function GET(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(`lookup:${ip}`, 30, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Çok fazla kurum doğrulama denemesi. Lütfen 1 dakika bekleyiniz.' },
        { status: 429 }
      );
    }

    const schoolKey = (req.nextUrl.searchParams.get('schoolKey') || '').trim();
    if (!schoolKey) {
      return NextResponse.json({ error: 'Kurum kodu gereklidir.' }, { status: 400 });
    }

    const school = await getLatestSchoolData(schoolKey);
    if (!school) {
      return NextResponse.json(
        { error: `"${schoolKey}" kurum koduna sahip bir okul kaydı bulunamadı.` },
        { status: 404 }
      );
    }

    const maskedKey =
      school.schoolKey.length > 4
        ? `${school.schoolKey.slice(0, 2)}***${school.schoolKey.slice(-2)}`
        : `${school.schoolKey[0] || ''}***`;

    return NextResponse.json({
      success: true,
      verifyOnly: true,
      schoolName: maskTurkishName(school.schoolName || 'Kayıtlı Okul'),
      maskedSchoolKey: maskedKey,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Okul doğrulama hatası.' },
      { status: 500 }
    );
  }
}
