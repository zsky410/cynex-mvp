import type { RouterContextProvider } from "react-router";
import { data, redirect } from "react-router";

import { runtimeEnvContext } from "./runtime-context";
import { createSupabase } from "./supabase.server";

export const ADMIN_CACHE_CONTROL = "private, no-store";
export const ADMIN_ROBOTS = "noindex, nofollow, noarchive";

export function adminHeaders(initial?: HeadersInit) {
  const headers = new Headers(initial);
  headers.set("Cache-Control", ADMIN_CACHE_CONTROL);
  headers.set("X-Robots-Tag", ADMIN_ROBOTS);
  return headers;
}

export function validateRequestOrigin(
  request: Request,
  context: Readonly<RouterContextProvider>,
) {
  const requestOrigin = request.headers.get("Origin");
  const expectedOrigin = context.get(runtimeEnvContext).APP_ORIGIN;

  const incomingOrigin = safeOrigin(requestOrigin);
  const configuredOrigin = safeOrigin(expectedOrigin);
  const isValid =
    incomingOrigin !== null &&
    configuredOrigin !== null &&
    incomingOrigin === configuredOrigin;
  if (!isValid) throw originFailure();
}

function safeOrigin(value: string | null) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function originFailure() {
  return data(
    { error: "Yêu cầu không hợp lệ. Vui lòng tải lại trang và thử lại." },
    { status: 403, headers: adminHeaders() },
  );
}

function throwMissingSession(request: Request, headers: Headers): never {
  const hasAuthCookie = (request.headers.get("Cookie") ?? "").includes("sb-");
  const reason = hasAuthCookie ? "session-expired" : "required";
  throw redirect(`/admin/login?reason=${reason}`, { headers });
}

function throwForbidden(headers: Headers): never {
  throw redirect("/admin/login?reason=forbidden", { headers });
}

function throwBackendFailure(headers: Headers): never {
  throw data(
    { error: "Không thể xác minh quyền quản trị. Vui lòng thử lại." },
    { status: 503, headers },
  );
}

export async function requireAdmin(
  request: Request,
  context: Readonly<RouterContextProvider>,
) {
  const { supabase, headers: supabaseHeaders } = createSupabase(request, context);
  const headers = adminHeaders(supabaseHeaders);
  const { data: claimsResult, error: claimsError } =
    await supabase.auth.getClaims();
  const claims = claimsResult?.claims;
  const userId = typeof claims?.sub === "string" ? claims.sub : null;

  if (claimsError || !userId) throwMissingSession(request, headers);

  const { data: admin, error: adminError } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminError) throwBackendFailure(headers);
  if (!admin) {
    await supabase.auth.signOut();
    throwForbidden(headers);
  }

  const email = typeof claims?.email === "string" ? claims.email : null;
  return {
    supabase,
    headers,
    userId,
    adminIdentifier: email ?? `Admin ${userId.slice(0, 8)}`,
  };
}

export async function requireAdminLoader(
  request: Request,
  context: Readonly<RouterContextProvider>,
) {
  return requireAdmin(request, context);
}

export async function requireAdminAction(
  request: Request,
  context: Readonly<RouterContextProvider>,
) {
  validateRequestOrigin(request, context);
  return requireAdmin(request, context);
}
