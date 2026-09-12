import { Form, data, redirect, useActionData, useSearchParams } from "react-router";

import { adminHeaders, validateRequestOrigin } from "../lib/admin.server";
import { createSupabase } from "../lib/supabase.server";
import type { Route } from "./+types/admin.login";

export function meta() {
  return [
    { title: "Đăng nhập quản trị | Cynex" },
    { name: "robots", content: "noindex, nofollow, noarchive" },
  ];
}

export function headers() {
  return adminHeaders();
}

export async function action({ request, context }: Route.ActionArgs) {
  validateRequestOrigin(request, context);
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return data(
      { error: "Vui lòng nhập email và mật khẩu." },
      { status: 400, headers: adminHeaders() },
    );
  }

  const { supabase, headers } = createSupabase(request, context);
  const { data: auth, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !auth.user) {
    return data(
      { error: "Email hoặc mật khẩu không đúng." },
      { status: 400, headers: adminHeaders(headers) },
    );
  }

  const { data: admin, error: adminError } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (adminError) {
    await supabase.auth.signOut();
    return data(
      { error: "Không thể xác minh quyền quản trị. Vui lòng thử lại." },
      { status: 503, headers: adminHeaders(headers) },
    );
  }

  if (!admin) {
    await supabase.auth.signOut();
    return data(
      { error: "Tài khoản không có quyền quản trị." },
      { status: 403, headers: adminHeaders(headers) },
    );
  }

  return redirect("/admin", { headers: adminHeaders(headers) });
}

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");
  const accessMessage =
    reason === "forbidden"
      ? "Tài khoản vừa đăng nhập không có quyền quản trị."
      : reason === "session-expired"
        ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        : null;

  return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card" aria-labelledby="login-title">
        <h1 id="login-title">Đăng nhập quản trị</h1>
        <p>Đăng nhập bằng tài khoản đã được cấp quyền cho môi trường này.</p>

        {accessMessage ? (
          <p role="alert" className="admin-auth-error">
            {accessMessage}
          </p>
        ) : null}

        <Form method="post" className="admin-auth-form">
          <label>
            Email
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Mật khẩu
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {actionData?.error ? (
            <p role="alert" className="admin-auth-error">
              {actionData.error}
            </p>
          ) : null}
          <button type="submit">Đăng nhập</button>
        </Form>
      </section>
    </main>
  );
}
