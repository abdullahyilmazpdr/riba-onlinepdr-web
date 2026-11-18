'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SsoProcessor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const uid = searchParams.get('uid');
    const role = searchParams.get('role');
    const ts = searchParams.get('ts');
    const sig = searchParams.get('sig');
    const schoolKey = searchParams.get('schoolKey');

    if (!uid || !role || !ts || !sig) {
      setErrorMsg('Eksik tek tık geçiş (SSO) parametreleri.');
      return;
    }

    fetch('/api/sso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, role, ts, sig, schoolKey }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'SSO oturumu doğrulanamadı.');
        }

        if (data.sessionType === 'admin') {
          localStorage.setItem('admin_active_school_key', data.activeSchoolKey);
          localStorage.setItem('active_spreadsheet_id', data.activeSpreadsheetId);
          localStorage.setItem(
            'sso_admin_session',
            JSON.stringify({
              uid: data.adminUid,
              schoolKey: data.activeSchoolKey,
              spreadsheetId: data.activeSpreadsheetId,
              schoolName: data.schoolName,
              academicYear: data.academicYear,
            })
          );
          router.replace('/admin');
        } else if (data.sessionType === 'teacher') {
          localStorage.setItem('teacher_session_token', data.sessionToken);
          localStorage.setItem(
            'teacher_session',
            JSON.stringify({
              schoolKey: data.schoolKey,
              spreadsheetId: data.spreadsheetId,
              schoolName: data.schoolName,
              academicYear: data.academicYear,
              teacher: data.teacher,
            })
          );
          router.replace('/teacher');
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Otomatik giriş başarısız.');
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-8 text-center">
        {errorMsg ? (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h1 className="text-lg font-bold text-slate-900">Geçiş Doğrulanamadı</h1>
            <p className="mt-2 text-sm text-slate-600">{errorMsg}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
              >
                PDR Girişi
              </Link>
              <Link
                href="/teacher/login"
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold"
              >
                Öğretmen Girişi
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Risk Haritasından RİBA&apos;ya Geçiliyor</h1>
            <p className="mt-2 text-sm text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Okulunuz ve sınıflarınız otomatik eşitleniyor...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function SsoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
          Yükleniyor...
        </div>
      }
    >
      <SsoProcessor />
    </Suspense>
  );
}
