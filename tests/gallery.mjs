import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

function evaluate(path, globals) {
  const context = { exports: {}, ...globals };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
  return context.exports;
}
const validation = evaluate("src/lib/reference-images.ts", {});
let authenticated = true, failSave = false, failUpload = false, failDelete = false;
const items = [], uploads = [], cleanup = [], refreshed = [];
const dependencies = {
  "next/headers": { cookies: async () => ({ get: () => ({ value: "test-session" }) }) },
  "next/navigation": { redirect: path => { throw new Error(`redirect:${path}`); } },
  "next/cache": { revalidatePath: path => refreshed.push(path) },
  "node:crypto": { randomUUID },
  "@vercel/blob": { del: async url => cleanup.push(url) },
  "@/lib/auth": { SESSION_COOKIE_NAME: "session", isValidSessionToken: () => authenticated },
  "@/lib/gallery": {
    getGallery: async () => items,
    saveGalleryItem: async item => { if (failSave) throw Error("database unavailable"); const index = items.findIndex(row => row.id === item.id); if (index < 0) items.push(item); else items[index] = item; },
    removeGalleryItem: async id => { if (failDelete) throw Error("database unavailable"); const index = items.findIndex(item => item.id === id); if (index >= 0) items.splice(index, 1); },
  },
  "@/lib/upload": { saveUploadedImage: async () => { if (failUpload) throw Error("storage unavailable"); const url = `https://test.invalid/${randomUUID()}.png`; uploads.push(url); return url; } },
  "@/lib/reference-images": validation,
};
const actions = evaluate("src/app/admin/gallery-actions.ts", { File, Uint8Array, require: name => { if (!dependencies[name]) throw Error(`Unexpected import: ${name}`); return dependencies[name]; } });
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/ZQAAAABJRU5ErkJggg==", "base64");
function form(overrides = {}, file = new File([png], "photo.png", { type: "image/png" })) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ caption: "Atölyemiz", category: "factory", position: "0", ...overrides })) data.set(key, value);
  if (file) data.set("image", file);
  return data;
}
authenticated = false;
await assert.rejects(actions.saveGalleryAction(null, {}, form()), /redirect:\/admin\/login/);
await assert.rejects(actions.deleteGalleryAction("test"), /redirect:\/admin\/login/);
assert.equal(uploads.length, 0);
authenticated = true;
for (const data of [form({caption: ""}), form({caption: "x".repeat(181)}), form({category: "invalid"}), form({position: "-1"}), form({position: "1.5"}), form({}, null), form({}, new File(["invalid"], "fake.png", {type: "image/png"})), form({}, new File([new Uint8Array(3 * 1024 * 1024 + 1)], "big.png", {type: "image/png"}))]) {
  assert.ok((await actions.saveGalleryAction(null, {}, data)).error);
}
assert.equal(uploads.length, 0);
assert.ok((await actions.saveGalleryAction(null, {}, form())).success);
const id = items[0].id, originalSrc = items[0].src;
assert.ok(refreshed.includes("/biz-kimiz") && refreshed.includes("/admin/gallery") && refreshed.includes("/fabrikamiz") && refreshed.includes("/"));
assert.ok((await actions.saveGalleryAction(id, {}, form({category: "delivery", caption: "Tamamlanan teslimat", position: "4"}, null))).success);
assert.equal(items[0].category, "delivery");
assert.equal(items[0].caption, "Tamamlanan teslimat");
assert.equal(items[0].src, originalSrc);
assert.equal(uploads.length, 1);
assert.ok((await actions.saveGalleryAction(id, {}, form())).success);
assert.notEqual(items[0].src, originalSrc);
failSave = true;
assert.ok((await actions.saveGalleryAction(null, {}, form())).error);
assert.equal(cleanup.at(-1), uploads.at(-1));
assert.equal(items.length, 1);
failSave = false; failUpload = true;
assert.ok((await actions.saveGalleryAction(null, {}, form())).error);
failUpload = false; failDelete = true;
assert.ok((await actions.deleteGalleryAction(id)).error);
assert.equal(items.length, 1);
failDelete = false;
assert.ok((await actions.deleteGalleryAction(id)).success);
assert.equal(items.length, 0);
assert.ok((await actions.saveGalleryAction(id, {}, form())).error);
console.log("PASS: gallery authorization, validation, upload/create/update/delete, revalidation, provider errors and orphan cleanup (isolated storage/database).");
