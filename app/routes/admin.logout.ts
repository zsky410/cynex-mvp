import { redirect } from "react-router";

import { createSupabase } from "../lib/supabase.server";
import type { Route } from "./+types/admin.logout";

export async function action({ request, context }: Route.ActionArgs) {
  const { supabase, headers } = createSupabase(request, context);
  await supabase.auth.signOut();
  return redirect("/admin/login", { headers });
}
