import { Navigate, useLocation } from "react-router-dom";
import { authStore } from "../../store/authStore.js";
import { useStore } from "../../store/useStore.js";

export function ProtectedRoute({ children }) {
  const auth = useStore(authStore);
  const location = useLocation();

  if (auth.status === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <div className="h-40 animate-pulse rounded-card bg-surface-2" />
      </div>
    );
  }

  if (!auth.user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return children;
}
