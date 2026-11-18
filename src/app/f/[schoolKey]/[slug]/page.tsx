'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { RIBA_LEVELS, RibaLevel, RibaRole } from '@/lib/riba-data';
import { trackRibaEvent } from '@/lib/analytics';
import {
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  HeartHandshake,
  Users,
  Loader2,
  Send,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormMeta {
  schoolKey: string;
  schoolName: string;
  academicYear: string;
  level: RibaLevel;
  levelName: string;
  role: RibaRole;
  roleLabel: string;
  badgeText: string;
  classKey: string;
  className: string;
  classesInLevel: { classKey: string; className: string }[];
}

function PublicSurveyContent() {
  const params = useParams<{ schoolKey: string; slug: string }>();
  const searchParams = useSearchParams();
  const schoolKey = params?.schoolKey || '';
  const d = searchParams.get('d') || '';
  const sig = searchParams.get('sig') || '';

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [meta, setMeta] = useState<FormMeta | null>(null);
  const [gender, setGender] = useState<'K' | 'E' | ''>('');
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [teacherScopeAll, setTeacherScopeAll] = useState(false);
  const [selectedClassKeys, setSelectedClassKeys] = useState<string[]>([]);
  const [teacherNote, setTeacherNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [nonce] = useState(() => `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    if (!d || !sig) {
      setErrorMsg('Anket bağlantısı eksik veya bozuk.');
      setLoading(false);
      return;
    }

    fetch(
      `/api/riba/form-meta?schoolKey=${encodeURIComponent(schoolKey)}&d=${encodeURIComponent(
        d
      )}&sig=${encodeURIComponent(sig)}`
    )
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok || !json.success) {
          throw new Error(json.error || 'Form doğrulama başarısız.');
        }
        setMeta(json.meta);
        if (json.meta.role === 'ogretmen' && json.meta.classesInLevel?.length === 0) {
          setTeacherScopeAll(true);
        }
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, [schoolKey, d, sig]);

  const formSpec = useMemo(() => {
    if (!meta) return null;
    return RIBA_LEVELS[meta.level]?.forms?.[meta.role] || null;
  }, [meta]);

  const questions = formSpec?.questions || [];
  const answeredCount = questions.filter((q) => answers[q.q] === 'A' || answers[q.q] === 'B').length;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const toggleClassPick = (ck: string) => {
    setTeacherScopeAll(false);
    setSelectedClassKeys((prev) =>
      prev.includes(ck) ? prev.filter((x) => x !== ck) : [...prev, ck]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meta || !formSpec) return;

    const firstUnanswered = questions.find((q) => answers[q.q] !== 'A' && answers[q.q] !== 'B');
    if (firstUnanswered) {
      toast.error(`Lütfen ${firstUnanswered.q}. soruyu da yanıtlayınız (${answeredCount}/${questions.length}).`);
      const el = document.getElementById(`riba-q-${firstUnanswered.q}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (
      meta.role === 'ogretmen' &&
      meta.classesInLevel.length > 0 &&
      !teacherScopeAll &&
      selectedClassKeys.length === 0
    ) {
      toast.error('Lütfen dersine girdiğiniz şube(leri) veya "Kademedeki Tüm Şubeler" seçeneğini işaretleyiniz.');
      document.getElementById('teacher-class-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const answerCode = questions.map((q) => answers[q.q]).join('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/riba/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'web',
          schoolKey: meta.schoolKey,
          d,
          sig,
          gender,
          answerCode,
          nonce,
          selectedClassKeys:
            meta.role === 'ogretmen'
              ? teacherScopeAll
                ? ['SCHOOL_POOL']
                : selectedClassKeys
              : undefined,
          teacherNote: meta.role === 'ogretmen' ? teacherNote : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Gönderim sırasında hata oluştu.');
        return;
      }
      trackRibaEvent('riba_survey_submitted', { level: meta.level, role: meta.role });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error('Bağlantı hatası. Lütfen tekrar deneyiniz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm font-medium text-slate-600">RİBA Anketi yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !meta || !formSpec) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-slate-900">Anket Açılamadı</h1>
          <p className="mt-2 text-sm text-slate-600">{errorMsg || 'Form tanımı bulunamadı.'}</p>
        </div>
      </div>
    );
  }

  const theme =
    meta.role === 'ogrenci'
      ? {
          gradient: 'from-blue-600 to-indigo-700',
          badge: 'bg-blue-500/20 text-white border-blue-300/40',
          selectedRing: 'border-blue-600 bg-blue-50/70 shadow-sm',
          pill: 'bg-blue-600 text-white',
          Icon: GraduationCap,
          salutation: 'Sevgili Öğrenci,',
          guide:
            'Bu anketin amacı okulumuzda hangi rehberlik hizmetlerine ihtiyaç duyduğunuzu belirlemektir. Her soruda A ve B olmak üzere iki ifade yer almaktadır. Size en önemli görünen YALNIZCA BİR seçeneği işaretleyiniz.',
          audienceNotice: 'DİKKAT: Bu bağlantı YALNIZCA ÖĞRENCİLER içindir.',
        }
      : meta.role === 'veli'
      ? {
          gradient: 'from-emerald-600 to-teal-700',
          badge: 'bg-emerald-500/20 text-white border-emerald-300/40',
          selectedRing: 'border-emerald-600 bg-emerald-50/70 shadow-sm',
          pill: 'bg-emerald-600 text-white',
          Icon: HeartHandshake,
          salutation: 'Sayın Veli,',
          guide:
            'Bu anketin amacı okulumuzda öğrencilerimizin hangi rehberlik hizmetlerine ihtiyaç duyduğunu belirlemektir. Her maddede A ve B seçeneklerinden çocuğunuz/öğrencilerimiz için daha öncelikli gördüğünüz YALNIZCA BİR seçeneği işaretleyiniz.',
          audienceNotice: 'DİKKAT: Bu bağlantı YALNIZCA VELİLER içindir.',
        }
      : {
          gradient: 'from-purple-600 to-violet-700',
          badge: 'bg-purple-500/20 text-white border-purple-300/40',
          selectedRing: 'border-purple-600 bg-purple-50/70 shadow-sm',
          pill: 'bg-purple-600 text-white',
          Icon: Users,
          salutation: 'Sayın Öğretmen,',
          guide:
            'Bu anketin amacı okulumuzda öğrencilerimizin hangi rehberlik hizmetlerine ihtiyaç duyduğunu belirlemektir. Her soruda A ve B seçeneklerinden öğrencileriniz için daha öncelikli olan YALNIZCA BİR seçeneği işaretleyiniz.',
          audienceNotice: 'DİKKAT: Bu bağlantı YALNIZCA ÖĞRETMENLER içindir.',
        };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            {meta.badgeText}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">Teşekkür Ederiz!</h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            <strong>{meta.schoolName}</strong> ({meta.className}) için{' '}
            <strong>{meta.roleLabel}</strong> yanıtınız başarıyla okul rehberlik servisi sistemine kaydedildi.
          </p>
          <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500">
            Rehberlik ve Psikolojik Danışma Servisi — {meta.academicYear}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Unmistakable Role Header */}
      <div className={`bg-gradient-to-r ${theme.gradient} text-white`}>
        <div className="max-w-3xl mx-auto px-4 py-7 sm:py-9">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${theme.badge}`}>
              <theme.Icon className="w-4 h-4" />
              {meta.badgeText}
            </span>
            <span className="text-xs font-semibold bg-white/15 px-3 py-1 rounded-full">
              {meta.academicYear} Eğitim-Öğretim Yılı
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {meta.schoolName}
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-white/90 font-medium">
            {meta.levelName} {meta.roleLabel} •{' '}
            <span className="underline decoration-white/50 underline-offset-4">{meta.className}</span>
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-black/20 px-3.5 py-2 rounded-xl text-xs font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {theme.audienceNotice}
          </div>
        </div>
      </div>

      {/* Sticky Progress Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                meta.role === 'ogrenci'
                  ? 'bg-blue-600'
                  : meta.role === 'veli'
                  ? 'bg-emerald-600'
                  : 'bg-purple-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 shrink-0">
            {answeredCount} / {questions.length} Soru
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 pt-6 space-y-5">
        {/* Yönerge */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <p className="text-sm font-bold text-slate-900">{theme.salutation}</p>
          <p className="text-sm text-slate-600 leading-relaxed">{theme.guide}</p>

          {/* Optional Gender (Matches MEB RİBA PDFs) */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 mr-1">Cinsiyetiniz (İsteğe Bağlı):</span>
            {([
              { id: 'K', label: meta.role === 'ogrenci' ? 'Kız' : 'Kadın' },
              { id: 'E', label: 'Erkek' },
            ] as const).map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGender((prev) => (prev === g.id ? '' : g.id))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  gender === g.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Teacher Class Picker */}
        {meta.role === 'ogretmen' && (
          <div
            id="teacher-class-box"
            className="bg-purple-50/70 rounded-2xl border-2 border-purple-200 p-5 space-y-3"
          >
            <h2 className="text-sm font-bold text-purple-950">
              Değerlendirdiğiniz Şube / Kapsam Seçimi
            </h2>
            <p className="text-xs text-purple-800">
              Sınıf rehber öğretmeni iseniz kendi şubenizi işaretleyiniz; birden fazla şubeye giren branş öğretmeni iseniz girdiğiniz şubeleri veya kademe genelini seçebilirsiniz.
            </p>

            <label className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-purple-200 cursor-pointer">
              <input
                type="checkbox"
                checked={teacherScopeAll}
                onChange={(e) => {
                  setTeacherScopeAll(e.target.checked);
                  if (e.target.checked) setSelectedClassKeys([]);
                }}
                className="w-4 h-4 accent-purple-600"
              />
              <span className="text-xs font-bold text-slate-800">
                Okul / {meta.levelName} Kademesi Geneli (Girdiğim tüm şubeler için geçerlidir)
              </span>
            </label>

            {meta.classesInLevel.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {meta.classesInLevel.map((c) => {
                  const active = selectedClassKeys.includes(c.classKey);
                  return (
                    <button
                      key={c.classKey}
                      type="button"
                      onClick={() => toggleClassPick(c.classKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                        active
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-100/60'
                      }`}
                    >
                      {c.className}
                    </button>
                  );
                })}
              </div>
            )}

            <input
              type="text"
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              placeholder="İsteğe bağlı: Branşınız veya Adınız (Gizli tutulabilir)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((q) => {
            const picked = answers[q.q];
            return (
              <div
                key={q.q}
                id={`riba-q-${q.q}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Madde {q.q} / {questions.length}
                  </span>
                  {picked ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Seçildi: {picked}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-600">Seçim bekleniyor</span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {(['A', 'B'] as const).map((choice) => {
                    const active = picked === choice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.q]: choice }))}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                          active
                            ? theme.selectedRing
                            : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                            active ? theme.pill : 'bg-white border border-slate-300 text-slate-600'
                          }`}
                        >
                          {choice}
                        </span>
                        <span className="text-sm text-slate-800 font-medium leading-snug pt-0.5">
                          {q[choice].text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl text-white font-bold text-base shadow-lg transition-all cursor-pointer disabled:opacity-60 bg-gradient-to-r ${theme.gradient}`}
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {submitting
              ? 'Gönderiliyor...'
              : `Anketi Tamamla ve Gönder (${answeredCount}/${questions.length})`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PublicSurveyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
          Anket yükleniyor...
        </div>
      }
    >
      <PublicSurveyContent />
    </Suspense>
  );
}
