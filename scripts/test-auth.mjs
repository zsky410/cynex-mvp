import { execFileSync } from "node:child_process";

const api = "http://127.0.0.1:55321";
const app = process.env.APP_ORIGIN ?? "http://127.0.0.1:5173";
const status = JSON.parse(
  execFileSync("pnpm", ["exec", "supabase", "status", "-o", "json"], {
    encoding: "utf8",
  }),
);
const secret = status.SECRET_KEY;
const password = `Local-${crypto.randomUUID()}!`;
const users = [];
const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  "Content-Type": "application/json",
};

async function createUser(email) {
  const response = await fetch(`${api}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!response.ok) throw new Error(`Could not create fixture: ${response.status}`);
  const user = await response.json();
  users.push(user.id);
  return user;
}

async function login(email) {
  return fetch(`${app}/admin/login`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: app,
    },
    body: new URLSearchParams({ email, password }),
  });
}

function redirectsTo(response, pathname) {
  const location = response.headers.get("location");
  return location && new URL(location, app).pathname === pathname;
}

try {
  const admin = await createUser(`phase2-admin-${crypto.randomUUID()}@example.test`);
  const nonAdmin = await createUser(`phase2-user-${crypto.randomUUID()}@example.test`);
  const allowlist = await fetch(`${api}/rest/v1/app_admins`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ user_id: admin.id }),
  });
  if (!allowlist.ok) throw new Error(`Could not allowlist Admin: ${allowlist.status}`);

  const adminLogin = await login(admin.email);
  const cookie = adminLogin.headers
    .getSetCookie()
    .map((value) => value.split(";", 1)[0])
    .join("; ");
  const adminPage = await fetch(`${app}/admin`, {
    redirect: "manual",
    headers: { Cookie: cookie },
  });
  const anonymousPage = await fetch(`${app}/admin`, { redirect: "manual" });
  const expiredPage = await fetch(`${app}/admin`, {
    redirect: "manual",
    headers: { Cookie: "sb-local-auth-token=expired" },
  });
  const invalidOrigin = await fetch(`${app}/admin/logout`, {
    method: "POST",
    redirect: "manual",
    headers: { Cookie: cookie, Origin: "https://attacker.example" },
  });
  const logout = await fetch(`${app}/admin/logout`, {
    method: "POST",
    redirect: "manual",
    headers: { Cookie: cookie, Origin: app },
  });
  const nonAdminLogin = await login(nonAdmin.email);

  const checks = {
    adminLogin: adminLogin.status === 302 && redirectsTo(adminLogin, "/admin"),
    adminGuard: adminPage.status === 200,
    adminPrivateCache:
      adminPage.headers.get("cache-control") === "private, no-store",
    adminRobotsHeader:
      adminPage.headers.get("x-robots-tag") === "noindex, nofollow, noarchive",
    adminRobotsMeta: (await adminPage.text()).includes(
      'name="robots" content="noindex, nofollow, noarchive"',
    ),
    anonymousDenied:
      anonymousPage.status === 302 && redirectsTo(anonymousPage, "/admin/login"),
    expiredSession:
      expiredPage.status === 302 &&
      new URL(expiredPage.headers.get("location"), app).searchParams.get("reason") ===
        "session-expired",
    invalidOrigin: invalidOrigin.status === 403,
    logout: logout.status === 302 && redirectsTo(logout, "/admin/login"),
    nonAdmin: nonAdminLogin.status === 403,
  };

  for (const [name, passed] of Object.entries(checks)) {
    console.log(`${passed ? "ok" : "not ok"} - ${name}`);
  }
  if (Object.values(checks).includes(false)) process.exitCode = 1;
} finally {
  for (const id of users) {
    await fetch(`${api}/auth/v1/admin/users/${id}`, { method: "DELETE", headers });
  }
}
