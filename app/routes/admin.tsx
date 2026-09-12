import {
  data,
  isRouteErrorResponse,
  Outlet,
  useLoaderData,
  useRouteError,
} from "react-router";

import { AdminShell } from "../components/admin/admin-shell";
import {
  AdminErrorState,
  AdminLoadingState,
} from "../components/admin/admin-primitives";
import { adminHeaders, requireAdminLoader } from "../lib/admin.server";
import { runtimeEnvContext } from "../lib/runtime-context";
import type { Route } from "./+types/admin";

export function meta() {
  return [
    { title: "Quản trị danh mục | Cynex" },
    { name: "robots", content: "noindex, nofollow, noarchive" },
  ];
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return adminHeaders(loaderHeaders);
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { headers, adminIdentifier } = await requireAdminLoader(request, context);
  const environment = context.get(runtimeEnvContext).APP_ENV;
  return data({ adminIdentifier, environment }, { headers });
}

export default function AdminLayout() {
  const { adminIdentifier, environment } = useLoaderData<typeof loader>();
  return (
    <AdminShell adminIdentifier={adminIdentifier} environment={environment}>
      <Outlet />
    </AdminShell>
  );
}

export function HydrateFallback() {
  return (
    <div className="admin-standalone-error">
      <AdminLoadingState label="Đang mở khu vực quản trị" />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const description = isRouteErrorResponse(error)
    ? error.data?.error ?? "Không thể tải khu vực quản trị."
    : "Đã có lỗi không mong đợi. Vui lòng tải lại trang.";

  return (
    <div className="admin-standalone-error">
      <AdminErrorState description={description} />
      <a className="admin-button" href="/admin">Tải lại trang quản trị</a>
    </div>
  );
}
