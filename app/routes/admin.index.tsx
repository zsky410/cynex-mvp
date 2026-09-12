import { Link } from "react-router";

import {
  AdminBreadcrumbs,
  AdminEmptyState,
  AdminNotification,
  AdminPageHeading,
} from "../components/admin/admin-primitives";

export default function AdminIndex() {
  return (
    <>
      <AdminBreadcrumbs items={[{ label: "Tổng quan" }]} />
      <AdminPageHeading
        title="Tổng quan"
        description="Theo dõi tình trạng danh mục và bắt đầu công việc cần ưu tiên."
      />
      <AdminNotification
        title="Nền tảng quản trị đã sẵn sàng"
        message="Xác thực, phân quyền và cấu trúc Catalog bốn cấp đang hoạt động trên môi trường này."
      />
      <AdminEmptyState
        title="Chưa có tác vụ cần xử lý"
        description="Các số liệu Catalog và lối tắt tạo nội dung sẽ xuất hiện trong những lát triển khai tiếp theo."
        action={<Link className="admin-button admin-button--secondary" to="/admin/categories">Xem khu vực Danh mục</Link>}
      />
    </>
  );
}
