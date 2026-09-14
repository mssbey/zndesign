import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";
import assert from "node:assert/strict";
const code = ts.transpileModule(fs.readFileSync("src/lib/contact.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const context = { exports: {}, require: () => ({ site: { whatsapp: "" } }) };
vm.runInNewContext(code, context);
const { whatsappUrl, productMessage } = context.exports;
const message = productMessage(
  "Luna",
  "160 × 200 cm",
  "Bej",
  "Bukle",
  "https://example.test/urunler/luna",
);
const target = new URL(whatsappUrl(message, "+90 555 000 00 00"));
assert.equal(target.hostname, "wa.me");
assert.equal(target.pathname, "/905550000000");
assert.equal(target.searchParams.get("text"), message);
assert.ok(whatsappUrl(message, "").startsWith("/iletisim?"));
assert.ok(whatsappUrl(message, "123").startsWith("/iletisim?"));
const minimal = productMessage("Luna", "", "", "", "");
assert.ok(!minimal.includes("Ölçü:"));
assert.ok(!minimal.includes("Renk/Kumaş:"));
assert.ok(!minimal.includes("Ürün bağlantısı:"));
console.log(
  "PASS: encoded WhatsApp URL, number normalization, missing/invalid number fallback, omission of unselected fields. Test number is never used in site configuration.",
);
