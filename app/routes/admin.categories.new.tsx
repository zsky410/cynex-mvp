import { data, useActionData } from "react-router";
import { CategoryForm } from "../components/admin/category-form";
import { AdminBreadcrumbs, AdminPageHeading } from "../components/admin/admin-primitives";
import { saveCategory } from "../lib/category-actions.server";
import { requireAdminLoader } from "../lib/admin.server";
import type { CategoryFormValues } from "../lib/categories";
import type { Route } from "./+types/admin.categories.new";
const defaults: CategoryFormValues = { name: "", slug: "", description: "", iconKey: "", imageUrl: "", sortOrder: "0", isActive: true };
export async function loader({ request, context }: Route.LoaderArgs) { const { headers } = await requireAdminLoader(request, context); return data({}, { headers }); }
export async function action({ request, context }: Route.ActionArgs) { return saveCategory(request, context); }
export default function NewCategory() { const result = useActionData<typeof action>(); return <><AdminBreadcrumbs items={[{ label: "Danh mục", to: "/admin/categories" }, { label: "Tạo mới" }]} /><AdminPageHeading title="Tạo danh mục" description="Thiết lập tên, đường dẫn, nội dung và trạng thái hiển thị." /><CategoryForm values={result?.values ?? defaults} errors={result?.errors} submitLabel="Tạo danh mục" /></>; }
