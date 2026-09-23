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
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/ZQAAAABJRU5ErkJggg==", "base64");
let stored = [], deleted = [], failAt = -1;
const route = evaluate("src/app/api/reference-images/route.ts", {
  Buffer, File, Response, Uint8Array, Date, URL, process: { env: { BLOB_READ_WRITE_TOKEN: "test-only" } },
  require: name => name === "node:crypto" ? { randomUUID } : name === "@vercel/blob" ? {
    put: async path => { if (stored.length === failAt) throw Error("Test provider outage"); stored.push(path); return { url: `https://test.public.blob.vercel-storage.com/${path}` }; },
    del: async urls => { deleted.push(...urls); },
  } : validation,
});
function request(files, { origin = "http://localhost:3001", consent = true, ip = randomUUID() } = {}) {
  const data = new FormData();
  for (const file of files) data.append("images", file);
  if (consent) data.append("consent", "yes");
  return new Request("http://localhost:3001/api/reference-images", { method: "POST", headers: { origin, "x-real-ip": ip }, body: data });
}
const file = () => new File([png], "reference.png", { type: "image/png" });
assert.equal((await route.POST(request([file()], { origin: "https://foreign.example" }))).status, 403);
assert.equal((await route.POST(request([file()], { consent: false }))).status, 400);
assert.equal((await route.POST(request([]))).status, 400);
assert.equal((await route.POST(request(Array.from({ length: 6 }, file)))).status, 400);
assert.equal((await route.POST(request([new File(["not an image"], "fake.png", { type: "image/png" })]))).status, 400);
assert.equal((await route.POST(request([new File([new Uint8Array(3 * 1024 * 1024 + 1)], "large.png", { type: "image/png" })]))).status, 400);
let response = await route.POST(request([file(), file()]));
assert.equal(response.status, 200);
const result = await response.json();
assert.equal(result.urls.length, 2);
assert.ok(result.urls.every(url => url.includes(result.requestId)));
assert.equal(response.headers.get("cache-control"), "no-store");
stored = []; failAt = 1;
response = await route.POST(request([file(), file()]));
assert.equal(response.status, 500);
assert.equal(deleted.length, 1, "partial uploads must be removed on provider error");
stored = []; failAt = -1;
for (let i = 0; i < 10; i++) await route.POST(request([], { ip: "rate-test" }));
assert.equal((await route.POST(request([file()], { ip: "rate-test" }))).status, 429);
const hugeBody = new Uint8Array(3 * 1024 * 1024 + 65537);
response = await route.POST(new Request("http://localhost:3001/api/reference-images", { method: "POST", headers: { origin: "http://localhost:3001", "content-type": "multipart/form-data; boundary=x", "x-real-ip": randomUUID() }, body: hugeBody }));
assert.equal(response.status, 413);
console.log("PASS: origin/consent checks, image signatures, count/size/stream limits, request-linked URLs, partial-upload cleanup, rate limiting.");
