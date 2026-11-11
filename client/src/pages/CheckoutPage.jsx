import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  MapPin,
  Tag,
  Truck,
} from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { AddressForm } from "../components/account/AddressForm.jsx";
import { EmptyState, ErrorState } from "../components/ui/States.jsx";
import { addressApi } from "../services/address.js";
import { orderApi } from "../services/order.js";
import { paymentApi } from "../services/payment.js";
import { shippingApi } from "../services/shipping.js";
import { cartStore } from "../store/cartStore.js";
import { toastStore } from "../store/toastStore.js";
import { formatRupiah } from "../utils/format.js";
import { loadSnapScript } from "../utils/snap.js";

const steps = [
  { id: 1, label: "Checkout" },
  { id: 2, label: "Pengiriman" },
  { id: 3, label: "Pembayaran" },
];

function parseShippingKey(key) {
  const [provider, service] = key.split(":");
  return { provider, service };
}

export default function CheckoutPage() {
  useDocumentTitle("Checkout", {
    description: "Selesaikan alamat, pengiriman, dan pembayaran pesanan.",
    noindex: true,
  });
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [shippingKey, setShippingKey] = useState("JNE:REG");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState(null);
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    data: addressesData,
    loading: addressesLoading,
    error: addressesError,
    reload: reloadAddresses,
  } = useAsyncData(
    () => addressApi.list().then((response) => response.data),
    [],
  );
  const addresses = useMemo(() => addressesData ?? [], [addressesData]);

  const {
    data: servicesData,
    loading: servicesLoading,
    error: servicesError,
  } = useAsyncData(
    () => shippingApi.services().then((response) => response.data),
    [],
  );
  const services = useMemo(() => servicesData ?? [], [servicesData]);

  const selectedAddress = useMemo(() => {
    if (!addresses.length) return null;
    if (selectedAddressId) {
      return (
        addresses.find((address) => address.id === selectedAddressId) ?? null
      );
    }
    return (
      addresses.find((address) => address.isDefault) ??
      addresses[0] ??
      null
    );
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    let active = true;
    const { provider, service } = parseShippingKey(shippingKey);

    Promise.resolve()
      .then(() => {
        if (active) setPreviewLoading(true);
        return orderApi.preview({
          shippingProvider: provider,
          shippingService: service,
          couponCode: appliedCoupon || undefined,
        });
      })
      .then((response) => {
        if (!active) return;
        setPreview(response.data);
        setPreviewError(null);
      })
      .catch((error) => {
        if (!active) return;
        setPreview(null);
        setPreviewError(error);
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });

    return () => {
      active = false;
    };
  }, [shippingKey, appliedCoupon]);

  const selectedService = useMemo(
    () => services.find((entry) => `${entry.provider}:${entry.service}` === shippingKey),
    [services, shippingKey],
  );

  async function handleApplyCoupon(event) {
    event.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setAppliedCoupon("");
      return;
    }

    const { provider, service } = parseShippingKey(shippingKey);
    try {
      const response = await orderApi.preview({
        shippingProvider: provider,
        shippingService: service,
        couponCode: code,
      });
      setAppliedCoupon(code);
      setPreview(response.data);
      toastStore.show(`Voucher ${code} diterapkan.`);
    } catch (error) {
      setCouponError(error?.message || "Voucher tidak valid.");
    }
  }

  function removeCoupon() {
    setAppliedCoupon("");
    setCouponInput("");
    setCouponError(null);
  }

  async function handleCreateOrder() {
    if (!selectedAddress) {
      toastStore.show("Pilih alamat pengiriman terlebih dahulu.", "error");
      setStep(1);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const { provider, service } = parseShippingKey(shippingKey);

    try {
      const response = await orderApi.create({
        addressId: selectedAddress.id,
        shippingProvider: provider,
        shippingService: service,
        couponCode: appliedCoupon || undefined,
        notes: notes || undefined,
      });
      const order = response.data;
      await cartStore.refresh().catch(() => null);

      try {
        const snap = await paymentApi.createSnapToken(order.orderNumber);
        const payment = snap.data;

        if (payment.mode === "midtrans") {
          const snapInstance = await loadSnapScript(
            payment.config?.snapScriptUrl,
            payment.config?.clientKey,
          );
          snapInstance.pay(payment.token, {
            onSuccess: () =>
              navigate(`/pesanan/${order.orderNumber}/sukses`, {
                replace: true,
              }),
            onPending: () =>
              navigate(`/pesanan/${order.orderNumber}/pending`, {
                replace: true,
              }),
            onError: () =>
              navigate(`/pesanan/${order.orderNumber}/gagal`, {
                replace: true,
              }),
            onClose: () =>
              navigate(`/pesanan/${order.orderNumber}/pending`, {
                replace: true,
              }),
          });
          return;
        }

        navigate(`/pesanan/${order.orderNumber}/pending`, { replace: true });
      } catch (paymentError) {
        toastStore.show(
          paymentError?.message ||
            "Pesanan dibuat, tetapi token pembayaran gagal dibuat.",
          "error",
        );
        navigate(`/pesanan/${order.orderNumber}/pending`, { replace: true });
      }
    } catch (error) {
      setSubmitError(error?.message || "Gagal membuat pesanan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (previewError?.status === 400) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <EmptyState
          title="Keranjang masih kosong"
          description="Tambahkan produk ke keranjang sebelum melanjutkan checkout."
          action={
            <Link
              to="/belanja"
              className="rounded-control bg-accent px-5 py-2.5 text-sm font-bold text-black"
            >
              Mulai Belanja
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <header>
        <p className="label-caps text-accent">Checkout</p>
        <h1 className="mt-2 font-heading text-2xl font-bold uppercase md:text-4xl">
          Selesaikan Pesanan
        </h1>
        <ol className="mt-5 flex flex-wrap gap-2 text-xs">
          {steps.map((entry) => {
            const active = step === entry.id;
            const done = step > entry.id;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => setStep(entry.id)}
                  className={`flex items-center gap-2 rounded-control border px-3 py-2 font-semibold ${
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : done
                        ? "border-accent/40 text-fg"
                        : "border-border text-muted"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">
                    {done ? <Check size={12} /> : entry.id}
                  </span>
                  {entry.label}
                </button>
              </li>
            );
          })}
        </ol>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <section className="space-y-5">
          {step === 1 ? (
            <div className="rounded-card border border-border bg-surface p-5">
              <h2 className="flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wide">
                <MapPin size={17} className="text-accent" aria-hidden="true" />
                Alamat Pengiriman
              </h2>

              {addressesLoading ? (
                <div className="mt-4 h-28 animate-pulse rounded-control bg-surface-2" />
              ) : addressesError ? (
                <div className="mt-4">
                  <ErrorState error={addressesError} onRetry={reloadAddresses} />
                </div>
              ) : addresses.length ? (
                <ul className="mt-4 space-y-3">
                  {addresses.map((address) => {
                    const active = selectedAddress?.id === address.id;
                    return (
                      <li key={address.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedAddressId(address.id)}
                          className={`w-full rounded-control border p-4 text-left ${
                            active
                              ? "border-accent bg-accent/5"
                              : "border-border bg-bg hover:border-accent/50"
                          }`}
                        >
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold">
                              {address.label}
                            </span>
                            {address.isDefault ? (
                              <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-bold text-black">
                                Utama
                              </span>
                            ) : null}
                            {active ? (
                              <Check
                                size={14}
                                className="ml-auto text-accent"
                                aria-hidden="true"
                              />
                            ) : null}
                          </span>
                          <span className="mt-1 block text-xs text-muted">
                            {address.recipientName} · {address.phone}
                          </span>
                          <span className="mt-1 block text-xs text-muted">
                            {address.detail}, {address.district}, {address.city},{" "}
                            {address.province} {address.postalCode}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  Belum ada alamat tersimpan. Tambahkan alamat pengiriman.
                </p>
              )}

              {addressFormOpen ? (
                <AddressForm
                  submitLabel="Simpan & Gunakan"
                  onCancel={() => setAddressFormOpen(false)}
                  onSaved={(saved) => {
                    setAddressFormOpen(false);
                    setSelectedAddressId(saved?.id ?? null);
                    reloadAddresses();
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setAddressFormOpen(true)}
                  className="mt-4 rounded-control border border-border px-4 py-2 text-xs font-semibold hover:border-accent"
                >
                  + Tambah alamat baru
                </button>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedAddress}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-control bg-accent px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"
                >
                  Lanjut ke Pengiriman
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="rounded-card border border-border bg-surface p-5">
              <h2 className="flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wide">
                <Truck size={17} className="text-accent" aria-hidden="true" />
                Metode Pengiriman
              </h2>
              <p className="mt-2 rounded-control border border-warning/40 bg-warning/10 px-3 py-2 text-[11px] text-warning">
                Tarif dan estimasi di bawah adalah mock development, bukan tarif
                kurir aktual.
              </p>

              {servicesLoading ? (
                <div className="mt-4 h-32 animate-pulse rounded-control bg-surface-2" />
              ) : servicesError ? (
                <div className="mt-4">
                  <ErrorState error={servicesError} />
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {services.map((service) => {
                    const key = `${service.provider}:${service.service}`;
                    const active = shippingKey === key;
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => setShippingKey(key)}
                          className={`flex w-full items-center justify-between gap-3 rounded-control border p-4 text-left ${
                            active
                              ? "border-accent bg-accent/5"
                              : "border-border bg-bg hover:border-accent/50"
                          }`}
                        >
                          <span>
                            <span className="block text-sm font-bold">
                              {service.provider} {service.service}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted">
                              {service.description} · estimasi {service.etaMinDays}
                              -
                              {service.etaMaxDays} hari
                            </span>
                          </span>
                          <span className="text-sm font-semibold">
                            {formatRupiah(service.cost)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-5 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 rounded-control border border-border px-4 py-2.5 text-sm font-semibold"
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 rounded-control bg-accent px-5 py-2.5 text-sm font-bold text-black"
                >
                  Lanjut ke Pembayaran
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="rounded-card border border-border bg-surface p-5">
              <h2 className="flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wide">
                <CreditCard
                  size={17}
                  className="text-accent"
                  aria-hidden="true"
                />
                Ringkasan & Pembayaran
              </h2>

              <div className="mt-4 rounded-control border border-border bg-bg p-4 text-xs text-muted">
                <p className="font-semibold text-fg">
                  {selectedAddress?.recipientName}
                </p>
                <p className="mt-1">
                  {selectedAddress?.detail}, {selectedAddress?.district},{" "}
                  {selectedAddress?.city}, {selectedAddress?.province}{" "}
                  {selectedAddress?.postalCode}
                </p>
                <p className="mt-1">{selectedAddress?.phone}</p>
                <p className="mt-2 text-fg">
                  {selectedService
                    ? `${selectedService.provider} ${selectedService.service} · ${formatRupiah(selectedService.cost)}`
                    : shippingKey.replace(":", " ")}
                </p>
              </div>

              <label className="mt-4 block text-xs text-muted">
                Catatan pesanan (opsional)
                <textarea
                  rows="2"
                  maxLength="240"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-1 w-full rounded-control border border-border bg-bg px-3 py-2 text-sm text-fg"
                />
              </label>

              {previewError && previewError.status !== 400 ? (
                <p
                  role="alert"
                  className="mt-4 rounded-control border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger"
                >
                  {previewError.message}
                </p>
              ) : null}

              {submitError ? (
                <p
                  role="alert"
                  className="mt-4 rounded-control border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger"
                >
                  {submitError}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-control border border-border px-4 py-2.5 text-sm font-semibold"
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleCreateOrder}
                  disabled={submitting || previewLoading || !preview}
                  className="inline-flex items-center gap-2 rounded-control bg-accent px-6 py-3 text-sm font-bold text-black disabled:opacity-50"
                >
                  {submitting ? "Memproses..." : "Bayar Sekarang"}
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <aside aria-label="Ringkasan checkout">
          <div className="sticky top-24 space-y-4 rounded-card border border-border bg-surface p-5">
            <h2 className="font-heading text-base font-bold uppercase tracking-wide">
              Ringkasan Pesanan
            </h2>

            {previewLoading && !preview ? (
              <div className="h-32 animate-pulse rounded-control bg-surface-2" />
            ) : preview ? (
              <>
                <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
                  {preview.items.map((item) => (
                    <li
                      key={item.variantId}
                      className="flex gap-3 text-xs text-muted"
                    >
                      {item.image ? (
                        <img
                          src={item.image.url}
                          alt=""
                          className="h-14 w-14 rounded object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="h-14 w-14 rounded bg-surface-2" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-fg">
                          {item.productName}
                        </span>
                        <span className="mt-0.5 block">
                          {item.size} · {item.color} · {item.quantity}x
                        </span>
                      </span>
                      <span className="font-semibold text-fg">
                        {formatRupiah(item.unitPrice * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <form onSubmit={handleApplyCoupon} className="border-t border-border pt-3">
                  <label htmlFor="coupon" className="label-caps text-muted">
                    Voucher
                  </label>
                  {appliedCoupon ? (
                    <div className="mt-2 flex items-center justify-between rounded-control border border-accent/40 bg-accent/5 px-3 py-2 text-xs">
                      <span className="inline-flex items-center gap-1 font-semibold text-accent">
                        <Tag size={13} aria-hidden="true" />
                        {appliedCoupon}
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-muted hover:text-danger"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <input
                        id="coupon"
                        value={couponInput}
                        onChange={(event) => setCouponInput(event.target.value)}
                        placeholder="STRIDE10"
                        className="w-full rounded-control border border-border bg-bg px-3 py-2 text-sm uppercase"
                      />
                      <button
                        type="submit"
                        className="rounded-control border border-border px-3 py-2 text-xs font-semibold hover:border-accent"
                      >
                        Pakai
                      </button>
                    </div>
                  )}
                  {couponError ? (
                    <p role="alert" className="mt-2 text-[11px] text-danger">
                      {couponError}
                    </p>
                  ) : null}
                </form>

                <dl className="space-y-2 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">
                      Subtotal ({preview.itemCount} item)
                    </dt>
                    <dd className="font-semibold">
                      {formatRupiah(preview.subtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Diskon</dt>
                    <dd className="font-semibold text-accent">
                      {preview.discountTotal > 0
                        ? `-${formatRupiah(preview.discountTotal)}`
                        : formatRupiah(0)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Ongkir</dt>
                    <dd className="font-semibold">
                      {formatRupiah(preview.shippingCost)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-border pt-2 text-base">
                    <dt className="font-bold">Total</dt>
                    <dd className="font-heading font-bold text-accent">
                      {formatRupiah(preview.total)}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="text-sm text-muted">
                Ringkasan belum tersedia. Periksa keranjang dan metode
                pengiriman.
              </p>
            )}

            <p className="flex items-start gap-2 text-[11px] text-muted">
              <AlertTriangle
                size={14}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              Harga, stok, voucher, dan ongkir dihitung ulang oleh backend saat
              pesanan dibuat.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
