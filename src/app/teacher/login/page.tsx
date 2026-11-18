'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { touchSessionActivity } from '@/lib/useSessionTimeout';
import { Users, KeyRound, School, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

function TeacherLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [schoolKey, setSchoolKey] = useState('');
  const [verifiedSchoolName, setVerifiedSchoolName] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const presetKey = searchParams.get('kurumKodu') || searchParams.get('schoolKey');
    const presetUser = searchParams.get('u') || searchParams.get('username');
    if (presetUser) setUsername(presetUser);
    if (presetKey) {
      setSchoolKey(presetKey);
      verifySchoolKey(presetKey, true);
    }
  }, [searchParams]);

  const verifySchoolKey = async (keyToVerify: string, silent = false) => {
    const clean = keyToVerify.trim();
    if (!clean) {
      if (!silent) toast.error('Lütfen okul kurum kodunu giriniz.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/school-lookup?schoolKey=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (!silent) toast.error(data.error || 'Kurum kodu bulunamadı.');
        return;
      }
      setVerifiedSchoolName(data.schoolName);
      setStep(2);
    } catch {
      if (!silent) toast.error('Doğrulama sırasında bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolKey.trim() || !username.trim() || !password.trim()) {
      toast.error('Lütfen tüm alanları doldurunuz.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/teacher-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolKey: schoolKey.trim(),
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Giriş yapılamadı.');
        return;
      }

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
      touchSessionActivity('teacher_session');
      toast.success(`Hoş geldiniz, ${data.teacher.name}!`);
      router.push('/teacher');
    } catch {
      toast.error('Giriş sırasında sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Öğretmen RİBA Girişi</h1>
            <p className="text-xs text-slate-500">Sınıf Linkleri ve Sonuç Takip Paneli</p>
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-3.5 mb-6 text-xs text-emerald-900 leading-relaxed">
          <strong>Risk Haritası ile Aynı Şifre:</strong> Okul Risk Haritası sisteminde kullandığınız kurum kodu, kullanıcı adı ve şifrenizle doğrudan giriş yapabilirsiniz.
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                1. Adım: MEB Kurum Kodu (veya Okul Anahtarı)
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={schoolKey}
                  onChange={(e) => setSchoolKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && verifySchoolKey(schoolKey)}
                  placeholder="Örn: 712345"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => verifySchoolKey(schoolKey)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Kontrol ediliyor...' : 'Okulumu Doğrula ve Devam Et'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {verifiedSchoolName} ({schoolKey})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Değiştir
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Örn: ahmetyilmaz1234"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Şifre</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Giriş yapılıyor...' : 'Sınıf RİBA Paneline Gir'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2 text-center text-xs text-slate-500">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            Şifrenizi bilmiyorsanız okul rehberlik servisinizden isteyiniz.
          </p>
          <div className="flex justify-center gap-4 pt-1">
            <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
              PDR / Yönetici Girişi
            </Link>
            <a
              href="https://risk.onlinepdr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-700 hover:underline"
            >
              Risk Haritası Paneli
            </a>
            <Link href="/" className="hover:text-slate-700">
              Ana Sayfa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
          Yükleniyor...
        </div>
      }
    >
      <TeacherLoginForm />
    </Suspense>
  );
}
