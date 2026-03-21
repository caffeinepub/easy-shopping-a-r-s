import { useNavigate } from "@tanstack/react-router";
import { Link, useLocation } from "@tanstack/react-router";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  X,
} from "lucide-react";
import { useState } from "react";
import { resetAdminActor } from "../../hooks/useAdminActor";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { to: "/admin/payments", icon: CreditCard, label: "Payment Settings" },
];

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    resetAdminActor();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex bg-muted">
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Enter" && setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar z-50 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <div className="font-display font-bold text-lg text-sidebar-foreground">
            Easy Shopping
          </div>
          <div className="text-xs text-primary">A.R.S - Admin Panel</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                data-ocid="admin.nav.link"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            type="button"
            data-ocid="admin.logout.button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-border p-4 flex items-center gap-4 md:hidden">
          <button
            type="button"
            data-ocid="admin.toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <span className="font-display font-bold">Admin Panel</span>
        </div>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
