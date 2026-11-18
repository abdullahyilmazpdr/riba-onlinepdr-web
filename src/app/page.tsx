import Link from 'next/link';
import {
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  Users,
  GraduationCap,
  HeartHandshake,
  BarChart3,
  FileSpreadsheet,
  ArrowRight,
  Lock,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

const RIBA_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'OnlinePDR MEB RİBA Otomasyonu',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      url: 'https://riba.onlinepdr.com',
      inLanguage: 'tr',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'TRY',
      },
      publisher: {
        '@type': 'Organization',
        name: 'OnlinePDR',
        url: 'https://onlinepdr.com',
      },
      description:
        'Okul Öncesi, İlkokul (3.-4. sınıf), Ortaokul ve Lise MEB RİBA (Rehberlik İhtiyacı Belirleme Anketi) öğrenci, veli ve öğretmen formlarını otomatik oluşturan; ASP puanlarını ve Sınıf/Okul Sonuç Çizelgelerini hesaplayan Google Drive tabanlı sistem.',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'İlkokul 1. ve 2. sınıflarda RİBA Öğrenci Formu uygulanır mı?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Hayır. MEB RİBA yönergesine göre ilkokullarda Öğrenci Formu yalnızca 3. ve 4. sınıf öğrencilerine uygulanır; 1. ve 2. sınıflarda ise yalnızca Veli ve Öğretmen formları uygulanır. riba.onlinepdr.com bu kuralı sınıf düzeyine göre otomatik uygular.',
          },
        },
        {
          '@type': 'Question',
          name: 'Okul Risk Haritası (risk.onlinepdr.com) kullanan öğretmenler RİBA için yeni şifre alacak mı?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Hayır. risk.onlinepdr.com sistemine kayıtlı okulların E-Tablosu ve öğretmen şifreleri doğrudan tanınır. Öğretmenler aynı kurum kodu, kullanıcı adı ve şifreyle RİBA paneline giriş yapabilir veya Risk panelinden tek tıkla geçiş yapabilir.',
          },
        },
        {
          '@type': 'Question',
          name: 'Öğrenci ve veli anket linklerinin karıştırılmaması nasıl sağlanır?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sistem her şube için /ogrenci-... ve /veli-... önekli, HMAC imzalı ve farklı renklerde (Öğrenci Mavi, Veli Yeşil, Öğretmen Mor) kartlar üretir. Öğretmen ilgili linki doğrudan öğrenci veya veli WhatsApp grubuna tek tıkla aktarabilir.',
          },
        },
        {
          '@type': 'Question',
          name: 'RİBA verileri ve öğrenci listeleri nerede saklanır?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Tüm veriler %100 KVKK uyumlu olarak okulunuzun kendi Google Drive hesabındaki Google E-Tablonuzda (RIBA_Ayarlar ve RIBA_Yanitlar sekmelerinde) saklanır.',
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-indigo-50/40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(RIBA_SCHEMA) }}
      />
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">RİBA</span>
              <span className="hidden sm:inline text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-2">
                riba.onlinepdr.com
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://risk.onlinepdr.com"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Risk Haritası Paneli
            </a>
            <Link
              href="/teacher/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-xs"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              Öğretmen Girişi
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              PDR / Yönetici Girişi
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              MEB ÖRGM 2026-2027 Resmi RİBA Formları ve ASP Hesaplama Motoru
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Okul RİBA Sürecini{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
                Karışıklık Olmadan
              </span>{' '}
              Dakikalar İçinde Tamamlayın
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              Okul türünüzü (<strong>Okul Öncesi, İlkokul, Ortaokul, Lise</strong>) okul adınızdan ve şubelerinizden otomatik algılar;{' '}
              <strong>Öğretmen</strong>, <strong>Öğrenci</strong> ve <strong>Veli</strong> anketlerini ayrı renkler ve korumalı bağlantılarla üretir.{' '}
              <strong>risk.onlinepdr.com</strong> kullanan okullarda öğretmenler ek şifreye gerek kalmadan <strong>mevcut şifreleriyle</strong> doğrudan giriş yapar.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all"
              >
                <ShieldCheck className="w-5 h-5" />
                Okul Google Hesabı ile Başla
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/teacher/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold shadow-sm transition-all"
              >
                <Users className="w-5 h-5 text-emerald-600" />
                Sınıf Öğretmeni Girişi (Risk Şifresiyle)
              </Link>
            </div>
          </div>

          {/* 3-Rol Sıfır Karışıklık Özeti */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl bg-white border-2 border-purple-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                  1. ÖĞRETMEN FORMU
                </span>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="font-bold text-slate-900 text-lg">Okul Öğretmenler Grubu</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Rehber öğretmen onayından sonra oluşan <strong>Öğretmen Anketi</strong> linkini ve öğretmen panel girişlerini tek tıkla okul öğretmenler WhatsApp grubunda paylaşın.
              </p>
            </div>

            <div className="rounded-2xl bg-white border-2 border-blue-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  2. ÖĞRENCİ FORMU
                </span>
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-bold text-slate-900 text-lg">Öğrenci Grubuna Özel</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                MEB RİBA yönergesine tam uyumlu: <strong>İlkokul 3.-4. sınıflar, Ortaokul ve Lise</strong> şubelerinde ayrı mavi banner ile açılır; 1.-2. sınıf ve Okul Öncesinde otomatik gizlenir.
              </p>
            </div>

            <div className="rounded-2xl bg-white border-2 border-emerald-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  3. VELİ FORMU
                </span>
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="font-bold text-slate-900 text-lg">Veli WhatsApp Grubuna Özel</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Her şube için öğrenciden tamamen ayrı kodlanmış <code>/veli-...</code> bağlantısı ve QR kod ile velilerin yanlışlıkla öğrenci formunu doldurması engellenir.
              </p>
            </div>
          </div>

          {/* Kademe Kuralları & Teknik Avantajlar */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-lg">Kademelere Göre Otomatik MEB RİBA Kuralları</h3>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Okul Öncesi / Anaokulu:</strong> 27 hedef, 13 soruluk Öğretmen (%51) + 13 soruluk Veli (%49) formları. (Öğrenci formu yoktur.)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>İlkokul (ve Anasınıfı):</strong> 38 hedef; 3.-4. sınıflarda Öğrenci + Veli + Öğretmen, 1.-2. sınıflarda yalnızca Veli + Öğretmen uygulanır. Bünyesinde anasınıfı varsa isteğe bağlı Okul Öncesi formları da otomatik eklenir.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Ortaokul &amp; İHO:</strong> 39 hedef, 18 soruluk Öğrenci (%39) + 16 soruluk Veli (%28) + 18 soruluk Öğretmen (%33).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Lise / MTAL / Anadolu / Fen / İHL:</strong> 40 hedef, 20 soruluk Öğrenci (%39) + 19 soruluk Veli (%28) + 19 soruluk Öğretmen (%33).
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-lg">Anlık Sınıf &amp; Okul Sonuç Çizelgeleri + KVKK</h3>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Okul Google Drive&apos;ında Güvenli Veri:</strong> Verileriniz kurumunuzun kendi Google E-Tablosundaki <code>RIBA_Yanitlar</code> ve <code>RIBA_Ayarlar</code> sekmelerinde saklanır.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Tam MEB ASP &amp; T Puanı Formülü:</strong> Her hedef alanının frekansları, örneklem standart sapma ve T puanları otomatik hesaplanır; Sınıf Sonuç Çizelgesi ve birleştirilmiş Okul Sonuç Çizelgesi tek tıkla <code>.xlsx</code> indirilir.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Risk Haritası ile Tek Şifre:</strong> <code>risk.onlinepdr.com</code> kullanan okulların öğretmen listesi ve şifreleri otomatik devralınır; ayrı şifre tanımlamaya gerek kalmaz.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>OnlinePDR Rehberlik Ekosistemi</span>
                <a
                  href="https://onlinepdr.com/riba/"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  RİBA Uygulama Rehberi &amp; Bilgi →
                </a>
              </div>
            </div>
          </div>

          {/* Sıkça Sorulan Sorular (SEO & Yapay Zeka Uyumlu) */}
          <div className="mt-10 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                Sıkça Sorulan Sorular (MEB RİBA)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4">
                <h3 className="font-bold text-slate-900 mb-1.5">
                  İlkokul 1. ve 2. sınıflarda RİBA Öğrenci Formu uygulanır mı?
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Hayır. MEB RİBA yönergesine göre ilkokullarda Öğrenci Formu yalnızca 3. ve 4. sınıf öğrencilerine uygulanır; 1. ve 2. sınıflarda ise sadece Veli ve Öğretmen formları uygulanır. Sistemimiz bu kuralı sınıf düzeyine göre otomatik uygular.
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4">
                <h3 className="font-bold text-slate-900 mb-1.5">
                  Risk Haritası kullanan öğretmenler yeni şifre alacak mı?
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Hayır. risk.onlinepdr.com kullanan okulların öğretmen kullanıcı adları ve şifreleri burada doğrudan geçerlidir; ayrıca Risk paneli sol menüsünden tek tıkla geçiş yapılabilir.
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4">
                <h3 className="font-bold text-slate-900 mb-1.5">
                  Öğrenci ve veli anket linklerinin karışması nasıl engellenir?
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Her sınıf şubesi için URL yolunda açıkça <code>/ogrenci-...</code> ve <code>/veli-...</code> taşıyan, HMAC imzalı ve ayrı renklerde WhatsApp paylaşım kartları üretilir.
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4">
                <h3 className="font-bold text-slate-900 mb-1.5">
                  Öğrenci listeleri ve anket sonuçları nerede saklanır?
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Tüm öğrenci ve öğretmen bilgileri ile anket yanıtları %100 KVKK uyumlu olarak kurumunuzun kendi Google Drive E-Tablosunda saklanır.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} OnlinePDR RİBA Sistemi — Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="https://onlinepdr.com" className="hover:text-slate-800">
              OnlinePDR Ana Sayfa
            </a>
            <a href="https://risk.onlinepdr.com" className="hover:text-slate-800">
              Okul Risk Haritası
            </a>
            <a href="/llms.txt" className="hover:text-slate-800">
              AI / LLMs Rehberi
            </a>
            <a href="https://onlinepdr.com/gizlilik-politikasi.html" className="hover:text-slate-800">
              KVKK &amp; Gizlilik
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
