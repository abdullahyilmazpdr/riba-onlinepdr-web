'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { auth } from '@/lib/firebase';
import { checkSchoolKeyOwnership, saveSchoolData } from '@/lib/db';
import { detectSchoolProfile, RIBA_LEVELS, RibaLevel } from '@/lib/riba-data';
import {
  FileSpreadsheet,
  Upload,
  Plus,
  Sparkles,
  CheckCircle2,
  Loader2,
  School,
} from 'lucide-react';

interface AdminSetupWizardProps {
  mode: 'new-school' | 'data-manager';
  existingSchoolKey?: string;
  existingSpreadsheetId?: string;
  existingSchoolName?: string;
  onComplete: (schoolKey: string, spreadsheetId: string) => void;
}

export default function AdminSetupWizard({
  mode,
  existingSchoolKey = '',
  existingSpreadsheetId = '',
  existingSchoolName = '',
  onComplete,
}: AdminSetupWizardProps) {
  const [schoolKey, setSchoolKey] = useState(existingSchoolKey);
  const [schoolName, setSchoolName] = useState(existingSchoolName);
  const [district, setDistrict] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [creating, setCreating] = useState(false);

  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [scheduleFile, setScheduleFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [manualClassName, setManualClassName] = useState('');
  const [manualClassLevel, setManualClassLevel] = useState<RibaLevel>('ilkokul');
  const [addingClass, setAddingClass] = useState(false);

  const [teacherName, setTeacherName] = useState('');
  const [teacherClasses, setTeacherClasses] = useState('');
  const [teacherRole, setTeacherRole] = useState('Sınıf Öğretmeni');
  const [addingTeacher, setAddingTeacher] = useState(false);

  const livePreview = schoolName.trim() ? detectSchoolProfile(schoolName.trim(), []) : null;

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      toast.error('Lütfen Google hesabınızla yeniden giriş yapınız.');
      return;
    }
    const cleanKey = schoolKey.trim();
    if (!cleanKey || !schoolName.trim()) {
      toast.error('Lütfen Kurum Kodu ve Okul Adı alanlarını doldurunuz.');
      return;
    }

    const googleToken = localStorage.getItem('google_access_token') || '';
    if (!googleToken) {
      toast.error('Google Drive izni yenilenmeli. Lütfen çıkış yapıp Google ile tekrar giriş yapınız.');
      return;
    }

    setCreating(true);
    const toastId = toast.loading('Kurum kontrol ediliyor ve Google E-Tablo hazırlanıyor...');
    try {
      const ownership = await checkSchoolKeyOwnership(cleanKey, user.uid);
      if (ownership.exists && !ownership.isOwner) {
        toast.dismiss(toastId);
        toast.error('Bu kurum kodu başka bir okul yöneticisi hesabına kayıtlıdır.');
        setCreating(false);
        return;
      }

      let spreadsheetId = ownership.existingSchool?.spreadsheetId || '';
      if (!spreadsheetId) {
        const res = await fetch('/api/create-sheet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${googleToken}`,
          },
          body: JSON.stringify({ schoolName: schoolName.trim(), academicYear }),
        });
        const data = await res.json();
        if (!res.ok || !data.spreadsheetId) {
          throw new Error(data.error || 'E-Tablo oluşturulamadı.');
        }
        spreadsheetId = data.spreadsheetId;
      }

      const ok = await saveSchoolData(user.uid, {
        schoolKey: cleanKey,
        spreadsheetId,
        schoolName: schoolName.trim(),
        district: district.trim(),
        academicYear,
        adminEmail: user.email || '',
      });
      if (!ok) throw new Error('Okul kaydı Firestore veritabanına yazılamadı.');

      localStorage.setItem('admin_active_school_key', cleanKey);
      localStorage.setItem('active_spreadsheet_id', spreadsheetId);

      // Save initial detected RİBA config
      const detected = detectSchoolProfile(schoolName.trim(), []);
      await fetch('/api/riba/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${googleToken}`,
        },
        body: JSON.stringify({
          action: 'save-config',
          schoolKey: cleanKey,
          spreadsheetId,
          adminUid: user.uid,
          primaryLevel: detected.primaryLevel,
          enabledLevels: detected.recommendedLevels,
        }),
      });

      toast.dismiss(toastId);
      toast.success('Okulunuz ve RİBA E-Tablonuz başarıyla oluşturuldu!');
      onComplete(cleanKey, spreadsheetId);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || 'Okul oluşturma hatası.');
    } finally {
      setCreating(false);
    }
  };

  const handleUploadPdfs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFile && !scheduleFile) {
      toast.error('Lütfen en az bir E-Okul PDF dosyası seçiniz.');
      return;
    }
    const ssoRaw = localStorage.getItem('sso_admin_session');
    const sso = ssoRaw ? JSON.parse(ssoRaw) : null;
    const adminUid = auth.currentUser?.uid || sso?.uid || '';
    const googleToken = localStorage.getItem('google_access_token') || '';

    setUploading(true);
    const toastId = toast.loading('E-Okul PDF dosyaları okunuyor ve şubeler/öğretmenler işleniyor...');
    try {
      const fd = new FormData();
      if (studentFile) fd.append('studentFile', studentFile);
      if (scheduleFile) fd.append('scheduleFile', scheduleFile);
      fd.append('schoolKey', existingSchoolKey);
      fd.append('spreadsheetId', existingSpreadsheetId);
      fd.append('adminUid', adminUid);

      const res = await fetch('/api/parse-upload', {
        method: 'POST',
        headers: googleToken ? { Authorization: `Bearer ${googleToken}` } : undefined,
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'PDF ayrıştırılamadı.');
      }

      toast.dismiss(toastId);
      toast.success(
        `Aktarım tamamlandı: ${data.studentCount} öğrenci, ${data.teacherCount} öğretmen, ${data.classCount} sınıf!`
      );
      setStudentFile(null);
      setScheduleFile(null);
      onComplete(existingSchoolKey, existingSpreadsheetId);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddManualClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualClassName.trim()) {
      toast.error('Lütfen sınıf / şube adı giriniz.');
      return;
    }
    const ssoRaw = localStorage.getItem('sso_admin_session');
    const sso = ssoRaw ? JSON.parse(ssoRaw) : null;
    const adminUid = auth.currentUser?.uid || sso?.uid || '';
    const googleToken = localStorage.getItem('google_access_token') || '';

    setAddingClass(true);
    try {
      const res = await fetch('/api/riba/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(googleToken ? { Authorization: `Bearer ${googleToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'add-manual-class',
          schoolKey: existingSchoolKey,
          spreadsheetId: existingSpreadsheetId,
          adminUid,
          className: manualClassName.trim(),
          level: manualClassLevel,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Sınıf eklenemedi.');
      toast.success(`"${manualClassName}" sınıfı eklendi!`);
      setManualClassName('');
      onComplete(existingSchoolKey, existingSpreadsheetId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddingClass(false);
    }
  };

  const handleAddManualTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      toast.error('Öğretmen adı gereklidir.');
      return;
    }
    const ssoRaw = localStorage.getItem('sso_admin_session');
    const sso = ssoRaw ? JSON.parse(ssoRaw) : null;
    const adminUid = auth.currentUser?.uid || sso?.uid || '';
    const googleToken = localStorage.getItem('google_access_token') || '';

    setAddingTeacher(true);
    try {
      const res = await fetch('/api/riba/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(googleToken ? { Authorization: `Bearer ${googleToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'add-manual-teacher',
          schoolKey: existingSchoolKey,
          spreadsheetId: existingSpreadsheetId,
          adminUid,
          name: teacherName.trim(),
          classes: teacherClasses
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          role: teacherRole,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Öğretmen eklenemedi.');
      toast.success(`"${teacherName}" eklendi!`);
      setTeacherName('');
      setTeacherClasses('');
      onComplete(existingSchoolKey, existingSpreadsheetId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddingTeacher(false);
    }
  };

  if (mode === 'new-school') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Yeni Okul RİBA Kurulumu</h2>
            <p className="text-xs text-slate-500">
              Google Drive&apos;ınızda okulunuza özel sıfır maliyetli E-Tablo otomatik oluşturulacaktır.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateSchool} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                MEB Kurum Kodu *
              </label>
              <input
                type="text"
                required
                value={schoolKey}
                onChange={(e) => setSchoolKey(e.target.value)}
                placeholder="Örn: 712345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Öğretim Yılı
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Okul Tam Adı * (Kademeyi Otomatik Algılar)
            </label>
            <input
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Örn: Atatürk İlkokulu / Fatih Anadolu Lisesi / Çiçek Anaokulu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {livePreview && (
            <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-3.5 text-xs text-indigo-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Otomatik Kademe Tahmini:</strong>{' '}
                {livePreview.recommendedLevels.map((l) => RIBA_LEVELS[l].name).join(' + ')} —{' '}
                <span className="text-indigo-700">{livePreview.reason}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">İl / İlçe</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Örn: Meram / Konya"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md cursor-pointer disabled:opacity-60"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            {creating ? 'E-Tablo Oluşturuluyor...' : 'Google Drive E-Tablomu Oluştur ve Kaydet'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* E-Okul PDF Upload */}
      <form
        onSubmit={handleUploadPdfs}
        className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <Upload className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900">E-Okul PDF&apos;lerinden Sınıf &amp; Öğretmen Aktar</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Risk Haritasında olduğu gibi E-Okul Sınıf Listesi ve Ders Programı PDF&apos;lerini yükleyebilirsiniz.{' '}
          <strong>Mevcut öğretmen kullanıcı adı ve şifreleri korunur.</strong>
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
            <label className="block font-bold text-slate-700 mb-1.5">
              1. Sınıf Öğrenci Listeleri PDF (İsteğe Bağlı)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setStudentFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:font-semibold"
            />
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
            <label className="block font-bold text-slate-700 mb-1.5">
              2. Öğretmen Ders Programı PDF (İsteğe Bağlı)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setScheduleFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:font-semibold"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {uploading ? 'İşleniyor...' : 'PDF Verilerini E-Tabloya Aktar'}
        </button>
      </form>

      {/* Manual Class & Teacher Quick Add */}
      <div className="space-y-6">
        <form
          onSubmit={handleAddManualClass}
          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Hızlı Manuel Şube Ekle</h3>
          </div>
          <p className="text-xs text-slate-500">
            Özellikle Anaokulları, Anasınıfı şubeleri veya PDF&apos;siz hızlı kurulumlar için şube ekleyebilirsiniz.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={manualClassName}
              onChange={(e) => setManualClassName(e.target.value)}
              placeholder="Örn: Anasınıfı / Sabah"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <select
              value={manualClassLevel}
              onChange={(e) => setManualClassLevel(e.target.value as RibaLevel)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="okuloncesi">Okul Öncesi RİBA</option>
              <option value="ilkokul">İlkokul RİBA</option>
              <option value="ortaokul">Ortaokul RİBA</option>
              <option value="lise">Lise RİBA</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={addingClass}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
          >
            {addingClass ? 'Ekleniyor...' : 'Şubeyi Ekle'}
          </button>
        </form>

        <form
          onSubmit={handleAddManualTeacher}
          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900">Hızlı Öğretmen Ekle (Otomatik Şifreyle)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="Adı Soyadı"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <input
              type="text"
              value={teacherClasses}
              onChange={(e) => setTeacherClasses(e.target.value)}
              placeholder="Sınıflar (virgülle): 3/A, 3/B"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={teacherRole}
              onChange={(e) => setTeacherRole(e.target.value)}
              placeholder="Görevi / Branşı"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={addingTeacher}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              {addingTeacher ? 'Ekleniyor...' : 'Öğretmen Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
