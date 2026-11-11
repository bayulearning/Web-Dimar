import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BellRing, CheckCheck } from "lucide-react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { EmptyState, ErrorState } from "../components/ui/States.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { notificationApi } from "../services/notification.js";
import { toastStore } from "../store/toastStore.js";
import { formatDate } from "../utils/format.js";

const typeLabels = {
  ORDER: "Pesanan",
  PROMO: "Promo",
  SYSTEM: "Sistem",
};

function NotificationItem({ notification, onRead, pending }) {
  const content = (
    <>
      <span
        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
          notification.isRead ? "bg-border" : "bg-accent"
        }`}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-sm font-bold">
            {notification.title}
          </span>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
            {typeLabels[notification.type] ?? notification.type}
          </span>
          {!notification.isRead ? (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
              Baru
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-xs text-muted">{notification.body}</span>
        <span className="mt-1.5 block text-[11px] text-muted">
          {formatDate(notification.createdAt, {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </span>
    </>
  );

  return (
    <li
      className={`rounded-card border p-4 ${
        notification.isRead
          ? "border-border bg-surface"
          : "border-accent/30 bg-accent/5"
      }`}
    >
      <div className="flex items-start gap-3">{content}</div>
      <div className="mt-3 flex flex-wrap items-center gap-3 pl-5 text-[11px] font-semibold">
        {notification.link ? (
          <Link to={notification.link} className="text-accent hover:underline">
            Lihat detail
          </Link>
        ) : null}
        {!notification.isRead ? (
          <button
            type="button"
            onClick={() => onRead(notification)}
            disabled={pending}
            className="text-muted hover:text-fg disabled:opacity-50"
          >
            Tandai dibaca
          </button>
        ) : null}
      </div>
    </li>
  );
}

export default function NotificationsPage() {
  useDocumentTitle("Notifikasi", {
    description: "Notifikasi pesanan dan promo Stride Athletics.",
    noindex: true,
  });
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const { data, loading, error, reload } = useAsyncData(
    () =>
      notificationApi
        .list({ unread: unreadOnly ? "true" : undefined, page, limit: 20 })
        .then((response) => response),
    [unreadOnly, page],
  );

  const notifications = data?.data ?? [];
  const meta = data?.meta;

  async function handleRead(notification) {
    setPendingId(notification.id);
    try {
      await notificationApi.markRead(notification.id);
      reload();
    } catch (requestError) {
      toastStore.show(
        requestError?.message || "Gagal menandai notifikasi.",
        "error",
      );
    } finally {
      setPendingId(null);
    }
  }

  async function handleReadAll() {
    setMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      toastStore.show("Semua notifikasi ditandai dibaca.");
      reload();
    } catch (requestError) {
      toastStore.show(
        requestError?.message || "Gagal menandai semua notifikasi.",
        "error",
      );
    } finally {
      setMarkingAll(false);
    }
  }

  function handleFilter(value) {
    setUnreadOnly(value);
    setPage(1);
  }

  return (
    <PageShell
      title="Notifikasi"
      description="Pembaruan status pesanan, promo, dan informasi dari Stride Athletics."
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-control border border-border p-1">
          <button
            type="button"
            onClick={() => handleFilter(false)}
            className={`rounded-control px-3 py-1.5 text-xs font-semibold ${
              unreadOnly ? "text-muted" : "bg-fg text-bg"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => handleFilter(true)}
            className={`rounded-control px-3 py-1.5 text-xs font-semibold ${
              unreadOnly ? "bg-fg text-bg" : "text-muted"
            }`}
          >
            Belum Dibaca
            {meta?.unreadCount ? (
              <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-black">
                {meta.unreadCount}
              </span>
            ) : null}
          </button>
        </div>

        <button
          type="button"
          onClick={handleReadAll}
          disabled={markingAll || !meta?.unreadCount}
          className="inline-flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs font-semibold hover:border-accent disabled:opacity-50"
        >
          <CheckCheck size={14} aria-hidden="true" />
          {markingAll ? "Memproses..." : "Tandai Semua Dibaca"}
        </button>
      </div>

      {loading && !data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((entry) => (
            <div
              key={entry}
              className="h-24 animate-pulse rounded-card bg-surface-2"
            />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={unreadOnly ? BellRing : Bell}
          title={unreadOnly ? "Tidak ada notifikasi baru" : "Belum ada notifikasi"}
          description={
            unreadOnly
              ? "Semua notifikasi sudah Anda baca."
              : "Pembaruan status pesanan dan promo akan muncul di sini."
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleRead}
                pending={pendingId === notification.id}
              />
            ))}
          </ul>

          {meta && meta.totalPages > 1 ? (
            <div className="mt-5 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={!meta.hasPrevPage}
                className="rounded-control border border-border px-3 py-2 font-semibold disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-muted">
                Halaman {meta.page} dari {meta.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((value) => value + 1)}
                disabled={!meta.hasNextPage}
                className="rounded-control border border-border px-3 py-2 font-semibold disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          ) : null}
        </>
      )}
    </PageShell>
  );
}
