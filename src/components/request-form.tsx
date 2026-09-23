"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { categories, categoryAliases, site } from "@/lib/data";
import { whatsappUrl } from "@/lib/contact";
import { validateReferenceImages } from "@/lib/reference-images";

type SelectedImage = { file: File; preview: string };
export function RequestForm({ custom = false }: { custom?: boolean }) {
  const params = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const previews = useRef(new Set<string>());
  const uploaded = useRef<{ files: File[]; urls: string[]; requestId: string } | null>(null);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [prepared, setPrepared] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploadFailed, setUploadFailed] = useState(false);
  const [hasLinks, setHasLinks] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareNote, setShareNote] = useState("");
  useEffect(() => {
    const urls = previews.current;
    return () => { for (const url of urls) URL.revokeObjectURL(url); urls.clear(); };
  }, []);

  function prepare(form: FormData, urls: string[] = [], requestId = "") {
    const message = [
      custom ? "Merhaba, Zenn Bedding’den özel üretim talep etmek istiyorum." : "Merhaba, Zenn Bedding hakkında bilgi almak istiyorum.",
      requestId && `Talep referansı: ${requestId}`,
      form.get("name") && `Adım: ${form.get("name")}`,
      custom && params.get("urun") && `Model: ${params.get("urun")}`,
      custom && form.get("category") && `Kategori: ${form.get("category")}`,
      custom && form.get("size") && `Ölçü: ${form.get("size")}`,
      custom && form.get("preference") && `Kumaş / Renk: ${form.get("preference")}`,
      form.get("notes") && `Notlar: ${form.get("notes")}`,
      urls.length ? `Referans görselleri:\n${urls.map((url, i) => `${i + 1}. ${url}`).join("\n")}` : images.length ? `Referans görselleri (ek olarak paylaşılacak): ${images.map(image => image.file.name).join(", ")}` : "",
    ].filter(Boolean).join("\n");
    setPrepared(message); setCopied(false); setHasLinks(urls.length > 0); setShareNote("");
  }

  return <form ref={formRef} className="request-form" onChange={() => { setPrepared(""); setShareNote(""); }} onSubmit={async event => {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setError(""); setUploadFailed(false);
    if (!images.length) { prepare(data); return; }
    if (uploaded.current && images.every((image, i) => image.file === uploaded.current?.files[i]) && images.length === uploaded.current.files.length) {
      prepare(data, uploaded.current.urls, uploaded.current.requestId); return;
    }
    setBusy(true);
    try {
      const payload = new FormData();
      images.forEach(image => payload.append("images", image.file));
      payload.append("consent", "yes");
      const response = await fetch("/api/reference-images", { method: "POST", body: payload, signal: AbortSignal.timeout(60000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Görseller yüklenemedi. Tekrar deneyin.");
      uploaded.current = { files: images.map(image => image.file), urls: result.urls, requestId: result.requestId };
      prepare(data, result.urls, result.requestId);
    } catch (err) {
      setError(err instanceof Error && err.name !== "TimeoutError" ? err.message : "Yükleme tamamlanamadı. Tekrar deneyin veya doğrudan paylaşın.");
      setUploadFailed(true);
    } finally { setBusy(false); }
  }}>
    <h2>{custom ? "Birlikte tasarlayalım." : "Birlikte konuşalım."}</h2>
    <fieldset disabled={busy} className="request-fields">
      <label>Adınız<input name="name" autoComplete="name" placeholder="Size nasıl hitap edelim?" maxLength={100}/></label>
      {custom && <>
        <label>İlgilenilen ürün kategorisi<select name="category" defaultValue={categories.find(c => c.slug === (categoryAliases[params.get("kategori") || ""] || params.get("kategori")))?.name || ""} required><option value="">Kategori seçin</option>{categories.map(c => <option key={c.slug}>{c.name}</option>)}</select></label>
        <label>İstenen ölçü<input name="size" placeholder="Örn. 160 × 200 cm" maxLength={100}/></label>
        <label>Renk / kumaş tercihi<input name="preference" defaultValue={[params.get("kumas"), params.get("renk")].filter(Boolean).join(" / ")} placeholder="Örn. Baby Face / Kum Beji" maxLength={200}/></label>
      </>}
      <label>{custom ? "Ek açıklama" : "Mesajınız"}<textarea name="notes" defaultValue={custom ? "" : params.get("mesaj") || ""} placeholder={custom ? "Aklınızdaki tasarımı ve detayları bizimle paylaşın." : "Size nasıl yardımcı olabiliriz?"} required={!custom} maxLength={4000}/></label>
      {custom && <div className="reference-field"><label htmlFor="reference-images">Ürün görseli / Referans görseli</label><p id="reference-help">Beğendiğiniz ürünün veya istediğiniz tasarımın görselini yükleyin. Ürün fotoğrafı, çizim veya ilham aldığınız bir tasarım olabilir.</p><label className="reference-dropzone" htmlFor="reference-images"><span aria-hidden="true">↥</span><strong>Görsellerinizi seçin</strong><span>En fazla 5 görsel · JPG, PNG, WEBP · Toplam 3 MB</span><input id="reference-images" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-describedby="reference-help" onChange={event => {
        const files = [...images.map(image => image.file), ...Array.from(event.target.files || [])];
        event.target.value = "";
        if (!files.length) return;
        const validation = validateReferenceImages(files);
        if (validation) { setError(validation); return; }
        for (const image of images) { URL.revokeObjectURL(image.preview); previews.current.delete(image.preview); }
        setImages(files.map(file => { const preview = URL.createObjectURL(file); previews.current.add(preview); return { file, preview }; }));
        setPrepared(""); setError(""); setUploadFailed(false); uploaded.current = null;
      }}/></label>
      {images.length > 0 && <><div className="reference-previews">{images.map((image, i) => <div key={image.preview}><Image src={image.preview} alt={image.file.name} width={120} height={100} unoptimized/><span title={image.file.name}>{image.file.name}</span><button type="button" aria-label={`${image.file.name} görselini kaldır`} onClick={() => { URL.revokeObjectURL(image.preview); previews.current.delete(image.preview); setImages(images.filter((_, index) => i !== index)); setPrepared(""); setError(""); uploaded.current = null; }}>×</button></div>)}</div><label className="reference-consent"><input type="checkbox" name="consent" required/><span>Görsellerimin talebime eklenmek üzere yüklenmesini ve bağlantıya sahip kişiler tarafından görüntülenebilmesini kabul ediyorum.</span></label></>}
      </div>}
    </fieldset>
    <p className="form-note">{site.whatsapp ? "Talebinizi hazırlayın, ardından WhatsApp’ta kontrol ederek gönderin." : "WhatsApp numaramız henüz eklenmedi. Talebinizi hazırlayıp kopyalayabilir veya cihazınızın paylaşım menüsünü kullanabilirsiniz."} {images.length > 0 && "Görseller talep referansına bağlı bağlantılar olarak mesaja eklenir."} Form metni sitede kaydedilmez.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button" type="submit" disabled={busy} aria-busy={busy}>{busy ? "Görseller yükleniyor…" : custom ? "Talebi Hazırla" : "Mesajı Hazırla"} <span aria-hidden="true">↗</span></button>
    {uploadFailed && <button type="button" className="text-link reset-button fallback-share" onClick={() => { if (formRef.current?.reportValidity()) { prepare(new FormData(formRef.current)); setError(""); } }}>Yüklemeden Hazırla ve Doğrudan Paylaş</button>}
    {prepared && <div className="request-result" aria-live="polite"><p><b>Talebiniz hazır; henüz gönderilmedi.</b></p>{images.length > 0 && <p className="form-note">{hasLinks ? `${images.length} görsel bağlantısı talebinize eklendi. WhatsApp’ta metinle birlikte iletilir.` : "Görseller henüz yüklenmedi. Görsellerle Paylaş düğmesiyle WhatsApp’ı seçin. Cihazınız dosya paylaşımını desteklemiyorsa mesajı kopyalayıp görselleri WhatsApp sohbetine ayrıca ekleyin."}</p>}<pre className="prepared-message">{prepared}</pre><div className="request-result-actions">{site.whatsapp && <a className="button" href={whatsappUrl(prepared)} target="_blank" rel="noreferrer">WhatsApp ile Devam Et ↗</a>}{images.length > 0 && <button type="button" className="button outline" disabled={sharing} onClick={async () => {
      const files = images.map(image => image.file);
      if (!navigator.canShare?.({ files, text: prepared })) { setShareNote("Bu cihaz görsel paylaşımını desteklemiyor. Mesajı kopyalayıp seçtiğiniz görselleri WhatsApp sohbetine ayrıca ekleyebilirsiniz."); return; }
      setSharing(true);
      try { await navigator.share({ files, text: prepared, title: "Zenn Bedding — Özel Üretim Talebi" }); setShareNote("Paylaşım menüsü kapandı. Mesaj ve görsellerin seçtiğiniz sohbette gönderildiğini kontrol edin."); }
      catch (err) { if (!(err instanceof Error && err.name === "AbortError")) setShareNote("Paylaşım açılamadı. Mesajı kopyalayıp görselleri WhatsApp sohbetine ayrıca ekleyin."); }
      finally { setSharing(false); }
    }}>Görsellerle Paylaş ↗</button>}<button type="button" className="text-link reset-button" onClick={async () => { try { await navigator.clipboard.writeText(prepared); setCopied(true); } catch { setShareNote("Otomatik kopyalama kullanılamıyor. Yukarıdaki metni seçerek kopyalayabilirsiniz."); } }}>{copied ? "Mesaj kopyalandı" : "Mesajı Kopyala"}</button></div>{shareNote && <p className="form-note" role="status">{shareNote}</p>}</div>}
  </form>;
}
