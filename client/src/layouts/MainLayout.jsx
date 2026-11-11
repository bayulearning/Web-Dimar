import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/layout/Header.jsx";
import { Footer } from "../components/layout/Footer.jsx";
import { BottomNav } from "../components/layout/BottomNav.jsx";
import { ScrollToTop } from "../components/common/ScrollToTop.jsx";
import { Toaster } from "../components/ui/Toaster.jsx";

export function MainLayout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>
      <ScrollToTop />
      <Header />
      <main id="main-content" className="flex-1 pb-16 lg:pb-0">
        <Suspense
          fallback={
            <div className="mx-auto w-full max-w-7xl px-4 py-12">
              <div className="h-64 animate-pulse rounded-card bg-surface-2" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      {isAdmin ? null : <Footer />}
      <BottomNav />
      <Toaster />
    </>
  );
}
