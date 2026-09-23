"use client";
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";
import { fabricGroups } from "@/lib/fabrics";
import { whatsappUrl } from "@/lib/contact";

export function FabricCatalog() {
  const [selected, setSelected] = useState<{ fabric: string; color: string } | null>(null);
  return <>
    <div className="wrap page-intro fabric-intro"><p className="eyebrow">Zenn Bedding · DOKU & TON</p><h1>Kumaş & Renk Kartelası</h1><p>Önce dokuyu, sonra size yakın rengi seçin.<br/>Yaşam alanınızın karakterini birlikte oluşturalım.</p></div>
    <div className="wrap"><p className="palette-disclaimer">Dijital renk ve doku örnekleri temsilidir; gerçek üretici kartelası değildir. Renk adları ilham amaçlıdır. Güncel renk, kumaş kodu ve bulunabilirliği bizimle doğrulayın; gerçek kumaşları ziyaretinizde inceleyin.</p><nav className="fabric-jump" aria-label="Kumaş grupları">{fabricGroups.map(f => <a href={`#${f.slug}`} key={f.slug}>{f.name} <span aria-hidden="true">↓</span></a>)}</nav></div>
    <div className="wrap fabric-groups">{fabricGroups.map((fabric, i) => <section className="fabric-group" id={fabric.slug} key={fabric.slug}><div className="fabric-group-heading"><div><p className="eyebrow">KUMAŞ GRUBU / 0{i + 1}</p><h2>{fabric.name}</h2><p>{fabric.note}</p></div><span>6 temsili renk</span></div><div className="fabric-swatches">{fabric.colors.map(color => {
      const active = selected?.fabric === fabric.name && selected.color === color.name;
      return <button type="button" key={color.name} className={`fabric-swatch ${active ? "selected" : ""}`} aria-pressed={active} aria-label={`${fabric.name} — ${color.name}`} onClick={() => setSelected({ fabric: fabric.name, color: color.name })}><span className={`fabric-texture ${fabric.texture}`} style={{ "--swatch": color.hex, ...(color.image ? { backgroundImage: `url(${color.image})` } : {}) } as CSSProperties}><span className="fabric-tick" aria-hidden="true">✓</span></span><span className="fabric-color-label">{color.name}<span aria-hidden="true">{active ? "✓" : "+"}</span></span></button>;
    })}</div></section>)}</div>
    <div className="fabric-selection" aria-live="polite"><div className="wrap"><div><span className="eyebrow">{selected ? "SEÇTİĞİNİZ KUMAŞ & RENK" : "SİZİN DOKUNUŞUNUZ"}</span><p>{selected ? `${selected.fabric} / ${selected.color}` : "Bir renk seçerek başlayın."}</p></div>{selected ? <div className="actions"><Link className="button" href={`/ozel-uretim?kumas=${encodeURIComponent(selected.fabric)}&renk=${encodeURIComponent(selected.color)}#talep`}>Bu Seçimle Tasarlayalım ↗</Link><a className="text-link" href={whatsappUrl(`Merhaba, ${selected.fabric} kumaşı ve ${selected.color} rengi için gerçek kartela ve üretim seçenekleri hakkında bilgi almak istiyorum.`)}>WhatsApp’tan Sorun ↗</a></div> : <Link className="text-link" href="/fabrikamiz">Kumaşları Yerinde İnceleyin ↗</Link>}</div></div>
  </>;
}
