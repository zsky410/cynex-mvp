import { useState } from "react";
import { data, Form, Link, useActionData, useLoaderData, useNavigation, useSearchParams } from "react-router";
import { AdminBreadcrumbs, AdminConfirmationDialog, AdminEmptyState, AdminNotification, AdminPageHeading } from "../components/admin/admin-primitives";
import { mutateCategoryList } from "../lib/category-actions.server";
import { requireAdminLoader } from "../lib/admin.server";
import type { Route } from "./+types/admin.categories";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { supabase, headers } = await requireAdminLoader(request, context);
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const state = url.searchParams.get("state") ?? "all";
  const safeQuery = query.replaceAll(",", "");
  let categories = supabase.from("categories").select("*, products(status)").order("sort_order").order("name");
  if (safeQuery) categories = categories.or(`name.ilike.%${safeQuery}%,slug.ilike.%${safeQuery}%`);
  if (state === "active") categories = categories.eq("is_active", true);
  if (state === "inactive") categories = categories.eq("is_active", false);
  const { data: rows, error } = await categories;
  if (error) throw data({ error: "Không thể tải danh mục. Vui lòng thử lại." }, { status: 503, headers });
  return data({ rows: rows ?? [], query, state }, { headers });
}

export async function action({ request, context }: Route.ActionArgs) {
  return mutateCategoryList(request, context);
}

const notices: Record<string, string> = { created: "Đã tạo danh mục.", updated: "Đã cập nhật danh mục.", moved: "Đã cập nhật thứ tự.", hidden: "Đã ẩn danh mục.", restored: "Đã khôi phục danh mục.", deleted: "Đã xóa danh mục." };

function MoveIcon({ direction }: { direction: "up" | "down" }) {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d={direction === "up" ? "m5 11 5-5 5 5M10 6v9" : "m5 9 5 5 5-5M10 5v9"} /></svg>;
}

function CategoryVisual({ imageUrl, iconKey }: { imageUrl: string | null; iconKey: string }) {
  return imageUrl ? <img className="admin-category-visual" src={imageUrl} alt="" /> : <span className="admin-category-visual admin-category-visual--fallback" aria-hidden="true">{iconKey.slice(0, 2).toUpperCase()}</span>;
}

export default function AdminCategories() {
  const { rows, query, state } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const [confirming, setConfirming] = useState<{ id: string; name: string; intent: "delete" | "hide"; publishedCount: number } | null>(null);
  const notice = notices[searchParams.get("notice") ?? ""];
  const submitting = navigation.state === "submitting";
  const pendingId = String(navigation.formData?.get("id") ?? "");

  const confirm = () => (document.getElementById("category-confirm-form") as HTMLFormElement | null)?.requestSubmit();
  const filtered = Boolean(query || state !== "all");

  return <>
    <AdminBreadcrumbs items={[{ label: "Tổng quan", to: "/admin" }, { label: "Danh mục" }]} />
    <AdminPageHeading title="Danh mục" description="Sắp xếp và kiểm soát các nhóm sản phẩm xuất hiện trên Storefront." action={<Link className="admin-button" to="/admin/categories/new">Tạo danh mục</Link>} />
    {notice ? <AdminNotification title="Đã lưu thay đổi" message={notice} /> : null}
    {submitting ? <p className="admin-pending" role="status">Đang lưu thay đổi danh mục…</p> : null}
    {actionData?.error ? <div className="admin-error-summary" role="alert"><strong>Không thể thực hiện</strong><span>{actionData.error}</span></div> : null}
    <Form method="get" className="admin-filters" role="search"><label>Tìm theo tên hoặc đường dẫn<input name="q" defaultValue={query} placeholder="Ví dụ: AI Tools" /></label><label>Trạng thái<select name="state" defaultValue={state}><option value="all">Tất cả</option><option value="active">Đang hiển thị</option><option value="inactive">Đang ẩn</option></select></label><button className="admin-button admin-button--secondary">Lọc danh mục</button>{filtered ? <Link to="/admin/categories">Xóa bộ lọc</Link> : null}</Form>
    {rows.length === 0 ? <AdminEmptyState title={filtered ? "Không tìm thấy danh mục" : "Chưa có danh mục"} description={filtered ? "Thử từ khóa khác hoặc xóa bộ lọc." : "Tạo danh mục đầu tiên để chuẩn bị Catalog."} action={filtered ? <Link className="admin-button admin-button--secondary" to="/admin/categories">Xóa bộ lọc</Link> : <Link className="admin-button" to="/admin/categories/new">Tạo danh mục đầu tiên</Link>} /> :
      <div className="admin-category-list">{rows.map((category, index) => {
        const productCount = category.products.length;
        const publishedCount = category.products.filter((product) => product.status === "published").length;
        const rowPending = submitting && pendingId === category.id;
        return <article className="admin-category-row" key={category.id} aria-busy={rowPending}>
          <div className="admin-category-identity"><CategoryVisual imageUrl={category.image_url} iconKey={category.icon_key} /><div><strong>{category.name}</strong><code>/{category.slug}</code></div></div>
          <dl className="admin-category-meta"><div><dt>Trạng thái</dt><dd><span className={`admin-status admin-status--${category.is_active ? "active" : "inactive"}`}>{category.is_active ? "Hiển thị" : "Đang ẩn"}</span></dd></div><div><dt>Sản phẩm</dt><dd>{productCount}</dd></div><div><dt>Cập nhật</dt><dd>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(category.updated_at))}</dd></div></dl>
          <div className="admin-category-controls"><Form method="post" className="admin-move-actions"><input type="hidden" name="id" value={category.id} /><button name="intent" value="move-up" disabled={submitting || index === 0} aria-label={`Đưa ${category.name} lên`}><MoveIcon direction="up" /></button><button name="intent" value="move-down" disabled={submitting || index === rows.length - 1} aria-label={`Đưa ${category.name} xuống`}><MoveIcon direction="down" /></button></Form><div className="admin-row-actions"><Link to={`/admin/categories/${category.id}`}>Chỉnh sửa</Link>{category.is_active ? <button type="button" disabled={submitting} onClick={() => setConfirming({ id: category.id, name: category.name, intent: "hide", publishedCount })}>Ẩn</button> : <Form method="post"><input type="hidden" name="id" value={category.id} /><button name="intent" value="restore" disabled={submitting}>Khôi phục</button></Form>}<button type="button" disabled={submitting} className="admin-danger-link" onClick={() => setConfirming({ id: category.id, name: category.name, intent: "delete", publishedCount })}>Xóa</button></div></div>
        </article>;
      })}</div>}
    <AdminConfirmationDialog open={Boolean(confirming)} title={confirming?.intent === "hide" ? "Ẩn danh mục?" : "Xóa danh mục?"} description={confirming ? confirming.intent === "hide" ? `Ẩn “${confirming.name}” sẽ ẩn ${confirming.publishedCount} sản phẩm đã xuất bản khỏi Storefront. Danh mục đang ở Trang chủ phải được gỡ trước.` : `Danh mục “${confirming.name}” chỉ có thể xóa khi không còn sản phẩm hoặc tham chiếu Trang chủ.` : ""} confirmLabel={confirming?.intent === "hide" ? "Ẩn danh mục" : "Xóa danh mục"} onCancel={() => setConfirming(null)} onConfirm={confirm} />
    <Form id="category-confirm-form" method="post" hidden><input type="hidden" name="id" value={confirming?.id ?? ""} /><input type="hidden" name="intent" value={confirming?.intent ?? ""} /></Form>
  </>;
}
