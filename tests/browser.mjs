import { chromium } from "@playwright/test";
import fs from "node:fs";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
for (const [name, url] of [
  ["home", "/"],
  ["catalog", "/urunler"],
  ["detail", "/urunler/luna"],
]) {
  await page.goto("http://localhost:3001" + url);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: `artifacts/${name}-desktop.png`,
    fullPage: true,
  });
}
await page.setViewportSize({ width: 390, height: 844 });
for (const [name, url] of [
  ["home", "/"],
  ["catalog", "/urunler"],
  ["detail", "/urunler/luna"],
]) {
  await page.goto("http://localhost:3001" + url);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: `artifacts/${name}-mobile.png`,
    fullPage: true,
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  if (overflow) throw Error(name + " mobile overflow");
}
await page.goto("http://localhost:3001/");
await page.getByRole("button", { name: "Menüyü aç" }).click();
await page
  .getByRole("navigation", { name: "Ana menü" })
  .getByRole("link", { name: "Ürünler", exact: true })
  .click();
await page.getByRole("button", { name: "Filtrele +" }).click();
await page.getByLabel("Ürün ara").fill("Luna");
await page.getByText("2 ürün bulundu", { exact: true }).waitFor();
await page
  .getByRole("combobox", { name: "Kategori", exact: true })
  .selectOption("kids");
await page.getByText("1 ürün bulundu", { exact: true }).waitFor();
await page.reload();
await page.getByText("1 ürün bulundu", { exact: true }).waitFor();
await page.getByRole("button", { name: "Filtrele +" }).click();
await page.getByRole("button", { name: "Tüm filtreleri temizle" }).click();
await page.getByText("16 ürün bulundu", { exact: true }).waitFor();
await page.goto("http://localhost:3001/urunler?kampanya=1");
await page.getByText("Yeni fırsatlara yer açıyoruz.").waitFor();
await page.goto("http://localhost:3001/urunler/luna");
await page.getByRole("button", { name: "160 × 200 cm", exact: true }).click();
await page.getByRole("button", { name: "Bej", exact: true }).click();
await page.getByRole("button", { name: "Bukle", exact: true }).click();
await page.getByRole("button", { name: "2. görsel", exact: true }).click();
if (
  (await page
    .getByRole("button", { name: "2. görsel", exact: true })
    .getAttribute("aria-pressed")) !== "true"
)
  throw Error("Thumbnail did not switch");
await page.getByRole("button", { name: "Ürün görselini büyüt" }).click();
await page.getByRole("dialog").waitFor();
await page.keyboard.press("ArrowLeft");
await page.getByText("Luna · 1 / 2", { exact: true }).waitFor();
await page.keyboard.press("Escape");
await page
  .getByRole("button", { name: "WhatsApp’tan Bilgi ve Fiyat Al", exact: true })
  .click();
await page.waitForURL("**/iletisim?*");
const message = await page.getByLabel("Mesajınız").inputValue();
for (const val of [
  "Luna",
  "160 × 200 cm",
  "Bej / Bukle",
  "http://localhost:3001/urunler/luna",
])
  if (!message.includes(val)) throw Error("Message missing " + val);
await page.getByRole("button", { name: "Mesajı Hazırla" }).click();
await page.getByText("Mesajınız hazır; henüz gönderilmedi.").waitFor();
await page.goto("http://localhost:3001/ozel-uretim");
await page
  .getByRole("combobox", { name: "İlgilenilen ürün kategorisi", exact: true })
  .selectOption({ label: "Bazalar" });
await page.getByLabel("İstenen ölçü").fill("150 × 210");
await page.getByLabel("Renk / kumaş tercihi").fill("Krem keten");
await page.getByLabel("Ek açıklama").fill("Başlıksız model");
await page.getByRole("button", { name: "Talebi WhatsApp ile Gönder" }).click();
await page.waitForURL("**/iletisim?*");
const custom = await page.getByLabel("Mesajınız").inputValue();
for (const val of ["Bazalar", "150 × 210", "Krem keten", "Başlıksız model"])
  if (!custom.includes(val)) throw Error("Custom message missing " + val);
for (const route of [
  "/koleksiyonlar",
  "/koleksiyonlar/sade-yasam",
  "/hakkimizda",
  "/magazamiz",
  "/urunler/milo",
]) {
  const r = await page.goto("http://localhost:3001" + route);
  if (r.status() !== 200) throw Error("Route failed " + route);
}
const bad = await page.goto("http://localhost:3001/urunler/does-not-exist");
if (bad.status() !== 404) throw Error("404 route failed");
fs.writeFileSync(
  "artifacts/test-results.json",
  JSON.stringify({ passed: true, errors, message, custom }, null, 2),
);
if (errors.length) throw Error(errors.join("\n"));
console.log(
  "PASS: desktop/mobile screenshots, overflow, menu, filters, URL persistence, empty state, gallery, product inquiry, custom inquiry, routes, 404; no browser errors.",
);
await browser.close();
