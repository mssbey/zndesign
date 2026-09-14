# ZN Design | Uyku & Yaşam

Next.js App Router, TypeScript ve Tailwind CSS ile hazırlanmış dijital ürün kataloğu.

## Çalıştırma

```sh
npm install
npm run dev -- --port 3001
```

Üretim: `npm run build` ardından `npm run start -- --port 3001`.

## İçerik ve iletişim

- `src/lib/data.ts`: 16 demo ürün, 6 kategori, 3 demo koleksiyon ve merkezi marka verisi.
- `.env.example` dosyasını `.env.local` olarak kopyalayın. `NEXT_PUBLIC_WHATSAPP_NUMBER` uluslararası formatta, ülke koduyla yazılır. `NEXT_PUBLIC_PHONE` isteğe bağlıdır.
- `NEXT_PUBLIC_SITE_URL`: gerçek HTTPS domain. Boşken sahte canonical veya sitemap adresi üretilmez.
- `NEXT_PUBLIC_LOGO_PATH`: `public` altına eklenecek orijinal, kırpılmış SVG/şeffaf PNG logosunun `/logo.svg` gibi yolu. Logo PDF'i bu oturumda sağlanmadığı için mevcut geometrik logo taklit edilmedi; geçici düz marka metni kullanıldı. PDF sağlandığında içindeki logo, Bedding yazısı korunarak çıkarılmalıdır.
- NEXT_PUBLIC değişkenleri değişince yeniden build alınır.
- Fiyatlar, telefon, çalışma saatleri ve sosyal medya bilgileri uydurulmamıştır. Kampanya ürünleri veride `campaign: true` ile yönetilir; başlangıçta aktif kampanya yoktur.
- WhatsApp numarası yokken ürün mesajı ve özel üretim talebi iletişim sayfasına taşınır. İletişim formu mesaj hazırlar/kopyalar; sunucuya kayıt veya gönderim yapmaz.
- Görseller yapay zekâyla oluşturulmuş temsili görsellerdir. Gerçek ürün fotoğrafları ve seçenekleriyle değiştirilmelidir. Demo ürünler bazı görselleri paylaşır.

## Kontroller

```sh
npm run lint
npm run build
node tests/contact.mjs
npx playwright install chromium
# Üretim sunucusu localhost:3001 üzerinde çalışırken:
node tests/browser.mjs
```

Tarayıcı kontrolleri: 1440px masaüstü / 390px mobil ana sayfa, katalog ve detay ekranları; taşma, mobil menü, arama/kategori filtreleri, URL koruma, temizleme, kampanya boş durumu, galeri, ürün ve özel üretim mesajları, sayfa rotaları ve 404.

Ekran görüntüleri ve test özeti `artifacts/` altında. Tarayıcı eklentisinde bağlı tarayıcı bulunmadığından yerel Playwright Chromium kullanıldı.

Görsellerin üretim notları: `IMAGE-PROMPTS.md`.

Tüm testleri kendi geçici üretim sunucusuyla çalıştırmak için (3001 portu boşken): 
ode tests/run.mjs. Ek kontroller 320/768/1024 px taşma, bütün ürün/koleksiyon rotaları, görsel yükleme, tüm filtre boyutları ve alfabetik sıralamayı kapsar.
