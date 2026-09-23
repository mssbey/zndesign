# Zenn Bedding | Uyku & Yaşam

Next.js App Router, TypeScript ve Tailwind CSS ile hazırlanmış dijital ürün kataloğu.

## Çalıştırma

```sh
npm install
npm run dev -- --port 3001
```

Üretim: `npm run build` ardından `npm run start -- --port 3001`.

## İçerik ve iletişim

- `src/lib/data.ts`: 7 ürün kategorisi, 6 koleksiyon ve merkezi marka verisi. Ürünler mevcut Neon veritabanından okunur; eski kategori ve koleksiyon kodları yeni yapıya eşlenir, ürün kayıtları silinmez.
- `.env.example` dosyasını `.env.local` olarak kopyalayın. `NEXT_PUBLIC_WHATSAPP_NUMBER` uluslararası formatta, ülke koduyla yazılır. `NEXT_PUBLIC_PHONE` isteğe bağlıdır. Varsayılan iletişim numarası, firma tarafından onaylanan **+90 532 679 17 67**’dir.
- `NEXT_PUBLIC_SITE_URL`: canonical ve sitemap için HTTPS domain. Varsayılan, projeye bağlı doğrulanmış canlı alan adı `https://www.zenbedding.com.tr`.
- `NEXT_PUBLIC_LOGO_PATH`: isteğe bağlı logo yolu. Mevcut orijinal logo kullanılır; erişilebilir adı Zenn Bedding’dir.
- Ana sayfa mevcut mağaza tasarımını kullanır: arama ve sol kategori alanı, büyük slayt, sekmeli ürün kaydırıcısı, koyu koleksiyon bandı, marka tanıtımı, referanslar ve hizmet şeridi. Dikey alt menüler, kartela ve form ekleri `zenn.css` içinde mevcut tasarıma uyarlanmıştır.
- `NEXT_PUBLIC_FACTORY_IMAGES`: yalnızca gerçek fabrika fotoğraflarının virgülle ayrılan dosya yolları veya URL’leri. Örnek: `/images/fabrika-1.webp,/images/fabrika-2.webp`. Boşken temsili fabrika fotoğrafı gösterilmez.
- `NEXT_PUBLIC_FACTORY_ADDRESS`: doğrulanmış fabrika adresi. Boşken mağaza adresi fabrika adresi olarak kullanılmaz; ziyaret için iletişime yönlendirilir.
- `src/lib/fabrics.ts`: Baby Face, Luna, Teddy, Puffy, Muzzy, Anka, Coco, Bukle grupları. Renk adları ve CSS dokuları açıkça temsili önizlemelerdir; gerçek tedarikçi kodları/görselleri geldiğinde buradaki `colors` verisi ve `image` alanı güncellenir. Kumaş seçimi özel üretim formuna aktarılır.
- NEXT_PUBLIC değişkenleri değişince yeniden build alınır.
- Fiyatlar, telefon, çalışma saatleri ve sosyal medya bilgileri uydurulmamıştır. Kampanya ürünleri veride `campaign: true` ile yönetilir; başlangıçta aktif kampanya yoktur.
- WhatsApp numarası yokken ürün mesajları iletişim sayfasına taşınır. Özel üretim formu talebi aynı sayfada hazırlayıp kopyalama/cihaz üzerinden paylaşma seçeneklerini sunar. Geçerli numara tanımlanınca WhatsApp bağlantısı görünür; mesajı müşteri gönderir.
- Özel üretim talebi en fazla 5 JPG/PNG/WEBP görselini (toplam 3 MB) kabul eder. `BLOB_READ_WRITE_TOKEN` tanımlı public Vercel Blob deposuna, müşterinin açık onayıyla `/api/reference-images` üzerinden yüklenir. Görseller aynı rastgele talep kimliği altında saklanır; bağlantıları ve talep kimliği WhatsApp metnine eklenir. Dosya içeriği, toplam boyut, origin ve istek sıklığı doğrulanır; kısmi yükleme hatasında tamamlanan dosyalar temizlenir. Canlı ortamda ek WAF hız sınırı ve saklama süresi politikası yapılandırılmalıdır.
- Yükleme hizmeti kullanılamıyorsa seçimler korunur; desteklenen cihazlarda Web Share ile görseller ve metin birlikte paylaşılır. Diğer cihazlarda metin kopyalanır, görseller WhatsApp sohbetine ayrıca eklenir. Form metni sunucuda saklanmaz; yüklenen görseller bağlantıya sahip kişilerce erişilebilir.
- `/hakkimizda` ve eski koleksiyon bağlantıları kalıcı olarak yeni adreslerine yönlendirilir. Yeni sayfalar `/biz-kimiz`, `/kumas-renk-kartelasi`, `/fabrikamiz` sitemap’e eklenmiştir.
- Görseller yapay zekâyla oluşturulmuş temsili görsellerdir. Gerçek ürün fotoğrafları ve seçenekleriyle değiştirilmelidir. Demo ürünler bazı görselleri paylaşır.

## Kontroller

```sh
npm run lint
npm run build
node tests/contact.mjs
node tests/reference-images.mjs
npx playwright install chromium
# Üretim sunucusu localhost:3001 üzerinde çalışırken:
node tests/revisions.mjs
```

Revizyon kontrolleri: 320–1440px taşma, masaüstü/mobil dikey menüler, klavye ile kapatma, kategori bağlantıları, 8 kumaş grubu ve 48 renk seçeneği, seçimlerin forma taşınması, çoklu görsel yükleme/kaldırma, hata ve doğrudan paylaşım akışı, mesajda referans bağlantıları, marka/SEO ve eski adres yönlendirmeleri. API testleri dosya imzasını, izinleri, boyut/sayı sınırlarını, başarısız yükleme temizliğini ve hız sınırını sınar.

Ekran görüntüleri ve test özeti `artifacts/` altında. Tarayıcı eklentisinde bağlı tarayıcı bulunmadığından yerel Playwright Chromium kullanıldı.

Görsellerin üretim notları: `IMAGE-PROMPTS.md`.

Güncel testleri kendi geçici üretim sunucusuyla çalıştırmak için (önce build alın ve 3001 portunu boş bırakın): `node tests/run.mjs`. `browser.mjs` ve `extended.mjs` önceki menü/veritabanı yapısına ait eski testlerdir; güncel çalıştırıcı `revisions.mjs` kullanır.
