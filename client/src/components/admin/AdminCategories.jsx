import { useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { adminApi } from "../../services/admin.js";
import { toastStore } from "../../store/toastStore.js";
import { EmptyState, ErrorState } from "../ui/States.jsx";
import { Field, Panel, StatusPill, Td, Th } from "./AdminUI.jsx";
import {
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "./adminUtils.js";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  sortOrder: "0",
  isActive: true,
};

function CategoryForm({ category, onCancel, onSaved }) {
  const [form, setForm] = useState(() =>
    category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          imageUrl: category.imageUrl || "",
          sortOrder: String(category.sortOrder),
          isActive: category.isActive,
        }
      : emptyForm,
  );
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };
    if (form.slug.trim()) payload.slug = form.slug.trim();

    try {
      if (category) {
        await adminApi.categories.update(category.id, payload);
        toastStore.show("Kategori diperbarui.");
      } else {
        await adminApi.categories.create(payload);
        toastStore.show("Kategori dibuat.");
      }
      onSaved();
    } catch (requestError) {
      setError(requestError?.message || "Gagal menyimpan kategori.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-accent/40 bg-surface p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-bold uppercase">
          {category ? "Edit Kategori" : "Kategori Baru"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-control p-1.5 hover:bg-surface-2"
          aria-label="Tutup formulir"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Nama">
          <input
            required
            minLength="2"
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Slug" hint="Kosongkan untuk otomatis">
          <input
            value={form.slug}
            onChange={(event) => set("slug", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="URL gambar">
          <input
            value={form.imageUrl}
            onChange={(event) => set("imageUrl", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Urutan">
          <input
            type="number"
            min="0"
            value={form.sortOrder}
            onChange={(event) => set("sortOrder", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Deskripsi" className="md:col-span-2">
          <textarea
            rows="3"
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
            className={inputClass}
          />
        </Field>
        <label className="flex items-center gap-2 text-xs font-semibold">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => set("isActive", event.target.checked)}
          />
          Kategori aktif
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-xs text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button type="button" onClick={onCancel} className={buttonSecondary}>
          Batal
        </button>
      </div>
    </form>
  );
}

export function AdminCategories() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data, loading, error, reload } = useAsyncData(() =>
    adminApi.categories.list().then((response) => response.data),
  );
  const categories = data ?? [];

  async function removeCategory(category) {
    if (
      !window.confirm(
        `Nonaktifkan kategori "${category.name}"? Kategori dengan produk aktif tidak dapat dinonaktifkan.`,
      )
    ) {
      return;
    }
    try {
      await adminApi.categories.remove(category.id);
      toastStore.show("Kategori dinonaktifkan.");
      reload();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal menonaktifkan kategori.", "error");
    }
  }

  return (
    <div className="space-y-5">
      {formOpen ? (
        <CategoryForm
          category={editing}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={() => {
            setFormOpen(false);
            setEditing(null);
            reload();
          }}
        />
      ) : null}

      <Panel
        title="Kategori"
        description="Kategori olahraga untuk katalog dan navigasi."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className={buttonPrimary}
          >
            <span className="inline-flex items-center gap-1">
              <Plus size={14} /> Kategori Baru
            </span>
          </button>
        }
      >
        {loading && !categories.length ? (
          <div className="h-32 animate-pulse rounded-control bg-surface-2" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : categories.length === 0 ? (
          <EmptyState title="Belum ada kategori" />
        ) : (
          <div className="overflow-x-auto rounded-control border border-border">
            <table className="w-full border-collapse">
              <thead className="bg-surface-2">
                <tr>
                  <Th>Nama</Th>
                  <Th>Slug</Th>
                  <Th>Produk</Th>
                  <Th>Urutan</Th>
                  <Th>Status</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t border-border">
                    <Td className="font-semibold">{category.name}</Td>
                    <Td className="font-mono text-muted">{category.slug}</Td>
                    <Td>{category.productCount}</Td>
                    <Td>{category.sortOrder}</Td>
                    <Td>
                      <StatusPill tone={category.isActive ? "accent" : "muted"}>
                        {category.isActive ? "Aktif" : "Nonaktif"}
                      </StatusPill>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(category);
                            setFormOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                        >
                          <Pencil size={11} /> Edit
                        </button>
                        {category.isActive ? (
                          <button
                            type="button"
                            onClick={() => removeCategory(category)}
                            className="text-[11px] font-semibold text-muted hover:text-danger"
                          >
                            Nonaktifkan
                          </button>
                        ) : null}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
