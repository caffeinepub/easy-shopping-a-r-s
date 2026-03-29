import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "@tanstack/react-router";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  RotateCcw,
  ShoppingBag,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { resetAdminActor } from "../../hooks/useAdminActor";
import {
  useAdminCancelNotifications,
  useAdminReturnNotifications,
  useMarkCancelNotificationRead,
  useMarkReturnNotificationRead,
} from "../../hooks/useQueries";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { to: "/admin/payments", icon: CreditCard, label: "Payment Settings" },
];

function NotificationBell() {
  const { data: cancelNotifications = [] } = useAdminCancelNotifications();
  const { data: returnNotifications = [] } = useAdminReturnNotifications();
  const markCancelRead = useMarkCancelNotificationRead();
  const markReturnRead = useMarkReturnNotificationRead();
  const [open, setOpen] = useState(false);

  const unreadCancelCount = cancelNotifications.filter((n) => !n.isRead).length;
  const unreadReturnCount = returnNotifications.filter((n) => !n.isRead).length;
  const unreadCount = unreadCancelCount + unreadReturnCount;

  const handleMarkAllRead = () => {
    for (const n of cancelNotifications.filter((n) => !n.isRead)) {
      markCancelRead.mutate(n.id);
    }
    for (const n of returnNotifications.filter((n) => !n.isRead)) {
      markReturnRead.mutate(n.id);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-ocid="admin.notification.button"
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-sidebar-foreground" />
          {unreadCount > 0 && (
            <Badge
              data-ocid="admin.notification.toast"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-red-500 text-white text-xs rounded-full border-2 border-white"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        data-ocid="admin.notification.popover"
        className="w-80 p-0"
        align="end"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              data-ocid="admin.notification.secondary_button"
              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {cancelNotifications.length === 0 &&
          returnNotifications.length === 0 ? (
            <div
              data-ocid="admin.notification.empty_state"
              className="px-4 py-8 text-center text-sm text-muted-foreground"
            >
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-border">
              {returnNotifications.map((notif, idx) => {
                const date = new Date(Number(notif.createdAt) / 1_000_000);
                return (
                  <div
                    key={`return-${notif.id.toString()}`}
                    data-ocid={`admin.notification.return.${idx + 1}`}
                    className={`px-4 py-3 flex items-start justify-between gap-3 ${
                      notif.isRead ? "opacity-60" : "bg-orange-50/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                        <p className="text-sm font-medium text-foreground">
                          Return request: Order #{notif.orderId.toString()}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {notif.reason}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {date.toLocaleDateString("en-NP", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        type="button"
                        onClick={() => markReturnRead.mutate(notif.id)}
                        className="shrink-0 text-xs text-primary hover:underline mt-0.5"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                );
              })}
              {cancelNotifications.map((notif, idx) => {
                const date = new Date(Number(notif.createdAt) / 1_000_000);
                return (
                  <div
                    key={`cancel-${notif.id.toString()}`}
                    data-ocid={`admin.notification.item.${idx + 1}`}
                    className={`px-4 py-3 flex items-start justify-between gap-3 ${
                      notif.isRead ? "opacity-60" : "bg-red-50/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-sm font-medium text-foreground">
                          Order #{notif.orderId.toString()} cancelled
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {date.toLocaleDateString("en-NP", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        type="button"
                        data-ocid={`admin.notification.toggle.${idx + 1}`}
                        onClick={() => markCancelRead.mutate(notif.id)}
                        className="shrink-0 text-xs text-primary hover:underline mt-0.5"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

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
        <div className="bg-white border-b border-border p-4 flex items-center gap-4">
          <button
            type="button"
            data-ocid="admin.toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted md:hidden"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <span className="font-display font-bold md:block hidden">
            Admin Panel
          </span>
          <span className="font-display font-bold md:hidden">Admin Panel</span>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </div>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
