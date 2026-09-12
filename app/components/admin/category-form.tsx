import { useState } from "react";
import { Form, useNavigation } from "react-router";
import { normalizeSlug, type CategoryFormErrors, type CategoryFormValues } from "../../lib/categories";

export function CategoryForm({ values, errors = {}, submitLabel }: { values: CategoryFormValues; errors?: CategoryFormErrors & { form?: string }; submitLabel: string }) {
  const navigation = useNavigation();
  const [name, setName] = useState(values.name);
  const [slug, setSlug] = useState(values.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(values.slug));
  const pending = navigation.state === "submitting";

  return (
    <Form method="post" className="admin-form">
      {errors.form ? <div className="admin-error-summary" role="alert"><strong>Không thể lưu danh mục</strong><span>{errors.form}</span></div> : null}
      <div className="admin-form__grid">
        <label>Tên danh mục<input required name="name" value={name} onChange={(event) => { setName(event.target.value); if (!slugEdited) setSlug(normalizeSlug(event.target.value)); }} aria-invalid={Boolean(errors.name)} />{errors.name ? <span className="admin-field-error">{errors.name}</span> : null}</label>
        <label>Đường dẫn<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" name="slug" value={slug} onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} aria-invalid={Boolean(errors.slug)} />{errors.slug ? <span className="admin-field-error">{errors.slug}</span> : null}</label>
        <label>Mã biểu tượng<input required name="iconKey" defaultValue={values.iconKey} aria-invalid={Boolean(errors.iconKey)} />{errors.iconKey ? <span className="admin-field-error">{errors.iconKey}</span> : null}</label>
        <label>Thứ tự<input name="sortOrder" type="number" min="0" step="1" defaultValue={values.sortOrder} aria-invalid={Boolean(errors.sortOrder)} />{errors.sortOrder ? <span className="admin-field-error">{errors.sortOrder}</span> : null}</label>
        <label className="admin-form__wide">URL hình ảnh (không bắt buộc)<input name="imageUrl" type="url" pattern="https://.*" defaultValue={values.imageUrl} aria-invalid={Boolean(errors.imageUrl)} />{errors.imageUrl ? <span className="admin-field-error">{errors.imageUrl}</span> : null}</label>
        <label className="admin-form__wide">Mô tả<textarea name="description" rows={5} defaultValue={values.description} /></label>
      </div>
      <label className="admin-checkbox"><input name="isActive" type="checkbox" defaultChecked={values.isActive} /> Hiển thị danh mục</label>
      <div className="admin-form__actions"><button className="admin-button" disabled={pending}>{pending ? "Đang lưu…" : submitLabel}</button></div>
    </Form>
  );
}
