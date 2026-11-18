'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ClipboardCheck,
  Copy,
  QrCode,
  MessageCircle,
  Download,
  RefreshCw,
  LogOut,
  GraduationCap,
  HeartHandshake,
  FilePlus2,
  BarChart3,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import RibaScoreTable from '@/components/RibaScoreTable';
import QrCodeModal from '@/components/QrCodeModal';
import ManualEntryModal from '@/components/ManualEntryModal';
import { RibaLevel } from '@/lib/riba-data';
import { ClassRibaResult } from '@/lib/riba-scoring';

interface TeacherSession {
  schoolKey: string;
  spreadsheetId: string;
  schoolName: string;
  academicYear: string;
  teacher: {
    name: string;
    username: string;
    role: string;
    isAdmin: boolean;
    classes: string[];
  };
}

interface ClassCardItem {
  classKey: string;
  className: string;
  level: RibaLevel;
  levelName: string;
  studentCount: number;
  studentEligible: boolean;
  eligibilityReason: string;
  studentFormUrl: string | null;
  parentFormUrl: string;
  waStudentLink: string | null;
  waParentLink: string;
  result: ClassRibaResult;
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<TeacherSession | null>(null);
  const [token, setToken] = useState('');
  const [cards, setCards] = useState<ClassCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClassKey, setExpandedClassKey] = useState<string | null>(null);
  const [qrState, setQrState] = useState<{
    open: boolean;
    title: string;
    subtitle: string;
    badgeText: string;
    badgeColor: 'blue' | 'emerald';
    url: string;
  } | null>(null);
  const [manualModal, setManualModal] = useState<ClassCardItem | null>(null);

  const fetchResults = useCallback(
    async (sess: TeacherSession, sessToken: string, fresh = false) => {
      setLoading(true);
      try {
        const url = new URL('/api/riba/results', window.location.origin);
        url.searchParams.set('schoolKey', sess.schoolKey);
        if (sess.spreadsheetId) url.searchParams.set('spreadsheetId', sess.spreadsheetId);
        if (fresh) url.searchParams.set('fresh', '1');

        const res = await fetch(url.toString(), {
          headers: { 'x-session-token': sessToken },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Sınıf verileri alınamadı.');
        }
        setCards(data.classCards || []);
        if (data.classCards?.length === 1) {
          setExpandedClassKey(data.classCards[0].classKey);
        }
      } catch (err: any) {
        toast.error(err.message || 'Veriler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const raw = localStorage.getItem('teacher_session');
    const tok = localStorage.getItem('teacher_session_token') || '';
    if (!raw || !tok) {
      router.replace('/teacher/login');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as TeacherSession;
      setSession(parsed);
      setToken(tok);
      fetchResults(parsed, tok);
    } catch {
      router.replace('/teacher/login');
    }
  }, [router, fetchResults]);

  const handleCopy = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`${label} kopyalandı!`);
  };

  const handleDownloadExcel = async (cls: ClassCardItem) => {
    if (!session || !token) return;
    const toastId = toast.loading(`${cls.className} Sınıf Sonuç Çizelgesi hazırlanıyor...`);
    try {
      const url = new URL('/api/riba/export', window.location.origin);
      url.searchParams.set('type', 'class');
      url.searchParams.set('schoolKey', session.schoolKey);
      url.searchParams.set('spreadsheetId', session.spreadsheetId);
      url.searchParams.set('classKey', cls.classKey);

      const res = await fetch(url.toString(), {
        headers: { 'x-session-token': token },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Excel indirilemedi.');
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `RIBA-Sinif-Sonuc-${cls.className.replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]+/g, '-')}.xlsx`;
      a.click();
      toast.dismiss(toastId);
      toast.success('Sınıf Sonuç Çizelgesi indirildi!');
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacher_session');
    localStorage.removeItem('teacher_session_token');
    router.push('/teacher/login');
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-sm sm:text-base truncate">
                {session.schoolName}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {session.teacher.name} • {session.teacher.role}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session.teacher.isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              >
                PDR Okul Paneli
              </Link>
            )}
            <button
              onClick={() => fetchResults(session, token, true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Zero Confusion Guide Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 leading-relaxed">
            <strong>Linkleri Karıştırmamak İçin Önemli Kural:</strong> Aşağıda her sınıfınız için{' '}
            <span className="font-bold text-blue-700">MAVİ (Öğrenci Anketi)</span> ve{' '}
            <span className="font-bold text-emerald-700">YEŞİL (Veli Anketi)</span> kartları ayrı ayrı hazırlanmıştır.
            Bağlantıların içinde <code>/ogrenci-...</code> ve <code>/veli-...</code> ibareleri açıkça yer alır. Sınıfın öğrenci grubu yoksa yalnızca Veli Anketini veli grubuna göndermeniz yeterlidir.
          </div>
        </div>

        {loading && cards.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-sm text-slate-500">
            Sınıflarınız ve RİBA istatistikleri yükleniyor...
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-2">
            <p className="font-bold text-slate-900">Üzerinize Atanmış Sınıf Bulunamadı</p>
            <p className="text-xs text-slate-500">
              Okul rehberlik servisinizin (PDR) şube eşleştirmesini kontrol etmesini isteyiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {cards.map((cls) => {
              const isExpanded = expandedClassKey === cls.classKey;
              return (
                <section
                  key={cls.classKey}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  {/* Class Top Header */}
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                          {cls.className}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                          {cls.levelName}
                        </span>
                        {cls.studentCount > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            {cls.studentCount} Öğrenci Kayıtlı
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                        {cls.studentEligible && (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold">
                            Öğrenci Yanıtı: {cls.result.counts.ogrenci}
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold">
                          Veli Yanıtı: {cls.result.counts.veli}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-semibold">
                          Öğretmen Yanıtı: {cls.result.counts.ogretmenEffective}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setManualModal(cls)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        <FilePlus2 className="w-4 h-4" />
                        Kağıt Form Gir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadExcel(cls)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Sınıf Sonucu (.xlsx)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedClassKey(isExpanded ? null : cls.classKey)
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Sonuç Çizelgesi
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Separated Share Cards */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/40">
                    {/* ÖĞRENCİ CARD */}
                    {cls.studentEligible && cls.studentFormUrl ? (
                      <div className="rounded-2xl border-2 border-blue-200 bg-white p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-extrabold">
                            <GraduationCap className="w-3.5 h-3.5" />
                            ÖĞRENCİ FORMU
                          </span>
                          <span className="text-[11px] font-bold text-blue-700">
                            Sadece Öğrenci Grubuna
                          </span>
                        </div>
                        <div className="text-[11px] font-mono bg-blue-50/70 text-blue-900 px-3 py-2 rounded-xl border border-blue-100 truncate">
                          {cls.studentFormUrl}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(cls.studentFormUrl!, 'Öğrenci Form Linki')}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Öğrenci Linkini Kopyala
                          </button>
                          {cls.waStudentLink && (
                            <a
                              href={cls.waStudentLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setQrState({
                                open: true,
                                title: `${cls.className} — Öğrenci Formu`,
                                subtitle: `${session.schoolName} (${cls.levelName})`,
                                badgeText: 'YALNIZCA ÖĞRENCİ ANKETİ',
                                badgeColor: 'blue',
                                url: cls.studentFormUrl!,
                              })
                            }
                            className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            QR
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-900 space-y-1">
                          <div className="font-bold">Bu Şubede Öğrenci Formu Uygulanmaz</div>
                          <p className="leading-relaxed">{cls.eligibilityReason}</p>
                        </div>
                      </div>
                    )}

                    {/* VELİ CARD */}
                    <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold">
                          <HeartHandshake className="w-3.5 h-3.5" />
                          VELİ FORMU
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">
                          Sadece Veli Grubuna
                        </span>
                      </div>
                      <div className="text-[11px] font-mono bg-emerald-50/70 text-emerald-900 px-3 py-2 rounded-xl border border-emerald-100 truncate">
                        {cls.parentFormUrl}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(cls.parentFormUrl, 'Veli Form Linki')}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Veli Linkini Kopyala
                        </button>
                        <a
                          href={cls.waParentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            setQrState({
                              open: true,
                              title: `${cls.className} — Veli Formu`,
                              subtitle: `${session.schoolName} (${cls.levelName})`,
                              badgeText: 'YALNIZCA VELİ ANKETİ',
                              badgeColor: 'emerald',
                              url: cls.parentFormUrl,
                            })
                          }
                          className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          QR
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Live Class RİBA Results */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-slate-200 bg-white">
                      <h3 className="font-bold text-slate-900 text-sm mb-3">
                        {cls.className} — Anlık Sınıf Sonuç Çizelgesi
                      </h3>
                      <RibaScoreTable result={cls.result} />
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>

      {qrState && (
        <QrCodeModal
          open={qrState.open}
          onClose={() => setQrState(null)}
          title={qrState.title}
          subtitle={qrState.subtitle}
          badgeText={qrState.badgeText}
          badgeColor={qrState.badgeColor}
          url={qrState.url}
        />
      )}

      {manualModal && (
        <ManualEntryModal
          open={true}
          onClose={() => setManualModal(null)}
          schoolKey={session.schoolKey}
          spreadsheetId={session.spreadsheetId}
          classKey={manualModal.classKey}
          className={manualModal.className}
          level={manualModal.level}
          studentEligible={manualModal.studentEligible}
          sessionToken={token}
          onSaved={() => fetchResults(session, token, true)}
        />
      )}
    </div>
  );
}
