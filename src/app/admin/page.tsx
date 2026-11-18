'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getSchoolsByAdmin, SchoolRecord } from '@/lib/db';
import { RIBA_LEVELS, RibaLevel, SchoolProfileDetection } from '@/lib/riba-data';
import { trackRibaEvent } from '@/lib/analytics';
import { ClassRibaResult, SchoolLevelResult } from '@/lib/riba-scoring';
import RibaScoreTable from '@/components/RibaScoreTable';
import QrCodeModal from '@/components/QrCodeModal';
import ManualEntryModal from '@/components/ManualEntryModal';
import AdminSetupWizard from '@/components/AdminSetupWizard';
import {
  ClipboardCheck,
  Sparkles,
  CheckCircle2,
  Users,
  BarChart3,
  Award,
  Upload,
  Copy,
  MessageCircle,
  QrCode,
  Download,
  RefreshCw,
  LogOut,
  School,
  GraduationCap,
  HeartHandshake,
  FilePlus2,
  ChevronDown,
  ChevronUp,
  Search,
  Printer,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface TeacherItem {
  name: string;
  classes: string[];
  username: string;
  password: string;
  role: string;
  whatsappLink: string;
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

type AdminTab = 'share' | 'classes' | 'school' | 'data';

const ALL_LEVELS: RibaLevel[] = ['okuloncesi', 'ilkokul', 'ortaokul', 'lise'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [adminUid, setAdminUid] = useState('');
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [activeKey, setActiveKey] = useState('');
  const [activeSheetId, setActiveSheetId] = useState('');
  const [showNewSchoolWizard, setShowNewSchoolWizard] = useState(false);

  const [tab, setTab] = useState<AdminTab>('share');
  const [loading, setLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const [schoolInfo, setSchoolInfo] = useState<{
    schoolKey: string;
    schoolName: string;
    academicYear: string;
  } | null>(null);
  const [detection, setDetection] = useState<SchoolProfileDetection | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [primaryLevel, setPrimaryLevel] = useState<RibaLevel>('ortaokul');
  const [enabledLevels, setEnabledLevels] = useState<RibaLevel[]>(['ortaokul']);
  const [classOverrides, setClassOverrides] = useState<Record<string, RibaLevel>>({});

  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [teacherFormUrls, setTeacherFormUrls] = useState<
    Record<string, { level: RibaLevel; label: string; url: string }>
  >({});
  const [classCards, setClassCards] = useState<ClassCardItem[]>([]);
  const [schoolResults, setSchoolResults] = useState<Partial<Record<RibaLevel, SchoolLevelResult>>>(
    {}
  );
  const [specialTargets, setSpecialTargets] = useState<Partial<Record<RibaLevel, [string, string]>>>(
    {}
  );
  const [activeResultLevel, setActiveResultLevel] = useState<RibaLevel>('ortaokul');

  const [origin, setOrigin] = useState('https://riba.onlinepdr.com');
  const [classSearch, setClassSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | RibaLevel>('all');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [expandedClassKey, setExpandedClassKey] = useState<string | null>(null);

  const [qrState, setQrState] = useState<{
    open: boolean;
    title: string;
    subtitle: string;
    badgeText: string;
    badgeColor: 'blue' | 'emerald' | 'purple';
    url: string;
  } | null>(null);
  const [manualModal, setManualModal] = useState<ClassCardItem | null>(null);

  const loadSchoolData = useCallback(
    async (key: string, sheetId: string, uid: string, fresh = false, silent = false) => {
      if (!key || !sheetId) return;
      if (!silent) setLoading(true);
      try {
        const googleToken = localStorage.getItem('google_access_token') || '';
        const headers: Record<string, string> = {};
        if (googleToken) headers.Authorization = `Bearer ${googleToken}`;
        const tsNow = Date.now().toString();

        const setupUrl = new URL('/api/riba/setup', window.location.origin);
        setupUrl.searchParams.set('schoolKey', key);
        setupUrl.searchParams.set('spreadsheetId', sheetId);
        if (uid) setupUrl.searchParams.set('adminUid', uid);
        setupUrl.searchParams.set('_t', tsNow);

        const resUrl = new URL('/api/riba/results', window.location.origin);
        resUrl.searchParams.set('schoolKey', key);
        resUrl.searchParams.set('spreadsheetId', sheetId);
        if (uid) resUrl.searchParams.set('adminUid', uid);
        resUrl.searchParams.set('fresh', fresh ? '1' : '1');
        resUrl.searchParams.set('_t', tsNow);

        const [setupRes, resultsRes] = await Promise.all([
          fetch(setupUrl.toString(), { headers, cache: 'no-store' }),
          fetch(resUrl.toString(), { headers, cache: 'no-store' }),
        ]);

        const setupJson = await setupRes.json();
        const resJson = await resultsRes.json();

        if (!setupRes.ok || !setupJson.success) {
          throw new Error(setupJson.error || 'Okul verisi yüklenemedi.');
        }

        setOrigin(setupJson.origin || window.location.origin);
        setSchoolInfo(setupJson.school);
        setDetection(setupJson.detection);
        setConfirmed(Boolean(setupJson.config?.confirmed));
        const nextPrimary: RibaLevel = setupJson.config?.primaryLevel || 'ortaokul';
        const nextEnabled: RibaLevel[] =
          setupJson.config?.enabledLevels?.length > 0
            ? setupJson.config.enabledLevels
            : [nextPrimary];

        if (!silent) {
          setPrimaryLevel(nextPrimary);
          setEnabledLevels(nextEnabled);
          setActiveResultLevel(nextPrimary);
        }
        setClassOverrides(setupJson.config?.classLevelOverrides || {});
        setTeachers(setupJson.teachers || []);
        setTeacherFormUrls(setupJson.teacherFormUrls || {});

        if (resJson.success) {
          setClassCards(resJson.classCards || []);
          setSchoolResults(resJson.schoolResults || {});
          setSpecialTargets(resJson.specialTargets || {});
        }
      } catch (err: any) {
        if (!silent) toast.error(err.message || 'RİBA verileri yüklenemedi.');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const ssoRaw = localStorage.getItem('sso_admin_session');
      const sso = ssoRaw ? JSON.parse(ssoRaw) : null;

      if (!user && !sso) {
        router.replace('/login');
        return;
      }

      const uid = user?.uid || sso?.uid || '';
      setAdminUid(uid);

      try {
        const list = uid ? await getSchoolsByAdmin(uid) : [];
        setSchools(list);

        const storedKey = localStorage.getItem('admin_active_school_key') || sso?.schoolKey || '';
        const chosen = list.find((s) => s.schoolKey === storedKey) || list[0];

        if (chosen && chosen.spreadsheetId) {
          setActiveKey(chosen.schoolKey);
          setActiveSheetId(chosen.spreadsheetId);
          localStorage.setItem('admin_active_school_key', chosen.schoolKey);
          localStorage.setItem('active_spreadsheet_id', chosen.spreadsheetId);
          loadSchoolData(chosen.schoolKey, chosen.spreadsheetId, uid);
        } else if (sso?.schoolKey && sso?.spreadsheetId) {
          setActiveKey(sso.schoolKey);
          setActiveSheetId(sso.spreadsheetId);
          loadSchoolData(sso.schoolKey, sso.spreadsheetId, uid);
        } else {
          setShowNewSchoolWizard(true);
        }
      } catch {
        setShowNewSchoolWizard(true);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsub();
  }, [router, loadSchoolData]);

  // Başka sekmede form doldurulup panele dönüldüğünde sayıları otomatik canlı yenile
  useEffect(() => {
    if (!activeKey || !activeSheetId) return;
    let lastRefresh = Date.now();
    const onFocus = () => {
      if (Date.now() - lastRefresh < 2500) return;
      lastRefresh = Date.now();
      loadSchoolData(activeKey, activeSheetId, adminUid, true, true);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [activeKey, activeSheetId, adminUid, loadSchoolData]);

  const handleChangeClassLevel = async (classKey: string, nextLvl: RibaLevel) => {
    if (!activeKey || !activeSheetId) return;
    const nextOverrides = { ...classOverrides, [classKey]: nextLvl };
    const nextEnabled = ALL_LEVELS.filter((l) => l === nextLvl || enabledLevels.includes(l));
    setClassOverrides(nextOverrides);
    try {
      const googleToken = localStorage.getItem('google_access_token') || '';
      const res = await fetch('/api/riba/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(googleToken ? { Authorization: `Bearer ${googleToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'save-config',
          schoolKey: activeKey,
          spreadsheetId: activeSheetId,
          adminUid,
          primaryLevel,
          enabledLevels: nextEnabled,
          classLevelOverrides: nextOverrides,
        }),
      });
      if (!res.ok) throw new Error('Sınıf kademesi güncellenemedi.');
      toast.success(`Sınıf RİBA düzeyi "${RIBA_LEVELS[nextLvl].name}" olarak güncellendi.`);
      loadSchoolData(activeKey, activeSheetId, adminUid, true, true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleLevel = (lvl: RibaLevel) => {
    setEnabledLevels((prev) => {
      if (prev.includes(lvl)) {
        if (prev.length === 1) {
          toast.error('En az bir okul kademesi seçili kalmalıdır.');
          return prev;
        }
        const next = prev.filter((x) => x !== lvl);
        if (primaryLevel === lvl) setPrimaryLevel(next[0]);
        return next;
      }
      const order = ALL_LEVELS.filter((x) => x === lvl || prev.includes(x));
      return order;
    });
  };

  const handleSaveLevels = async () => {
    if (!activeKey || !activeSheetId) return;
    setSavingConfig(true);
    try {
      const googleToken = localStorage.getItem('google_access_token') || '';
      const res = await fetch('/api/riba/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(googleToken ? { Authorization: `Bearer ${googleToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'save-config',
          schoolKey: activeKey,
          spreadsheetId: activeSheetId,
          adminUid,
          primaryLevel,
          enabledLevels,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Kayıt başarısız.');
      trackRibaEvent('riba_levels_confirmed', { primaryLevel, count: enabledLevels.length });
      toast.success('Okul kademeleri onaylandı ve RİBA formları güncellendi!');
      setConfirmed(true);
      await loadSchoolData(activeKey, activeSheetId, adminUid, true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveSpecialTargets = async (lvl: RibaLevel) => {
    const pair = specialTargets[lvl] || ['', ''];
    try {
      const googleToken = localStorage.getItem('google_access_token') || '';
      const res = await fetch('/api/riba/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(googleToken ? { Authorization: `Bearer ${googleToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'save-special-targets',
          schoolKey: activeKey,
          spreadsheetId: activeSheetId,
          adminUid,
          level: lvl,
          targets: pair,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Kaydedilemedi.');
      toast.success(`${RIBA_LEVELS[lvl].name} Okul Özel Hedefleri kaydedildi!`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const buildTeachersGroupMessage = () => {
    const formLines = Object.values(teacherFormUrls)
      .map((f) => `• *${f.label}:*\n${f.url}`)
      .join('\n\n');
    const teacherLoginUrl = `${origin.replace(/\/+$/, '')}/teacher/login?kurumKodu=${encodeURIComponent(
      activeKey
    )}`;
    return (
      `📋 *${schoolInfo?.schoolName || 'OKULUMUZ'} — RİBA ANKETİ UYGULAMA DUYURUSU*\n\n` +
      `Değerli Öğretmenlerimiz, MEB Rehberlik İhtiyacı Belirleme Anketi (RİBA) sürecimiz başlamıştır.\n\n` +
      `*1️⃣ ÖĞRETMENLERİMİZİN DOLDURACAĞI RİBA FORMU:*\n` +
      `${formLines}\n\n` +
      `*2️⃣ SINIF REHBER ÖĞRETMENLERİMİZİN ÖĞRENCİ VE VELİ LİNKLERİNİ ALACAĞI PANEL:*\n` +
      `🔗 Panel Adresi: ${teacherLoginUrl}\n` +
      `🏫 Kurum Kodu: ${activeKey}\n` +
      `(Giriş bilgileriniz Okul Risk Haritası sistemindeki mevcut kullanıcı adı ve şifrenizle AYNI olup bireysel şifre kartlarınız ayrıca paylaşılabilir. Panelden kendi şubenize ait Mavi ÖĞRENCİ ve Yeşil VELİ linklerini ayrı ayrı kopyalayarak ilgili gruplarda paylaşınız.)`
    );
  };

  const handleDownloadSchoolExcel = async (lvl: RibaLevel) => {
    const toastId = toast.loading(`${RIBA_LEVELS[lvl].name} Okul Sonuç Çizelgesi hazırlanıyor...`);
    try {
      const googleToken = localStorage.getItem('google_access_token') || '';
      const url = new URL('/api/riba/export', window.location.origin);
      url.searchParams.set('type', 'school');
      url.searchParams.set('schoolKey', activeKey);
      url.searchParams.set('spreadsheetId', activeSheetId);
      url.searchParams.set('adminUid', adminUid);
      url.searchParams.set('level', lvl);

      const res = await fetch(url.toString(), {
        headers: googleToken ? { Authorization: `Bearer ${googleToken}` } : undefined,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Excel indirilemedi.');
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `RIBA-Okul-Sonuc-${activeKey}-${lvl}.xlsx`;
      a.click();
      toast.dismiss(toastId);
      trackRibaEvent('riba_excel_exported', { scope: 'school', level: lvl });
      toast.success('Okul Sonuç Çizelgesi indirildi!');
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message);
    }
  };

  const handleDownloadClassExcel = async (cls: ClassCardItem) => {
    const toastId = toast.loading(`${cls.className} Sınıf Sonuç Çizelgesi indiriliyor...`);
    try {
      const googleToken = localStorage.getItem('google_access_token') || '';
      const url = new URL('/api/riba/export', window.location.origin);
      url.searchParams.set('type', 'class');
      url.searchParams.set('schoolKey', activeKey);
      url.searchParams.set('spreadsheetId', activeSheetId);
      url.searchParams.set('adminUid', adminUid);
      url.searchParams.set('classKey', cls.classKey);

      const res = await fetch(url.toString(), {
        headers: googleToken ? { Authorization: `Bearer ${googleToken}` } : undefined,
      });
      if (!res.ok) throw new Error('Excel indirilemedi.');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `RIBA-Sinif-${cls.classKey}.xlsx`;
      a.click();
      toast.dismiss(toastId);
      toast.success('Sınıf Sonuç Çizelgesi indirildi!');
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth).catch(() => {});
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('admin_active_school_key');
    localStorage.removeItem('sso_admin_session');
    router.push('/login');
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
        PDR Paneli hazırlanıyor...
      </div>
    );
  }

  const filteredClasses = classCards.filter((c) => {
    if (levelFilter !== 'all' && c.level !== levelFilter) return false;
    if (
      classSearch.trim() &&
      !c.className.toLowerCase().includes(classSearch.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredTeachers = teachers.filter(
    (t) =>
      !teacherSearch.trim() ||
      t.name.toLowerCase().includes(teacherSearch.trim().toLowerCase()) ||
      t.classes.some((c) => c.toLowerCase().includes(teacherSearch.trim().toLowerCase()))
  );

  const activeSchoolResult = schoolResults[activeResultLevel];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-sm sm:text-base truncate">
                {schoolInfo?.schoolName || 'RİBA Okul Yönetim Paneli'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Kurum Kodu: <strong>{activeKey || '-'}</strong> • {schoolInfo?.academicYear || '2026-2027'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {schools.length > 0 && (
              <select
                value={showNewSchoolWizard ? '__new__' : activeKey}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setShowNewSchoolWizard(true);
                    return;
                  }
                  const target = schools.find((s) => s.schoolKey === e.target.value);
                  if (target) {
                    setShowNewSchoolWizard(false);
                    setActiveKey(target.schoolKey);
                    setActiveSheetId(target.spreadsheetId);
                    localStorage.setItem('admin_active_school_key', target.schoolKey);
                    localStorage.setItem('active_spreadsheet_id', target.spreadsheetId);
                    loadSchoolData(target.schoolKey, target.spreadsheetId, adminUid, true);
                  }
                }}
                className="hidden sm:block text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 max-w-[210px] truncate cursor-pointer"
              >
                {schools.map((s) => (
                  <option key={s.schoolKey} value={s.schoolKey}>
                    {s.schoolName || s.schoolKey}
                  </option>
                ))}
                <option value="__new__">+ Yeni Okul Ekle</option>
              </select>
            )}

            <button
              type="button"
              onClick={() => loadSchoolData(activeKey, activeSheetId, adminUid, true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {showNewSchoolWizard ? (
          <div className="space-y-4">
            {schools.length > 0 && (
              <button
                type="button"
                onClick={() => setShowNewSchoolWizard(false)}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                ← Mevcut Okuluma Dön
              </button>
            )}
            <AdminSetupWizard
              mode="new-school"
              onComplete={(newKey, newSheet) => {
                setShowNewSchoolWizard(false);
                setActiveKey(newKey);
                setActiveSheetId(newSheet);
                loadSchoolData(newKey, newSheet, adminUid, true);
              }}
            />
          </div>
        ) : (
          <>
            {/* Auto-Detected School Level Confirmation Box */}
            <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs no-print">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                      <Sparkles className="w-3.5 h-3.5" />
                      Okul Türü &amp; Kademe Ayarı
                    </span>
                    {confirmed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Onaylandı
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Lütfen Kademeleri Onaylayın
                      </span>
                    )}
                  </div>
                  <h1 className="text-lg font-extrabold text-slate-900">
                    {schoolInfo?.schoolName} — Otomatik Algılanan RİBA Kademeleri
                  </h1>
                  <p className="text-xs text-slate-500">
                    {detection?.reason || 'Okul adınıza ve sınıflarınıza göre uygun MEB formları hazırlandı. İlkokulunuzda anasınıfı varsa Okul Öncesini de seçebilirsiniz.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={savingConfig}
                  onClick={handleSaveLevels}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer disabled:opacity-60 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {savingConfig
                    ? 'Kaydediliyor...'
                    : confirmed
                    ? 'Kademeleri Güncelle ve Formları Yenile'
                    : 'Kademeleri Onayla ve Formları Oluştur'}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ALL_LEVELS.map((lvl) => {
                  const selected = enabledLevels.includes(lvl);
                  const isPrimary = primaryLevel === lvl;
                  const meta = RIBA_LEVELS[lvl];
                  const subNote =
                    lvl === 'okuloncesi'
                      ? 'Öğretmen + Veli (Öğrenci yok)'
                      : lvl === 'ilkokul'
                      ? '3.-4. Snf Öğrenci + Tüm Veli/Öğrt'
                      : 'Öğrenci + Veli + Öğretmen';

                  return (
                    <div
                      key={lvl}
                      onClick={() => handleToggleLevel(lvl)}
                      className={`rounded-2xl border-2 p-3.5 cursor-pointer transition-all ${
                        selected
                          ? 'border-indigo-600 bg-indigo-50/60'
                          : 'border-slate-200 bg-slate-50/40 hover:bg-slate-100/70 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900">{meta.name}</span>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {}}
                          className="w-4 h-4 accent-indigo-600"
                        />
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {meta.targetCount} Hedef • {subNote}
                      </div>
                      {selected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryLevel(lvl);
                          }}
                          className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPrimary
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {isPrimary ? '★ Ana Kademe' : 'Ana Kademe Yap'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 no-print">
              {[
                {
                  id: 'share' as const,
                  label: 'Öğretmen Paylaşım & Şifreler',
                  icon: Users,
                  count: teachers.length,
                },
                {
                  id: 'classes' as const,
                  label: 'Sınıflar & Sınıf Sonuçları',
                  icon: GraduationCap,
                  count: classCards.length,
                },
                {
                  id: 'school' as const,
                  label: 'Okul Sonuç Çizelgesi & Özel Hedef',
                  icon: BarChart3,
                },
                {
                  id: 'data' as const,
                  label: 'E-Okul PDF / Manuel Sınıf Ekle',
                  icon: Upload,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    tab === item.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${
                        tab === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* TAB 1: TEACHER SHARE HUB */}
            {tab === 'share' && (
              <div className="space-y-6">
                {/* School Teachers WhatsApp Group Broadcast */}
                <div className="rounded-3xl bg-white border-2 border-purple-200 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold mb-2">
                        1. ADIM — OKUL ÖĞRETMENLER GRUBUNDA PAYLAŞIN
                      </span>
                      <h2 className="text-lg font-extrabold text-slate-900">
                        Öğretmen RİBA Anketi + Öğretmen Paneli Erişim Bilgisi
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        Bu mesajı okul öğretmenler WhatsApp grubuna atabilirsiniz. Her öğretmen aşağıdaki linkten kendi Öğretmen RİBA anketini doldurur, ayrıca öğretmenler kendi kullanıcı adı/şifreleriyle panele girip şubelerinin <strong>Öğrenci</strong> ve <strong>Veli</strong> linklerini karıştırmadan kopyalayabilir.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(buildTeachersGroupMessage());
                          toast.success('Öğretmenler grubu mesajı kopyalandı!');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shadow-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Grup Mesajını Kopyala
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          buildTeachersGroupMessage()
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp&apos;ta Paylaş
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {Object.values(teacherFormUrls).map((tf) => (
                      <div
                        key={tf.level}
                        className="rounded-2xl bg-purple-50/70 border border-purple-200 p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-purple-900">{tf.label}</span>
                          <a
                            href={tf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:underline"
                          >
                            Formu Önizle <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="text-[11px] font-mono bg-white px-3 py-2 rounded-xl border border-purple-100 truncate text-slate-700">
                          {tf.url}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(tf.url);
                              toast.success(`${tf.label} linki kopyalandı!`);
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Linki Kopyala
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setQrState({
                                open: true,
                                title: tf.label,
                                subtitle: schoolInfo?.schoolName || '',
                                badgeText: 'YALNIZCA ÖĞRETMEN ANKETİ',
                                badgeColor: 'purple',
                                url: tf.url,
                              })
                            }
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-purple-800 text-xs font-bold cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            QR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teachers Individual Login & Password Cards */}
                <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">
                        Öğretmen Giriş Bilgileri &amp; Şifre Kartları (Risk Haritası ile Ortak)
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ayrı şifre tanımlamadan öğretmenlerinize buradan giriş bilgisi gönderebilir veya öğretmen odasına toplu çıktı alabilirsiniz.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 no-print">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={teacherSearch}
                          onChange={(e) => setTeacherSearch(e.target.value)}
                          placeholder="Öğretmen veya sınıf ara..."
                          className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        Şifre Listesi Yazdır
                      </button>
                    </div>
                  </div>

                  {filteredTeachers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                      Henüz öğretmen kaydı yok. &ldquo;E-Okul PDF / Manuel Sınıf Ekle&rdquo; sekmesinden öğretmen ekleyebilir veya E-Okul PDF&apos;i yükleyebilirsiniz.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Öğretmen Adı</th>
                            <th className="px-4 py-3">Görevi</th>
                            <th className="px-4 py-3">Atanan Sınıflar</th>
                            <th className="px-4 py-3">Kullanıcı Adı</th>
                            <th className="px-4 py-3">Şifre</th>
                            <th className="px-4 py-3 text-right no-print">Paylaş</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredTeachers.map((t, i) => (
                            <tr key={`${t.username}-${i}`} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 font-bold text-slate-900">{t.name}</td>
                              <td className="px-4 py-2.5 text-slate-600">{t.role}</td>
                              <td className="px-4 py-2.5">
                                <div className="flex flex-wrap gap-1">
                                  {t.classes.length > 0 ? (
                                    t.classes.map((c) => (
                                      <span
                                        key={c}
                                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                                      >
                                        {c}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-400">Okul Geneli</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2.5 font-mono font-semibold text-indigo-700">
                                {t.username}
                              </td>
                              <td className="px-4 py-2.5 font-mono font-bold text-slate-800">
                                {t.password}
                              </td>
                              <td className="px-4 py-2.5 text-right no-print">
                                <a
                                  href={t.whatsappLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  WhatsApp
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: CLASSES & CLASS RIBA RESULTS */}
            {tab === 'classes' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLevelFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        levelFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Tümü ({classCards.length})
                    </button>
                    {enabledLevels.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevelFilter(lvl)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                          levelFilter === lvl
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {RIBA_LEVELS[lvl].name} (
                        {classCards.filter((c) => c.level === lvl).length})
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={classSearch}
                      onChange={(e) => setClassSearch(e.target.value)}
                      placeholder="Sınıf ara (Örn: 3/A, 8/B)..."
                      className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {filteredClasses.map((cls) => {
                  const isOpen = expandedClassKey === cls.classKey;
                  return (
                    <div
                      key={cls.classKey}
                      className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
                    >
                      <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 text-base">
                              {cls.className}
                            </h3>
                            <select
                              value={cls.level}
                              onChange={(e) =>
                                handleChangeClassLevel(cls.classKey, e.target.value as RibaLevel)
                              }
                              title="Bu şubenin RİBA form kademesini değiştir"
                              className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 cursor-pointer focus:outline-none"
                            >
                              {ALL_LEVELS.map((l) => (
                                <option key={l} value={l}>
                                  {RIBA_LEVELS[l].name}
                                </option>
                              ))}
                            </select>
                            {!cls.studentEligible && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                Öğrenci Formu Yok (MEB Kuralı)
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {cls.studentEligible && (
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold">
                                Öğrenci: {cls.result.counts.ogrenci}
                              </span>
                            )}
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold">
                              Veli: {cls.result.counts.veli}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-semibold">
                              Öğretmen: {cls.result.counts.ogretmenEffective}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {cls.studentEligible && cls.studentFormUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(cls.studentFormUrl!);
                                toast.success(`${cls.className} Öğrenci Linki kopyalandı!`);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                              Öğrenci Link
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(cls.parentFormUrl);
                              toast.success(`${cls.className} Veli Linki kopyalandı!`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                          >
                            <HeartHandshake className="w-3.5 h-3.5" />
                            Veli Link
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualModal(cls)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            <FilePlus2 className="w-3.5 h-3.5" />
                            Kağıt Gir
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadClassExcel(cls)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Excel
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedClassKey(isOpen ? null : cls.classKey)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer"
                          >
                            Çizelge
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-5 border-t border-slate-200 bg-slate-50/40">
                          <RibaScoreTable result={cls.result} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: CONSOLIDATED OKUL SONUÇ ÇİZELGESİ & ÖZEL HEDEFLER */}
            {tab === 'school' && (
              <div className="space-y-6">
                {enabledLevels.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {enabledLevels.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setActiveResultLevel(lvl)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                          activeResultLevel === lvl
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {RIBA_LEVELS[lvl].name} Okul Sonuç Çizelgesi
                      </button>
                    ))}
                  </div>
                )}

                {activeSchoolResult && (
                  <>
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-extrabold text-slate-900">
                            {schoolInfo?.schoolName} — {activeSchoolResult.levelName} RİBA Okul Sonuç Çizelgesi
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Katılım sağlayan {activeSchoolResult.participatingClasses.length} sınıfın ASP ortalamaları birleştirilmiştir. İlk 3 öncelik kırmızı ile işaretlenmiştir.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadSchoolExcel(activeResultLevel)}
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold cursor-pointer shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          Okul Sonuç Çizelgesi (.xlsx) İndir
                        </button>
                      </div>

                      {activeSchoolResult.participatingClasses.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                          Bu kademedeki sınıflardan henüz veri toplanmadı. Sınıflar form doldurdukça Okul Sonuç Çizelgesi otomatik hesaplanır.
                        </div>
                      ) : (
                        <>
                          {/* Top 10 Needs Visual Bars */}
                          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2.5">
                            <div className="text-xs font-extrabold text-slate-700 mb-2">
                              En Yüksek Puanlı İlk 8 Okul İhtiyacı (Özel Hedef Seçimi İçin Önerilen)
                            </div>
                            {[...activeSchoolResult.targets]
                              .sort((a, b) => b.averageAsp - a.averageAsp)
                              .slice(0, 8)
                              .map((t) => {
                                const widthPct = Math.max(15, Math.min(100, t.averageAsp));
                                return (
                                  <div key={t.targetId} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-semibold text-slate-800">
                                        <span className="font-bold text-rose-600 mr-1.5">
                                          #{t.rank}
                                        </span>
                                        {t.title}
                                      </span>
                                      <span className="font-mono font-bold text-slate-900">
                                        {t.averageAsp.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                                      <div
                                        className={`h-full rounded-full ${
                                          t.isTopPriority ? 'bg-rose-600' : 'bg-indigo-600'
                                        }`}
                                        style={{ width: `${widthPct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                          </div>

                          {/* Special Targets Picker */}
                          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-5 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h3 className="text-sm font-extrabold text-rose-950 flex items-center gap-2">
                                <Award className="w-4 h-4 text-rose-600" />
                                Okulun Belirlediği 2 Özel Hedef (Excel Raporuna Dahil Edilir)
                              </h3>
                              <button
                                type="button"
                                onClick={() => {
                                  const top2 = [...activeSchoolResult.targets]
                                    .sort((a, b) => b.averageAsp - a.averageAsp)
                                    .slice(0, 2);
                                  setSpecialTargets((prev) => ({
                                    ...prev,
                                    [activeResultLevel]: [
                                      top2[0]?.title || '',
                                      top2[1]?.title || '',
                                    ],
                                  }));
                                }}
                                className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                              >
                                En Yüksek 2 Hedefi Otomatik Doldur
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {[0, 1].map((idx) => (
                                <input
                                  key={idx}
                                  type="text"
                                  value={specialTargets[activeResultLevel]?.[idx] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSpecialTargets((prev) => {
                                      const cur: [string, string] = [
                                        prev[activeResultLevel]?.[0] || '',
                                        prev[activeResultLevel]?.[1] || '',
                                      ];
                                      cur[idx] = val;
                                      return { ...prev, [activeResultLevel]: cur };
                                    });
                                  }}
                                  placeholder={`${idx + 1}. Özel Hedef`}
                                  className="px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                                />
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSaveSpecialTargets(activeResultLevel)}
                              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                            >
                              Özel Hedefleri Kaydet
                            </button>
                          </div>

                          {/* Full Consolidated Matrix */}
                          <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <tr>
                                  <th className="px-3 py-2.5 w-10 text-center">RS</th>
                                  <th className="px-3 py-2.5 min-w-[220px]">Hedefler</th>
                                  {activeSchoolResult.participatingClasses.map((pc) => (
                                    <th key={pc.classKey} className="px-2.5 py-2.5 text-center whitespace-nowrap">
                                      {pc.className}
                                    </th>
                                  ))}
                                  <th className="px-3 py-2.5 text-center bg-slate-200">Ort. ASP</th>
                                  <th className="px-3 py-2.5 text-center bg-slate-200">Sıra</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {[...activeSchoolResult.targets]
                                  .sort((a, b) => b.averageAsp - a.averageAsp)
                                  .map((t) => (
                                    <tr
                                      key={t.targetId}
                                      className={t.isTopPriority ? 'bg-rose-50/75' : 'hover:bg-slate-50'}
                                    >
                                      <td className="px-3 py-2 text-center font-mono text-slate-500">
                                        {t.targetId}
                                      </td>
                                      <td className="px-3 py-2 font-semibold text-slate-900">
                                        {t.title}
                                      </td>
                                      {activeSchoolResult.participatingClasses.map((pc) => (
                                        <td key={pc.classKey} className="px-2.5 py-2 text-center text-slate-600">
                                          {(t.classAsps[pc.classKey] ?? 0).toFixed(1)}
                                        </td>
                                      ))}
                                      <td className="px-3 py-2 text-center font-extrabold text-slate-900 bg-slate-50">
                                        {t.averageAsp.toFixed(2)}
                                      </td>
                                      <td className="px-3 py-2 text-center bg-slate-50">
                                        <span
                                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                                            t.isTopPriority
                                              ? 'bg-rose-600 text-white'
                                              : 'bg-slate-200 text-slate-700'
                                          }`}
                                        >
                                          {t.rank}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 4: DATA & PDF UPLOAD */}
            {tab === 'data' && (
              <AdminSetupWizard
                mode="data-manager"
                existingSchoolKey={activeKey}
                existingSpreadsheetId={activeSheetId}
                existingSchoolName={schoolInfo?.schoolName}
                onComplete={(k, s) => loadSchoolData(k, s, adminUid, true)}
              />
            )}
          </>
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
          schoolKey={activeKey}
          spreadsheetId={activeSheetId}
          adminUid={adminUid}
          googleToken={typeof window !== 'undefined' ? localStorage.getItem('google_access_token') || '' : ''}
          classKey={manualModal.classKey}
          className={manualModal.className}
          level={manualModal.level}
          studentEligible={manualModal.studentEligible}
          onSaved={() => loadSchoolData(activeKey, activeSheetId, adminUid, true)}
        />
      )}
    </div>
  );
}
