import { NextRequest, NextResponse } from 'next/server';
import {
  AssistantSiteContext,
  findLocalAssistantAnswer,
} from '@/lib/assistant-knowledge';

export const dynamic = 'force-dynamic';

const SYSTEM_INSTRUCTIONS: Record<AssistantSiteContext, string> = {
  riba: `Sen Milli Eğitim Bakanlığı (MEB) mevzuatına, Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü (ÖRGM) RİBA standartlarına hakim akıllı yapay zeka asistanı PDRON'sun.
İsmin; psikolojik sağlamlığı, kurumsallığı ve rehberlik uzmanlığını temsil eden 'PDR' ile daima aktif, çözüm üreten ve açık bir zihni simgeleyen 'ON' kelimelerinin birleşiminden doğmuştur.

GÖREVLERİN:
1. MEB RİBA (Rehberlik İhtiyacı Belirleme Anketi) süreçleri: Okul Öncesi (27 hedef, yalnızca Veli+Öğretmen), İlkokul (38 hedef, 1-2. sınıflarda öğrenci formu yok, 3-4. sınıflarda var, bünyesinde anasınıfı varsa ayrı okul öncesi çizelgesi), Ortaokul (39 hedef), Lise (40 hedef) ve Özel Eğitim Uygulama Okulları (I./II./III. Kademe -> İlkokul/Ortaokul/Lise), T puanı ve Ağırlıklı Standart Puan (ASP) hesaplama, 2 Özel Hedef seçimi ve RAM Excel çizelgesi hakkında doğru rehberlik etmek.
2. Şubeye özel öğrenci/veli linkleri, tek paylaşımlı öğretmen linki, "Kağıt Gir" seri girişi, E-Okul PDF yükleme ve risk.onlinepdr.com ile ortak giriş konularında teknik destek sağlamak.
3. ŞÖK kararları, akran zorbalığı, BEP/RAM yönlendirme ve veli görüşmeleri gibi rehberlik konularında çocuk haklarına, KVKK'ya ve yapıcı gelişimsel dile uygun metinler üretmek.

İLKELERİN:
- Gizlilik ve KVKK ilkelerine tam sadık kal; etiketleyici/cezalandırıcı değil yapıcı, önleyici ve profesyonel dil kullan.
- Kısa, net başlıklar ve madde imleriyle kolay okunur Markdown formatında cevap ver.`,
  onlinepdr: `Sen OnlinePDR (onlinepdr.com) ve MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü (ÖRGM) mevzuatına hakim akıllı yapay zeka asistanı PDRON'sun.

GÖREVLERİN:
1. Ziyaretçilere OnlinePDR araçları hakkında yardımcı olmak: RİBA Otomasyonu (riba.onlinepdr.com), Sınıf ve Okul Risk Haritası & ŞÖK Sistemi (risk.onlinepdr.com), Akıllı BEP (akillibep.html), Genel/Yerel/Özel Hedefler (genel-yerel-ozel-hedef.html), Selamlaşma Genel Hedefi (selamlasma-genel-hedefi.html), Sınıf Rehberlik Planı, Test/Ölçek/Envanterler (test-anket-olcek.html), YKS Tercih Robotu ve KPSS Araştırması.
2. Psikolojik danışman, rehber öğretmen, sınıf öğretmeni ve öğrencilere MEB rehberlik hizmetleri, Özel Eğitim / BEP, RAM yönlendirme, RİBA ve ŞÖK süreçlerinde mevzuata uygun, yapıcı ve somut yanıtlar sunmak.

İLKELERİN:
- KVKK ve çocuk haklarına saygılı, etik, yapıcı ve net bir dil kullan.
- Kolay okunabilir Markdown madde imleri kullan; ilgili olduğunda https://onlinepdr.com, https://riba.onlinepdr.com veya https://risk.onlinepdr.com bağlantılarını paylaş.`,
  risk: `Sen Milli Eğitim Bakanlığı (MEB) mevzuatına ve ÖRGM standartlarına hakim akıllı yapay zeka asistanı PDRON'sun. Öğretmenlere ve PDR uzmanlarına risk faktörleri, ŞÖK tutanak kararları, BEP/RAM süreçleri ve sistem kullanımı hakkında yapıcı, KVKK uyumlu rehberlik sağlarsın.`,
};

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (
    origin === 'https://onlinepdr.com' ||
    origin === 'https://www.onlinepdr.com' ||
    origin === 'https://riba.onlinepdr.com' ||
    origin === 'https://risk.onlinepdr.com'
  ) {
    return true;
  }
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
    return true;
  }
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    return true;
  }
  return false;
}

function getCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin!;
  }
  return headers;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);

  try {
    const body = await req.json();
    const { message, history = [], customApiKey, siteContext } = body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Lütfen bir mesaj giriniz.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const trimmedMessage = message.trim().slice(0, 2000);
    const resolvedContext: AssistantSiteContext =
      siteContext === 'onlinepdr' || siteContext === 'risk' ? siteContext : 'riba';

    const apiKey =
      (typeof customApiKey === 'string' ? customApiKey.trim() : '') ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      '';

    if (apiKey) {
      try {
        const formattedContents: Array<{
          role: 'user' | 'model';
          parts: Array<{ text: string }>;
        }> = [];

        const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
        for (const msg of recentHistory) {
          if (msg && typeof msg.text === 'string' && msg.text.trim()) {
            formattedContents.push({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.text.slice(0, 2000) }],
            });
          }
        }

        formattedContents.push({
          role: 'user',
          parts: [{ text: trimmedMessage }],
        });

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
            apiKey
          )}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: formattedContents,
              systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTIONS[resolvedContext] }],
              },
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 1200,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const textReply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (textReply) {
            return NextResponse.json(
              {
                success: true,
                reply: textReply,
                source: 'ai',
                suggestions:
                  resolvedContext === 'onlinepdr'
                    ? [
                        'RİBA kademe kuralları nelerdir?',
                        'ŞÖK tutanağı görüşü örneği yaz',
                        'OnlinePDR araçları nelerdir?',
                      ]
                    : [
                        'ASP ve Özel Hedef seçimini açıkla',
                        'Bunu ŞÖK tutanağına uygun resmi dille özetle',
                        'Öğrenci ve veli linkleri nasıl paylaşılır?',
                      ],
              },
              { headers: corsHeaders }
            );
          }
        } else {
          console.warn('Gemini API hatası, yerel bilgi bankasına geçiliyor:', geminiRes.status);
        }
      } catch (aiErr) {
        console.warn('Gemini API bağlantı hatası, yerel bilgi bankasına geçiliyor:', aiErr);
      }
    }

    const localResult = findLocalAssistantAnswer(trimmedMessage, resolvedContext);
    return NextResponse.json(
      {
        success: true,
        reply: localResult.answer,
        title: localResult.title,
        suggestions: localResult.suggestions,
        source: 'knowledge_base',
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('PDRON asistan API hatası:', error);
    const fallback = findLocalAssistantAnswer('', 'riba');
    return NextResponse.json(
      {
        success: true,
        reply: fallback.answer,
        suggestions: fallback.suggestions,
        source: 'knowledge_base',
      },
      { headers: corsHeaders }
    );
  }
}
