'use client';

import { useState } from 'react';
import { ShieldAlert, ExternalLink, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function RiskSwitchButton({
  role,
  schoolKey: explicitSchoolKey,
}: {
  role: 'admin' | 'teacher';
  schoolKey?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleGoRisk = async () => {
    setLoading(true);
    try {
      let schoolKey = explicitSchoolKey || '';
      let adminUid = '';
      let adminName = '';
      let adminEmail = '';
      let teacherName = '';
      let sessionToken = '';
      const googleToken = localStorage.getItem('google_access_token') || '';

      if (role === 'admin') {
        schoolKey = schoolKey || localStorage.getItem('admin_active_school_key') || '';
        const ssoRaw = localStorage.getItem('sso_admin_session');
        const sso = ssoRaw ? JSON.parse(ssoRaw) : null;
        adminUid = auth.currentUser?.uid || sso?.uid || '';
        adminName =
          auth.currentUser?.displayName ||
          sso?.schoolName ||
          auth.currentUser?.email ||
          'Okul PDR';
        adminEmail = auth.currentUser?.email || '';
      } else {
        const tRaw = localStorage.getItem('teacher_session');
        const tSess = tRaw ? JSON.parse(tRaw) : null;
        schoolKey = schoolKey || tSess?.schoolKey || '';
        teacherName = tSess?.teacher?.name || '';
        sessionToken = localStorage.getItem('teacher_session_token') || '';
      }

      const res = await fetch('/api/risk-sso-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(googleToken ? { Authorization: `Bearer ${googleToken}` } : {}),
          ...(sessionToken ? { 'x-session-token': sessionToken } : {}),
        },
        body: JSON.stringify({
          role,
          schoolKey,
          adminUid,
          adminName,
          adminEmail,
          teacherName,
          sessionToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Risk Haritası bağlantısı oluşturulamadı.');
      }

      const win = window.open(data.url, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err?.message || 'Risk Haritasına geçiş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoRisk}
      disabled={loading}
      title="Okul Risk Haritası & ŞÖK sistemine tek tıkla geç"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-60 border ${
        role === 'admin'
          ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : (
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
      )}
      <span className="hidden sm:inline">Risk Haritası Paneli</span>
      <span className="sm:hidden">Risk</span>
      <ExternalLink className="w-3 h-3 opacity-75 shrink-0" />
    </button>
  );
}
