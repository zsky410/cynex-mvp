import type { RouterContextProvider } from "react-router";
import { data, redirect } from "react-router";
import { adminHeaders, requireAdminAction } from "./admin.server";
import { categoryValues, translateCategoryError, validateCategory } from "./categories";

export async function saveCategory(request: Request, context: Readonly<RouterContextProvider>, id?: string) {
  const { supabase, headers } = await requireAdminAction(request, context);
  const values = categoryValues(await request.formData());
  const errors = validateCategory(values);
  if (Object.keys(errors).length) return data({ errors, values }, { status: 400, headers });
  const payload = {
    name: values.name,
    slug: values.slug,
    description: values.description,
    icon_key: values.iconKey,
    image_url: values.imageUrl || null,
    sort_order: Number(values.sortOrder),
    is_active: values.isActive,
  };
  const result = id
    ? await supabase.from("categories").update(payload).eq("id", id).select("id").single()
    : await supabase.from("categories").insert(payload).select("id").single();
  if (result.error) return data({ errors: translateCategoryError(result.error), values }, { status: 400, headers });
  return redirect(`/admin/categories?notice=${id ? "updated" : "created"}`, { headers });
}

export async function mutateCategoryList(request: Request, context: Readonly<RouterContextProvider>) {
  const { supabase, headers } = await requireAdminAction(request, context);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!id) return data({ error: "Không tìm thấy danh mục cần thay đổi." }, { status: 400, headers });

  if (intent === "move-up" || intent === "move-down") {
    const { error } = await supabase.rpc("admin_move_category", { target_id: id, move_direction: intent === "move-up" ? "up" : "down" });
    if (error) return data({ error: translateCategoryError(error).form }, { status: 400, headers });
    return redirect("/admin/categories?notice=moved", { headers });
  }
  if (intent === "hide" || intent === "restore") {
    const { error } = await supabase.from("categories").update({ is_active: intent === "restore" }).eq("id", id).select("id").single();
    if (error) return data({ error: translateCategoryError(error).form }, { status: 400, headers });
    return redirect(`/admin/categories?notice=${intent === "hide" ? "hidden" : "restored"}`, { headers });
  }
  if (intent === "delete") {
    const { error } = await supabase.from("categories").delete().eq("id", id).select("id").single();
    if (error) return data({ error: translateCategoryError(error).form }, { status: 400, headers });
    return redirect("/admin/categories?notice=deleted", { headers });
  }
  return data({ error: "Thao tác danh mục không hợp lệ." }, { status: 400, headers: adminHeaders(headers) });
}
