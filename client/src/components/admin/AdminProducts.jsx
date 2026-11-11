import { useState } from "react";
import {
  ImagePlus,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";
import { adminApi } from "../../services/admin.js";
import { toastStore } from "../../store/toastStore.js";
import { formatRupiah } from "../../utils/format.js";
import { EmptyState, ErrorState } from "../ui/States.jsx";
import { Field, Pagination, Panel, StatusPill, Td, Th } from "./AdminUI.jsx";
import {
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "./adminUtils.js";

const statusOptions = [
  { value: "all", label: "Semua (tanpa terhapus)" },
  { value: "published", label: "Tayang" },
  { value: "draft", label: "Draft" },
  { value: "deleted", label: "Terhapus" },
];

const genders = ["unisex", "men", "women", "kids"];
const badges = ["", "BARU", "TERLARIS", "POPULER", "EKSKLUSIF", "DISKON"];

const emptyProduct = {
  sku: "",
  name: "",
  slug: "",
  description: "",
  brand: "Stride Athletics",
  categoryId: "",
  gender: "unisex",
  basePrice: "",
  salePrice: "",
  badge: "",
  isPublished: true,
};

function ProductForm({ product, categories, onCancel, onSaved }) {
  const [form, setForm] = useState(() =>
    product
      ? {
          sku: product.sku,
          name: product.name,
          slug: product.slug,
          description: product.description,
          brand: product.brand,
          categoryId: String(product.categoryId),
          gender: product.gender,
          basePrice: String(product.basePrice),
          salePrice: product.salePrice == null ? "" : String(product.salePrice),
          badge: product.badge || "",
          isPublished: product.isPublished,
        }
      : emptyProduct,
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
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      brand: form.brand.trim() || "Stride Athletics",
      categoryId: Number(form.categoryId),
      gender: form.gender,
      basePrice: Number(form.basePrice),
      salePrice: form.salePrice === "" ? null : Number(form.salePrice),
      badge: form.badge || null,
      isPublished: form.isPublished,
    };
    if (form.slug.trim()) payload.slug = form.slug.trim();

    try {
      if (product) {
        await adminApi.products.update(product.id, payload);
        toastStore.show("Produk diperbarui.");
      } else {
        await adminApi.products.create(payload);
        toastStore.show("Produk dibuat. Tambahkan gambar dan varian.");
      }
      onSaved();
    } catch (requestError) {
      setError(requestError?.message || "Gagal menyimpan produk.");
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
          {product ? "Edit Produk" : "Produk Baru"}
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
        <Field label="SKU">
          <input
            required
            minLength="2"
            value={form.sku}
            onChange={(event) => set("sku", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Nama produk">
          <input
            required
            minLength="2"
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Slug" hint="Kosongkan untuk dibuat otomatis">
          <input
            value={form.slug}
            onChange={(event) => set("slug", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Kategori">
          <select
            required
            value={form.categoryId}
            onChange={(event) => set("categoryId", event.target.value)}
            className={inputClass}
          >
            <option value="">Pilih kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {category.isActive ? "" : " (nonaktif)"}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Brand">
          <input
            value={form.brand}
            onChange={(event) => set("brand", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Gender">
          <select
            value={form.gender}
            onChange={(event) => set("gender", event.target.value)}
            className={inputClass}
          >
            {genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Harga dasar (Rp)">
          <input
            required
            type="number"
            min="0"
            step="1"
            value={form.basePrice}
            onChange={(event) => set("basePrice", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Harga diskon (Rp)" hint="Kosongkan bila tidak diskon">
          <input
            type="number"
            min="0"
            step="1"
            value={form.salePrice}
            onChange={(event) => set("salePrice", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Badge">
          <select
            value={form.badge}
            onChange={(event) => set("badge", event.target.value)}
            className={inputClass}
          >
            {badges.map((badge) => (
              <option key={badge || "none"} value={badge}>
                {badge || "Tanpa badge"}
              </option>
            ))}
          </select>
        </Field>
        <label className="mt-6 flex items-center gap-2 text-xs font-semibold">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(event) => set("isPublished", event.target.checked)}
          />
          Tayang di katalog
        </label>
        <Field label="Deskripsi" className="md:col-span-2">
          <textarea
            required
            minLength="10"
            rows="4"
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
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
          {saving ? "Menyimpan..." : product ? "Simpan Perubahan" : "Buat Produk"}
        </button>
        <button type="button" onClick={onCancel} className={buttonSecondary}>
          Batal
        </button>
      </div>
    </form>
  );
}

function VariantStockRow({ productId, variant, onChanged }) {
  const [quantity, setQuantity] = useState(String(variant.quantity));
  const [threshold, setThreshold] = useState(String(variant.lowStockThreshold));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await adminApi.products.updateStock(productId, variant.id, {
        quantity: Number(quantity),
        lowStockThreshold: Number(threshold),
      });
      toastStore.show("Stok diperbarui.");
      onChanged();
    } catch (error) {
      toastStore.show(error?.message || "Gagal memperbarui stok.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive() {
    try {
      await adminApi.products.updateVariant(productId, variant.id, {
        isActive: !variant.isActive,
      });
      toastStore.show(variant.isActive ? "Varian dinonaktifkan." : "Varian diaktifkan.");
      onChanged();
    } catch (error) {
      toastStore.show(error?.message || "Gagal memperbarui varian.", "error");
    }
  }

  return (
    <tr className="border-t border-border">
      <Td className="font-mono">{variant.sku}</Td>
      <Td>{variant.size}</Td>
      <Td>
        <span className="inline-flex items-center gap-1.5">
          {variant.colorHex ? (
            <span
              className="h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: variant.colorHex }}
            />
          ) : null}
          {variant.color}
        </span>
      </Td>
      <Td>{variant.priceOverride ? formatRupiah(variant.priceOverride) : "-"}</Td>
      <Td>
        <input
          type="number"
          min="0"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="w-20 rounded-control border border-border bg-bg px-2 py-1 text-xs"
        />
      </Td>
      <Td>
        <input
          type="number"
          min="0"
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
          className="w-16 rounded-control border border-border bg-bg px-2 py-1 text-xs"
        />
      </Td>
      <Td>
        <StatusPill tone={variant.isActive ? "accent" : "muted"}>
          {variant.isActive ? "Aktif" : "Nonaktif"}
        </StatusPill>
      </Td>
      <Td>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="text-[11px] font-semibold text-accent hover:underline disabled:opacity-50"
          >
            Simpan stok
          </button>
          <button
            type="button"
            onClick={toggleActive}
            className="text-[11px] font-semibold text-muted hover:text-fg"
          >
            {variant.isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </div>
      </Td>
    </tr>
  );
}

function ProductDetailPanel({ productId, onEdit, onChanged, onClose }) {
  const { data: product, loading, error, reload } = useAsyncData(
    () => adminApi.products.detail(productId).then((response) => response.data),
    [productId],
  );
  const [imageForm, setImageForm] = useState({ url: "", alt: "", isPrimary: false });
  const [variantForm, setVariantForm] = useState({
    size: "",
    color: "",
    colorHex: "#111111",
    priceOverride: "",
    quantity: "0",
    lowStockThreshold: "3",
  });
  const [busy, setBusy] = useState(false);

  function refresh() {
    reload();
    onChanged();
  }

  async function addImage(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await adminApi.products.addImage(productId, {
        url: imageForm.url.trim(),
        alt: imageForm.alt.trim() || undefined,
        isPrimary: imageForm.isPrimary,
        sortOrder: product?.images.length ?? 0,
      });
      toastStore.show("Gambar ditambahkan.");
      setImageForm({ url: "", alt: "", isPrimary: false });
      refresh();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal menambah gambar.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function setPrimary(image) {
    try {
      await adminApi.products.updateImage(productId, image.id, { isPrimary: true });
      toastStore.show("Gambar utama diperbarui.");
      refresh();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal memperbarui gambar.", "error");
    }
  }

  async function removeImage(image) {
    if (!window.confirm("Hapus gambar ini?")) return;
    try {
      await adminApi.products.removeImage(productId, image.id);
      toastStore.show("Gambar dihapus.");
      refresh();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal menghapus gambar.", "error");
    }
  }

  async function addVariant(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await adminApi.products.addVariant(productId, {
        size: variantForm.size.trim(),
        color: variantForm.color.trim(),
        colorHex: variantForm.colorHex || undefined,
        priceOverride:
          variantForm.priceOverride === ""
            ? null
            : Number(variantForm.priceOverride),
        quantity: Number(variantForm.quantity),
        lowStockThreshold: Number(variantForm.lowStockThreshold),
      });
      toastStore.show("Varian ditambahkan.");
      setVariantForm((current) => ({
        ...current,
        size: "",
        color: "",
        priceOverride: "",
        quantity: "0",
      }));
      refresh();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal menambah varian.", "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !product) {
    return <div className="h-40 animate-pulse rounded-card bg-surface-2" />;
  }
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <Panel
      title={`Kelola: ${product.name}`}
      description={`${product.sku} · ${product.variants.length} varian`}
      actions={
        <div className="flex gap-2">
          <button type="button" onClick={() => onEdit(product)} className={buttonSecondary}>
            <span className="inline-flex items-center gap-1">
              <Pencil size={13} /> Edit
            </span>
          </button>
          <button type="button" onClick={onClose} className={buttonDanger}>
            Tutup
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide">Gambar Produk</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {product.images.map((image) => (
              <li
                key={image.id}
                className="overflow-hidden rounded-control border border-border bg-bg"
              >
                <img
                  src={image.url}
                  alt={image.alt || product.name}
                  className="h-24 w-full object-cover"
                />
                <div className="flex items-center justify-between gap-1 px-2 py-1.5 text-[10px]">
                  {image.isPrimary ? (
                    <span className="font-bold text-accent">Utama</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPrimary(image)}
                      className="text-muted hover:text-accent"
                    >
                      Jadikan utama
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="text-muted hover:text-danger"
                    aria-label="Hapus gambar"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </li>
            ))}
            {product.images.length === 0 ? (
              <li className="col-span-full text-xs text-muted">Belum ada gambar.</li>
            ) : null}
          </ul>

          <form onSubmit={addImage} className="mt-3 space-y-2">
            <Field label="URL gambar">
              <input
                required
                value={imageForm.url}
                onChange={(event) =>
                  setImageForm((current) => ({ ...current, url: event.target.value }))
                }
                placeholder="/images/products/contoh.svg"
                className={inputClass}
              />
            </Field>
            <Field label="Alt text">
              <input
                value={imageForm.alt}
                onChange={(event) =>
                  setImageForm((current) => ({ ...current, alt: event.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={imageForm.isPrimary}
                onChange={(event) =>
                  setImageForm((current) => ({
                    ...current,
                    isPrimary: event.target.checked,
                  }))
                }
              />
              Jadikan gambar utama
            </label>
            <button type="submit" disabled={busy} className={buttonPrimary}>
              <span className="inline-flex items-center gap-1">
                <ImagePlus size={13} /> Tambah Gambar
              </span>
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide">Varian & Stok</h3>
          <div className="mt-3 overflow-x-auto rounded-control border border-border">
            <table className="w-full border-collapse">
              <thead className="bg-surface-2">
                <tr>
                  <Th>SKU</Th>
                  <Th>Ukuran</Th>
                  <Th>Warna</Th>
                  <Th>Harga</Th>
                  <Th>Stok</Th>
                  <Th>Ambang</Th>
                  <Th>Status</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => (
                  <VariantStockRow
                    key={variant.id}
                    productId={product.id}
                    variant={variant}
                    onChanged={refresh}
                  />
                ))}
                {product.variants.length === 0 ? (
                  <tr>
                    <Td className="text-muted">Belum ada varian.</Td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <form onSubmit={addVariant} className="mt-3 grid grid-cols-2 gap-2">
            <Field label="Ukuran">
              <input
                required
                value={variantForm.size}
                onChange={(event) =>
                  setVariantForm((current) => ({ ...current, size: event.target.value }))
                }
                placeholder="EU 42"
                className={inputClass}
              />
            </Field>
            <Field label="Warna">
              <input
                required
                value={variantForm.color}
                onChange={(event) =>
                  setVariantForm((current) => ({ ...current, color: event.target.value }))
                }
                placeholder="Hitam"
                className={inputClass}
              />
            </Field>
            <Field label="Hex warna">
              <input
                value={variantForm.colorHex}
                onChange={(event) =>
                  setVariantForm((current) => ({
                    ...current,
                    colorHex: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Harga override">
              <input
                type="number"
                min="0"
                value={variantForm.priceOverride}
                onChange={(event) =>
                  setVariantForm((current) => ({
                    ...current,
                    priceOverride: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Stok awal">
              <input
                type="number"
                min="0"
                value={variantForm.quantity}
                onChange={(event) =>
                  setVariantForm((current) => ({
                    ...current,
                    quantity: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Ambang stok">
              <input
                type="number"
                min="0"
                value={variantForm.lowStockThreshold}
                onChange={(event) =>
                  setVariantForm((current) => ({
                    ...current,
                    lowStockThreshold: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
            <div className="col-span-2">
              <button type="submit" disabled={busy} className={buttonPrimary}>
                <span className="inline-flex items-center gap-1">
                  <Plus size={13} /> Tambah Varian
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Panel>
  );
}

export function AdminProducts() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const debouncedQuery = useDebouncedValue(query, 350);

  const { data, loading, error, reload } = useAsyncData(
    () =>
      adminApi.products
        .list({
          q: debouncedQuery || undefined,
          status,
          page,
          limit: 10,
        })
        .then((response) => response),
    [debouncedQuery, status, page],
  );

  const { data: categoryData } = useAsyncData(
    () => adminApi.categories.list().then((response) => response.data),
    [],
  );
  const categories = categoryData ?? [];

  const products = data?.data ?? [];
  const meta = data?.meta;

  async function startEdit(product) {
    try {
      const response = await adminApi.products.detail(product.id);
      setEditing(response.data);
      setFormOpen(true);
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal memuat produk.", "error");
    }
  }

  async function removeProduct(product) {
    if (
      !window.confirm(
        `Hapus produk "${product.name}"? Produk akan disembunyikan dari katalog.`,
      )
    ) {
      return;
    }
    try {
      await adminApi.products.remove(product.id);
      toastStore.show("Produk dihapus.");
      if (selectedId === product.id) setSelectedId(null);
      reload();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal menghapus produk.", "error");
    }
  }

  return (
    <div className="space-y-5">
      {formOpen ? (
        <ProductForm
          product={editing}
          categories={categories}
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

      {selectedId ? (
        <ProductDetailPanel
          productId={selectedId}
          onEdit={startEdit}
          onChanged={reload}
          onClose={() => setSelectedId(null)}
        />
      ) : null}

      <Panel
        title="Produk"
        description="Kelola katalog, gambar, varian, dan stok."
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
              <Plus size={14} /> Produk Baru
            </span>
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_220px]">
          <label className="relative block">
            <span className="sr-only">Cari produk</span>
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
              placeholder="Cari nama, SKU, atau slug"
              className="w-full rounded-control border border-border bg-bg py-2 pl-9 pr-3 text-sm"
            />
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-control border border-border bg-bg px-3 py-2 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading && !data ? (
          <div className="mt-4 h-40 animate-pulse rounded-control bg-surface-2" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : products.length === 0 ? (
          <EmptyState title="Produk tidak ditemukan" description="Ubah pencarian atau filter." />
        ) : (
          <>
            <div className="mt-4 overflow-x-auto rounded-control border border-border">
              <table className="w-full border-collapse">
                <thead className="bg-surface-2">
                  <tr>
                    <Th>Produk</Th>
                    <Th>Kategori</Th>
                    <Th>Harga</Th>
                    <Th>Varian</Th>
                    <Th>Stok</Th>
                    <Th>Status</Th>
                    <Th>Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-border">
                      <Td>
                        <div className="flex items-center gap-2">
                          {product.image ? (
                            <img
                              src={product.image.url}
                              alt=""
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-surface-2">
                              <PackagePlus size={14} className="text-muted" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-[11px] text-muted">{product.sku}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>{product.category?.name ?? "-"}</Td>
                      <Td>
                        <p>{formatRupiah(product.effectivePrice)}</p>
                        {product.salePrice ? (
                          <p className="text-[10px] text-muted line-through">
                            {formatRupiah(product.basePrice)}
                          </p>
                        ) : null}
                      </Td>
                      <Td>{product.variantCount}</Td>
                      <Td>{product.totalStock}</Td>
                      <Td>
                        {product.deletedAt ? (
                          <StatusPill tone="danger">Terhapus</StatusPill>
                        ) : product.isPublished ? (
                          <StatusPill tone="accent">Tayang</StatusPill>
                        ) : (
                          <StatusPill>Draft</StatusPill>
                        )}
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedId(product.id)}
                            className="text-[11px] font-semibold text-accent hover:underline"
                          >
                            Kelola
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            className="text-[11px] font-semibold text-muted hover:text-fg"
                          >
                            Edit
                          </button>
                          {!product.deletedAt ? (
                            <button
                              type="button"
                              onClick={() => removeProduct(product)}
                              className="text-[11px] font-semibold text-muted hover:text-danger"
                            >
                              Hapus
                            </button>
                          ) : null}
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
