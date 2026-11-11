import { useState } from "react";
import { Pencil, Plus, Search, X } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";
import { adminApi } from "../../services/admin.js";
import { toastStore } from "../../store/toastStore.js";
import { formatDate } from "../../utils/format.js";
import { EmptyState, ErrorState } from "../ui/States.jsx";
import { Field, Pagination, Panel, StatusPill, Td, Th } from "./AdminUI.jsx";
import {
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "./adminUtils.js";

const emptyForm = {
  title: "",
  slug: "",
  category: "Umum",
  excerpt: "",
  content: "",
  isPublished: true,
  sortOrder: "0",
};

function HelpForm({ article, onCancel, onSaved }) {
  const [form, setForm] = useState(() =>
    article
      ? {
          title: article.title,
          slug: article.slug,
          category: article.category,
          excerpt: article.excerpt || "",
          content: article.content,
          isPublished: article.isPublished,
          sortOrder: String(article.sortOrder),
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
      title: form.title.trim(),
      category: form.category.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim(),
      isPublished: form.isPublished,
      sortOrder: Number(form.sortOrder) || 0,
    };
    if (form.slug.trim()) payload.slug = form.slug.trim();

    try {
      if (article) {
        await adminApi.help.update(article.id, payload);
        toastStore.show("Artikel bantuan diperbarui.");
      } else {
        await adminApi.help.create(payload);
        toastStore.show("Artikel bantuan dibuat.");
      }
      onSaved();
    } catch (requestError) {
      setError(requestError?.message || "Gagal menyimpan artikel.");
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
          {article ? "Edit Artikel Bantuan" : "Artikel Bantuan Baru"}
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
        <Field label="Judul" className="md:col-span-2">
          <input
            required
            minLength="3"
            value={form.title}
            onChange={(event) => set("title", event.target.value)}
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
        <Field label="Kategori">
          <input
            required
            minLength="2"
            value={form.category}
            onChange={(event) => set("category", event.target.value)}
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
        <label className="mt-6 flex items-center gap-2 text-xs font-semibold">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(event) => set("isPublished", event.target.checked)}
          />
          Publikasikan
        </label>
        <Field label="Ringkasan" className="md:col-span-2">
          <textarea
            rows="2"
            maxLength="400"
            value={form.excerpt}
            onChange={(event) => set("excerpt", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Konten" className="md:col-span-2">
          <textarea
            required
            minLength="20"
            rows="8"
            value={form.content}
            onChange={(event) => set("content", event.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-xs text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? "Menyimpan..." : "Simpan Artikel"}
        </button>
        <button type="button" onClick={onCancel} className={buttonSecondary}>
          Batal
        </button>
      </div>
    </form>
  );
}

export function AdminHelp() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const debouncedQuery = useDebouncedValue(query, 350);

  const { data, loading, error, reload } = useAsyncData(
    () =>
      adminApi.help
        .list({ q: debouncedQuery || undefined, page, limit: 10 })
        .then((response) => response),
    [debouncedQuery, page],
  );

  const articles = data?.data ?? [];
  const meta = data?.meta;

  async function startEdit(article) {
    try {
      const response = await adminApi.help.detail(article.id);
      setEditing(response.data);
      setFormOpen(true);
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal memuat artikel.", "error");
    }
  }

  async function removeArticle(article) {
    if (!window.confirm(`Hapus artikel "${article.title}"?`)) return;
    try {
      await adminApi.help.remove(article.id);
      toastStore.show("Artikel bantuan dihapus.");
      reload();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal menghapus artikel.", "error");
    }
  }

  return (
    <div className="space-y-5">
      {formOpen ? (
        <HelpForm
          key={editing?.id ?? "new"}
          article={editing}
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
        title="Artikel Bantuan"
        description="Konten pusat bantuan yang tampil di halaman /bantuan."
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
              <Plus size={14} /> Artikel Baru
            </span>
          </button>
        }
      >
        <label className="relative block max-w-md">
          <span className="sr-only">Cari artikel bantuan</span>
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Cari judul, kategori, atau ringkasan"
            className="w-full rounded-control border border-border bg-bg py-2 pl-9 pr-3 text-sm"
          />
        </label>

        {loading && !data ? (
          <div className="mt-4 h-40 animate-pulse rounded-control bg-surface-2" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : articles.length === 0 ? (
          <EmptyState title="Belum ada artikel" />
        ) : (
          <>
            <div className="mt-4 overflow-x-auto rounded-control border border-border">
              <table className="w-full border-collapse">
                <thead className="bg-surface-2">
                  <tr>
                    <Th>Judul</Th>
                    <Th>Kategori</Th>
                    <Th>Urutan</Th>
                    <Th>Update</Th>
                    <Th>Status</Th>
                    <Th>Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="border-t border-border">
                      <Td className="font-semibold">{article.title}</Td>
                      <Td>{article.category}</Td>
                      <Td>{article.sortOrder}</Td>
                      <Td>{formatDate(article.updatedAt)}</Td>
                      <Td>
                        <StatusPill tone={article.isPublished ? "accent" : "muted"}>
                          {article.isPublished ? "Terbit" : "Draft"}
                        </StatusPill>
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(article)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                          >
                            <Pencil size={11} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeArticle(article)}
                            className="text-[11px] font-semibold text-muted hover:text-danger"
                          >
                            Hapus
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={meta} onPage={setPage} />
          </>
        )}
      </Panel>
    </div>
  );
}
