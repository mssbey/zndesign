"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { categories, site } from "@/lib/data";
import { whatsappUrl } from "@/lib/contact";
export function RequestForm({ custom = false }: { custom?: boolean }) {
  const params = useSearchParams();
  const [prepared, setPrepared] = useState("");
  const [copied, setCopied] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const message = custom
          ? [
              "Merhaba, özel üretim hakkında bilgi almak istiyorum.",
              params.get("urun") && `Model: ${params.get("urun")}`,
              f.get("category") && `Kategori: ${f.get("category")}`,
              f.get("size") && `Ölçü: ${f.get("size")}`,
              f.get("preference") && `Renk/Kumaş: ${f.get("preference")}`,
              f.get("notes") && `Notlar: ${f.get("notes")}`,
            ]
              .filter(Boolean)
              .join("\n")
          : [f.get("name") && `Adım: ${f.get("name")}`, f.get("notes")]
              .filter(Boolean)
              .join("\n");
        const url = whatsappUrl(message);
        if (url.startsWith("https://")) window.location.assign(url);
        else if (custom) window.location.assign(url);
        else {
          setPrepared(message);
          setCopied(false);
        }
      }}
    >
      <h2>{custom ? "Birlikte tasarlayalım." : "Birlikte konuşalım."}</h2>
      {custom ? (
        <>
          <label>
            İlgilenilen ürün kategorisi
            <select
              name="category"
              defaultValue={
                categories.find((c) => c.slug === params.get("kategori"))
                  ?.name || ""
              }
              required
            >
              <option value="">Kategori seçin</option>
              {categories.map((c) => (
                <option key={c.slug}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            İstenen ölçü
            <input
              name="size"
              placeholder="Örn. 160 × 200 cm"
              maxLength={100}
            />
          </label>
          <label>
            Renk / kumaş tercihi
            <input
              name="preference"
              placeholder="Örn. krem, keten dokulu"
              maxLength={200}
            />
          </label>
        </>
      ) : (
        <label>
          Adınız
          <input name="name" autoComplete="name" maxLength={100} />
        </label>
      )}
      <label>
        {custom ? "Ek açıklama" : "Mesajınız"}
        <textarea
          name="notes"
          defaultValue={custom ? "" : params.get("mesaj") || ""}
          placeholder={
            custom
              ? "Aklınızdaki detayları bizimle paylaşın."
              : "Hangi ürün hakkında bilgi almak istersiniz?"
          }
          required={!custom}
          maxLength={4000}
        />
      </label>
      <p className="form-note">
        {site.whatsapp
          ? "Bu form WhatsApp’ta bir mesaj hazırlar. Mesajı WhatsApp üzerinden siz gönderirsiniz."
          : custom
            ? "Talebiniz iletişim sayfasına aktarılır. WhatsApp iletişim bilgimiz henüz paylaşılmadı."
            : "WhatsApp iletişim bilgimiz henüz paylaşılmadı. Mesajınızı hazırlayıp kopyalayabilir veya mağazamızı ziyaret edebilirsiniz."}{" "}
        Bilgiler bu sitede kaydedilmez.
      </p>
      <button className="button" type="submit">
        {custom
          ? "Talebi WhatsApp ile Gönder"
          : site.whatsapp
            ? "WhatsApp ile Devam Et"
            : "Mesajı Hazırla"}{" "}
        <span aria-hidden="true">⟶</span>
      </button>
      {prepared && (
        <div aria-live="polite">
          <p className="form-note">Mesajınız hazır; henüz gönderilmedi.</p>
          <pre className="prepared-message">{prepared}</pre>
          <button
            type="button"
            className="text-link reset-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(prepared);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "Mesaj kopyalandı" : "Mesajı Kopyala"}
          </button>
        </div>
      )}
    </form>
  );
}
