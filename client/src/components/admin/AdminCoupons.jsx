import { useState } from "react";
import { Pencil, Plus, Search, X } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";
import { adminApi } from "../../services/admin.js";
import { toastStore } from "../../store/toastStore.js";
import { formatDate, formatRupiah } from "../../utils/format.js";
import { EmptyState, ErrorState } from "../ui/States.jsx";
import { Field, Pagination, Panel, StatusPill, Td, Th } from "./AdminUI.jsx";
import {
  buttonPrimary,
  buttonSecondary,
  inputClass,
  toDateTimeInput,
} from "./adminUtils.js";

function defaultExpiry() {
  const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return toDateTimeInput(date);
}

const emptyForm = {
  code: "",
  description: "",
  type: "PERCENT",
  value: "10",
  minSpend: "0",
  maxDiscount: "",
  usageLimit: "",
  perUserLimit: "1",
  startsAt: "",
  expiresAt: defaultExpiry(),
  isActive: true,
};

function CouponForm({ coupon, onCancel, onSaved }) {
  const [form, setForm] = useState(() =>
    coupon
      ? {
          code: coupon.code,
          description: coupon.description || "",
          type: coupon.type,
          value: String(coupon.value),
          minSpend: String(coupon.minSpend),
          maxDiscount: coupon.maxDiscount == null ? "" : String(coupon.maxDiscount),
          usageLimit: coupon.usageLimit == null ? "" : String(coupon.usageLimit),
          perUserLimit: String(coupon.perUserLimit),
          startsAt: toDateTimeInput(coupon.startsAt),
          expiresAt: toDateTimeInput(coupon.expiresAt),
          isActive: coupon.isActive,
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
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      type: form.type,
      value: Number(form.value),
      minSpend: Number(form.minSpend || 0),
      maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),
      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
      perUserLimit: Number(form.perUserLimit || 1),
      expiresAt: new Date(form.expiresAt).toISOString(),
      isActive: form.isActive,
    };
    if (form.startsAt) {
      payload.startsAt = new Date(form.startsAt).toISOString();
    }

    try {
      if (coupon) {
        await adminApi.coupons.update(coupon.id, payload);
        toastStore.show("Voucher diperbarui.");
      } else {
        await adminApi.coupons.create(payload);
        toastStore.show("Voucher dibuat.");
      }
      onSaved();
    } catch (requestError) {
      setError(requestError?.message || "Gagal menyimpan voucher.");
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
          {coupon ? "Edit Voucher" : "Voucher Baru"}
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

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label="Kode">
          <input
            required
            minLength="3"
            maxLength="40"
            value={form.code}
            onChange={(event) => set("code", event.target.value.toUpperCase())}
            className={`${inputClass} font-mono uppercase`}
          />
        </Field>
        <Field label="Tipe">
          <select
            value={form.type}
            onChange={(event) => set("type", event.target.value)}
            className={inputClass}
          >
            <option value="PERCENT">Persen</option>
            <option value="FIXED">Nominal tetap</option>
          </select>
        </Field>
        <Field label={form.type === "PERCENT" ? "Nilai (%)" : "Nilai (Rp)"}>
          <input
            required
            type="number"
            min="1"
            max={form.type === "PERCENT" ? "100" : undefined}
            value={form.value}
            onChange={(event) => set("value", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Minimal transaksi (Rp)">
          <input
            type="number"
            min="0"
            value={form.minSpend}
            onChange={(event) => set("minSpend", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Maksimal diskon (Rp)" hint="Kosongkan bila tanpa batas">
          <input
            type="number"
            min="0"
            value={form.maxDiscount}
            onChange={(event) => set("maxDiscount", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Kuota total" hint="Kosongkan bila tanpa batas">
          <input
            type="number"
            min="1"
            value={form.usageLimit}
            onChange={(event) => set("usageLimit", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Batas per pengguna">
          <input
            required
            type="number"
            min="1"
            value={form.perUserLimit}
            onChange={(event) => set("perUserLimit", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Mulai berlaku">
          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) => set("startsAt", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Berakhir">
          <input
            required
            type="datetime-local"
            value={form.expiresAt}
            onChange={(event) => set("expiresAt", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Deskripsi" className="md:col-span-2">
          <input
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
            className={inputClass}
          />
        </Field>
        <label className="mt-6 flex items-center gap-2 text-xs font-semibold">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => set("isActive", event.target.checked)}
          />
          Voucher aktif
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-xs text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? "Menyimpan..." : "Simpan Voucher"}
        </button>
        <button type="button" onClick={onCancel} className={buttonSecondary}>
          Batal
        </button>
      </div>
    </form>
  );
}

export function AdminCoupons() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const debouncedQuery = useDebouncedValue(query, 350);

  const { data, loading, error, reload } = useAsyncData(
    () =>
      adminApi.coupons
        .list({
          q: debouncedQuery || undefined,
          status: status || undefined,
          page,
          limit: 10,
        })
        .then((response) => response),
    [debouncedQuery, status, page],
  );

  const coupons = data?.data ?? [];
  const meta = data?.meta;

  async function removeCoupon(coupon) {
    if (!window.confirm(`Nonaktifkan voucher "${coupon.code}"?`)) return;
    try {
      await adminApi.coupons.remove(coupon.id);
      toastStore.show("Voucher dinonaktifkan.");
      reload();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal menonaktifkan voucher.", "error");
    }
  }

  return (
    <div className="space-y-5">
      {formOpen ? (
        <CouponForm
          key={editing?.id ?? "new"}
          coupon={editing}
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
        title="Voucher"
        description="Atur kode promo, kuota, dan masa berlaku."
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
              <Plus size={14} /> Voucher Baru
            </span>
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_200px]">
          <label className="relative block">
            <span className="sr-only">Cari voucher</span>
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
              placeholder="Cari kode atau deskripsi"
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
            <option value="">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="expired">Kedaluwarsa</option>
          </select>
        </div>

        {loading && !data ? (
          <div className="mt-4 h-40 animate-pulse rounded-control bg-surface-2" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : coupons.length === 0 ? (
          <EmptyState title="Belum ada voucher" />
        ) : (
          <>
            <div className="mt-4 overflow-x-auto rounded-control border border-border">
              <table className="w-full border-collapse">
                <thead className="bg-surface-2">
                  <tr>
                    <Th>Kode</Th>
                    <Th>Diskon</Th>
                    <Th>Min. Transaksi</Th>
                    <Th>Pemakaian</Th>
                    <Th>Berlaku</Th>
                    <Th>Status</Th>
                    <Th>Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => {
                    const expired = new Date(coupon.expiresAt) < new Date();
                    return (
                      <tr key={coupon.id} className="border-t border-border">
                        <Td className="font-mono font-bold">{coupon.code}</Td>
                        <Td>
                          {coupon.type === "PERCENT"
                            ? `${coupon.value}%`
                            : formatRupiah(coupon.value)}
                          {coupon.maxDiscount ? (
                            <p className="text-[10px] text-muted">
                              maks {formatRupiah(coupon.maxDiscount)}
                            </p>
                          ) : null}
                        </Td>
                        <Td>{formatRupiah(coupon.minSpend)}</Td>
                        <Td>
                          {coupon.usageCount}
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                        </Td>
                        <Td className="text-[11px]">
                          {formatDate(coupon.startsAt)} – {formatDate(coupon.expiresAt)}
                        </Td>
                        <Td>
                          {expired ? (
                            <StatusPill tone="danger">Kedaluwarsa</StatusPill>
                          ) : coupon.isActive ? (
                            <StatusPill tone="accent">Aktif</StatusPill>
                          ) : (
                            <StatusPill>Nonaktif</StatusPill>
                          )}
                        </Td>
                        <Td>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditing(coupon);
                                setFormOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                            >
                              <Pencil size={11} /> Edit
                            </button>
                            {coupon.isActive ? (
                              <button
                                type="button"
                                onClick={() => removeCoupon(coupon)}
                                className="text-[11px] font-semibold text-muted hover:text-danger"
                              >
                                Nonaktifkan
                              </button>
                            ) : null}
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
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
