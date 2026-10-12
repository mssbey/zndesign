"use client";
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";
import type { FabricGroup } from "@/lib/fabrics";
import type { ContentValues } from "@/lib/content-sections";
import { Lines } from "./shared";
import { whatsappUrl } from "@/lib/contact";

export function FabricCatalog({ groups: fabricGroups, content }: { groups: FabricGroup[]; content: ContentValues }) {
  const [selected, setSelected] = useState<{ fabric: string; color: string } | null>(null);
  return <>
    <div className="wrap page-intro fabric-intro"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p><Lines text={content.text}/></p></div>
    <div className="wrap">{content.disclaimer && <p className="palette-disclaimer"><Lines text={content.disclaimer}/></p>}<nav className="fabric-jump" aria-label="Kumaş grupları">{fabricGroups.map(f => <a href={`#${f.slug}`} key={f.slug}>{f.name} <span aria-hidden="true">↓</span></a>)}</nav></div>
    <div className="wrap fabric-groups">{fabricGroups.map((fabric, i) => <section className="fabric-group" id={fabric.slug} key={fabric.slug}><div className="fabric-group-heading"><div><p className="eyebrow">KUMAŞ GRUBU / {String(i + 1).padStart(2, "0")}</p><h2>{fabric.name}</h2><p>{fabric.note}</p></div><span>{content.countLabel.replace("{sayı}", String(fabric.colors.length))}</span></div><div className="fabric-swatches">{fabric.colors.map((color, ci) => {
      const active = selected?.fabric === fabric.name && selected.color === color.name;
      return <button type="button" key={ci} className={`fabric-swatch ${active ? "selected" : ""}`} aria-pressed={active} aria-label={`${fabric.name} — ${color.name}`} onClick={() => setSelected({ fabric: fabric.name, color: color.name })}><span className={`fabric-texture ${fabric.texture}`} style={{ "--swatch": color.hex, ...(color.image ? { backgroundImage: `url(${color.image})` } : {}) } as CSSProperties}><span className="fabric-tick" aria-hidden="true">✓</span></span><span className="fabric-color-label">{color.name}<span aria-hidden="true">{active ? "✓" : "+"}</span></span></button>;
    })}</div></section>)}</div>
    <div className="fabric-selection" aria-live="polite"><div className="wrap"><div><span className="eyebrow">{selected ? "SEÇTİĞİNİZ KUMAŞ & RENK" : "SİZİN DOKUNUŞUNUZ"}</span><p>{selected ? `${selected.fabric} / ${selected.color}` : content.emptyText}</p></div>{selected ? <div className="actions"><Link className="button" href={`/ozel-uretim?kumas=${encodeURIComponent(selected.fabric)}&renk=${encodeURIComponent(selected.color)}#talep`}>Bu Seçimle Tasarlayalım ↗</Link><a className="text-link" href={whatsappUrl(`Merhaba, ${selected.fabric} kumaşı ve ${selected.color} rengi için gerçek kartela ve üretim seçenekleri hakkında bilgi almak istiyorum.`)}>WhatsApp’tan Sorun ↗</a></div> : <Link className="text-link" href="/fabrikamiz">{content.visitLinkText}</Link>}</div></div>
  </>;
}
