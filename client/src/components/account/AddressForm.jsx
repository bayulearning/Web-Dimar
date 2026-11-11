import { useState } from "react";
import { addressApi } from "../../services/address.js";
import { toastStore } from "../../store/toastStore.js";

const emptyAddress = {
  label: "Rumah",
  recipientName: "",
  phone: "",
  province: "",
  city: "",
  district: "",
  postalCode: "",
  detail: "",
  isDefault: false,
};

const fields = [
  { key: "label", label: "Label", placeholder: "Rumah / Kantor" },
  { key: "recipientName", label: "Nama penerima" },
  { key: "phone", label: "Nomor telepon" },
  { key: "province", label: "Provinsi" },
  { key: "city", label: "Kota / Kabupaten" },
  { key: "district", label: "Kecamatan" },
  { key: "postalCode", label: "Kode pos" },
];

export function AddressForm({
  address,
  onSaved,
  onCancel,
  submitLabel = "Simpan Alamat",
}) {
  const [form, setForm] = useState(
    address ? { ...emptyAddress, ...address } : { ...emptyAddress },
  );
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      label: form.label,
      recipientName: form.recipientName,
      phone: form.phone,
      province: form.province,
      city: form.city,
      district: form.district,
      postalCode: form.postalCode,
      detail: form.detail,
      isDefault: Boolean(form.isDefault),
    };

    try {
      const response = address
        ? await addressApi.update(address.id, payload)
        : await addressApi.create(payload);
      toastStore.show("Alamat berhasil disimpan.");
      onSaved?.(response.data);
    } catch (requestError) {
      setError(requestError?.message || "Gagal menyimpan alamat.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-control border border-border bg-bg p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="text-xs text-muted">
            {field.label}
            <input
              required
              value={form[field.key] || ""}
              placeholder={field.placeholder}
              onChange={(event) => updateField(field.key, event.target.value)}
              className="mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-fg"
            />
          </label>
        ))}
      </div>

      <label className="mt-3 block text-xs text-muted">
        Alamat lengkap
        <textarea
          required
          rows="2"
          value={form.detail || ""}
          onChange={(event) => updateField("detail", event.target.value)}
          className="mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-fg"
        />
      </label>

      <label className="mt-3 flex items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={Boolean(form.isDefault)}
          onChange={(event) => updateField("isDefault", event.target.checked)}
        />
        Jadikan alamat utama
      </label>

      {error ? (
        <p role="alert" className="mt-3 text-xs text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-control bg-accent px-4 py-2 text-xs font-bold text-black disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-control border border-border px-4 py-2 text-xs font-semibold"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
