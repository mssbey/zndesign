import { site } from "@/lib/data";
import { Photo } from "./shared";
import { getGallery } from "@/lib/gallery";

// Only owner-supplied photography is shown as the factory. Never substitute stock imagery.
export async function FactoryGallery() {
  const items = (await getGallery()).filter(item => item.category === "factory");
  const images = [...items, ...site.factoryImages.filter(src => !items.some(item => item.src === src)).map((src, i) => ({ src, caption: `Zenn Bedding üretim tesisinden görünüm ${i + 1}` }))];
  if (!images.length) return null;
  return <div className="wrap factory-gallery">{images.map(item => <figure key={item.src}><Photo src={item.src} alt={item.caption}/><figcaption>{item.caption}</figcaption></figure>)}</div>;
}
