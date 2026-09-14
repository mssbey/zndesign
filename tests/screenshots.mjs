import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const p = await browser.newPage();
for (const size of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  await p.setViewportSize(size);
  for (const [n, u] of [
    ["home", "/"],
    ["catalog", "/urunler"],
    ["detail", "/urunler/luna"],
  ]) {
    await p.goto("http://localhost:3001" + u);
    await p.waitForLoadState("networkidle");
    await p.screenshot({ path: `artifacts/${n}-${size.width}-viewport.png` });
  }
}
await browser.close();
