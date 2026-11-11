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
  category: "Berita",
  excerpt: "",
  coverImage: "",
  content: "",
  isPublished: true,
  productIds: [],
};

function NewsForm({ article, products, onCancel, onSaved }) {
  const [form, setForm] = useState(() =>
    article
      ? {
          title: article.title,
          slug: article.slug,
          category: article.category,
          excerpt: article.excerpt || "",
          coverImage: article.coverImage || "",
          content: article.content,
          isPublished: article.isPublished,
          productIds: article.products.map((product) => product.id),
        }
      : emptyForm,
  );
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleProduct(id) {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(id)
        ? current.productIds.filter((entry) => entry !== id)
        : [...current.productIds, id],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      excerpt: form.excerpt.trim() || null,
      coverImage: form.coverImage.trim() || null,
      content: form.content.trim(),
      isPublished: form.isPublished,
      productIds: form.productIds,
    };
    if (form.slug.trim()) payload.slug = form.slug.trim();

    try {
      if (article) {
        await adminApi.news.update(article.id, payload);
        toastStore.show("Artikel news diperbarui.");
      } else {
        await adminApi.news.create(payload);
        toastStore.show("Artikel news dibuat.");
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
          {article ? "Edit Artikel News" : "Artikel News Baru"}
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
        <Field label="URL cover">
          <input
            value={form.coverImage}
            onChange={(event) => set("coverImage", event.target.value)}
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
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Produk terkait
          </p>
          <div className="mt-2 grid max-h-40 grid-cols-1 gap-1 overflow-y-auto rounded-control border border-border bg-bg p-3 text-xs sm:grid-cols-2">
            {products.map((product) => (
              <label key={product.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.productIds.includes(product.id)}
                  onChange={() => toggleProduct(product.id)}
                />
                {product.name}
              </label>
            ))}
          </div>
        </div>
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

export function AdminNews() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const debouncedQuery = useDebouncedValue(query, 350);

  const { data, loading, error, reload } = useAsyncData(
    () =>
      adminApi.news
        .list({ q: debouncedQuery || undefined, page, limit: 10 })
        .then((response) => response),
    [debouncedQuery, page],
  );

  const { data: productData } = useAsyncData(
    () => adminApi.products.list({ limit: 50 }).then((response) => response.data),
    [],
  );

  const articles = data?.data ?? [];
  const meta = data?.meta;
  const products = productData ?? [];

  async function startEdit(article) {
    try {
      const response = await adminApi.news.detail(article.id);
      setEditing(response.data);
      setFormOpen(true);
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal memuat artikel.", "error");
    }
  }

  async function removeArticle(article) {
    if (!window.confirm(`Hapus artikel "${article.title}"?`)) return;
    try {
      await adminApi.news.remove(article.id);
      toastStore.show("Artikel news dihapus.");
      reload();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal menghapus artikel.", "error");
    }
  }

  return (
    <div className="space-y-5">
      {formOpen ? (
        <NewsForm
          key={editing?.id ?? "new"}
          article={editing}
          products={products}
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
        title="Artikel News"
        description="Kelola berita, cerita brand, dan produk terkait."
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
          <span className="sr-only">Cari artikel news</span>
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
                    <Th>Tanggal</Th>
                    <Th>Views</Th>
                    <Th>Produk</Th>
                    <Th>Status</Th>
                    <Th>Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="border-t border-border">
                      <Td className="font-semibold">{article.title}</Td>
                      <Td>{article.category}</Td>
                      <Td>{formatDate(article.publishedAt)}</Td>
                      <Td>{article.viewCount}</Td>
                      <Td>{article.productCount}</Td>
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
