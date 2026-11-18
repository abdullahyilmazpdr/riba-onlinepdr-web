// AUTO-GENERATED & VERIFIED FROM OFFICIAL MEB RİBA PDFs & EXCEL WORKBOOKS
// Do NOT hand-edit questions, option texts, or target weights without regenerating from source documents.

export type RibaLevel = 'okuloncesi' | 'ilkokul' | 'ortaokul' | 'lise';
export type RibaRole = 'ogrenci' | 'veli' | 'ogretmen';

export interface RibaOption {
  text: string;
  targetId: number;
}

export interface RibaQuestion {
  q: number;
  A: RibaOption;
  B: RibaOption;
}

export interface RibaFormSpec {
  questionCount: number;
  questions: RibaQuestion[];
}

export interface RibaTarget {
  id: number;
  title: string;
}

export interface RibaLevelSpec {
  id: RibaLevel;
  name: string;
  roles: RibaRole[];
  weights: {
    ogrenci: number;
    veli: number;
    ogretmen: number;
  };
  studentEligibility: 'none' | 'grade_3_4_only' | 'all_grades';
  targetCount: number;
  targets: RibaTarget[];
  forms: Partial<Record<RibaRole, RibaFormSpec>>;
}

export const RIBA_LEVELS: Record<RibaLevel, RibaLevelSpec> = {
  "okuloncesi": {
    "id": "okuloncesi",
    "name": "Okul Öncesi",
    "roles": [
      "veli",
      "ogretmen"
    ],
    "weights": {
      "ogrenci": 0,
      "veli": 0.49,
      "ogretmen": 0.51
    },
    "studentEligibility": "none",
    "targetCount": 27,
    "targets": [
      {
        "id": 1,
        "title": "İş birliği geliştirme"
      },
      {
        "id": 2,
        "title": "Problem çözme becerileri"
      },
      {
        "id": 3,
        "title": "Yaşam becerileri"
      },
      {
        "id": 4,
        "title": "Otokontrol"
      },
      {
        "id": 5,
        "title": "Öfke yönetimi"
      },
      {
        "id": 6,
        "title": "Okula ve Çevreye Uyum/Okul kuralları"
      },
      {
        "id": 7,
        "title": "Sosyal beceriler"
      },
      {
        "id": 8,
        "title": "Özsaygı geliştirme"
      },
      {
        "id": 9,
        "title": "Özgüven geliştirme"
      },
      {
        "id": 10,
        "title": "Öz disiplin geliştirme"
      },
      {
        "id": 11,
        "title": "Duygu farkındalığı/Duygu düzenleme"
      },
      {
        "id": 12,
        "title": "Yaratıcılık"
      },
      {
        "id": 13,
        "title": "Rehberlik ve Psikolojik Danışma servisinin tanıtılması"
      },
      {
        "id": 14,
        "title": "İletişim becerileri"
      },
      {
        "id": 15,
        "title": "Sosyal beceriler"
      },
      {
        "id": 16,
        "title": "Karar verme becerisi"
      },
      {
        "id": 17,
        "title": "Zaman yönetimi"
      },
      {
        "id": 18,
        "title": "Kariyer gelişimi"
      },
      {
        "id": 19,
        "title": "Yardım arama"
      },
      {
        "id": 20,
        "title": "İletişim becerileri"
      },
      {
        "id": 21,
        "title": "Sınır koyma"
      },
      {
        "id": 22,
        "title": "Bireysel farklılıklara saygı"
      },
      {
        "id": 23,
        "title": "Sağlıklı yaşam"
      },
      {
        "id": 24,
        "title": "İhmal ve istismardan korunma"
      },
      {
        "id": 25,
        "title": "Dikkat geliştirme çalışmaları"
      },
      {
        "id": 26,
        "title": "Bilinçli Teknoloji Kullanımı"
      },
      {
        "id": 27,
        "title": "Okul olgunluğu"
      }
    ],
    "forms": {
      "veli": {
        "questionCount": 13,
        "questions": [
          {
            "q": 1,
            "A": {
              "text": "Arkadaşlarıyla iş birliği yaparak ve paylaşarak oynamayı öğrenme",
              "targetId": 1
            },
            "B": {
              "text": "Sorunlarını nasıl çözebileceğini öğrenme (ör., çözüm yolları üretme, yardım isteme)",
              "targetId": 2
            }
          },
          {
            "q": 2,
            "A": {
              "text": "Tehlikeli olabilecek durumlarda (ör., bahçede koşma, yüksekten atlama, sivri cisimler kullanma) dikkatli davranmayı öğrenme",
              "targetId": 3
            },
            "B": {
              "text": "İrade geliştirmeyle ilgili temel düzeyde beceriler kazanma (Ör., Bir oyuncak satın almak için para biriktirmek)",
              "targetId": 4
            }
          },
          {
            "q": 3,
            "A": {
              "text": "Öfkesini kontrol etmeyi öğrenme",
              "targetId": 5
            },
            "B": {
              "text": "Sınıf kuralları hakkında bilgilenme",
              "targetId": 6
            }
          },
          {
            "q": 4,
            "A": {
              "text": "İncitici bir davranışla (kötü söz söyleme, alay etme, vurma vb.) karşılaştığında ne yapması gerektiğini öğrenme",
              "targetId": 7
            },
            "B": {
              "text": "Kişisel özellikleriyle değerli bir birey olduğunu hissetme",
              "targetId": 8
            }
          },
          {
            "q": 5,
            "A": {
              "text": "Özgüven kazanma konusunda desteklenme (ör., kararlarını bağımsız verme, yalnızken bile kendini güvende hissetme)",
              "targetId": 9
            },
            "B": {
              "text": "Başkaları hatırlatmadan sorumluluklarını yerine getirebilme becerisi kazanma (ör., oyuncaklarını toplama, tabağını masadan kaldırma)",
              "targetId": 10
            }
          },
          {
            "q": 6,
            "A": {
              "text": "Duygularını (ör., mutluluk, üzüntü, korku ve şaşkınlık) tanıma",
              "targetId": 11
            },
            "B": {
              "text": "Blok, oyun hamuru gibi materyaller ile yaratıcılıklarını kullanarak kendini ifade etme",
              "targetId": 12
            }
          },
          {
            "q": 7,
            "A": {
              "text": "Rehber öğretmeni/psikolojik danışmanı tanıma ve ondan hangi konularda yardım alacaklarını öğrenme",
              "targetId": 13
            },
            "B": {
              "text": "İletişim becerileri kazanma (ör., söz kesmeden dinlemek, soru sorma ve uyarıları dikkate alma)",
              "targetId": 14
            }
          },
          {
            "q": 8,
            "A": {
              "text": "Arkadaş edinme ve arkadaşlarıyla iyi geçinme (ör., kavga etmeden oyun oynama, oyuncaklarını paylaşma)",
              "targetId": 15
            },
            "B": {
              "text": "Karar vermeyle ilgili temel düzeyde beceriler kazanma (ör., verilen seçenekler arasından uygun olanı seçme)",
              "targetId": 16
            }
          },
          {
            "q": 9,
            "A": {
              "text": "Zamanı planlamayı öğrenme (ör., uyuma, dinlenme, oyun oynama süresi)",
              "targetId": 17
            },
            "B": {
              "text": "Mesleklerin toplumdaki önemini fark etme ve olumlu tutum geliştirme (Ör., itfaiyeci hayat kurtarmaktadır.)",
              "targetId": 18
            }
          },
          {
            "q": 10,
            "A": {
              "text": "İhtiyacı olduğunda doğru kişilerden yardım isteme (ör., incitici bir davranışla karşılaştığında öğretmeninden yardım isteme)",
              "targetId": 19
            },
            "B": {
              "text": "Duygu ve düşüncelerini ifade etme",
              "targetId": 20
            }
          },
          {
            "q": 11,
            "A": {
              "text": "“HAYIR!” diyebilmeyi öğrenme (ör., bir şey yapmak istemediğinde ya da tehlikeli durumlardan kaçınması gerektiğinde)",
              "targetId": 21
            },
            "B": {
              "text": "Bireysel farklılıklara (karşı cins, özel gereksinimli birey ve göçmenler) saygılı davranmayı öğrenme",
              "targetId": 22
            }
          },
          {
            "q": 12,
            "A": {
              "text": "Sağlıklı yaşam, kişisel bakım ve hijyen konusunda bilgilenme (ör., sağlıklı beslenme, ellerini yıkama)",
              "targetId": 23
            },
            "B": {
              "text": "İstismardan korunmayı öğrenme",
              "targetId": 24
            }
          },
          {
            "q": 13,
            "A": {
              "text": "Dikkatini odaklama ve sürdürme becerileri kazanma",
              "targetId": 25
            },
            "B": {
              "text": "Tablet, televizyon ve telefonu kullanırken ailenin belirlediği içeriklere ve kullanım süresine uyma",
              "targetId": 26
            }
          }
        ]
      },
      "ogretmen": {
        "questionCount": 13,
        "questions": [
          {
            "q": 1,
            "A": {
              "text": "Arkadaşlarıyla iş birliği yaparak ve paylaşarak oynamayı öğrenme",
              "targetId": 1
            },
            "B": {
              "text": "Problem çözme becerilerini öğrenme",
              "targetId": 2
            }
          },
          {
            "q": 2,
            "A": {
              "text": "Okulda fiziksel güvenliklerini sağlayacak davranışlar kazanma",
              "targetId": 3
            },
            "B": {
              "text": "İrade geliştirmeyle ilgili temel düzeyde beceriler kazanma (Ör., Bir oyuncak satın almak için para biriktirmek)",
              "targetId": 4
            }
          },
          {
            "q": 3,
            "A": {
              "text": "Öfke kontrolüyle ilgili temel düzeyde beceriler kazanma",
              "targetId": 5
            },
            "B": {
              "text": "Okul ve sınıf kuralları hakkında bilgilenme",
              "targetId": 6
            }
          },
          {
            "q": 4,
            "A": {
              "text": "İncitici bir davranışla (kötü söz söyleme, alay etme, vurma vb.) karşılaştığında ne yapması gerektiğini öğrenme",
              "targetId": 7
            },
            "B": {
              "text": "Kendilerine özgü özellikleriyle değerli bireyler olduklarını hissetme",
              "targetId": 8
            }
          },
          {
            "q": 5,
            "A": {
              "text": "Özgüven kazanma konusunda desteklenme",
              "targetId": 9
            },
            "B": {
              "text": "Başkaları hatırlatmadan sorumluluklarını yerine getirebilme becerisi kazanma (ör., oyuncaklarını toplama, tabağını masadan kaldırma)",
              "targetId": 10
            }
          },
          {
            "q": 6,
            "A": {
              "text": "Duygularını (ör., mutluluk, üzüntü, korku ve şaşkınlık) tanıma",
              "targetId": 11
            },
            "B": {
              "text": "Blok, oyun hamuru gibi materyaller ile yaratıcılıklarını kullanarak kendini ifade etme",
              "targetId": 12
            }
          },
          {
            "q": 7,
            "A": {
              "text": "Rehber öğretmeni/psikolojik danışmanı tanıma ve ondan hangi konularda yardım alacaklarını öğrenme",
              "targetId": 13
            },
            "B": {
              "text": "İletişim becerileri kazanma (ör., söz kesmeden dinlemek, soru sorma ve yönergeleri takip etme)",
              "targetId": 14
            }
          },
          {
            "q": 8,
            "A": {
              "text": "Arkadaş edinme ve arkadaşlarıyla iyi geçinme",
              "targetId": 15
            },
            "B": {
              "text": "Karar vermeyle ilgili temel düzeyde beceriler kazanma",
              "targetId": 16
            }
          },
          {
            "q": 9,
            "A": {
              "text": "Zamanı planlamayı öğrenme",
              "targetId": 17
            },
            "B": {
              "text": "Mesleklerin toplumdaki önemini fark etme ve olumlu tutum geliştirme",
              "targetId": 18
            }
          },
          {
            "q": 10,
            "A": {
              "text": "Yardım arama becerilerini geliştirme (ör., nereden ve kimden yardım isteyeceğini bilme)",
              "targetId": 19
            },
            "B": {
              "text": "Duygu ve düşüncelerini ifade etme",
              "targetId": 20
            }
          },
          {
            "q": 11,
            "A": {
              "text": "İlişkilerinde kişisel sınırlarını koruma (ör., “HAYIR!” deme becerisi)",
              "targetId": 21
            },
            "B": {
              "text": "Bireysel farklılıklara (ör., karşı cinsiyet, engelli öğrenci ve göçmenler) saygılı davranmayı öğrenme",
              "targetId": 22
            }
          },
          {
            "q": 12,
            "A": {
              "text": "Sağlıklı yaşam, kişisel bakım ve hijyen konusunda bilgilenme",
              "targetId": 23
            },
            "B": {
              "text": "İstismardan korunmayı öğrenme",
              "targetId": 24
            }
          },
          {
            "q": 13,
            "A": {
              "text": "Dikkatini odaklama ve sürdürme becerileri kazanma",
              "targetId": 25
            },
            "B": {
              "text": "Okuryazarlığa hazırlık çalışmalarında hazırbulunuşluklarını destekleme",
              "targetId": 27
            }
          }
        ]
      }
    }
  },
  "ilkokul": {
    "id": "ilkokul",
    "name": "İlkokul",
    "roles": [
      "ogrenci",
      "veli",
      "ogretmen"
    ],
    "weights": {
      "ogrenci": 0.27,
      "veli": 0.36,
      "ogretmen": 0.38
    },
    "studentEligibility": "grade_3_4_only",
    "targetCount": 38,
    "targets": [
      {
        "id": 1,
        "title": "Özgüven Geliştirme"
      },
      {
        "id": 2,
        "title": "Okula ve Çevreye Uyum/Okul Kuralları"
      },
      {
        "id": 3,
        "title": "Hedef Belirleme"
      },
      {
        "id": 4,
        "title": "Meslek ile İlgi, Değer, Yetenek ve Kişisel Özellik İlişkisi"
      },
      {
        "id": 5,
        "title": "Çatışma Çözme Becerileri"
      },
      {
        "id": 6,
        "title": "Öz Disiplin Geliştirme"
      },
      {
        "id": 7,
        "title": "Karar Verme Becerisi"
      },
      {
        "id": 8,
        "title": "Öz Disiplin Geliştirme"
      },
      {
        "id": 9,
        "title": "Çatışma Çözme Becerileri"
      },
      {
        "id": 10,
        "title": "Aile İçi İletişim"
      },
      {
        "id": 11,
        "title": "Problem Çözme Becerileri"
      },
      {
        "id": 12,
        "title": "Rehberlik ve Psikolojik Danışma Servisinin Tanıtılması"
      },
      {
        "id": 13,
        "title": "Sosyal Beceriler"
      },
      {
        "id": 14,
        "title": "İş Birliği Geliştirme"
      },
      {
        "id": 15,
        "title": "Meslek Tanıtımı"
      },
      {
        "id": 16,
        "title": "Bireysel Farklılıklara Saygı"
      },
      {
        "id": 17,
        "title": "Yaşam Becerileri"
      },
      {
        "id": 18,
        "title": "Dikkat Geliştirme Çalışmaları"
      },
      {
        "id": 19,
        "title": "Öz Düzenlemeli Öğrenme"
      },
      {
        "id": 20,
        "title": "Üst Öğrenim Kurumlarının Tanıtılması"
      },
      {
        "id": 21,
        "title": "Motivasyon/Devamsızlığı Önleme"
      },
      {
        "id": 22,
        "title": "Duygu Farkındalığı/Duygu Düzenleme"
      },
      {
        "id": 23,
        "title": "Okul ve Çevresindeki Sosyokültürel İmkanlar"
      },
      {
        "id": 24,
        "title": "Bilinçli Teknoloji Kullanımı"
      },
      {
        "id": 25,
        "title": "İletişim Becerileri"
      },
      {
        "id": 26,
        "title": "Akran Zorbalığı"
      },
      {
        "id": 27,
        "title": "Hak ve Sorumluluklarını Bilme"
      },
      {
        "id": 28,
        "title": "Meslek ile İlgi, Değer, Yetenek ve Kişisel Özellik İlişkisi"
      },
      {
        "id": 29,
        "title": "Okul ve Çevresindeki Sosyokültürel İmkanlar"
      },
      {
        "id": 30,
        "title": "Verimli Ders Çalışma Teknikleri"
      },
      {
        "id": 31,
        "title": "Sağlıklı Yaşam"
      },
      {
        "id": 32,
        "title": "İhmal ve İstismardan Korunma"
      },
      {
        "id": 33,
        "title": "Sosyal Beceriler"
      },
      {
        "id": 34,
        "title": "Akademik Öz Yeterlik"
      },
      {
        "id": 35,
        "title": "Sınır Koyma"
      },
      {
        "id": 36,
        "title": "Meslek Sahibi Olmanın Önemi"
      },
      {
        "id": 37,
        "title": "Zaman Yönetimi"
      },
      {
        "id": 38,
        "title": "Yardım Arama"
      }
    ],
    "forms": {
      "ogrenci": {
        "questionCount": 15,
        "questions": [
          {
            "q": 1,
            "A": {
              "text": "Çevremdeki insanların mesleklerini öğrenmek (ör., Hastanede doktor ve hemşireler çalışır.)",
              "targetId": 15
            },
            "B": {
              "text": "Okul kurallarını öğrenmek",
              "targetId": 2
            }
          },
          {
            "q": 2,
            "A": {
              "text": "Gelecekte başarılı olmak için kendime uygun hedefler belirlemek (ör., Başarılı bir sporcu olmak isteyen bir öğrenci her gün antrenman yapar.)",
              "targetId": 3
            },
            "B": {
              "text": "Severek yapabileceğim şeyleri öğrenmek (ör., Bir öğrenci sesi güzel olsun ya da olmasın şarkı söylemeyi sevebilir. Bu öğrencinin müziğe ilgisi vardır denir.)",
              "targetId": 4
            }
          },
          {
            "q": 3,
            "A": {
              "text": "Bilgisayar, cep telefonu, tablet veya televizyonu kullanırken yaşıma uygun içerik seçmek ve kullanım süresini belirlemek",
              "targetId": 24
            },
            "B": {
              "text": "Başkaları hatırlatmadan sorumluluklarımı yerine getirmek (ör., ödevlerimi tamamlamak; odamı, eşyalarımı düzenlemek, temiz tutmak vb.)",
              "targetId": 6
            }
          },
          {
            "q": 4,
            "A": {
              "text": "Okulda, evde ve arkadaşlık ilişkilerimde doğru kararlar almak",
              "targetId": 7
            },
            "B": {
              "text": "Bedenimi korumayı öğrenmek (ör., Başkalarının bedenime izinsiz dokunmasına izin vermemek)",
              "targetId": 32
            }
          },
          {
            "q": 5,
            "A": {
              "text": "Sorunlarımı nasıl çözebileceğimi öğrenmek",
              "targetId": 11
            },
            "B": {
              "text": "Rehber öğretmen/psikolojik danışmandan hangi konularda yardım alabileceğimi öğrenmek",
              "targetId": 12
            }
          },
          {
            "q": 6,
            "A": {
              "text": "Yeni arkadaşlar edinmek ve arkadaşlarımla iyi geçinmeyi öğrenmek",
              "targetId": 13
            },
            "B": {
              "text": "Oyun oynarken, ödev yaparken arkadaşlarımla yardımlaşmayı öğrenmek",
              "targetId": 14
            }
          },
          {
            "q": 7,
            "A": {
              "text": "Tehlikeli olabilecek durumlarda dikkatli davranmayı öğrenmek (ör., Bu tehlikeli durumlar merdivenden dikkatsizce inip çıkmak, koridorda koşmak olabilir)",
              "targetId": 17
            },
            "B": {
              "text": "Ders çalıştığım sırada silgiyle oynama, resim çizme gibi dikkatimi dağıtan davranışlardan uzak durmayı öğrenmek",
              "targetId": 18
            }
          },
          {
            "q": 8,
            "A": {
              "text": "Ders çalışma ortamımı (odamı, masamı) nasıl düzenleyeceğimi bilmek",
              "targetId": 19
            },
            "B": {
              "text": "Hangi ortaokullara gidebileceğimi öğrenmek",
              "targetId": 20
            }
          },
          {
            "q": 9,
            "A": {
              "text": "Okula her gün mutlu bir şekilde gelme isteğimi artırmak",
              "targetId": 21
            },
            "B": {
              "text": "Yaşadığım duyguları tanımak (ör., sevdiğim oyuncağı kaybettiğimde üzülmek, lunaparka gidince mutlu olmak)",
              "targetId": 22
            }
          },
          {
            "q": 10,
            "A": {
              "text": "Duygularımı ve isteklerimi saygılı bir şekilde karşımdakine iletmek",
              "targetId": 25
            },
            "B": {
              "text": "Zorbalıkla karşılaştığımda (ör., kötü söz söyleme, vurma) ne yapmam gerektiğini öğrenmek",
              "targetId": 26
            }
          },
          {
            "q": 11,
            "A": {
              "text": "Bir çocuk olarak hak ve sorumluluklarımı öğrenmek",
              "targetId": 27
            },
            "B": {
              "text": "Kolay öğrendiğim, başkalarından daha iyi yapabildiğim şeyleri öğrenmek (Bir öğrenci zor matematik sorularını hızlı ve doğru çözüyorsa matematiğe yeteneği var demektir. Çok hızlı koşuyorsa, spora yeteneği vardır.)",
              "targetId": 28
            }
          },
          {
            "q": 12,
            "A": {
              "text": "Okuldaki kurslar, kulüpler (ör., spor, satranç, tiyatro) ve yarışmalar gibi etkinlikler hakkında bilgilenmek",
              "targetId": 29
            },
            "B": {
              "text": "Nasıl ders çalışmam gerektiğini öğrenmek",
              "targetId": 30
            }
          },
          {
            "q": 13,
            "A": {
              "text": "Başkalarının ne hissettiklerini ve ne düşündüklerini anlamak",
              "targetId": 33
            },
            "B": {
              "text": "Derslerde zorlandığımda bile başarılı olacağıma inanmak",
              "targetId": 34
            }
          },
          {
            "q": 14,
            "A": {
              "text": "“HAYIR!” diyebilmeyi öğrenmek (ör., bir şey yapmak istemediğimde ya da tehlikeli durumlardan kaçınmam gerektiğinde)",
              "targetId": 35
            },
            "B": {
              "text": "Bir mesleğe sahip olmanın önemini anlamak (ör., Bir mesleğim olursa para kazanırım.)",
              "targetId": 36
            }
          },
          {
            "q": 15,
            "A": {
              "text": "Ders çalışmak ve oyun oynamak için zamanı planlamayı öğrenmek",
              "targetId": 37
            },
            "B": {
              "text": "Zorlandığım konularda doğru kişilerden yardım istemek (ör., zorbalığa uğradığımda bir yetişkinden yardım istemek; dersi anlamadığımda öğretmenden yardım istemek)",
              "targetId": 38
            }
          }
        ]
      },
      "veli": {
        "questionCount": 13,
        "questions": [
          {
            "q": 1,
            "A": {
              "text": "Özgüvenini geliştirme",
              "targetId": 1
            },
            "B": {
              "text": "Sağlıklı yaşam becerilerini (spor yapmak, sağlıklı beslenmek gibi) kazanma",
              "targetId": 31
            }
          },
          {
            "q": 2,
            "A": {
              "text": "Başarılı olmak için hedefler belirleme",
              "targetId": 3
            },
            "B": {
              "text": "İlgilerini (kodlama, spor, resim, müzik gibi) keşfetme",
              "targetId": 4
            }
          },
          {
            "q": 3,
            "A": {
              "text": "Hem ilişkilerini hem de haklarını koruyacak şekilde çatışmalarını çözmeyi öğrenme",
              "targetId": 5
            },
            "B": {
              "text": "Sorumluluklarının (ör., ödevlerini tamamlama, odasını, eşyalarını düzenleme ve temiz tutma) bilincinde olma",
              "targetId": 6
            }
          },
          {
            "q": 4,
            "A": {
              "text": "Rehber öğretmen/psikolojik danışmandan hangi konularda yardım alabileceğini öğrenme",
              "targetId": 12
            },
            "B": {
              "text": "Aile üyeleriyle iletişimini güçlendirme",
              "targetId": 10
            }
          },
          {
            "q": 5,
            "A": {
              "text": "Arkadaş edinme ve arkadaşlık ilişkilerini sürdürme",
              "targetId": 13
            },
            "B": {
              "text": "Okula devam etme isteğini arttırma",
              "targetId": 21
            }
          },
          {
            "q": 6,
            "A": {
              "text": "Tehlikeli olabilecek durumlarda (merdivenden inip çıkarken ya da koridorda koşma, servis kurallarına uyma gibi) dikkatli davranma",
              "targetId": 17
            },
            "B": {
              "text": "Ders çalıştığı sırada silgiyle oynama, resim çizme gibi dikkatini dağıtan davranışlardan uzak durmayı öğrenme",
              "targetId": 18
            }
          },
          {
            "q": 7,
            "A": {
              "text": "Ders çalışma ortamını (odasını, masasını) nasıl düzenleyeceğini öğrenme",
              "targetId": 19
            },
            "B": {
              "text": "Ortaokullar hakkında bilgi edinme",
              "targetId": 20
            }
          },
          {
            "q": 8,
            "A": {
              "text": "Duygularını ve isteklerini saygılı bir şekilde ifade etme",
              "targetId": 25
            },
            "B": {
              "text": "Zorbalıkla karşılaştığında (ör., kötü söz söyleme, vurma) ne yapması gerektiğini bilme",
              "targetId": 26
            }
          },
          {
            "q": 9,
            "A": {
              "text": "Bilgisayar, cep telefonu, tablet veya televizyonu kullanırken uygun içerik seçme ve kullanma süresini belirleme",
              "targetId": 24
            },
            "B": {
              "text": "Yeteneklerini (neleri iyi yapabildiğini) tanıma",
              "targetId": 28
            }
          },
          {
            "q": 10,
            "A": {
              "text": "Okuldaki kulüpler (spor, satranç, tiyatro vb.) ve yarışmalar gibi etkinlikler hakkında bilgilenme",
              "targetId": 29
            },
            "B": {
              "text": "Verimli ders çalışmayı öğrenme",
              "targetId": 30
            }
          },
          {
            "q": 11,
            "A": {
              "text": "İstismardan korunmayı öğrenme",
              "targetId": 32
            },
            "B": {
              "text": "Derslerde zorlandığında bile çalışarak başarılı olacağına inanma",
              "targetId": 34
            }
          },
          {
            "q": 12,
            "A": {
              "text": "Kendini korumak için “HAYIR” diyebilmeyi öğrenme",
              "targetId": 35
            },
            "B": {
              "text": "Meslek edinmenin önemini anlama",
              "targetId": 36
            }
          },
          {
            "q": 13,
            "A": {
              "text": "Ders çalışmak ve oyun oynamak için zamanını planlama",
              "targetId": 37
            },
            "B": {
              "text": "Zorlandığı konularda doğru kişilerden yardım isteme (ör., zorbalığa uğradığında bir yetişkinden yardım isteme; dersi anlamadığında öğretmeninden yardım isteme)",
              "targetId": 38
            }
          }
        ]
      },
      "ogretmen": {
        "questionCount": 16,
        "questions": [
          {
            "q": 1,
            "A": {
              "text": "Özgüvenlerini geliştirme",
              "targetId": 1
            },
            "B": {
              "text": "Okul kurallarını öğrenme",
              "targetId": 2
            }
          },
          {
            "q": 2,
            "A": {
              "text": "Akademik hedefler belirleme",
              "targetId": 3
            },
            "B": {
              "text": "İlgilerini (kodlama, spor, resim, müzik gibi) keşfetme",
              "targetId": 4
            }
          },
          {
            "q": 3,
            "A": {
              "text": "Çatışma çözme becerilerini geliştirme",
              "targetId": 9
            },
            "B": {
              "text": "Sorumluluklarının (ör., ödevlerini tamamlaması ve materyalleri unutmaması) bilincinde olma",
              "targetId": 6
            }
          },
          {
            "q": 4,
            "A": {
              "text": "Karar alma becerilerini geliştirme",
              "targetId": 7
            },
            "B": {
              "text": "Davranışlarının sorumluluğunu alma",
              "targetId": 8
            }
          },
          {
            "q": 5,
            "A": {
              "text": "Sorun çözme becerilerini öğrenme",
              "targetId": 11
            },
            "B": {
              "text": "Rehberlik ve psikolojik danışma servisinden hangi konularda yardım alabileceklerini öğrenme",
              "targetId": 12
            }
          },
          {
            "q": 6,
            "A": {
              "text": "Arkadaş edinme ve arkadaşlık ilişkilerini sürdürme",
              "targetId": 13
            },
            "B": {
              "text": "İş birliği kurma becerilerini güçlendirme (ör., grup çalışmaları ve grup oyunlarında birlikte hareket edebilme)",
              "targetId": 14
            }
          },
          {
            "q": 7,
            "A": {
              "text": "Üst öğrenim kurumları hakkında bilgi edinme",
              "targetId": 20
            },
            "B": {
              "text": "Bireysel farklılıklara saygı göstermeyi öğrenme",
              "targetId": 16
            }
          },
          {
            "q": 8,
            "A": {
              "text": "Okulda fiziksel güvenliklerini sağlayacak davranışlar kazanma",
              "targetId": 17
            },
            "B": {
              "text": "Dikkat geliştirme becerileri kazanma",
              "targetId": 18
            }
          },
          {
            "q": 9,
            "A": {
              "text": "Okula devam motivasyonlarını artırma",
              "targetId": 21
            },
            "B": {
              "text": "Duygularını (ör., mutluluk, üzüntü, korku ve şaşkınlık) tanıma",
              "targetId": 22
            }
          },
          {
            "q": 10,
            "A": {
              "text": "Okul dışı etkinlikler (eğitsel, kültürel, sosyal ve sportif faaliyetler) hakkında bilgilenme",
              "targetId": 23
            },
            "B": {
              "text": "Teknoloji bağımlılığına karşı koruyucu temel beceriler edinme",
              "targetId": 24
            }
          },
          {
            "q": 11,
            "A": {
              "text": "Duygularını ve isteklerini saygılı bir şekilde ifade etme",
              "targetId": 25
            },
            "B": {
              "text": "Zorbalıkla karşılaştığında (ör., kötü söz söyleme, vurma) ne yapmaları gerektiğini bilme",
              "targetId": 26
            }
          },
          {
            "q": 12,
            "A": {
              "text": "Çocuk hakları ve sorumluluklarını öğrenme",
              "targetId": 27
            },
            "B": {
              "text": "Yeteneklerini (neleri iyi yapabildiklerini) tanıma",
              "targetId": 28
            }
          },
          {
            "q": 13,
            "A": {
              "text": "Derslerde zorlansa bile başarılı olacağına inanma",
              "targetId": 34
            },
            "B": {
              "text": "Verimli ders çalışma tekniklerini öğrenme",
              "targetId": 30
            }
          },
          {
            "q": 14,
            "A": {
              "text": "Sağlıklı yaşam becerilerini (spor yapmak, sağlıklı beslenmek gibi) kazanma",
              "targetId": 31
            },
            "B": {
              "text": "İstismardan korunmayı öğrenme",
              "targetId": 32
            }
          },
          {
            "q": 15,
            "A": {
              "text": "İlişkilerinde kişisel sınırlarını koruma",
              "targetId": 35
            },
            "B": {
              "text": "Mesleki farkındalıklarını (meslek edinmenin önemi, mesleklerin özellikleri gibi) geliştirme",
              "targetId": 36
            }
          },
          {
            "q": 16,
            "A": {
              "text": "Zaman yönetimi becerilerini geliştirme",
              "targetId": 37
            },
            "B": {
              "text": "Yardım arama becerilerini geliştirme (ör., nereden ve kimden yardım isteyeceğini bilme)",
              "targetId": 38
            }
          }
        ]
      }
    }
  },
  "ortaokul": {
    "id": "ortaokul",
    "name": "Ortaokul",
    "roles": [
      "ogrenci",
      "veli",
      "ogretmen"
    ],
    "weights": {
      "ogrenci": 0.39,
      "veli": 0.28,
      "ogretmen": 0.33
    },
    "studentEligibility": "all_grades",
    "targetCount": 39,
    "targets": [
      {
        "id": 1,
        "title": "Problem Çözme Becerileri"
      },
      {
        "id": 2,
        "title": "Öz Düzenlemeli Öğrenme"
      },
      {
        "id": 3,
        "title": "Karar Verme Becerisi"
      },
      {
        "id": 4,
        "title": "Motivasyon/Devamsızlığı Önleme"
      },
      {
        "id": 5,
        "title": "Sosyal Beceriler"
      },
      {
        "id": 6,
        "title": "Üst Öğrenime Geçiş Sınavları"
      },
      {
        "id": 7,
        "title": "Okul ve Çevresindeki Sosyokültürel İmkanlar"
      },
      {
        "id": 8,
        "title": "Atılganlık"
      },
      {
        "id": 9,
        "title": "Yardım Arama"
      },
      {
        "id": 10,
        "title": "Öz Disiplin Geliştirme"
      },
      {
        "id": 11,
        "title": "Duygu Düzenleme"
      },
      {
        "id": 12,
        "title": "Bilinçli Teknoloji Kullanımı"
      },
      {
        "id": 13,
        "title": "Zaman Yönetimi/Öz Düzenlemeli Öğrenme"
      },
      {
        "id": 14,
        "title": "Gelişim Dönemi Özellikleri"
      },
      {
        "id": 15,
        "title": "Hak ve Sorumluluklarını Bilme"
      },
      {
        "id": 16,
        "title": "Meslek ile İlgi, Değer, Yetenek ve Kişisel Özellik"
      },
      {
        "id": 17,
        "title": "Üst Öğrenim Kurumlarının Tanıtılması"
      },
      {
        "id": 18,
        "title": "Psikolojik Sağlamlık"
      },
      {
        "id": 19,
        "title": "Dikkat Geliştirme Çalışmaları"
      },
      {
        "id": 20,
        "title": "Bağımlılıkla Mücadele"
      },
      {
        "id": 21,
        "title": "İletişim Becerileri"
      },
      {
        "id": 22,
        "title": "Mesleki Benlik"
      },
      {
        "id": 23,
        "title": "Çatışma Çözme Becerileri"
      },
      {
        "id": 24,
        "title": "Bireysel Farklılıklara Saygı"
      },
      {
        "id": 25,
        "title": "Aile İçi İletişim"
      },
      {
        "id": 26,
        "title": "Öfke Yönetimi"
      },
      {
        "id": 27,
        "title": "Sınır Koyma"
      },
      {
        "id": 28,
        "title": "Okula ve Çevreye Uyum/Okul Kuralları"
      },
      {
        "id": 29,
        "title": "İletişim Becerileri"
      },
      {
        "id": 30,
        "title": "Rehberlik ve Psikolojik Danışma Servisinin Tanıtılması"
      },
      {
        "id": 31,
        "title": "Özgüven Geliştirme"
      },
      {
        "id": 32,
        "title": "Okul ve Çevresindeki Sosyokültürel İmkanlar"
      },
      {
        "id": 33,
        "title": "Meslek ile İlgi, Değer, Yetenek ve Kişisel Özellik"
      },
      {
        "id": 34,
        "title": "Sınav Kaygısı"
      },
      {
        "id": 35,
        "title": "İhmal ve İstismardan Korunma"
      },
      {
        "id": 36,
        "title": "Yaşam Becerileri"
      },
      {
        "id": 37,
        "title": "Sağlıklı Yaşam"
      },
      {
        "id": 38,
        "title": "Akran Zorbalığı"
      },
      {
        "id": 39,
        "title": "Duygu Farkındalığı/Duygu Düzenleme"
      }
    ],
    "forms": {
      "ogrenci": {
        "questionCount": 18,
        "questions": [
          {
            "q": 1,
            "A": {
              "text": "Sorunları tanımlayıp çeşitli çözümler içinden en mantıklı olanı uygulamak",
              "targetId": 1
            },
            "B": {
              "text": "Kendime uygun ders çalışma becerilerini geliştirmek (ör., plan yapmak, görselleştirmek, not çıkartmak, çalışma ortamımı düzenlemek)",
              "targetId": 2
            }
          },
          {
            "q": 2,
            "A": {
              "text": "Hayatımla ilgili konularda karar verme becerilerimi geliştirmek (ör., kıyafet seçme, arkadaş seçme, okul seçme)",
              "targetId": 3
            },
            "B": {
              "text": "Okula devam etme isteğimi artırmak",
              "targetId": 4
            }
          },
          {
            "q": 3,
            "A": {
              "text": "Arkadaşlık kurma becerilerimi geliştirmek (ör., insanlarla tanışmak, arkadaş edinmek ve arkadaşlıklarımı sürdürmek)",
              "targetId": 5
            },
            "B": {
              "text": "Liselere giriş sınavları hakkında bilgilenmek",
              "targetId": 6
            }
          },
          {
            "q": 4,
            "A": {
              "text": "Okuldaki kulüpler (spor, satranç, tiyatro vb.) ve yarışmalar gibi etkinlikler hakkında bilgilenmek",
              "targetId": 7
            },
            "B": {
              "text": "İlişkilerimi bozmadan haklarımı savunmayı öğrenmek",
              "targetId": 8
            }
          },
          {
            "q": 5,
            "A": {
              "text": "Zorlandığım konularda doğru kişilerden yardım isteme becerilerimi geliştirmek (ör., zorbalığa uğradığımda rehber öğretmen/psikolojik danışmana ulaşmak; yapamadığım soruları arkadaşlara ya da öğretmene sormak)",
              "targetId": 9
            },
            "B": {
              "text": "Başkaları hatırlatmadan sorumluluklarımı yerine getirmek (ör., ödevlerimi tamamlama; odamı, eşyalarımı düzenlemek, temiz tutmak)",
              "targetId": 10
            }
          },
          {
            "q": 6,
            "A": {
              "text": "Duygularım (üzüntü, öfke, kaygı vb.) ortaya çıktığında, bunları kontrol etmeyi öğrenmek",
              "targetId": 11
            },
            "B": {
              "text": "Bilgisayar, cep telefonu, tablet veya televizyonu kullanırken uygun içerik seçmek ve kullanım süresini belirlemek",
              "targetId": 12
            }
          },
          {
            "q": 7,
            "A": {
              "text": "Zamanımı planlamayı öğrenmek (ör., ders çalışmak, arkadaşlarla buluşmak, oyun oynamak)",
              "targetId": 13
            },
            "B": {
              "text": "Ergenlikteki değişikliklerle ilgili bilgilenmek (ör., bedendeki değişimler, sivilcelerin çıkması, anne ve babayla çatışmalar)",
              "targetId": 14
            }
          },
          {
            "q": 8,
            "A": {
              "text": "Hak ve sorumluluklarımı öğrenmek",
              "targetId": 15
            },
            "B": {
              "text": "Yeteneklerimi (neleri iyi yapabildiğimi) tanımak",
              "targetId": 16
            }
          },
          {
            "q": 9,
            "A": {
              "text": "Ortaokuldan sonra gidebileceğim eğitim kurumlarını tanımak",
              "targetId": 17
            },
            "B": {
              "text": "Yaşamdaki zorluklar karşısında duygusal açıdan dayanıklı olmak (ör., okul değiştirme, ebeveynlerin boşanması, yakınların ölümü)",
              "targetId": 18
            }
          },
          {
            "q": 10,
            "A": {
              "text": "Madde kullanımı, oyun ve sosyal medya gibi bağımlılık türleri ve korunma yöntemleri hakkında bilgilenmek",
              "targetId": 20
            },
            "B": {
              "text": "Duygu ve düşüncelerimi saygılı ve açık bir şekilde ifade etmek",
              "targetId": 21
            }
          },
          {
            "q": 11,
            "A": {
              "text": "Kişisel özelliklerim ile belli meslekler arasında ilişkiler kurmak (Ör., Çocukları seven bir öğrencinin büyüyünce öğretmen olmayı istemesi)",
              "targetId": 22
            },
            "B": {
              "text": "İnsanlarla anlaşmazlıklarımı, her iki tarafın da isteklerini karşılayacak şekilde çözmeyi öğrenmek",
              "targetId": 23
            }
          },
          {
            "q": 12,
            "A": {
              "text": "Farklı özelliklere sahip bireylere saygı göstermeyi öğrenmek (ör., cinsiyet, özel gereksinimli öğrenci)",
              "targetId": 24
            },
            "B": {
              "text": "Öfkemi kontrol etmek",
              "targetId": 26
            }
          },
          {
            "q": 13,
            "A": {
              "text": "Bir şeyi yapmak istemediğimde “HAYIR” diyebilmek",
              "targetId": 27
            },
            "B": {
              "text": "Okul ve sınıf kurallarını benimsemek",
              "targetId": 28
            }
          },
          {
            "q": 14,
            "A": {
              "text": "İletişim becerilerimi geliştirmek (ör., karşımızdakinin beden ve yüz hareketlerinden duygularını tahmin etmek, söz kesmeden dinlemek)",
              "targetId": 29
            },
            "B": {
              "text": "Rehber öğretmenden/psikolojik danışmandan hangi konularda yardım alabileceğimi öğrenmek",
              "targetId": 30
            }
          },
          {
            "q": 15,
            "A": {
              "text": "Kendime güvenmeyi öğrenmek",
              "targetId": 31
            },
            "B": {
              "text": "İlgilerimi (ör., kodlama, spor, resim ve müzik) keşfetmek",
              "targetId": 33
            }
          },
          {
            "q": 16,
            "A": {
              "text": "Sınav kaygısı ile başa çıkmayı öğrenmek",
              "targetId": 34
            },
            "B": {
              "text": "Bedenimi korumayı öğrenmek (ör., başkalarının bedenime dokunmasına izin vermemek)",
              "targetId": 35
            }
          },
          {
            "q": 17,
            "A": {
              "text": "Riskli davranışlardan kaçınmayı öğrenmek (ör., tehlikeli arkadaş gruplarına katılmaktan, okuldan kaçmaktan ve kavgaya karışmaktan kaçınmak)",
              "targetId": 36
            },
            "B": {
              "text": "Sağlıklı yaşam becerilerini kazanmak (ör., spor yapmak, sağlıklı beslenmek)",
              "targetId": 37
            }
          },
          {
            "q": 18,
            "A": {
              "text": "Zorbalığa uğradığımda ne yapmam gerektiğini öğrenmek (ör., alay etme, vurma, fotoğraflarımı sosyal medyada izinsiz paylaşma)",
              "targetId": 38
            },
            "B": {
              "text": "Duygularımı (mutluluk, öfke, kaygı, üzüntü, korku, şaşkınlık gibi) tanımak",
              "targetId": 39
            }
          }
        ]
      },
      "veli": {
        "questionCount": 16,
        "questions": [
          {
            "q": 1,
            "A": {
              "text": "Ders çalıştığı sırada dikkatini dağıtan davranışlardan uzak durmayı öğrenme",
              "targetId": 19
            },
            "B": {
              "text": "Ders çalışma becerilerini (derslerini düzenli çalışma, çalışırken telefon/tabletle ilgilenmeme gibi) geliştirme",
              "targetId": 2
            }
          },
          {
            "q": 2,
            "A": {
              "text": "Kendisi ile ilgili konularda karar verme becerilerini geliştirme (ör., kıyafet seçme, arkadaş seçme, okul seçme)",
              "targetId": 3
            },
            "B": {
              "text": "Okula devam etme isteğini arttırma",
              "targetId": 4
            }
          },
          {
            "q": 3,
            "A": {
              "text": "Arkadaşlık kurma becerilerini geliştirme (ör., insanlarla tanışma, arkadaş edinme ve arkadaşlıklarını sürdürme)",
              "targetId": 5
            },
            "B": {
              "text": "Liselere giriş sınavları hakkında bilgilenme",
              "targetId": 6
            }
          },
          {
            "q": 4,
            "A": {
              "text": "Okuldaki kulüpler (spor, satranç, tiyatro vb.) ve yarışmalar gibi etkinlikler hakkında bilgilenme",
              "targetId": 7
            },
            "B": {
              "text": "Haklarını savunmasını öğrenme",
              "targetId": 8
            }
          },
          {
            "q": 5,
            "A": {
              "text": "Zorlandığı konularda doğru kişilerden yardım isteme becerilerini geliştirme (ör., zorbalığa uğradığında rehber öğretmen/psikolojik danışmana ulaşma; yapamadığı soruları arkadaşlarına ya da öğretmenine sorma)",
              "targetId": 9
            },
            "B": {
              "text": "Sorumluluklarının bilincinde olma (ör., ödevlerini tamamlama; odasını, eşyalarını düzenleme, temiz tutma)",
              "targetId": 10
            }
          },
          {
            "q": 6,
            "A": {
              "text": "Zorbalığa uğradığında ne yapması gerektiğini bilme (ör., alay etme, vurma, fotoğraflarının sosyal medyada izinsiz paylaşılması)",
              "targetId": 38
            },
            "B": {
              "text": "Bilgisayar, cep telefonu, tablet veya televizyonu kullanırken uygun içerik seçme ve kullanma sürelerini ayarlama",
              "targetId": 12
            }
          },
          {
            "q": 7,
            "A": {
              "text": "Zamanını planlamayı öğrenme (ör., ders çalışmak, arkadaşlarla buluşmak, oyun oynamak)",
              "targetId": 13
            },
            "B": {
              "text": "Ergenlikteki değişikliklerle ilgili bilgilenme (ör., bedendeki değişimler, sivilcelerin çıkması, anne ve babayla çatışmalar)",
              "targetId": 14
            }
          },
          {
            "q": 8,
            "A": {
              "text": "İnsanlarla anlaşmazlıklarını, her iki tarafın da isteklerini karşılayacak şekilde çözmeyi öğrenme",
              "targetId": 23
            },
            "B": {
              "text": "Yeteneklerini (neleri iyi yapabildiğini) tanıma",
              "targetId": 16
            }
          },
          {
            "q": 9,
            "A": {
              "text": "Ortaokuldan sonra gidebileceği eğitim kurumlarını tanıma",
              "targetId": 17
            },
            "B": {
              "text": "Yaşamdaki zorluklar karşısında duygusal açıdan dayanıklı olma (ör., okul değiştirme, ebeveynlerin boşanması, yakınların ölümü)",
              "targetId": 18
            }
          },
          {
            "q": 10,
            "A": {
              "text": "Madde kullanımı, oyun ve sosyal medya gibi bağımlılık türleri ve korunma yöntemleri hakkında bilgilenme",
              "targetId": 20
            },
            "B": {
              "text": "Duygu ve düşüncelerini saygılı ve açık bir şekilde ifade etme",
              "targetId": 21
            }
          },
          {
            "q": 11,
            "A": {
              "text": "Aile üyeleriyle iletişimini güçlendirme",
              "targetId": 25
            },
            "B": {
              "text": "Öfkesini kontrol etme",
              "targetId": 26
            }
          },
          {
            "q": 12,
            "A": {
              "text": "Riskli durumlardan kaçınmak için “HAYIR” deme becerisini geliştirme",
              "targetId": 27
            },
            "B": {
              "text": "Okul ve sınıf kurallarını benimseme",
              "targetId": 28
            }
          },
          {
            "q": 13,
            "A": {
              "text": "İletişim becerilerini geliştirme (ör., söz kesmeden dinleme, göz teması kurma)",
              "targetId": 29
            },
            "B": {
              "text": "Rehber öğretmenden/psikolojik danışmandan hangi konularda yardım alabileceğini öğrenme",
              "targetId": 30
            }
          },
          {
            "q": 14,
            "A": {
              "text": "Kendine güvenmeyi öğrenme",
              "targetId": 31
            },
            "B": {
              "text": "İlgilerini (ör., kodlama, spor, resim ve müzik) keşfetme",
              "targetId": 33
            }
          },
          {
            "q": 15,
            "A": {
              "text": "Sınav kaygısı ile başa çıkmayı öğrenme",
              "targetId": 34
            },
            "B": {
              "text": "İstismardan korunmayı öğrenme",
              "targetId": 35
            }
          },
          {
            "q": 16,
            "A": {
              "text": "Riskli davranışlardan kaçınmayı öğrenme (ör., tehlikeli arkadaş gruplarına katılmaktan, okuldan kaçmaktan ve kavgaya karışmaktan kaçınmak)",
              "targetId": 36
            },
            "B": {
              "text": "Sağlıklı yaşam becerilerini (ör., spor yapmak, sağlıklı beslenmek) edinme",
              "targetId": 37
            }
          }
        ]
      },
      "ogretmen": {
        "questionCount": 18,
        "questions": [
          {
            "q": 1,
            "A": {
              "text": "Problem çözme becerilerini güçlendirme",
              "targetId": 1
            },
            "B": {
              "text": "Ders çalışma becerilerini (plan yapmak, görselleştirmek, not çıkartmak, öz değerlendirme gibi) geliştirme",
              "targetId": 2
            }
          },
          {
            "q": 2,
            "A": {
              "text": "Karar alma becerilerini güçlendirme",
              "targetId": 3
            },
            "B": {
              "text": "Okula devam motivasyonlarını artırma",
              "targetId": 4
            }
          },
          {
            "q": 3,
            "A": {
              "text": "Arkadaşlık kurma becerilerini geliştirme",
              "targetId": 5
            },
            "B": {
              "text": "Liselere giriş sınavları hakkında bilgilenme",
              "targetId": 6
            }
          },
          {
            "q": 4,
            "A": {
              "text": "Okuldaki kulüpler (spor, satranç, tiyatro vb.) ve yarışmalar gibi etkinlikler hakkında bilgilenme",
              "targetId": 7
            },
            "B": {
              "text": "İlişkilerini bozmadan haklarını savunmayı öğrenme",
              "targetId": 8
            }
          },
          {
            "q": 5,
            "A": {
              "text": "Yardım arama becerilerini geliştirme (ör., nereden ve kimden yardım isteyeceğini bilme)",
              "targetId": 9
            },
            "B": {
              "text": "Sorumluluklarının bilincinde olma (ör., ödevlerini tamamlama, materyallerini unutmama)",
              "targetId": 10
            }
          },
          {
            "q": 6,
            "A": {
              "text": "Duygu düzenleme becerilerini (olaylara farklı açıdan bakmak, duyguyla arasına mesafe koymak, duygusal destek aramak vb.) kazanma",
              "targetId": 11
            },
            "B": {
              "text": "Teknoloji bağımlılığına karşı koruyucu ek beceriler kazanma",
              "targetId": 12
            }
          },
          {
            "q": 7,
            "A": {
              "text": "Zaman yönetimi becerilerini güçlendirme",
              "targetId": 13
            },
            "B": {
              "text": "Ergenlikteki bedensel ve psikolojik değişikliklere uyum sağlama",
              "targetId": 14
            }
          },
          {
            "q": 8,
            "A": {
              "text": "Hak ve sorumluluklarını bilme",
              "targetId": 15
            },
            "B": {
              "text": "Yeteneklerini (neleri iyi yapabildiklerini) tanıma",
              "targetId": 16
            }
          },
          {
            "q": 9,
            "A": {
              "text": "Üst öğrenim kurumları hakkında bilgi edinme",
              "targetId": 17
            },
            "B": {
              "text": "Yaşamdaki zorluklar karşısında duygusal açıdan dayanıklı olma (ör., okul değiştirme, ebeveynlerin boşanması, yakınların ölümü)",
              "targetId": 18
            }
          },
          {
            "q": 10,
            "A": {
              "text": "Madde kullanımı, oyun ve sosyal medya gibi bağımlılık türleri ve korunma yöntemleri hakkında bilgilenme",
              "targetId": 20
            },
            "B": {
              "text": "Duygu ve düşüncelerini saygılı ve açık bir şekilde ifade etme",
              "targetId": 21
            }
          },
          {
            "q": 11,
            "A": {
              "text": "Dikkat geliştirme becerilerini iyileştirme",
              "targetId": 19
            },
            "B": {
              "text": "Kişilerarası çatışma çözme becerilerini geliştirme",
              "targetId": 23
            }
          },
          {
            "q": 12,
            "A": {
              "text": "Bireysel farklılıklara saygı göstermeyi öğrenme",
              "targetId": 24
            },
            "B": {
              "text": "Öfkelerini kontrol etme",
              "targetId": 26
            }
          },
          {
            "q": 13,
            "A": {
              "text": "İlişkilerinde kişisel sınırlarını koruma",
              "targetId": 27
            },
            "B": {
              "text": "Okul ve sınıf kurallarını benimseme",
              "targetId": 28
            }
          },
          {
            "q": 14,
            "A": {
              "text": "İletişim becerilerini iyileştirme",
              "targetId": 29
            },
            "B": {
              "text": "Rehberlik ve psikolojik danışma servisinden hangi konularda yardım alabileceklerini öğrenme",
              "targetId": 30
            }
          },
          {
            "q": 15,
            "A": {
              "text": "Kendine güvenmeyi öğrenme",
              "targetId": 31
            },
            "B": {
              "text": "İlgilerini (ör., kodlama, spor, resim ve müzik) keşfetme",
              "targetId": 33
            }
          },
          {
            "q": 16,
            "A": {
              "text": "Sınav kaygısı ile başa çıkma becerileri kazanma",
              "targetId": 34
            },
            "B": {
              "text": "İstismardan korunmayı öğrenme",
              "targetId": 35
            }
          },
          {
            "q": 17,
            "A": {
              "text": "Riskli davranışlardan kaçınmayı öğrenme (ör., tehlikeli arkadaş gruplarına katılmaktan, okuldan kaçmaktan ve kavgaya karışmaktan kaçınmak)",
              "targetId": 36
            },
            "B": {
              "text": "Sağlıklı yaşam becerilerini (ör., spor yapmak, sağlıklı beslenmek) edinme",
              "targetId": 37
            }
          },
          {
            "q": 18,
            "A": {
              "text": "Zorbalığa uğradığında ne yapmaları gerektiğini bilme",
              "targetId": 38
            },
            "B": {
              "text": "Duygularını (mutluluk, üzüntü, korku, şaşkınlık gibi) tanıma",
              "targetId": 39
            }
          }
        ]
      }
    }
  },
  "lise": {
    "id": "lise",
    "name": "Lise",
    "roles": [
      "ogrenci",
      "veli",
      "ogretmen"
    ],
    "weights": {
      "ogrenci": 0.39,
      "veli": 0.28,
      "ogretmen": 0.33
    },
    "studentEligibility": "all_grades",
    "targetCount": 40,
    "targets": [
      {
        "id": 1,
        "title": "Atılganlık"
      },
      {
        "id": 2,
        "title": "Verimli Ders Çalışma Teknikleri/Öz Düzenlemeli Öğrenme"
      },
      {
        "id": 3,
        "title": "Stresle Baş Etme Becerileri"
      },
      {
        "id": 4,
        "title": "Karar Verme Becerisi"
      },
      {
        "id": 5,
        "title": "Psikolojik Sağlamlık"
      },
      {
        "id": 6,
        "title": "Sınır Koyma"
      },
      {
        "id": 7,
        "title": "Meslek ile İlgi, Değer, Yetenek ve Kişisel Özellik İlişkisi"
      },
      {
        "id": 8,
        "title": "Okula ve Çevreye Uyum/Okul kuralları"
      },
      {
        "id": 9,
        "title": "Gelişim Dönemi Özellikleri"
      },
      {
        "id": 10,
        "title": "İletişim Becerileri"
      },
      {
        "id": 11,
        "title": "Otokontrol"
      },
      {
        "id": 12,
        "title": "Gelişim Dönemi Özellikleri"
      },
      {
        "id": 13,
        "title": "İhmal ve İstismardan Korunma"
      },
      {
        "id": 14,
        "title": "Üst Öğrenim Kurumlarının Tanıtılması"
      },
      {
        "id": 15,
        "title": "Üst Öğrenime Geçiş Sınavları"
      },
      {
        "id": 16,
        "title": "Bilinçli Teknoloji Kullanımı"
      },
      {
        "id": 17,
        "title": "İletişim Becerileri"
      },
      {
        "id": 18,
        "title": "Mesleki Hedef Belirleme"
      },
      {
        "id": 19,
        "title": "Aile İçi İletişim"
      },
      {
        "id": 20,
        "title": "Meslek Tanıtımı"
      },
      {
        "id": 21,
        "title": "Meslek Seçerken Dikkat Edilmesi Gereken Hususlar"
      },
      {
        "id": 22,
        "title": "Yardım Arama"
      },
      {
        "id": 23,
        "title": "Öfke Yönetimi"
      },
      {
        "id": 24,
        "title": "Rehberlik ve Psikolojik Danışma Servisinin Tanıtılması"
      },
      {
        "id": 25,
        "title": "Duygu Düzenleme"
      },
      {
        "id": 26,
        "title": "Bağımlılıkla Mücadele"
      },
      {
        "id": 27,
        "title": "Çatışma Çözme Becerileri/Atılganlık"
      },
      {
        "id": 28,
        "title": "Okul ve Çevresindeki Sosyokültürel İmkanlar"
      },
      {
        "id": 29,
        "title": "Sağlıklı Yaşam"
      },
      {
        "id": 30,
        "title": "Meslek ile İlgi, Değer, Yetenek ve Kişisel Özellik İlişkisi"
      },
      {
        "id": 31,
        "title": "Meslek ile İlgi, Değer, Yetenek ve Kişisel Özellik İlişkisi"
      },
      {
        "id": 32,
        "title": "Bireysel Farklılıklara Saygı"
      },
      {
        "id": 33,
        "title": "Bilinçli Teknoloji Kullanımı"
      },
      {
        "id": 34,
        "title": "Özgüven Geliştirme"
      },
      {
        "id": 35,
        "title": "Zaman Yönetimi/ Öz Düzenlemeli Öğrenme"
      },
      {
        "id": 36,
        "title": "Okul ve Çevresindeki Sosyokültürel İmkanlar"
      },
      {
        "id": 37,
        "title": "Sınav Kaygısı"
      },
      {
        "id": 38,
        "title": "Akran Zorbalığı"
      },
      {
        "id": 39,
        "title": "Motivasyon/Devamsızlığı önleme"
      },
      {
        "id": 40,
        "title": "Okulda Seçilecek Alan/Dal"
      }
    ],
    "forms": {
      "ogrenci": {
        "questionCount": 20,
        "questions": [
          {
            "q": 1,
            "A": {
              "text": "İlişkilerimi bozmadan haklarımı savunmayı öğrenmek",
              "targetId": 1
            },
            "B": {
              "text": "Verimli ders çalışma becerilerimi geliştirmek",
              "targetId": 2
            }
          },
          {
            "q": 2,
            "A": {
              "text": "Stresle baş etmeyi öğrenmek",
              "targetId": 3
            },
            "B": {
              "text": "Hayatımla ilgili konularda karar verme becerilerimi geliştirmek (ör., arkadaş seçme, okul seçme, kariyer planlama)",
              "targetId": 4
            }
          },
          {
            "q": 3,
            "A": {
              "text": "Yaşamdaki zorluklar karşısında duygusal açıdan dayanıklı olmak (ör., okul değiştirme, ebeveynlerin boşanması, yakınların ölümü)",
              "targetId": 5
            },
            "B": {
              "text": "Bir şeyi yapmak istemediğimde, “HAYIR” diyebilme becerisini kazanmak",
              "targetId": 6
            }
          },
          {
            "q": 4,
            "A": {
              "text": "Yeteneklerimi (neleri iyi yapabildiğimi) tanımak",
              "targetId": 7
            },
            "B": {
              "text": "Okul kuralları (sınıf geçme, ödül, disiplin gibi konular) hakkında bilgilenmek",
              "targetId": 8
            }
          },
          {
            "q": 5,
            "A": {
              "text": "Ergenlik döneminin duygusal değişimleriyle ilgili bilgi edinmek",
              "targetId": 9
            },
            "B": {
              "text": "İletişim becerilerimi güçlendirmek (ör., beden dilini anlamak, empati kurmak)",
              "targetId": 10
            }
          },
          {
            "q": 6,
            "A": {
              "text": "Harekete geçmeden önce anlık isteğimi değil, davranışımın sonuçlarını göz önünde bulundurmak (ör., ders çalışırken telefonunu başka odaya koymak, tartışmalar şiddetlendiğinde ortamdan uzaklaşmak)",
              "targetId": 11
            },
            "B": {
              "text": "Ergenlik dönemi gelişim özellikleri konusunda bilgilenmek (ör., bedensel ve ruhsal değişiklikler)",
              "targetId": 12
            }
          },
          {
            "q": 7,
            "A": {
              "text": "İstismar (fiziksel, duygusal vb.) ve ihmal türlerinden korunmayı öğrenmek",
              "targetId": 13
            },
            "B": {
              "text": "Üst öğrenim olanakları hakkında bilgilenmek",
              "targetId": 14
            }
          },
          {
            "q": 8,
            "A": {
              "text": "Üniversite sınavları hakkında bilgilenmek",
              "targetId": 15
            },
            "B": {
              "text": "Teknoloji bağımlılığından korunma becerilerimi geliştirmek",
              "targetId": 16
            }
          },
          {
            "q": 9,
            "A": {
              "text": "Karşı cinsle sağlıklı iletişim kurabilme becerisi kazanmak",
              "targetId": 17
            },
            "B": {
              "text": "Farklı kariyer seçeneklerinde nelerin gerekli olduğunu öğrenmek ve buna göre hedeflerimi gözden geçirmek (ör., deneme sınav sonuçlarıyla istediğim bölümlerin başarı sıralarını karşılaştırmak)",
              "targetId": 18
            }
          },
          {
            "q": 10,
            "A": {
              "text": "Mesleklerle ilgili çeşitli kaynaklardan bilgi edinmek (ör., iş yerlerini gezme, meslek insanın okula davet edilmesi, internet kaynakları)",
              "targetId": 20
            },
            "B": {
              "text": "İlgi, yetenek ve değerlerime uygun kariyer seçeneklerini analiz etmek",
              "targetId": 21
            }
          },
          {
            "q": 11,
            "A": {
              "text": "Zorlandığım konularda doğru kişilerden yardım isteme becerilerimi geliştirmek (ör., zorbalıkla karşılaştığımda rehber öğretmen/psikolojik danışmana ulaşmak; yapamadığım soruları arkadaşlara ya da öğretmene sormak)",
              "targetId": 22
            },
            "B": {
              "text": "Öfkemi kontrol etme becerilerimi güçlendirmek",
              "targetId": 23
            }
          },
          {
            "q": 12,
            "A": {
              "text": "Rehber öğretmenden/psikolojik danışmandan hangi konularda yardım alabileceğimi öğrenmek",
              "targetId": 24
            },
            "B": {
              "text": "Bağımlılık yapan maddelerin etkileri hakkında bilgilenmek",
              "targetId": 26
            }
          },
          {
            "q": 13,
            "A": {
              "text": "İnsanlarla anlaşmazlıklarımı, ilişkilerimi bozmayacak ve haklarımı savunacak şekilde çözmek",
              "targetId": 27
            },
            "B": {
              "text": "Okul dışı etkinlikler (eğitsel, kültürel, sosyal ve sportif faaliyetler) hakkında bilgilenmek",
              "targetId": 28
            }
          },
          {
            "q": 14,
            "A": {
              "text": "Sağlıklı yaşam becerilerini kazanmak (ör., spor yapmak, sağlıklı beslenmek, kişisel hijyene dikkat etmek)",
              "targetId": 29
            },
            "B": {
              "text": "Meslek seçiminde nelere önem verildiğini öğrenmek (ör., işin kazancı, saygınlığı, çalışma ortamı)",
              "targetId": 30
            }
          },
          {
            "q": 15,
            "A": {
              "text": "İlgilerimi (kodlama, spor, resim, müzik gibi) keşfetmek",
              "targetId": 31
            },
            "B": {
              "text": "Dijital okur-yazarlık becerilerini geliştirmek (ör., sahte videoları ayırt etmek, kötü amaçlı yazılımları indirmemek ve kişisel verileri paylaşmamak)",
              "targetId": 33
            }
          },
          {
            "q": 16,
            "A": {
              "text": "Özgüvenimi geliştirmek",
              "targetId": 34
            },
            "B": {
              "text": "Zamanı planlama becerilerimi geliştirmek",
              "targetId": 35
            }
          },
          {
            "q": 17,
            "A": {
              "text": "Okul kulüpleri (spor, satranç, tiyatro vb.) ve yarışmalar gibi etkinlikler hakkında bilgilenmek",
              "targetId": 36
            },
            "B": {
              "text": "Sınav kaygısı ile başa çıkmayı öğrenmek",
              "targetId": 37
            }
          },
          {
            "q": 18,
            "A": {
              "text": "Zorbalıkla karşılaştığımda ne yapmam gerektiğini öğrenmek (ör., alay etme, vurma, fotoğraflarımı sosyal medyada izinsiz paylaşma)",
              "targetId": 38
            },
            "B": {
              "text": "Aile üyeleriyle iletişimimi güçlendirmek",
              "targetId": 19
            }
          },
          {
            "q": 19,
            "A": {
              "text": "Duygularımı düzenlemeyi öğrenmek (ör., öfkelenince, üzülünce, kaygılanınca sakinleşmek için yürüyüşe çıkmak, biriyle dertleşmek, olaylara farklı açıdan bakmak)",
              "targetId": 25
            },
            "B": {
              "text": "Farklı özelliklere sahip bireylere saygı göstermeyi öğrenmek (ör., karşı cins, özel gereksinimli birey ve göçmenler)",
              "targetId": 32
            }
          },
          {
            "q": 20,
            "A": {
              "text": "Okula devam etme isteğimi artırmak",
              "targetId": 39
            },
            "B": {
              "text": "Okulda seçebileceğim alan/dal hakkında bilgilenmek",
              "targetId": 40
            }
          }
        ]
      },
      "veli": {
        "questionCount": 19,
        "questions": [
          {
            "q": 1,
            "A": {
              "text": "Haklarını savunmasını öğrenme",
              "targetId": 1
            },
            "B": {
              "text": "Verimli ders çalışma becerilerini geliştirme",
              "targetId": 2
            }
          },
          {
            "q": 2,
            "A": {
              "text": "Stresle baş etmeyi öğrenme",
              "targetId": 3
            },
            "B": {
              "text": "Yaşamıyla ilgili önemli konularda mantıklı kararlar alma",
              "targetId": 4
            }
          },
          {
            "q": 3,
            "A": {
              "text": "Yaşamdaki zorluklar karşısında duygusal açıdan dayanıklı olma (ör., okul değiştirme, ebeveynlerin boşanması, yakınların ölümü)",
              "targetId": 5
            },
            "B": {
              "text": "Riskli durumlardan kaçınmak için “HAYIR” deme becerisini geliştirme",
              "targetId": 6
            }
          },
          {
            "q": 4,
            "A": {
              "text": "Yeteneklerini (neleri iyi yapabildiğini) tanıma",
              "targetId": 7
            },
            "B": {
              "text": "Okul kuralları (sınıf geçme, ödül, disiplin gibi konular) hakkında bilgilenme",
              "targetId": 8
            }
          },
          {
            "q": 5,
            "A": {
              "text": "Ergenlik döneminin duygusal sorunlarıyla baş etmeyi öğrenme",
              "targetId": 9
            },
            "B": {
              "text": "İletişim becerilerini geliştirme (ör., söz kesmeden dinleme, göz teması kurma)",
              "targetId": 10
            }
          },
          {
            "q": 6,
            "A": {
              "text": "Harekete geçmeden önce anlık isteklerini değil, davranışının sonuçlarını göz önünde bulundurma (ör., ders çalışırken telefonunu başka odaya koymak, tartışmalar şiddetlendiğinde ortamdan uzaklaşmak)",
              "targetId": 11
            },
            "B": {
              "text": "Ergenlik dönemi gelişim özellikleri konusunda bilgilenme (ör., bedensel ve ruhsal değişiklikler)",
              "targetId": 12
            }
          },
          {
            "q": 7,
            "A": {
              "text": "İstismar (fiziksel ve duygusal vb.) ve ihmal türlerinden korunmayı öğrenme",
              "targetId": 13
            },
            "B": {
              "text": "Üst öğrenim olanakları hakkında bilgilenme",
              "targetId": 14
            }
          },
          {
            "q": 8,
            "A": {
              "text": "Üniversite sınavları hakkında bilgilenme",
              "targetId": 15
            },
            "B": {
              "text": "Teknoloji bağımlılığının olumsuz etkilerinden korunmayı öğrenme",
              "targetId": 16
            }
          },
          {
            "q": 9,
            "A": {
              "text": "Karşı cinsle sağlıklı iletişim kurabilme becerisi kazanma",
              "targetId": 17
            },
            "B": {
              "text": "Farklı kariyer seçeneklerinde nelerin gerekli olduğunu öğrenme ve buna göre hedeflerini gözden geçirme (ör., deneme sınav sonuçlarıyla istediği bölümlerin başarı sıralarını karşılaştırmak)",
              "targetId": 18
            }
          },
          {
            "q": 10,
            "A": {
              "text": "Mesleklerle ilgili bilgi edinme",
              "targetId": 20
            },
            "B": {
              "text": "İlgi, yetenek ve değerlerine uygun kariyer seçeneklerini analiz etme",
              "targetId": 21
            }
          },
          {
            "q": 11,
            "A": {
              "text": "Zorlandığı konularda doğru kişilerden yardım isteme becerilerini geliştirme (ör., zorbalığa uğradığında rehber öğretmen/psikolojik danışmana ulaşma; yapamadığı soruları arkadaşlarına ya da öğretmenine sorma)",
              "targetId": 22
            },
            "B": {
              "text": "Öfkesini kontrol etme",
              "targetId": 23
            }
          },
          {
            "q": 12,
            "A": {
              "text": "Rehber öğretmenden/psikolojik danışmandan hangi konularda yardım alabileceğini öğrenme",
              "targetId": 24
            },
            "B": {
              "text": "Bağımlılık yapan maddelerin olumsuz etkileri hakkında bilgilenme",
              "targetId": 26
            }
          },
          {
            "q": 13,
            "A": {
              "text": "İnsanlarla anlaşmazlıklarını, ilişkilerini bozmayacak ve haklarını savunacak şekilde çözme",
              "targetId": 27
            },
            "B": {
              "text": "Okul dışı etkinlikler (eğitsel, kültürel, sosyal ve sportif faaliyetler) hakkında bilgilenme",
              "targetId": 28
            }
          },
          {
            "q": 14,
            "A": {
              "text": "Sağlıklı yaşam becerilerini edinme (ör., spor yapma, sağlıklı beslenme ve kişisel hijyene dikkat etme)",
              "targetId": 29
            },
            "B": {
              "text": "Meslek seçiminde nelere önem verildiğini fark etme (ör., işin kazancı, saygınlığı, çalışma ortamı)",
              "targetId": 30
            }
          },
          {
            "q": 15,
            "A": {
              "text": "İlgilerini (kodlama, spor, resim, müzik gibi) keşfetme",
              "targetId": 31
            },
            "B": {
              "text": "Dijital okur-yazarlık becerilerini geliştirme (ör., sahte videoları ayırt etmek, kötü amaçlı yazılımları indirmemek ve kişisel verileri paylaşmamak)",
              "targetId": 33
            }
          },
          {
            "q": 16,
            "A": {
              "text": "Kendine güvenmeyi öğrenme",
              "targetId": 34
            },
            "B": {
              "text": "Zaman planlama becerilerini geliştirme",
              "targetId": 35
            }
          },
          {
            "q": 17,
            "A": {
              "text": "Okul kulüpleri (spor, satranç, tiyatro vb.) ve yarışmalar gibi etkinlikler hakkında bilgilenme",
              "targetId": 36
            },
            "B": {
              "text": "Sınav kaygısı ile başa çıkmayı öğrenme",
              "targetId": 37
            }
          },
          {
            "q": 18,
            "A": {
              "text": "Zorbalıkla karşılaştığında ne yapması gerektiğini bilme (ör., alay etme, vurma, fotoğraflarının sosyal medyada izinsiz paylaşılması)",
              "targetId": 38
            },
            "B": {
              "text": "Aile üyeleriyle iletişimini güçlendirme",
              "targetId": 19
            }
          },
          {
            "q": 19,
            "A": {
              "text": "Okula devam etme isteğini artırma",
              "targetId": 39
            },
            "B": {
              "text": "Okulda seçebileceği alan/dal hakkında bilgilenme",
              "targetId": 40
            }
          }
        ]
      },
      "ogretmen": {
        "questionCount": 19,
        "questions": [
          {
            "q": 1,
            "A": {
              "text": "İlişkilerini bozmadan haklarını savunmayı öğrenme",
              "targetId": 1
            },
            "B": {
              "text": "Verimli ders çalışma becerilerini geliştirme",
              "targetId": 2
            }
          },
          {
            "q": 2,
            "A": {
              "text": "Stresle baş etme becerileri kazanma",
              "targetId": 3
            },
            "B": {
              "text": "Karar alma becerilerini geliştirme",
              "targetId": 4
            }
          },
          {
            "q": 3,
            "A": {
              "text": "Yaşamdaki zorluklar karşısında duygusal açıdan dayanıklı olma (ör., okul değiştirme, ebeveynlerin boşanması, yakınların ölümü)",
              "targetId": 5
            },
            "B": {
              "text": "İlişkilerinde kişisel sınırlarını koruma (ör., “HAYIR” diyebilme becerisini kazanma)",
              "targetId": 6
            }
          },
          {
            "q": 4,
            "A": {
              "text": "Yeteneklerini (neleri iyi yapabildiklerini) tanıma",
              "targetId": 7
            },
            "B": {
              "text": "Okul kuralları (sınıf geçme, ödül, disiplin gibi konular) hakkında bilgilenme",
              "targetId": 8
            }
          },
          {
            "q": 5,
            "A": {
              "text": "Ergenlik döneminin duygusal sorunlarıyla baş etmeyi öğrenme",
              "targetId": 9
            },
            "B": {
              "text": "İletişim becerilerini (beden dili, etkin dinleme, empati vb.) geliştirme",
              "targetId": 10
            }
          },
          {
            "q": 6,
            "A": {
              "text": "Harekete geçmeden önce anlık isteklerini değil, davranışlarının sonuçlarını göz önünde bulundurma (ör., arkadaşıyla konuşmak yerine dersi dinlemek, tartışmalar şiddetlendiğinde ortamdan uzaklaşmak)",
              "targetId": 11
            },
            "B": {
              "text": "Ergenlik dönemi gelişim özellikleri konusunda bilgilenme (bedensel ve duygusal değişiklikler)",
              "targetId": 12
            }
          },
          {
            "q": 7,
            "A": {
              "text": "İhmal ve istismardan korunmayı öğrenme",
              "targetId": 13
            },
            "B": {
              "text": "Üst öğrenim olanakları hakkında bilgilenme",
              "targetId": 14
            }
          },
          {
            "q": 8,
            "A": {
              "text": "Üniversite sınavları hakkında bilgilenme",
              "targetId": 15
            },
            "B": {
              "text": "Teknoloji bağımlılığından korunma becerilerini geliştirme",
              "targetId": 16
            }
          },
          {
            "q": 9,
            "A": {
              "text": "Karşı cinsle sağlıklı iletişim kurabilme becerileri kazanma",
              "targetId": 17
            },
            "B": {
              "text": "Farklı kariyer seçeneklerinde nelerin gerekli olduğunu öğrenme ve buna göre hedeflerini gözden geçirme (ör., deneme sınav sonuçlarıyla istedikleri bölümlerin başarı sıralarını karşılaştırmak)",
              "targetId": 18
            }
          },
          {
            "q": 10,
            "A": {
              "text": "Mesleklerle ilgili bilgi edinme",
              "targetId": 20
            },
            "B": {
              "text": "İlgi, yetenek ve değerlerine uygun kariyer seçeneklerini analiz etme",
              "targetId": 21
            }
          },
          {
            "q": 11,
            "A": {
              "text": "Yardım arama becerilerini geliştirme (ör., nereden ve kimden yardım isteyeceğini bilme)",
              "targetId": 22
            },
            "B": {
              "text": "Öfkelerini kontrol etme becerilerini güçlendirme",
              "targetId": 23
            }
          },
          {
            "q": 12,
            "A": {
              "text": "Rehberlik ve psikolojik danışma servisinden hangi konularda yardım alabileceklerini öğrenme",
              "targetId": 24
            },
            "B": {
              "text": "Bağımlılık yapan maddelerin olumsuz etkileri hakkında bilgilenme",
              "targetId": 26
            }
          },
          {
            "q": 13,
            "A": {
              "text": "Kişilerarası çatışma çözme becerilerini geliştirme",
              "targetId": 27
            },
            "B": {
              "text": "Okul dışı etkinlikler (eğitsel, kültürel, sosyal ve sportif faaliyetler) hakkında bilgilenme",
              "targetId": 28
            }
          },
          {
            "q": 14,
            "A": {
              "text": "Sağlıklı yaşam becerilerini edinme (ör., spor yapma, sağlıklı beslenme ve kişisel hijyene dikkat etme)",
              "targetId": 29
            },
            "B": {
              "text": "Meslek seçiminde nelere önem verildiğini fark etme (ör., işin kazancı, saygınlığı, çalışma ortamı)",
              "targetId": 30
            }
          },
          {
            "q": 15,
            "A": {
              "text": "İlgilerini (kodlama, spor, resim, müzik gibi) keşfetme",
              "targetId": 31
            },
            "B": {
              "text": "Dijital okur-yazarlık becerilerini geliştirme (ör., sahte videoları ayırt etmek, kötü amaçlı yazılımları indirmemek ve kişisel verileri paylaşmamak)",
              "targetId": 33
            }
          },
          {
            "q": 16,
            "A": {
              "text": "Özgüvenlerini geliştirme",
              "targetId": 34
            },
            "B": {
              "text": "Zamanı planlama becerilerini geliştirme",
              "targetId": 35
            }
          },
          {
            "q": 17,
            "A": {
              "text": "Okul kulüpleri (spor, satranç, tiyatro vb.) ve yarışmalar gibi etkinlikler hakkında bilgilenme",
              "targetId": 36
            },
            "B": {
              "text": "Sınav kaygısı ile başa çıkma becerileri kazanma",
              "targetId": 37
            }
          },
          {
            "q": 18,
            "A": {
              "text": "Zorbalıkla karşılaştığında ne yapmaları gerektiğini bilme",
              "targetId": 38
            },
            "B": {
              "text": "Duygu düzenleme becerilerini (olaylara farklı açıdan bakmak, duygusal destek aramak) kazanma",
              "targetId": 25
            }
          },
          {
            "q": 19,
            "A": {
              "text": "Okula devam etme isteklerini artırma",
              "targetId": 39
            },
            "B": {
              "text": "Okulda seçebilecekleri alan/dal hakkında bilgilenme",
              "targetId": 40
            }
          }
        ]
      }
    }
  }
};

export const RIBA_ROLE_META: Record<
  RibaRole,
  {
    label: string;
    shortLabel: string;
    badgeText: string;
    audienceWarning: string;
  }
> = {
  ogrenci: {
    label: 'Öğrenci Formu',
    shortLabel: 'Öğrenci',
    badgeText: 'ÖĞRENCİ ANKETİ',
    audienceWarning: 'YALNIZCA ÖĞRENCİ GRUBUNDA PAYLAŞINIZ (Veli veya öğretmenle karıştırmayınız)',
  },
  veli: {
    label: 'Veli Formu',
    shortLabel: 'Veli',
    badgeText: 'VELİ ANKETİ',
    audienceWarning: 'YALNIZCA VELİ WHATSAPP GRUBUNDA PAYLAŞINIZ (Öğrenci formuyla karıştırmayınız)',
  },
  ogretmen: {
    label: 'Öğretmen Formu',
    shortLabel: 'Öğretmen',
    badgeText: 'ÖĞRETMEN ANKETİ',
    audienceWarning: 'YALNIZCA OKUL ÖĞRETMENLER GRUBUNDA PAYLAŞINIZ',
  },
};

export function normalizeTrLower(input: string): string {
  return (input || '')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ş/g, 'ş')
    .replace(/Ğ/g, 'ğ')
    .replace(/Ü/g, 'ü')
    .replace(/Ö/g, 'ö')
    .replace(/Ç/g, 'ç')
    .toLowerCase()
    .trim();
}

export interface SchoolProfileDetection {
  primaryLevel: RibaLevel;
  recommendedLevels: RibaLevel[];
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  hasPreschoolClasses: boolean;
  detectedGrades: number[];
}

export interface ClassRibaEligibility {
  level: RibaLevel;
  grade: number | null;
  studentEligible: boolean;
  reason: string;
}

export function extractGradeNumber(className: string): number | null {
  const lower = normalizeTrLower(className);
  // Look for explicit "X. sınıf" or "X/A" or leading "ÖEİU - X. Sınıf"
  const m1 = lower.match(/(?:^|\b)(1[012]|[1-9])\s*\.\s*s[ıi]n[ıi]f/);
  if (m1) return parseInt(m1[1], 10);

  const m2 = lower.match(/^\s*(?:öe[iı]u\s*-\s*)?(1[012]|[1-9])\s*[\/\-\s]+[a-zçğıöşü]/);
  if (m2) return parseInt(m2[1], 10);

  const m3 = lower.match(/^(1[012]|[1-9])$/);
  if (m3) return parseInt(m3[1], 10);

  return null;
}

export function isPreschoolClassName(className: string): boolean {
  const lower = normalizeTrLower(className);
  return (
    lower.includes('anasınıf') ||
    lower.includes('ana sınıf') ||
    lower.includes('okul öncesi') ||
    lower.includes('okuloncesi') ||
    lower.includes('uygulama sınıf') ||
    /\b[345]\s*ya[şs]\b/.test(lower)
  );
}

export function classifyClassForRiba(
  className: string,
  enabledLevels: RibaLevel[],
  primaryLevel: RibaLevel
): ClassRibaEligibility {
  if (isPreschoolClassName(className)) {
    return {
      level: 'okuloncesi',
      grade: 0,
      studentEligible: false,
      reason: 'Okul öncesi şubelerinde MEB RİBA yönergesine göre yalnızca Öğretmen ve Veli formları uygulanır (Öğrenci formu yoktur).',
    };
  }

  const grade = extractGradeNumber(className);
  const lower = normalizeTrLower(className);

  if (grade !== null) {
    if (grade >= 1 && grade <= 2) {
      return {
        level: 'ilkokul',
        grade,
        studentEligible: false,
        reason: 'MEB İlkokul RİBA yönergesine göre 1. ve 2. sınıflarda Öğrenci Formu uygulanmaz; yalnızca Veli ve Öğretmen formları uygulanır.',
      };
    }
    if (grade >= 3 && grade <= 4) {
      return {
        level: 'ilkokul',
        grade,
        studentEligible: true,
        reason: 'İlkokul 3. ve 4. sınıf şubesi: Öğrenci, Veli ve Öğretmen formlarının tamamı uygulanır.',
      };
    }
    if (grade >= 5 && grade <= 8) {
      return {
        level: 'ortaokul',
        grade,
        studentEligible: true,
        reason: 'Ortaokul şubesi: Öğrenci, Veli ve Öğretmen formlarının tamamı uygulanır.',
      };
    }
    if (grade >= 9 && grade <= 12) {
      return {
        level: 'lise',
        grade,
        studentEligible: true,
        reason: 'Lise şubesi: Öğrenci, Veli ve Öğretmen formlarının tamamı uygulanır.',
      };
    }
  }

  if (lower.includes('hazırlık') || lower.includes('hazirlik')) {
    return {
      level: enabledLevels.includes('lise') ? 'lise' : primaryLevel,
      grade: 9,
      studentEligible: true,
      reason: 'Hazırlık sınıfı için Lise formları uygulanır.',
    };
  }

  const fallback = enabledLevels.includes(primaryLevel)
    ? primaryLevel
    : enabledLevels[0] || primaryLevel;

  if (fallback === 'okuloncesi') {
    return {
      level: 'okuloncesi',
      grade: 0,
      studentEligible: false,
      reason: 'Okul öncesi düzeyinde Öğrenci Formu uygulanmaz.',
    };
  }

  if (fallback === 'ilkokul') {
    return {
      level: 'ilkokul',
      grade: null,
      studentEligible: true,
      reason: 'Sınıf numarası belirlenemediği için İlkokul kuralları varsayılan olarak atandı (1.-2. sınıf ise öğrenci formunu paylaşmayınız).',
    };
  }

  return {
    level: fallback,
    grade: null,
    studentEligible: true,
    reason: `${RIBA_LEVELS[fallback].name} kuralları uygulanır.`,
  };
}

export function detectSchoolProfile(
  schoolName: string,
  classNames: string[] = []
): SchoolProfileDetection {
  const lower = normalizeTrLower(schoolName);
  const detectedGradesSet = new Set<number>();
  let hasPreschoolClasses = false;
  let hasPrimary = false;
  let hasMiddle = false;
  let hasHigh = false;

  for (const cn of classNames) {
    if (isPreschoolClassName(cn)) {
      hasPreschoolClasses = true;
    }
    const g = extractGradeNumber(cn);
    if (g !== null) {
      detectedGradesSet.add(g);
      if (g >= 1 && g <= 4) hasPrimary = true;
      else if (g >= 5 && g <= 8) hasMiddle = true;
      else if (g >= 9 && g <= 12) hasHigh = true;
    }
  }

  const detectedGrades = Array.from(detectedGradesSet).sort((a, b) => a - b);
  const nameMatchesPreschool =
    lower.includes('anaokulu') ||
    lower.includes('ana okulu') ||
    lower.includes('okul öncesi');
  const nameMatchesPrimary = lower.includes('ilkokul');
  const nameMatchesMiddle =
    lower.includes('ortaokul') ||
    lower.includes('imam hatip ortaokul') ||
    /\biho\b/.test(lower);
  const nameMatchesHigh =
    (lower.includes('lise') ||
      lower.includes('mtal') ||
      lower.includes('mesleki ve teknik') ||
      lower.includes('imam hatip lise') ||
      lower.includes('anadolu lise') ||
      lower.includes('fen lise') ||
      lower.includes('çpal') ||
      /\bihl\b/.test(lower)) &&
    !nameMatchesMiddle;

  const levels = new Set<RibaLevel>();
  if (nameMatchesPreschool && !nameMatchesPrimary && !nameMatchesMiddle && !nameMatchesHigh) {
    levels.add('okuloncesi');
  }
  if (nameMatchesPrimary || hasPrimary) levels.add('ilkokul');
  if (nameMatchesMiddle || hasMiddle) levels.add('ortaokul');
  if (nameMatchesHigh || hasHigh) levels.add('lise');
  if (hasPreschoolClasses || nameMatchesPreschool) levels.add('okuloncesi');

  let primaryLevel: RibaLevel = 'ortaokul';
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  let reason = 'Okul adı ve sınıf şubelerine göre otomatik belirlendi.';

  if (nameMatchesHigh && !nameMatchesMiddle && !nameMatchesPrimary) {
    primaryLevel = 'lise';
    confidence = 'high';
    reason = 'Okul adında Lise / MTAL / İHL ifadesi algılandı.';
  } else if (nameMatchesMiddle && !nameMatchesPrimary) {
    primaryLevel = 'ortaokul';
    confidence = 'high';
    reason = 'Okul adında Ortaokul ifadesi algılandı.';
  } else if (nameMatchesPrimary && !nameMatchesMiddle) {
    primaryLevel = 'ilkokul';
    confidence = 'high';
    reason = hasPreschoolClasses
      ? 'İlkokul + Okul Öncesi (Anasınıfı) şubeleri birlikte algılandı.'
      : 'Okul adında İlkokul ifadesi algılandı (3.-4. sınıflar için Öğrenci, tüm sınıflar için Veli/Öğretmen formları).';
  } else if (nameMatchesPreschool) {
    primaryLevel = 'okuloncesi';
    confidence = 'high';
    reason = 'Anaokulu / Okul Öncesi kurumu algılandı (Yalnızca Öğretmen ve Veli formları).';
  } else if (hasHigh) {
    primaryLevel = 'lise';
    confidence = 'high';
    reason = 'Yüklü 9.-12. sınıf şubelerinden Lise düzeyi algılandı.';
  } else if (hasMiddle) {
    primaryLevel = 'ortaokul';
    confidence = 'high';
    reason = 'Yüklü 5.-8. sınıf şubelerinden Ortaokul düzeyi algılandı.';
  } else if (hasPrimary) {
    primaryLevel = 'ilkokul';
    confidence = 'high';
    reason = 'Yüklü 1.-4. sınıf şubelerinden İlkokul düzeyi algılandı.';
  } else if (hasPreschoolClasses) {
    primaryLevel = 'okuloncesi';
    confidence = 'high';
    reason = 'Anasınıfı şubelerinden Okul Öncesi düzeyi algılandı.';
  } else {
    confidence = 'low';
    reason = 'Okul adından kademe kesinleştirilemedi; lütfen uygulayacağınız RİBA kademelerini seçiniz.';
  }

  if (levels.size === 0) levels.add(primaryLevel);
  const order: RibaLevel[] = ['okuloncesi', 'ilkokul', 'ortaokul', 'lise'];
  const recommendedLevels = order.filter((l) => levels.has(l));

  return {
    primaryLevel,
    recommendedLevels,
    confidence,
    reason,
    hasPreschoolClasses,
    detectedGrades,
  };
}
