import { describe, expect, it } from "vitest";
import { normalizeSlug, translateCategoryError, validateCategory } from "./categories";

describe("Category domain helpers", () => {
  it("normalizes Vietnamese category names", () => {
    expect(normalizeSlug("  Trí Tuệ Nhân Tạo & Đồ họa  ")).toBe("tri-tue-nhan-tao-do-hoa");
  });

  it("validates fields with Vietnamese messages", () => {
    const errors = validateCategory({ name: "", slug: "Không hợp lệ", description: "", iconKey: "", imageUrl: "http://example.test/a.png", sortOrder: "-1", isActive: true });
    expect(Object.keys(errors)).toEqual(["name", "slug", "iconKey", "imageUrl", "sortOrder"]);
  });

  it("translates duplicate, reference, and homepage constraints", () => {
    expect(translateCategoryError({ code: "23505" })).toHaveProperty("slug");
    expect(translateCategoryError({ code: "23503" }).form).toContain("sản phẩm");
    expect(translateCategoryError({ code: "23514", message: "homepage category" }).form).toContain("Trang chủ");
  });
});
