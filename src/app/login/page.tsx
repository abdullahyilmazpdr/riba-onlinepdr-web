'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getSchoolsByAdmin } from '@/lib/db';
import {
  INACTIVITY_TIMEOUT_MS,
  touchSessionActivity,
  clearSessionActivity,
} from '@/lib/useSessionTimeout';
import toast from 'react-hot-toast';
import { ClipboardCheck, ShieldCheck, ArrowRight, Users, Sparkles } from 'lucide-react';

function buildGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');
  provider.setCustomParameters({
    access_type: 'offline',
    prompt: 'select_account',
  });
  return provider;
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const finalizeSignedInUser = async (uid: string, accessToken?: string) => {
    touchSessionActivity('admin_session');
    if (accessToken) {
      localStorage.setItem('google_access_token', accessToken);
    }
    const schools = await getSchoolsByAdmin(uid);
    if (schools.length > 0) {
      const active = schools[0];
      localStorage.setItem('admin_active_school_key', active.schoolKey);
      if (active.spreadsheetId) {
        localStorage.setItem('active_spreadsheet_id', active.spreadsheetId);
      }
      toast.success(`Hoş geldiniz! ${active.schoolName || 'Okul'} hesabınız eşleştirildi.`);
    } else {
      toast.success('Giriş başarılı! Okul bilgilerinizi tanımlayabilirsiniz.');
    }
    router.replace('/admin');
  };

  useEffect(() => {
    let mounted = true;
    // Önce tam sayfa Google yönlendirme dönüşü varsa işle
    getRedirectResult(auth)
      .then(async (redirectRes) => {
        if (redirectRes?.user && mounted) {
          const credential = GoogleAuthProvider.credentialFromResult(redirectRes);
          await finalizeSignedInUser(redirectRes.user.uid, credential?.accessToken);
        }
      })
      .catch((err: any) => {
        if (!mounted) return;
        if (err?.code === 'auth/unauthorized-domain') {
          toast.error(
            `Bu alan adı (${window.location.hostname}) Firebase Authorized domains listesinde ekli değil.`
          );
        } else if (err?.message) {
          toast.error(err.message);
        }
      });

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const lastRaw = localStorage.getItem('admin_session_last_active');
        if (lastRaw && Date.now() - parseInt(lastRaw, 10) >= INACTIVITY_TIMEOUT_MS) {
          await signOut(auth).catch(() => {});
          clearSessionActivity('admin_session');
          if (mounted) setCheckingAuth(false);
          return;
        }
        try {
          if (!lastRaw) touchSessionActivity('admin_session');
          const schools = await getSchoolsByAdmin(user.uid);
          if (schools.length > 0) {
            const active = schools[0];
            localStorage.setItem('admin_active_school_key', active.schoolKey);
            if (active.spreadsheetId) {
              localStorage.setItem('active_spreadsheet_id', active.spreadsheetId);
            }
          }
          router.replace('/admin');
          return;
        } catch {}
      }
      if (mounted) setCheckingAuth(false);
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, [router]);

  const handleGoogleRedirectSignIn = async () => {
    setLoading(true);
    try {
      const provider = buildGoogleProvider();
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error('Google Redirect Sign-In error:', err);
      toast.error(err?.message || 'Yönlendirme ile giriş başlatılamadı.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = buildGoogleProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      await finalizeSignedInUser(result.user.uid, credential?.accessToken);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        toast('Açılır pencere engellendi — tam sayfa Google girişine yönlendiriliyor...', {
          icon: '🔄',
        });
        await handleGoogleRedirectSignIn();
        return;
      }
      if (err?.code === 'auth/unauthorized-domain') {
        toast.error(
          `Bu alan adı (${window.location.hostname}) Firebase Console > Authentication > Authorized domains listesine eklenmelidir.`
        );
      } else {
        toast.error(err?.message || 'Google ile giriş yapılamadı.');
      }
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-sm text-slate-500 font-medium">Oturum kontrol ediliyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/40">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">PDR &amp; Yönetici Girişi</h1>
            <p className="text-xs text-slate-500">riba.onlinepdr.com Yönetim Merkezi</p>
          </div>
        </div>

        <div className="rounded-2xl bg-indigo-50/80 border border-indigo-200/70 p-4 mb-6 text-xs text-indigo-900 leading-relaxed space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-indigo-700">
            <Sparkles className="w-4 h-4" />
            Okul Risk Haritası ile Tam Entegre
          </div>
          <p>
            Daha önce <strong>risk.onlinepdr.com</strong> hesabınızı oluşturduğunuz <strong>okul Google hesabınızla</strong> giriş yaparsanız; tüm sınıflarınız, öğretmenleriniz ve öğretmen şifreleriniz otomatik olarak gelir.
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all shadow-md disabled:opacity-60 cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          {loading ? 'Bağlanıyor...' : 'Okul Google (Gmail) Hesabı ile Giriş Yap'}
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleGoogleRedirectSignIn}
          disabled={loading}
          className="mt-2.5 w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline py-1.5 cursor-pointer disabled:opacity-50"
        >
          Açılır pencere engellenirse tam sayfa Google yönlendirmesi ile gir →
        </button>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3 text-center">
          <Link
            href="/teacher/login"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 py-2.5 px-4 rounded-xl transition-colors"
          >
            <Users className="w-4 h-4" />
            Sınıf / Branş Öğretmeni Misiniz? Buradan Girin
          </Link>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <a
              href="https://risk.onlinepdr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Risk Haritası Paneli →
            </a>
            <span>•</span>
            <Link href="/" className="hover:text-slate-600">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
