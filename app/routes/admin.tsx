import { Form, data } from "react-router";

import { requireAdmin } from "../lib/supabase.server";
import type { Route } from "./+types/admin";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { headers } = await requireAdmin(request, context);
  return data({}, { headers });
}

export default function Admin() {
  return (
    <main className="admin-shell">
      <header>
        <div>
          <p>Cynex Storefront</p>
          <h1>Quản trị danh mục</h1>
        </div>
        <Form method="post" action="/admin/logout">
          <button type="submit">Đăng xuất</button>
        </Form>
      </header>
      <p>Database và xác thực đã sẵn sàng. Catalog CRUD bắt đầu ở Phase 3.</p>
    </main>
  );
}
