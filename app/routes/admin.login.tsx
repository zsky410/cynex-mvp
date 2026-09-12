import { Form, data, redirect, useActionData } from "react-router";

import { createSupabase } from "../lib/supabase.server";
import type { Route } from "./+types/admin.login";

export function meta() {
  return [{ title: "Đăng nhập quản trị | Cynex" }];
}

export function headers() {
  return { "Cache-Control": "private, no-store" };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return data({ error: "Vui lòng nhập email và mật khẩu." }, { status: 400 });
  }

  const { supabase, headers } = createSupabase(request, context);
  const { data: auth, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !auth.user) {
    return data(
      { error: "Email hoặc mật khẩu không đúng." },
      { status: 400, headers },
    );
  }

  const { data: admin } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return data(
      { error: "Tài khoản không có quyền quản trị." },
      { status: 403, headers },
    );
  }

  return redirect("/admin", { headers });
}

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();

  return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card" aria-labelledby="login-title">
        <p className="admin-auth-eyebrow">Cynex Storefront</p>
        <h1 id="login-title">Đăng nhập quản trị</h1>
        <p>Đăng nhập bằng tài khoản đã được cấp quyền cho môi trường này.</p>

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
