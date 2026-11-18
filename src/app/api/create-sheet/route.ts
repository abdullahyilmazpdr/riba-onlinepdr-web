import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { ensureServiceAccountShared } from '@/lib/sheets';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const accessToken = authHeader?.split('Bearer ')[1]?.trim();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Google Drive erişim bileti eksik.' },
        { status: 401 }
      );
    }

    const { schoolName, academicYear } = await req.json();
    const title = `${schoolName || 'Okul'} - RİBA ve Rehberlik Sistemi (${academicYear || '2026-2027'})`;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: [
          { properties: { title: 'Öğrenciler' } },
          { properties: { title: 'Öğretmenler' } },
          { properties: { title: 'OkulRisk' } },
          { properties: { title: 'RIBA_Ayarlar' } },
          { properties: { title: 'RIBA_Yanitlar' } },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('E-Tablo oluşturulamadı (ID dönmedi).');
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: 'Öğrenciler!A1:D1',
            values: [['Sınıf/Şube', 'Okul No', 'Adı Soyadı', 'Cinsiyet']],
          },
          {
            range: 'Öğretmenler!A1:E1',
            values: [['Öğretmen Adı', 'Girdiği Sınıflar', 'Kullanıcı Adı', 'Şifre', 'Görev/Branş']],
          },
          {
            range: 'RIBA_Ayarlar!A1:C1',
            values: [['AyarAnahtari', 'DegerJSON', 'GuncellemeTarihi']],
          },
          {
            range: 'RIBA_Yanitlar!A1:J1',
            values: [[
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
            ]],
          },
        ],
      },
    });

    await ensureServiceAccountShared(accessToken, spreadsheetId).catch(() => false);

    return NextResponse.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl: spreadsheet.data.spreadsheetUrl,
    });
  } catch (err: any) {
    console.error('Create sheet error:', err);
    return NextResponse.json(
      { error: err.message || 'E-Tablo oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
