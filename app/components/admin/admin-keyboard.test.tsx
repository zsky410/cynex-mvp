import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminMobileNav } from "./admin-shell";
import { AdminConfirmationDialog } from "./admin-primitives";

afterEach(cleanup);

function renderMobileNav() {
  const Stub = createRoutesStub([{ path: "/", Component: AdminMobileNav }]);
  return render(<Stub initialEntries={["/"]} />);
}

describe("Admin keyboard behavior", () => {
  it("opens mobile navigation, moves focus, and restores it on Escape", async () => {
    renderMobileNav();
    const trigger = screen.getByRole("button", { name: "Menu" });

    fireEvent.click(trigger);
    const firstLink = screen.getByRole("link", { name: "Tổng quan" });
    await waitFor(() => expect(document.activeElement).toBe(firstLink));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps Tab focus inside the mobile menu", async () => {
    renderMobileNav();
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const firstLink = screen.getByRole("link", { name: "Tổng quan" });
    const logout = screen.getByRole("button", { name: "Đăng xuất" });
    await waitFor(() => expect(document.activeElement).toBe(firstLink));

    logout.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(firstLink);
  });

  it("focuses cancel and dismisses confirmation with Escape", async () => {
    const onCancel = vi.fn();
    render(
      <AdminConfirmationDialog
        open
        title="Xác nhận thay đổi"
        description="Thao tác này cần được xác nhận."
        confirmLabel="Xác nhận"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    const cancel = screen.getByRole("button", { name: "Hủy" });
    await waitFor(() => expect(document.activeElement).toBe(cancel));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
