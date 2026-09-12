import { useEffect, useRef } from "react";
import { Link } from "react-router";

type BreadcrumbItem = { label: string; to?: string };

export function AdminBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="admin-breadcrumbs">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AdminPageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="admin-page-heading">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="admin-page-heading__action">{action}</div> : null}
    </header>
  );
}

export function AdminLoadingState({ label = "Đang tải dữ liệu" }: { label?: string }) {
  return (
    <div className="admin-state" role="status" aria-live="polite">
      <span className="admin-spinner" aria-hidden="true" />
      <strong>{label}</strong>
      <span>Vui lòng chờ trong giây lát.</span>
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="admin-state admin-state--empty">
      <svg className="admin-state__symbol" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M5 7.5h14v11H5zM8 5h8M9 12h6M12 9v6" />
      </svg>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  );
}

export function AdminErrorState({
  title = "Không thể tải dữ liệu",
  description = "Đã có lỗi từ dịch vụ. Vui lòng thử lại.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <section className="admin-state admin-state--error" role="alert">
      <h2>{title}</h2>
      <p>{description}</p>
      {onRetry ? <button type="button" onClick={onRetry}>Thử lại</button> : null}
    </section>
  );
}

export function AdminNotification({
  tone = "success",
  title,
  message,
}: {
  tone?: "success" | "error";
  title: string;
  message: string;
}) {
  return (
    <div className={`admin-notification admin-notification--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}

export function AdminConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="admin-dialog-backdrop" role="presentation">
      <section ref={dialogRef} className="admin-dialog" role="alertdialog" aria-modal="true" aria-labelledby="admin-dialog-title" aria-describedby="admin-dialog-description">
        <h2 id="admin-dialog-title">{title}</h2>
        <p id="admin-dialog-description">{description}</p>
        <div className="admin-dialog__actions">
          <button ref={cancelRef} type="button" className="admin-button admin-button--secondary" onClick={onCancel}>Hủy</button>
          <button type="button" className="admin-button admin-button--danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
