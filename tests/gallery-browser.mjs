import { spawn } from "node:child_process";
import { randomUUID, createHmac } from "node:crypto";
import fs from "node:fs";
import { chromium, expect } from "@playwright/test";

// A temporary local session secret avoids reading or exposing real admin credentials.
const secret = randomUUID(), base = "http://localhost:3011";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "3011"], {
  env: { ...process.env, ADMIN_SESSION_SECRET: secret }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
});
let browser;
try {
  let ready = false;
  for (let i = 0; i < 50; i++) {
    if (server.exitCode !== null) throw Error("Temporary server exited before starting");
    try { if ((await fetch(base + "/admin/login")).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw Error("Temporary server did not start");
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const page = await context.newPage(), errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(base + "/admin/gallery");
  await expect(page).toHaveURL(base + "/admin/login");
  const expires = String(Date.now() + 60000);
  await context.addCookies([{ name: "zn_admin_session", value: `${expires}.${createHmac("sha256", secret).update(expires).digest("hex")}`, url: base, httpOnly: true, sameSite: "Lax" }]);
  await page.goto(base + "/admin/gallery", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Fabrika ve Teslimatlar" })).toBeVisible();
  await page.locator("#new-category").selectOption("delivery");
  await page.locator("#new-caption").fill("Validation only — never published");
  await page.locator("#new-image").setInputFiles({ name: "fake.png", mimeType: "image/png", buffer: Buffer.from("not an image") });
  await page.getByRole("button", { name: "Galeriye ekle" }).click();
  await expect(page.locator("form [role=alert]")).toContainText("Geçerli bir JPG, PNG veya WEBP");
  await expect(page.locator("#new-caption")).toHaveValue("Validation only — never published");
  await page.reload({ waitUntil: "networkidle" });
  fs.mkdirSync("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/gallery-admin-desktop.png", fullPage: true });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `admin gallery ${width}px`).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/gallery-admin-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
  console.log("PASS: protected gallery page, authenticated form, server-side rejection of invalid image, form preservation and responsive admin layout. No images were published.");
} finally { await browser?.close(); server.kill(); }
