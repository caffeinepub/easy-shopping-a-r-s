import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyOrders } from "../hooks/useQueries";

const statusConfig: Record<
  string,
  {
    color: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }
> = {
  Pending: {
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
    label: "Pending",
  },
  Processing: {
    color: "bg-blue-100 text-blue-700",
    icon: Package,
    label: "Processing",
  },
  Shipped: {
    color: "bg-purple-100 text-purple-700",
    icon: Truck,
    label: "Shipped",
  },
  Delivered: {
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
    label: "Delivered",
  },
  Cancelled: {
    color: "bg-red-100 text-red-700",
    icon: XCircle,
    label: "Cancelled",
  },
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading } = useMyOrders();

  if (!identity) {
    navigate({ to: "/" });
    return null;
  }

  const sorted = [...(orders ?? [])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          data-ocid="orders.secondary_button"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shopping
        </button>

        <h1 className="font-display text-3xl font-bold text-foreground mb-8">
          My Orders
        </h1>

        {isLoading ? (
          <div data-ocid="orders.loading_state" className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div data-ocid="orders.empty_state" className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No orders yet</h3>
            <p className="text-muted-foreground mt-2">
              Place your first order to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((order, idx) => {
              const status = statusConfig[order.status] ?? statusConfig.Pending;
              const StatusIcon = status.icon;
              const date = new Date(Number(order.createdAt) / 1_000_000);
              return (
                <motion.div
                  key={order.id.toString()}
                  data-ocid={`orders.item.${idx + 1}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl p-6 shadow-card"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground">
                          Order #{order.id.toString()}
                        </h3>
                        <Badge
                          className={`${status.color} flex items-center gap-1 text-xs`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {date.toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary text-lg">
                        PKR {Number(order.totalAmount).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} item(s)
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item) => (
                        <span
                          key={item.productId.toString()}
                          className="text-xs bg-muted px-2 py-1 rounded-full"
                        >
                          {Number(item.quantity)}x Product #
                          {item.productId.toString()}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
