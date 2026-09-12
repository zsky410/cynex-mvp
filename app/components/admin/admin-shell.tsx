import { useEffect, useRef, useState } from "react";
import { Form, NavLink } from "react-router";

type AdminShellProps = {
  adminIdentifier: string;
  environment: string;
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  to: string;
  end?: boolean;
  icon: "home" | "categories" | "products" | "star" | "contact";
};

export const adminNavigation: NavItem[] = [
  { label: "Tổng quan", to: "/admin", end: true, icon: "home" },
  { label: "Danh mục", to: "/admin/categories", icon: "categories" },
  { label: "Sản phẩm", to: "/admin/products", icon: "products" },
  { label: "Trang chủ", to: "/admin/homepage", icon: "star" },
  { label: "Liên hệ", to: "/admin/settings/contact", icon: "contact" },
];

function NavIcon({ name }: { name: NavItem["icon"] }) {
  const paths = {
    home: <path d="M3 11.5 12 4l9 7.5V21H15v-6H9v6H3Z" />,
    categories: <path d="M4 5h6v6H4Zm10 0h6v6h-6ZM4 15h6v6H4Zm10 0h6v6h-6Z" />,
    products: <path d="m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />,
    contact: <path d="M4 5h16v12H8l-4 4Zm4 4h8M8 13h5" />,
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function EnvironmentBadge({ environment }: { environment: string }) {
  const normalized = environment.toLowerCase();
  const label =
    normalized === "production"
      ? "Production"
      : normalized === "staging"
        ? "Staging"
        : "Local";
  return <span className={`admin-environment admin-environment--${normalized}`}>{label}</span>;
}

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Điều hướng quản trị" className="admin-nav">
      {adminNavigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `admin-nav__link${isActive ? " admin-nav__link--active" : ""}`
          }
        >
          <NavIcon name={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function LogoutForm() {
  return (
    <Form method="post" action="/admin/logout" className="admin-logout-form">
      <button type="submit" className="admin-logout-button">
        Đăng xuất
      </button>
    </Form>
  );
}

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>("a, button");
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="admin-mobile-nav">
      <button
        ref={triggerRef}
        type="button"
        className="admin-mobile-nav__trigger"
        aria-expanded={open}
        aria-controls="admin-mobile-menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="admin-mobile-nav__icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        Menu
      </button>
      {open ? (
        <div ref={panelRef} id="admin-mobile-menu" className="admin-mobile-nav__panel">
          <nav aria-label="Điều hướng quản trị trên thiết bị di động" className="admin-nav">
            {adminNavigation.map((item, index) => (
              <NavLink
                key={item.to}
                ref={index === 0 ? firstLinkRef : undefined}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `admin-nav__link${isActive ? " admin-nav__link--active" : ""}`
                }
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <LogoutForm />
        </div>
      ) : null}
    </div>
  );
}

export function AdminShell({ adminIdentifier, environment, children }: AdminShellProps) {
  return (
    <div className="admin-app-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand__mark" aria-hidden="true">C</span>
          <div>
            <strong>Cynex</strong>
            <span>Quản trị danh mục</span>
          </div>
        </div>
        <EnvironmentBadge environment={environment} />
        <AdminNav />
        <div className="admin-sidebar__account">
          <span>Đang đăng nhập</span>
          <strong title={adminIdentifier}>{adminIdentifier}</strong>
          <LogoutForm />
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-mobile-header">
          <div className="admin-brand">
            <span className="admin-brand__mark" aria-hidden="true">C</span>
            <strong>Cynex Admin</strong>
          </div>
          <EnvironmentBadge environment={environment} />
          <AdminMobileNav />
        </header>
        <main id="admin-main-content" className="admin-main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
