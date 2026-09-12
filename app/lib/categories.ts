export type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  iconKey: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
};

export type CategoryFormErrors = Partial<Record<keyof CategoryFormValues, string>>;

export function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categoryValues(formData: FormData): CategoryFormValues {
  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    iconKey: String(formData.get("iconKey") ?? "").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim(),
    sortOrder: String(formData.get("sortOrder") ?? "0").trim(),
    isActive: formData.get("isActive") === "on",
  };
}

export function validateCategory(values: CategoryFormValues) {
  const errors: CategoryFormErrors = {};
  if (!values.name) errors.name = "Vui lòng nhập tên danh mục.";
  if (!values.slug) errors.slug = "Vui lòng nhập đường dẫn.";
  else if (normalizeSlug(values.slug) !== values.slug) {
    errors.slug = "Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang.";
  }
  if (!values.iconKey) errors.iconKey = "Vui lòng nhập mã biểu tượng.";
  if (values.imageUrl) {
    try {
      if (new URL(values.imageUrl).protocol !== "https:") throw new Error();
    } catch {
      errors.imageUrl = "URL hình ảnh phải là địa chỉ HTTPS hợp lệ.";
    }
  }
  const order = Number(values.sortOrder);
  if (!Number.isInteger(order) || order < 0) {
    errors.sortOrder = "Thứ tự phải là số nguyên không âm.";
  }
  return errors;
}

export function translateCategoryError(error: { code?: string; message?: string }) {
  if (error.code === "23505") return { slug: "Đường dẫn này đã được sử dụng." };
  if (error.code === "23503") {
    return { form: "Không thể xóa danh mục đang có sản phẩm." };
  }
  if (error.code === "23514" && error.message?.includes("homepage")) {
    return { form: "Hãy gỡ danh mục khỏi Trang chủ trước khi ẩn hoặc xóa." };
  }
  return { form: "Không thể lưu thay đổi. Vui lòng thử lại." };
}
