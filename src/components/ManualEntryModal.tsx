'use client';

import { useState, useMemo } from 'react';
import { RIBA_LEVELS, RIBA_ROLE_META, RibaLevel, RibaRole } from '@/lib/riba-data';
import { X, CheckCircle2, FilePlus2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ManualEntryModalProps {
  open: boolean;
  onClose: () => void;
  schoolKey: string;
  spreadsheetId?: string;
  classKey: string;
  className: string;
  level: RibaLevel;
  studentEligible: boolean;
  sessionToken?: string;
  googleToken?: string;
  adminUid?: string;
  onSaved: () => void;
}

export default function ManualEntryModal({
  open,
  onClose,
  schoolKey,
  spreadsheetId,
  classKey,
  className,
  level,
  studentEligible,
  sessionToken,
  googleToken,
  adminUid,
  onSaved,
}: ManualEntryModalProps) {
  const availableRoles: RibaRole[] = useMemo(() => {
    const roles = RIBA_LEVELS[level].roles;
    return roles.filter((r) => (r === 'ogrenci' ? studentEligible : true));
  }, [level, studentEligible]);

  const [role, setRole] = useState<RibaRole>(availableRoles[0] || 'veli');
  const [gender, setGender] = useState<'K' | 'E' | ''>('');
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const formSpec = RIBA_LEVELS[level].forms[role];
  const questions = formSpec?.questions || [];
  const answeredCount = questions.filter((q) => answers[q.q] === 'A' || answers[q.q] === 'B').length;

  const handleSave = async () => {
    if (!formSpec) return;
    if (answeredCount !== questions.length) {
      toast.error(`Lütfen tüm maddeleri işaretleyiniz (${answeredCount}/${questions.length}).`);
      return;
    }

    const answerCode = questions.map((q) => answers[q.q]).join('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/riba/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(googleToken ? { Authorization: `Bearer ${googleToken}` } : {}),
          ...(sessionToken ? { 'x-session-token': sessionToken } : {}),
        },
        body: JSON.stringify({
          source: 'manual',
          schoolKey,
          spreadsheetId,
          adminUid,
          sessionToken,
          level,
          role,
          classKey,
          className,
          gender,
          answerCode,
          selectedClassKeys: role === 'ogretmen' ? [classKey] : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Kayıt başarısız.');
        return;
      }
      toast.success('Kağıt anket yanıtı işlendi! Sonraki formu girebilirsiniz.');
      setAnswers({});
      setGender('');
      onSaved();
    } catch {
      toast.error('Kayıt sırasında bağlantı hatası.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FilePlus2 className="w-5 h-5 text-indigo-600" />
              Kağıt Form / Manuel Yanıt İşleme
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {className} — {RIBA_LEVELS[level].name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Role + Gender Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setAnswers({});
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    role === r
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {RIBA_ROLE_META[r].label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Cinsiyet:</span>
              {(['', 'K', 'E'] as const).map((g) => (
                <button
                  key={g || 'none'}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    gender === g ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {g === '' ? 'Belirtilmemiş' : g === 'K' ? 'Kız/Kadın' : 'Erkek'}
                </button>
              ))}
            </div>
          </div>

          {/* Fast Compact A/B Grid */}
          <div className="space-y-2">
            {questions.map((q) => (
              <div
                key={q.q}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-slate-200 bg-white"
              >
                <div className="text-xs text-slate-700 flex-1 space-y-1">
                  <div className="font-bold text-slate-900">Soru {q.q}</div>
                  <div>
                    <span className="font-semibold text-indigo-700">A:</span> {q.A.text}
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-700">B:</span> {q.B.text}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(['A', 'B'] as const).map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.q]: choice }))}
                      className={`w-12 h-10 rounded-xl font-bold text-sm cursor-pointer border transition-all ${
                        answers[q.q] === choice
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-3xl">
          <span className="text-xs font-semibold text-slate-600">
            İşaretlenen: <strong>{answeredCount}</strong> / {questions.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              Kapat
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting || answeredCount !== questions.length}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Kaydediliyor...' : 'E-Tabloya Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
