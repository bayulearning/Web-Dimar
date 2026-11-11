import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { addressApi } from "../services/address.js";
import { AddressForm } from "../components/account/AddressForm.jsx";
import { authStore } from "../store/authStore.js";
import { useStore } from "../store/useStore.js";
import { toastStore } from "../store/toastStore.js";

export default function AccountPage() {
  useDocumentTitle("Akun Saya", {
    description: "Kelola profil, alamat, dan pengaturan akun Stride Athletics.",
    noindex: true,
  });
  const navigate = useNavigate();
  const auth = useStore(authStore);
  const user = auth.user;

  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [profileError, setProfileError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const {
    data: addresses = [],
    loading: addressesLoading,
    error: addressesError,
    reload: reloadAddresses,
  } = useAsyncData(() => addressApi.list().then((response) => response.data), [
    user?.id,
  ]);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    try {
      await authStore.updateProfile({
        name: profile.name,
        phone: profile.phone,
      });
      toastStore.show("Profil berhasil diperbarui.");
    } catch (requestError) {
      setProfileError(requestError?.message || "Gagal memperbarui profil.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleDeleteAddress(address) {
    if (!window.confirm(`Hapus alamat "${address.label}"?`)) return;
    try {
      await addressApi.remove(address.id);
      toastStore.show("Alamat dihapus.");
      reloadAddresses();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal menghapus alamat.", "error");
    }
  }

  async function handleSetDefault(address) {
    try {
      await addressApi.update(address.id, { isDefault: true });
      toastStore.show("Alamat utama diperbarui.");
      reloadAddresses();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal memperbarui alamat.", "error");
    }
  }

  async function handleLogout() {
    await authStore.logout();
    toastStore.show("Anda telah keluar.");
    navigate("/", { replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-caps text-accent">Akun Saya</p>
          <h1 className="mt-2 font-heading text-2xl font-bold uppercase md:text-4xl">
            Halo, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Kelola profil, alamat pengiriman, dan pesanan Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-control border border-border px-4 py-2 text-xs font-semibold text-muted hover:border-danger hover:text-danger"
        >
          <LogOut size={14} aria-hidden="true" />
          Keluar
        </button>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <section className="rounded-card border border-border bg-surface p-5">
            <h2 className="flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wide">
              <User size={17} className="text-accent" aria-hidden="true" />
              Profil
            </h2>

            <form onSubmit={handleProfileSubmit} className="mt-4 space-y-3">
              <label className="block text-xs text-muted">
                Nama lengkap
                <input
                  required
                  minLength="2"
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm text-fg"
                />
              </label>

              <label className="block text-xs text-muted">
                Email
                <input
                  readOnly
                  value={user.email}
                  className="mt-1 w-full rounded-control border border-border bg-bg/50 px-3 py-2.5 text-sm text-muted"
                />
              </label>

              <label className="block text-xs text-muted">
                Nomor telepon
                <input
                  value={profile.phone || ""}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm text-fg"
                />
              </label>

              {profileError ? (
                <p role="alert" className="text-xs text-danger">
                  {profileError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-control bg-fg px-4 py-2 text-xs font-bold text-bg disabled:opacity-60"
              >
                {savingProfile ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </form>
          </section>

          <section className="rounded-card border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wide">
                <MapPin size={17} className="text-accent" aria-hidden="true" />
                Alamat
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setFormOpen(true);
                }}
                className="inline-flex items-center gap-1 rounded-control border border-border px-3 py-2 text-xs font-semibold hover:border-accent"
              >
                <Plus size={14} aria-hidden="true" />
                Tambah Alamat
              </button>
            </div>

            {formOpen ? (
              <AddressForm
                key={editingAddress?.id ?? "new"}
                address={editingAddress}
                onCancel={() => {
                  setFormOpen(false);
                  setEditingAddress(null);
                }}
                onSaved={() => {
                  setFormOpen(false);
                  setEditingAddress(null);
                  reloadAddresses();
                }}
              />
            ) : null}

            {addressesLoading ? (
              <div className="mt-4 h-24 animate-pulse rounded-control bg-surface-2" />
            ) : addressesError ? (
              <p className="mt-4 text-sm text-danger">
                Gagal memuat alamat: {addressesError.message}
              </p>
            ) : addresses.length ? (
              <ul className="mt-4 space-y-3">
                {addresses.map((address) => (
                  <li
                    key={address.id}
                    className="rounded-control border border-border bg-bg p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold">{address.label}</p>
                      {address.isDefault ? (
                        <span className="inline-flex items-center gap-1 rounded bg-accent px-2 py-0.5 text-[10px] font-bold text-black">
                          <CheckCircle2 size={11} aria-hidden="true" />
                          Utama
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {address.recipientName} · {address.phone}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {address.detail}, {address.district}, {address.city},{" "}
                      {address.province} {address.postalCode}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddress(address);
                          setFormOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-accent hover:underline"
                      >
                        <Pencil size={12} aria-hidden="true" />
                        Edit
                      </button>
                      {!address.isDefault ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(address)}
                          className="text-muted hover:text-fg"
                        >
                          Jadikan Utama
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(address)}
                        className="inline-flex items-center gap-1 text-muted hover:text-danger"
                      >
                        <Trash2 size={12} aria-hidden="true" />
                        Hapus
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">
                Belum ada alamat tersimpan. Tambahkan alamat pengiriman pertama
                Anda.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide">
              Pesanan
            </h2>
            <p className="mt-2 text-xs text-muted">
              Lihat riwayat dan status pesanan Anda.
            </p>
            <div className="mt-4 space-y-2">
              <Link
                to="/pesanan"
                className="flex items-center gap-2 rounded-control border border-border px-3 py-2.5 text-xs font-semibold hover:border-accent"
              >
                <Package size={14} className="text-accent" aria-hidden="true" />
                Riwayat Pesanan
              </Link>
              <Link
                to="/notifikasi"
                className="flex items-center gap-2 rounded-control border border-border px-3 py-2.5 text-xs font-semibold hover:border-accent"
              >
                Notifikasi
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-2 rounded-control border border-border px-3 py-2.5 text-xs font-semibold hover:border-accent"
              >
                Wishlist
              </Link>
            </div>
          </div>

          {user.role === "ADMIN" ? (
            <div className="rounded-card border border-accent/40 bg-accent/5 p-5">
              <h2 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wide">
                <ShieldCheck size={15} className="text-accent" aria-hidden="true" />
                Admin
              </h2>
              <p className="mt-2 text-xs text-muted">
                Kelola produk, pesanan, pengiriman, konten, dan voucher.
              </p>
              <Link
                to="/admin"
                className="mt-3 inline-block rounded-control bg-accent px-4 py-2 text-xs font-bold text-black"
              >
                Buka Dashboard Admin
              </Link>
            </div>
          ) : null}

          <div className="rounded-card border border-border bg-surface p-5 text-xs text-muted">
            <p className="font-heading text-sm font-bold uppercase tracking-wide text-fg">
              Butuh bantuan?
            </p>
            <p className="mt-2">
              Hubungi tim Stride melalui pusat bantuan untuk pertanyaan pesanan
              atau pengembalian.
            </p>
            <Link
              to="/bantuan"
              className="mt-3 inline-block text-accent hover:underline"
            >
              Buka Pusat Bantuan
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
