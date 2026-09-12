import { data, useActionData, useLoaderData } from "react-router";
import { CategoryForm } from "../components/admin/category-form";
import { AdminBreadcrumbs, AdminPageHeading } from "../components/admin/admin-primitives";
import { saveCategory } from "../lib/category-actions.server";
import { requireAdminLoader } from "../lib/admin.server";
import type { Route } from "./+types/admin.categories.$id";
export async function loader({ request, context, params }: Route.LoaderArgs) { const { supabase, headers } = await requireAdminLoader(request, context); const { data: category, error } = await supabase.from("categories").select("*").eq("id", params.id).single(); if (error) throw data({ error: "Không tìm thấy danh mục." }, { status: 404, headers }); return data({ category }, { headers }); }
export async function action({ request, context, params }: Route.ActionArgs) { return saveCategory(request, context, params.id); }
export default function EditCategory() { const { category } = useLoaderData<typeof loader>(); const result = useActionData<typeof action>(); const values = result?.values ?? { name: category.name, slug: category.slug, description: category.description, iconKey: category.icon_key, imageUrl: category.image_url ?? "", sortOrder: String(category.sort_order), isActive: category.is_active }; return <><AdminBreadcrumbs items={[{ label: "Danh mục", to: "/admin/categories" }, { label: category.name }]} /><AdminPageHeading title={`Chỉnh sửa ${category.name}`} description="Thay đổi có hiệu lực sau khi máy chủ xác nhận." /><CategoryForm values={values} errors={result?.errors} submitLabel="Lưu thay đổi" /></>; }
