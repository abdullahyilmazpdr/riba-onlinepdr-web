import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import AIAssistantWidget from '@/components/AIAssistantWidget';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://riba.onlinepdr.com'),
  title: {
    default: 'RİBA Otomasyonu | MEB Rehberlik İhtiyacı Belirleme Anketi Sistemi',
    template: '%s | Okul RİBA Otomasyonu',
  },
  other: {
    'google-adsense-account': 'ca-pub-6640600529852358',
  },
  description:
    'MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü (ÖRGM) resmi RİBA anketleri ile uyumlu; Okul Öncesi, İlkokul (3-4), Ortaokul ve Lise öğrenci, veli ve öğretmen formlarını otomatik üreten ve Sınıf/Okul Sonuç Çizelgelerini hesaplayan Google Drive tabanlı sistem.',
  keywords: [
    'riba',
    'riba anketi',
    'rehberlik ihtiyacı belirleme anketi',
    'meb riba excel',
    'riba okul sonuç çizelgesi',
    'riba sınıf sonuç çizelgesi',
    'online riba',
    'okul öncesi riba',
    'ilkokul riba',
    'ortaokul riba',
    'lise riba',
    'pdr riba otomasyonu',
    'riba.onlinepdr.com',
  ],
  authors: [{ name: 'Abdullah YILMAZ - OnlinePDR', url: 'https://onlinepdr.com' }],
  creator: 'OnlinePDR',
  publisher: 'OnlinePDR Eğitim Çözümleri',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://riba.onlinepdr.com',
    title: 'Okul RİBA Otomasyonu | MEB Rehberlik İhtiyacı Belirleme Sistemi',
    description:
      'Okul türünüzü otomatik algılayan, öğrenci-veli-öğretmen linklerini karıştırmadan ayrı yöneten, ASP ve T puanlarını anlık hesaplayan MEB uyumlu RİBA platformu.',
    siteName: 'riba.onlinepdr.com',
    images: [
      {
        url: 'https://onlinepdr.com/assets/img/riba-otomasyon-kapak.jpg',
        width: 1200,
        height: 675,
        alt: 'OnlinePDR MEB RİBA Otomasyonu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Okul RİBA Otomasyonu | riba.onlinepdr.com',
    description:
      'MEB ÖRGM uyumlu Okul Öncesi, İlkokul (3-4), Ortaokul ve Lise RİBA anket toplama, ASP hesaplama ve Excel çıktı sistemi.',
    images: ['https://onlinepdr.com/assets/img/riba-otomasyon-kapak.jpg'],
  },
  alternates: {
    canonical: 'https://riba.onlinepdr.com',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XVH8NX75JE" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XVH8NX75JE');
            `,
          }}
        />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PFZ4T344');`,
          }}
        />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6640600529852358"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PFZ4T344"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#fff',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
            },
          }}
        />
        {children}
        <AIAssistantWidget />
      </body>
    </html>
  );
}
