import { AdminBreadcrumbs, AdminEmptyState, AdminPageHeading } from "./admin-primitives";

export function AdminPlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <>
      <AdminBreadcrumbs items={[{ label: "Tổng quan", to: "/admin" }, { label: title }]} />
      <AdminPageHeading title={title} description={description} />
      <AdminEmptyState
        title={`${title} chưa được triển khai`}
        description="Khu vực điều hướng đã sẵn sàng. Chức năng quản lý dữ liệu sẽ được bổ sung trong phase tương ứng."
      />
    </>
  );
}
