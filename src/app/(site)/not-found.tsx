import Link from "next/link";
export default function NotFound() {
  return (
    <div className="not-found">
      <p className="eyebrow">404 / SAYFA BULUNAMADI</p>
      <h1>Yeni bir yoldan keşfedelim.</h1>
      <p>Aradığınız sayfa veya ürün bulunamadı.</p>
      <Link className="button" href="/urunler">
        Ürünleri Keşfet ⟶
      </Link>
    </div>
  );
}
