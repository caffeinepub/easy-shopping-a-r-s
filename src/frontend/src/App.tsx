import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AdminLoginPage from "./pages/AdminLoginPage";
import CartPage from "./pages/CartPage";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminProducts from "./pages/admin/AdminProducts";

const ADMIN_USERNAME = "ARSadmin";
const ADMIN_PASSWORD = "ARS@12345";

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" />
    </>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const adminAuth = sessionStorage.getItem("adminAuth");

  if (!adminAuth) {
    window.location.href = "/admin-login";
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  try {
    const decoded = atob(adminAuth);
    const [u, p] = decoded.split(":");
    if (u !== ADMIN_USERNAME || p !== ADMIN_PASSWORD) {
      sessionStorage.removeItem("adminAuth");
      window.location.href = "/admin-login";
      return null;
    }
  } catch {
    sessionStorage.removeItem("adminAuth");
    window.location.href = "/admin-login";
    return null;
  }

  return <>{children}</>;
}

const rootRoute = createRootRoute({ component: RootComponent });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product/$id",
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-login",
  component: AdminLoginPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  ),
});

const adminProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/products",
  component: () => (
    <AdminGuard>
      <AdminProducts />
    </AdminGuard>
  ),
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/orders",
  component: () => (
    <AdminGuard>
      <AdminOrders />
    </AdminGuard>
  ),
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/payments",
  component: () => (
    <AdminGuard>
      <AdminPayments />
    </AdminGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  productRoute,
  cartRoute,
  ordersRoute,
  profileRoute,
  adminLoginRoute,
  adminRoute,
  adminProductsRoute,
  adminOrdersRoute,
  adminPaymentsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
