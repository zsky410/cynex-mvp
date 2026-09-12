import { redirect } from "react-router";

import { requireAdminAction } from "../lib/admin.server";
import type { Route } from "./+types/admin.logout";

export async function action({ request, context }: Route.ActionArgs) {
  const { supabase, headers } = await requireAdminAction(request, context);
  await supabase.auth.signOut();
  return redirect("/admin/login", { headers });
}
