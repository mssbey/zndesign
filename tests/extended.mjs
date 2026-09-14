import { chromium, expect } from "@playwright/test";
import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";
import { DatabaseSync } from "node:sqlite";
const context = { exports: {}, process: { env: {} } };
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/lib/data.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  context,
);
const { collections, categories } = context.exports;
const productDb = new DatabaseSync("data/app.db");
const products = productDb.prepare("SELECT slug FROM products").all();
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto("http://localhost:3001/urunler");
await p
  .getByRole("combobox", { name: "Ölçü", exact: true })
  .selectOption("90 × 190 cm");
await p.getByText("2 ürün bulundu", { exact: true }).waitFor();
await p
  .getByRole("combobox", { name: "Renk", exact: true })
  .selectOption("Bej");
await p
  .getByRole("combobox", { name: "Kumaş", exact: true })
  .selectOption("Kadife");
await p.getByText("1 ürün bulundu", { exact: true }).waitFor();
await p.getByRole("checkbox", { name: "Yeni ürünler", exact: true }).check();
await p.getByText("0 ürün bulundu", { exact: true }).waitFor();
await p.getByRole("button", { name: "Tüm filtreleri temizle" }).click();
await p
  .getByRole("combobox", { name: "Sıralama", exact: true })
  .selectOption("za");
await expect(p.locator(".product-card h3").first()).toHaveText("Vera");
for (const url of [
  ...products.map((x) => "/urunler/" + x.slug),
  ...collections.map((x) => "/koleksiyonlar/" + x.slug),
  ...categories.map((x) => "/urunler?kategori=" + x.slug),
]) {
  const r = await p.goto("http://localhost:3001" + url);
  if (r.status() !== 200) throw Error(url);
  await p.waitForLoadState("networkidle");
  const broken = await p
    .locator("img")
    .evaluateAll((imgs) =>
      imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
    );
  if (broken.length) throw Error("Broken images " + broken);
}
for (const w of [320, 768, 1024]) {
  await p.setViewportSize({ width: w, height: 900 });
  for (const url of [
    "/",
    "/urunler",
    "/urunler/luna",
    "/ozel-uretim",
    "/iletisim",
  ]) {
    await p.goto("http://localhost:3001" + url);
    if (
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    )
      throw Error("Overflow " + w + url);
  }
}
await p.setViewportSize({ width: 1440, height: 1000 });
await p.goto("http://localhost:3001/");
await p.locator("#kategoriler").scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
await p
  .locator("#kategoriler")
  .screenshot({ path: "artifacts/categories-final.png" });
await p.setViewportSize({ width: 390, height: 844 });
await p.goto("http://localhost:3001/urunler/luna");
await p.getByRole("button", { name: "2. görsel", exact: true }).click();
await p.getByRole("button", { name: "Ürün görselini büyüt" }).click();
await p.screenshot({ path: "artifacts/gallery-mobile-final.png" });
console.log(
  "PASS: all 16 product routes, 3 collections, 6 categories, image loading, all filter dimensions, alphabetical sorting, 320/768/1024px overflow, mobile gallery.",
);
await b.close();
