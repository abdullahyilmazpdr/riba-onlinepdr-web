export type AssistantSiteContext = 'riba' | 'onlinepdr' | 'risk';

export interface AssistantFAQ {
  keywords: string[];
  title: string;
  category: 'riba' | 'sistem' | 'rehberlik' | 'sok' | 'onlinepdr';
  summary: string;
  answer: string;
  quickActions?: { label: string; prompt: string }[];
}

function normalizeAsciiTr(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, ' ')
    .trim();
}

export const RIBA_AND_MEB_FAQS: AssistantFAQ[] = [
  {
    category: 'riba',
    keywords: [
      'kademe',
      'okul turu',
      '1. sinif',
      '2. sinif',
      'anasinifi',
      'ogrenci formu yok',
      'ozel egitim uygulama',
      'ilkokul',
      'ortaokul',
      'lise',
    ],
    title: 'MEB RİBA Kademe Kuralları ve Öğrenci Formu Kuralı',
    summary: 'Okul Öncesi, İlkokul (1-2 vs 3-4), Ortaokul, Lise ve Özel Eğitim kuralları.',
    answer: `**MEB Resmi RİBA Uygulama Kuralları:**
• **Okul Öncesi / Anaokulu (27 Hedef):** Yalnızca **Veli (13 soru)** ve **Öğretmen (13 soru)** formları uygulanır; Öğrenci formu yoktur (%49 Veli / %51 Öğretmen).
• **İlkokul (38 Hedef):** **1. ve 2. sınıflara** yalnızca Veli ve Öğretmen formları uygulanır (**Öğrenci formu MEB kuralı gereği gizlenir**). **3. ve 4. sınıflara** Öğrenci (15) + Veli (13) + Öğretmen (16) uygulanır (Ağırlıklar: %27 Öğr / %36 Veli / %38 Öğrt).
• **Bünyesinde Anasınıfı Olan İlkokul:** Anasınıfı şubeleri için otomatik **Okul Öncesi**, 1–4. sınıflar için **İlkokul** çizelgesi üretilir.
• **Ortaokul & İHO (39 Hedef):** Öğrenci (18) + Veli (16) + Öğretmen (18) uygulanır (%39 / %28 / %33).
• **Lise / MTAL / İHL (40 Hedef):** Öğrenci (20) + Veli (19) + Öğretmen (19) uygulanır (%39 / %28 / %33).
• **Özel Eğitim Uygulama Okulları:** *I. Kademe -> İlkokul*, *II. Kademe -> Ortaokul*, *III. Kademe -> Lise* olarak algılanır; dilerseniz sınıf kartındaki açılır menüden her sınıfın RİBA düzeyini ayrıca değiştirebilirsiniz.`,
    quickActions: [
      { label: 'ASP & Özel Hedef Nasıl Seçilir?', prompt: 'RİBA ASP puanı nasıl hesaplanır ve Özel Hedef nasıl seçilir?' },
      { label: 'Kağıt Anket Nasıl Girilir?', prompt: 'Kağıt RİBA formu dolduranlar sisteme nasıl girilir?' },
    ],
  },
  {
    category: 'riba',
    keywords: [
      'asp',
      't puani',
      'agirlikli standart puan',
      'ozel hedef',
      'ram',
      'excel',
      'sonuc cizelgesi',
      'hesaplama',
    ],
    title: 'RİBA T Puanı, ASP Hesaplama ve Özel Hedef Seçimi',
    summary: 'Puanların hesaplanma mantığı, 2 Özel Hedef seçimi ve RAM Excel çıktısı.',
    answer: `**RİBA Puanlama ve Özel Hedef Süreci:**
• **T Puanı:** Her hedef alanı (Öğrenci / Veli / Öğretmen) ayrı ayrı ortalaması ve örneklem standart sapması üzerinden \`T = 50 + 10 * ((Puan - Ort) / SS)\` formülüyle hesaplanır.
• **ASP (Ağırlıklı Standart Puan):** Kademenin resmi MEB ağırlıkları kullanılarak T puanlarının ağırlıklı ortalaması alınır (örneğin 1.-2. sınıfta yalnızca Veli ve Öğretmen yanıtı varsa payda o iki ağırlığın toplamına bölünerek otomatik normalize edilir).
• **2 Özel Hedef Seçimi:** *Okul Sonuçları* sekmesinde ASP sıralamasına göre en yüksek ihtiyaç alanları üstte görünür. Buradan okulunuzun **2 adet Özel Hedefini** seçip kaydettiğinizde, indireceğiniz **RAM Excel Çizelgesine** otomatik işlenir.
• Genel, Yerel ve Özel Hedef rehberi için [onlinepdr.com/genel-yerel-ozel-hedef.html](https://onlinepdr.com/genel-yerel-ozel-hedef.html) sayfasını inceleyebilirsiniz.`,
    quickActions: [
      { label: 'Excel Çizelgesi Nasıl İndirilir?', prompt: 'Okul veya sınıf RİBA Excel çizelgesini nasıl alırım?' },
      { label: 'E-Okul PDF Yükleme', prompt: 'E-okuldan öğrenci listesi ve ders programı PDF nasıl yüklenir?' },
    ],
  },
  {
    category: 'riba',
    keywords: [
      'link',
      'veli linki',
      'ogrenci linki',
      'ogretmen linki',
      'ayri',
      'karisir mi',
      'kagit gir',
      'kagit anket',
      'form',
    ],
    title: 'Ayrı Anket Linkleri ve Kağıt Form Girişi (Kağıt Gir)',
    summary: 'Öğrenci, Veli ve Öğretmen linklerinin ayrımı ve kağıt formların sisteme işlenmesi.',
    answer: `**Anket Linkleri ve Kağıt Form Girişi:**
• **Tek Genel Öğretmen Linki:** MEB RİBA yönergesinde öğretmen formu şube bazlı değil okul/kademe bazlı uygulandığından öğretmenler için tek bir paylaşımlı **Mor Öğretmen Linki** üretilir.
• **Şubeye Özel Öğrenci & Veli Linkleri:** Her şubenin **Mavi Öğrenci Linki** ve **Yeşil Veli Linki** HMAC imzalı ayrı adreslere gider; böylece öğrencinin yanlışlıkla veli ya da başka sınıf anketi doldurması engellenir.
• **Kağıt Anket Girişi:** Anketi kâğıtta dolduran öğrenci veya veliler için her sınıf kartındaki **Kağıt Gir** butonunu (veya öğretmen panelindeki hızlı girişi) kullanarak seri şekilde \`A / B\` şıklarını işaretleyip kaydedebilirsiniz.`,
    quickActions: [
      { label: 'Ortak Şifre ile Öğretmen Girişi', prompt: 'Risk haritası şifreleriyle öğretmenler RİBAya nasıl girer?' },
      { label: 'E-Okul PDF Nasıl İndirilir?', prompt: 'E-okuldan öğrenci listesi nasıl indirilir?' },
    ],
  },
  {
    category: 'sistem',
    keywords: [
      'risk haritasi',
      'risk',
      'ortak giris',
      'sifre',
      'ogretmen girisi',
      'sso',
      'popup',
      'google drive',
      'e-tablo',
      'kvkk',
    ],
    title: 'Okul Risk Haritası Ortak Girişi, Google E-Tablo ve KVKK',
    summary: 'risk.onlinepdr.com şifrelerinin RİBAda kullanımı ve Drive veri güvenliği.',
    answer: `**Ortak Okul Altyapısı & Google Drive KVKK Mimarisi:**
• **Ortak Kurum & Öğretmen Girişi:** [risk.onlinepdr.com](https://risk.onlinepdr.com) Okul Risk Haritası sistemini kullanıyorsanız, aynı kurum adı ve öğretmen kullanıcı adı/şifreleri [riba.onlinepdr.com/teacher/login](https://riba.onlinepdr.com/teacher/login) üzerinde doğrudan geçerlidir; tek tıkla geçiş de yapabilirsiniz.
• **%100 KVKK Uyumlu Mimari:** RİBA sonuçlarınız ve kurulum ayarlarınız dış bir veritabanında değil, **doğrudan okulunuzun Google Drive E-Tablosundaki** \`RIBA_Ayarlar\` ve \`RIBA_Yanitlar\` sekmelerinde saklanır.
• **Popup Engeli (auth/popup-blocked):** Tarayıcı Google giriş penceresini engellerse sistem otomatik olarak yönlendirmeli Google girişine geçer.`,
    quickActions: [
      { label: 'E-Okul PDF Yükleme', prompt: 'E-okuldan öğrenci listesi ve ders programı nasıl alınır?' },
      { label: 'Sınıf Sonuçları Neden Anlık Güncellenir?', prompt: 'RİBA sınıf sonuçları nasıl hesaplanır?' },
    ],
  },
  {
    category: 'sistem',
    keywords: [
      'e-okul',
      'ogrenci listesi',
      'sube listesi',
      'ders programi',
      'pdf',
      'nereden indirilir',
      'nasil yuklenir',
    ],
    title: 'E-Okul Şube Listesi ve Öğretmen Ders Programı PDF Yükleme',
    summary: 'Okul kurulumunda şube ve öğretmen listesini otomatik çıkarma adımları.',
    answer: `**E-Okul Raporlarını Sisteme Yükleme:**
1. **Şube Listesi (Öğrenci No Sıralı):** E-Okul > *Öğrenci İşlemleri* > *Yazıcı (Raporlar)* > *Şube Listesi* raporunu **PDF** kaydedin.
2. **Öğretmen Ders Programı:** E-Okul > *Kurum İşlemleri* > *Ders İşlemleri* > *Ders Öğretmenleri / Öğretmen Ders Programları* raporunu **PDF** kaydedin.
3. Kurulum sihirbazına yüklediğinizde tüm şubeler, kademeler ve öğretmen hesapları otomatik tanınır. Eksik kalan şube veya özel eğitim sınıfını kurulumdan sonra **"Sınıf Ekle"** butonuyla da ekleyebilirsiniz.`,
    quickActions: [
      { label: 'Kademe Kuralları Nelerdir?', prompt: 'İlkokul, ortaokul ve lise RİBA kademe kuralları nelerdir?' },
    ],
  },
  {
    category: 'onlinepdr',
    keywords: [
      'onlinepdr',
      'bep',
      'akilli bep',
      'yerel hedef',
      'selamlasma',
      'kpss',
      'tercih robotu',
      'yok atlas',
      'kayit yasi',
      'envanter',
      'test',
      'sinif rehberlik plani',
    ],
    title: 'OnlinePDR Ücretsiz Eğitim & Rehberlik Araçları',
    summary: 'onlinepdr.com üzerindeki tüm rehberlik, BEP, planlama ve kariyer modülleri.',
    answer: `**OnlinePDR Platformundaki Temel Araçlar:**
• **RİBA Otomasyonu:** [riba.onlinepdr.com](https://riba.onlinepdr.com) ve [onlinepdr.com/riba](https://onlinepdr.com/riba/)
• **Okul Risk Haritası & ŞÖK:** [risk.onlinepdr.com](https://risk.onlinepdr.com) ve [onlinepdr.com/sinif-ve-okul-risk-haritasi.html](https://onlinepdr.com/sinif-ve-okul-risk-haritasi.html)
• **Akıllı BEP & Kaba Değerlendirme:** [onlinepdr.com/akillibep.html](https://onlinepdr.com/akillibep.html)
• **Genel, Yerel ve Özel Hedefler & Selamlaşma Hedefi:** [onlinepdr.com/genel-yerel-ozel-hedef.html](https://onlinepdr.com/genel-yerel-ozel-hedef.html) ve [onlinepdr.com/selamlasma-genel-hedefi.html](https://onlinepdr.com/selamlasma-genel-hedefi.html)
• **Sınıf Rehberlik Planı & Testler:** [onlinepdr.com/rehberlik.html](https://onlinepdr.com/rehberlik.html) ve [onlinepdr.com/test-anket-olcek.html](https://onlinepdr.com/test-anket-olcek.html)
• **YKS Tercih Robotu, YÖK Atlas & KPSS Araştırması:** [onlinepdr.com/tercih-robotu.html](https://onlinepdr.com/tercih-robotu.html) ve [onlinepdr.com/KPSS-Arastirmasi.html](https://onlinepdr.com/KPSS-Arastirmasi.html)`,
    quickActions: [
      { label: 'RİBA Sistemi Nasıl Çalışır?', prompt: 'RİBA Kademe Kuralları ve Öğrenci Formu Kuralı nedir?' },
      { label: 'ŞÖK Görüşü Örnekleri', prompt: 'ŞÖK tutanağı için örnek yapıcı görüşler ver' },
    ],
  },
  {
    category: 'rehberlik',
    keywords: [
      'akran zorbaligi',
      'zorbalik',
      'saldirgan',
      'magdur',
      'zorba',
      'siddet',
    ],
    title: 'Akran Zorbalığı (Mağdur ve Zorba Öğrenci) Müdahale Kılavuzu',
    summary: 'Sınıfta zorbalık tespiti, mağdurun güçlendirilmesi ve veli görüşmesi.',
    answer: `**Akran Zorbalığı Müdahale Adımları:**
1. **Olayı Normalleştirmeyin:** "Çocuklar arasında olur" yaklaşımı mağduru yalnızlaştırır.
2. **Mağdur Öğrenci İçin:** Güvende hissettirin, *"Bu senin suçun değil, yardım istemekle en doğrusunu yaptın"* mesajını verin ve güvenli akran gruplarıyla eşleştirin.
3. **Zorbalık Yapan Öğrenci İçin:** Seyirciler önünde değil, bire bir sakin ortamda görüşün; davranışın sonucunu somutlaştırıp öfke/empati çalışması için rehberlik servisine yönlendirin.
4. **Velilerle Görüşme:** İki tarafın velisini asla aynı anda yüz yüze getirmeyin; ayrı ayrı resmi bilgilendirme yapın.`,
    quickActions: [
      { label: 'Zorbalık İçin ŞÖK Görüşü', prompt: 'Akran zorbalığı için ŞÖK toplantı kararı örneği yazar mısın?' },
    ],
  },
  {
    category: 'rehberlik',
    keywords: [
      'parcalanmis aile',
      'bosanmis',
      'anne baba',
      'vefat',
      'yetim',
      'oksuz',
      'devamsizlik',
      'okul terk',
    ],
    title: 'Hassas Durumdaki Öğrenciler ve Devamsızlık Önleme',
    summary: 'Parçalanmış aile, kayıp/yas ve kronik devamsızlık için pedagojik yaklaşım.',
    answer: `**Pedagojik Yaklaşım ve Devamsızlık Takibi:**
• **Etiketlemeyin:** Sınıf içinde öğrencinin ailevi durumunu kesinlikle açık etmeyin; özel gün etkinliklerinde kapsayıcı alternatifler sunun.
• **Erken Devamsızlık Takibi:** Özürsüz devamsızlık 5 günü aştığında veli ile telefon/yüz yüze iletişim kurun; nedenin akran zorbalığı, akademik kaygı veya ailevi ekonomik sorun olup olmadığını analiz edin.
• **Ev Ziyareti & Rehberlik:** Kronik devamsızlıkta rehber öğretmen ve sınıf rehber öğretmeni eşliğinde veli ziyareti ve bireysel destek planı uygulayın.`,
    quickActions: [
      { label: 'Devamsızlık ŞÖK Kararı', prompt: 'Devamsız öğrenci için ŞÖK görüşü yazar mısın?' },
    ],
  },
  {
    category: 'sok',
    keywords: ['sok', 'gorus', 'karar', 'tutanak', 'sube ogretmenler kurulu'],
    title: 'ŞÖK Toplantı Tutanakları İçin Yapıcı MEB Görüş Şablonları',
    summary: 'Akademik başarısızlık, devamsızlık, BEP ve davranış için ŞÖK kararları.',
    answer: `**ŞÖK Tutanağına Doğrudan Eklenebilecek Görüş Örnekleri:**
• **Akademik Destek:** *"Öğrencinin ders içi aktif katılımının teşvik edilmesine, temel kazanım eksikliklerinin DYK/bireysel pekiştirme çalışmalarıyla desteklenmesine ve velisiyle haftalık çalışma planı takip edilmesine karar verilmiştir."*
• **Devamsızlık Takibi:** *"Devamsızlık nedenlerinin veli iş birliğiyle araştırılmasına, yasal bilgilendirmelerin zamanında yapılmasına ve rehberlik servisince okula uyum takibinin sürdürülmesine karar verilmiştir."*
• **Özel Eğitim / BEP:** *"Öğrencinin bireysel gelişim hızına uygun BEP hedefleri doğrultusunda ders içi etkinlik ve ölçme-değerlendirme uyarlamalarının yapılmasına karar verilmiştir."*
• **Sosyal Uyum / Zorbalık:** *"Akran iletişimi ve öfke düzenleme becerilerini güçlendirmek amacıyla rehberlik servisince bireysel/grup rehberliği uygulanmasına karar verilmiştir."*`,
    quickActions: [
      { label: 'RİBA Özel Hedefler', prompt: 'RİBA ASP puanı nasıl hesaplanır ve Özel Hedef nasıl seçilir?' },
    ],
  },
];

export function findLocalAssistantAnswer(
  userQuery: string,
  siteContext: AssistantSiteContext = 'riba'
): {
  answer: string;
  title?: string;
  suggestions?: string[];
  matchedCategory?: string;
} {
  const normalized = normalizeAsciiTr(userQuery);

  let bestScore = 0;
  let bestMatch: AssistantFAQ | null = null;

  for (const faq of RIBA_AND_MEB_FAQS) {
    let score = 0;
    for (const kw of faq.keywords) {
      const kwNorm = normalizeAsciiTr(kw);
      if (normalized.includes(kwNorm)) {
        score += 2;
      }
    }
    if (normalized.includes(normalizeAsciiTr(faq.title))) {
      score += 4;
    }
    if (faq.category === siteContext && score > 0) {
      score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return {
      title: bestMatch.title,
      answer: bestMatch.answer,
      matchedCategory: bestMatch.category,
      suggestions: bestMatch.quickActions?.map((a) => a.prompt) || [
        'RİBA Kademe Kuralları nelerdir?',
        'ŞÖK görüşü örneği ver',
        'OnlinePDR araçları nelerdir?',
      ],
    };
  }

  if (siteContext === 'onlinepdr') {
    return {
      title: 'PDRON - OnlinePDR & MEB Rehberlik Asistanı',
      answer: `Merhabalar, ben **PDRON**! **OnlinePDR** platformundaki araçlar (RİBA, Okul Risk Haritası, Akıllı BEP, Genel/Yerel/Özel Hedefler, KPSS & YKS Tercih Robotu) ve **MEB Rehberlik mevzuatı** konusunda 7/24 yanınızdayım.

Bana şunları sorabilirsiniz:
• *"RİBA kademe kuralları ve ASP hesaplama nasıl çalışır?"*
• *"Okul Risk Haritası ve ŞÖK görüşü nasıl hazırlanır?"*
• *"Özel Eğitim / Akıllı BEP süreci nasıl işler?"*
• *"Akran zorbalığı veya devamsızlık durumunda sınıfta ne yapılmalı?"*`,
      suggestions: [
        'OnlinePDR araçları nelerdir?',
        'RİBA Kademe Kuralları nelerdir?',
        'ŞÖK için örnek yapıcı görüşler ver',
        'Akran zorbalığı durumunda ne yapılmalı?',
      ],
    };
  }

  return {
    title: 'PDRON - RİBA & MEB Rehberlik Asistanı',
    answer: `Merhabalar, ben **PDRON**! Hem **MEB RİBA Otomasyonu** (kademe kuralları, T-puanı/ASP hesaplama, Özel Hedef seçimi, E-Okul PDF yükleme, Risk Haritası ortak giriş) hem de **Rehberlik, Özel Eğitim & ŞÖK süreçlerinde** 7/24 yardımcı olmak için buradayım.

Bana doğrudan şunları sorabilirsiniz:
• *"İlkokul 1. ve 2. sınıfta neden Öğrenci formu çıkmıyor?"*
• *"RİBA ASP puanı nasıl hesaplanır ve 2 Özel Hedef nasıl seçilir?"*
• *"Özel Eğitim III. Kademe sınıflarının düzeyi nasıl ayarlanır?"*
• *"Akran zorbalığı veya devamsızlık için ŞÖK kararı yazar mısın?"*`,
    suggestions: [
      'RİBA Kademe Kuralları nelerdir?',
      'RİBA ASP puanı ve Özel Hedef seçimi',
      'E-Okul PDF yükleme adımları',
      'ŞÖK için örnek yapıcı görüşler ver',
    ],
  };
}
