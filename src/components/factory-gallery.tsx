import { site } from "@/lib/data";
import { Photo } from "./shared";

// Only owner-supplied photography is shown as the factory. Never substitute stock imagery.
export function FactoryGallery() {
  if (!site.factoryImages.length) return null;
  return <div className="wrap factory-gallery">{site.factoryImages.map((src, i) => <figure key={src}><Photo src={src} alt={`Zenn Bedding üretim tesisinden görünüm ${i + 1}`}/><figcaption>Üretim tesisimiz · {String(i + 1).padStart(2, "0")}</figcaption></figure>)}</div>;
}
