import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout.jsx";
import { staticPages } from "./data/staticPages.js";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.jsx";
import { AdminRoute } from "./components/auth/AdminRoute.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const ShopPage = lazy(() => import("./pages/ShopPage.jsx"));
const CategoryPage = lazy(() => import("./pages/CategoryPage.jsx"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage.jsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));
const CartPage = lazy(() => import("./pages/CartPage.jsx"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage.jsx"));
const OrdersPage = lazy(() => import("./pages/OrdersPage.jsx"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage.jsx"));
const OrderStatusPage = lazy(() => import("./pages/OrderStatusPage.jsx"));
const HelpPage = lazy(() => import("./pages/HelpPage.jsx"));
const HelpArticlePage = lazy(() => import("./pages/HelpArticlePage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const NewsPage = lazy(() => import("./pages/NewsPage.jsx"));
const NewsDetailPage = lazy(() => import("./pages/NewsDetailPage.jsx"));
const SitemapPage = lazy(() => import("./pages/SitemapPage.jsx"));
const WishlistPage = lazy(() => import("./pages/WishlistPage.jsx"));
const AccountPage = lazy(() => import("./pages/AccountPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage.jsx"));
const AdminPage = lazy(() => import("./pages/AdminPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));
const StaticInfoPage = lazy(() =>
  import("./pages/StaticInfoPage.jsx").then((module) => ({
    default: module.StaticInfoPage,
  })),
);

const orderStatusPages = [
  { path: "sukses", status: "success" },
  { path: "pending", status: "pending" },
  { path: "gagal", status: "failed" },
];

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="belanja" element={<ShopPage />} />
        <Route path="kategori/:slug" element={<CategoryPage />} />
        <Route path="produk/:slug" element={<ProductDetailPage />} />
        <Route path="cari" element={<SearchPage />} />
        <Route path="keranjang" element={<CartPage />} />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="pesanan"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pesanan/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        {orderStatusPages.map(({ path, status }) => (
          <Route
            key={path}
            path={`pesanan/:orderId/${path}`}
            element={
              <ProtectedRoute>
                <OrderStatusPage status={status} />
              </ProtectedRoute>
            }
          />
        ))}

        <Route path="bantuan" element={<HelpPage />} />
        <Route path="bantuan/:slug" element={<HelpArticlePage />} />
        <Route path="kontak" element={<ContactPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:slug" element={<NewsDetailPage />} />
        <Route path="sitemap" element={<SitemapPage />} />

        <Route path="wishlist" element={<WishlistPage />} />
        <Route
          path="akun"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="daftar" element={<RegisterPage />} />
        <Route
          path="notifikasi"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        {staticPages.map(({ path, title, description, sections }) => (
          <Route
            key={path}
            path={path}
            element={
              <StaticInfoPage
                title={title}
                description={description}
                sections={sections}
              />
            }
          />
        ))}

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
