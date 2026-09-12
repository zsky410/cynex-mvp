import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const api = "http://127.0.0.1:55321";
const app = process.env.APP_ORIGIN ?? "http://127.0.0.1:5173";
const local = JSON.parse(execFileSync("pnpm", ["exec", "supabase", "status", "-o", "json"], { encoding: "utf8" }));
const secret = local.SECRET_KEY;
const password = `Local-${crypto.randomUUID()}!`;
const marker = `phase3c-${crypto.randomUUID()}`;
const adminHeaders = { apikey: secret, Authorization: `Bearer ${secret}`, "Content-Type": "application/json" };
let userId;
let nonAdminUserId;
const categoryIds = [];
let productId;
const rlsClient = createClient(api, local.PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const nonAdminClient = createClient(api, local.PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

async function adminApi(path, options = {}) {
  const response = await fetch(`${api}${path}`, { ...options, headers: { ...adminHeaders, ...options.headers } });
  if (!response.ok) throw new Error(`Fixture API failed: ${response.status}`);
  return response;
}
async function submit(path, cookie, fields) {
  return fetch(`${app}${path}`, { method: "POST", redirect: "manual", headers: { Cookie: cookie, Origin: app, "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(fields) });
}
function ok(name, passed) { console.log(`${passed ? "ok" : "not ok"} - ${name}`); if (!passed) process.exitCode = 1; }

try {
  const created = await adminApi("/auth/v1/admin/users", { method: "POST", body: JSON.stringify({ email: `${marker}@example.test`, password, email_confirm: true }) });
  const user = await created.json(); userId = user.id;
  await adminApi("/rest/v1/app_admins", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ user_id: userId }) });
  const rlsLogin = await rlsClient.auth.signInWithPassword({ email: user.email, password });
  if (rlsLogin.error) throw new Error("Could not authenticate RLS fixture client");
  const nonAdminCreated = await adminApi("/auth/v1/admin/users", { method: "POST", body: JSON.stringify({ email: `${marker}-non-admin@example.test`, password, email_confirm: true }) });
  const nonAdminUser = await nonAdminCreated.json(); nonAdminUserId = nonAdminUser.id;
  const nonAdminLogin = await nonAdminClient.auth.signInWithPassword({ email: nonAdminUser.email, password });
  if (nonAdminLogin.error) throw new Error("Could not authenticate non-admin fixture client");
  const denied = await nonAdminClient.from("categories").insert({ name: `${marker}-forbidden`, slug: `${marker}-forbidden`, icon_key: "test" });
  ok("authenticated non-admin Category mutation denied by RLS", Boolean(denied.error));
  const login = await fetch(`${app}/admin/login`, { method: "POST", redirect: "manual", headers: { Origin: app, "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ email: user.email, password }) });
  const cookie = login.headers.getSetCookie().map((value) => value.split(";", 1)[0]).join("; ");

  for (const [index, name] of ["Alpha", "Beta", "Gamma"].entries()) {
    const response = await submit("/admin/categories/new", cookie, { name: `${marker}-${name}`, slug: `${marker}-${name.toLowerCase()}`, description: "HTTP acceptance", iconKey: "test", sortOrder: String(index), isActive: "on" });
    ok(`Admin creates Category ${name}`, response.status === 302);
  }
  const rowsResponse = await adminApi(`/rest/v1/categories?slug=like.${marker}*&select=id,slug,sort_order,is_active&order=sort_order`);
  const rows = await rowsResponse.json(); categoryIds.push(...rows.map((row) => row.id));
  ok("three Category fixtures exist", rows.length === 3);

  const duplicate = await submit("/admin/categories/new", cookie, { name: "Duplicate", slug: rows[0].slug, iconKey: "test", sortOrder: "4", isActive: "on" });
  ok("duplicate slug returns Vietnamese validation", duplicate.status === 400 && (await duplicate.text()).includes("Đường dẫn này đã được sử dụng"));

  const edit = await submit(`/admin/categories/${rows[0].id}`, cookie, { name: `${marker}-Edited`, slug: rows[0].slug, description: "Updated", iconKey: "updated", sortOrder: "0", isActive: "on" });
  ok("Admin edits Category", edit.status === 302);
  const move = await submit("/admin/categories", cookie, { id: rows[2].id, intent: "move-up" });
  ok("Admin moves Category up", move.status === 302);
  const hide = await submit("/admin/categories", cookie, { id: rows[1].id, intent: "hide" });
  const restore = await submit("/admin/categories", cookie, { id: rows[1].id, intent: "restore" });
  ok("Admin hides and restores Category", hide.status === 302 && restore.status === 302);

  const productResponse = await rlsClient.from("products").insert({ category_id: rows[0].id, name: marker, slug: marker, short_description: "Reference fixture" }).select("id").single();
  if (productResponse.error) throw new Error("Could not create referenced Product fixture under RLS");
  productId = productResponse.data.id;
  const guardedDelete = await submit("/admin/categories", cookie, { id: rows[0].id, intent: "delete" });
  ok("referenced delete returns Vietnamese constraint error", guardedDelete.status === 400 && (await guardedDelete.text()).includes("đang có sản phẩm"));

  const invalidOrigin = await fetch(`${app}/admin/categories`, { method: "POST", redirect: "manual", headers: { Cookie: cookie, Origin: "https://attacker.example", "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ id: rows[1].id, intent: "hide" }) });
  const unchanged = await rlsClient.from("categories").select("is_active").eq("id", rows[1].id).single();
  ok("Category mutation rejects invalid Origin", invalidOrigin.status === 400 && unchanged.data?.is_active === true);
} finally {
  if (productId) await rlsClient.from("products").delete().eq("id", productId);
  for (const id of categoryIds) await rlsClient.from("categories").delete().eq("id", id);
  await rlsClient.auth.signOut();
  await nonAdminClient.auth.signOut();
  if (nonAdminUserId) await fetch(`${api}/auth/v1/admin/users/${nonAdminUserId}`, { method: "DELETE", headers: adminHeaders });
  if (userId) await fetch(`${api}/auth/v1/admin/users/${userId}`, { method: "DELETE", headers: adminHeaders });
  const remaining = await fetch(`${api}/rest/v1/categories?slug=like.${marker}*&select=id`, { headers: adminHeaders });
  ok("all Category fixtures cleaned", (await remaining.json()).length === 0);
}
