import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAllOrders, useUpdateOrderStatus } from "../../hooks/useQueries";
import AdminLayout from "./AdminLayout";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const statusConfig: Record<
  string,
  { color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  Processing: { color: "bg-blue-100 text-blue-700", icon: Package },
  Shipped: { color: "bg-purple-100 text-purple-700", icon: Truck },
  Delivered: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  Cancelled: { color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = (orders ?? [])
    .filter((o) => filterStatus === "All" || o.status === filterStatus)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  const handleStatusChange = async (orderId: bigint, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order status");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Orders
            </h1>
            <p className="text-muted-foreground mt-1">
              {(orders ?? []).length} total orders
            </p>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger data-ocid="admin.orders.select" className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Orders</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div data-ocid="admin.orders.loading_state" className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="admin.orders.empty_state"
            className="text-center py-20"
          >
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, idx) => {
              const cfg = statusConfig[order.status] ?? statusConfig.Pending;
              const StatusIcon = cfg.icon;
              const date = new Date(Number(order.createdAt) / 1_000_000);
              return (
                <motion.div
                  key={order.id.toString()}
                  data-ocid={`admin.orders.row.${idx + 1}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white rounded-xl p-6 shadow-card"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold">
                          Order #{order.id.toString()}
                        </h3>
                        <Badge
                          className={`${cfg.color} flex items-center gap-1 text-xs`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {date.toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        Buyer: {order.buyerId.toString().slice(0, 20)}...
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          PKR {Number(order.totalAmount).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.items.length} item(s)
                        </div>
                      </div>
                      <Select
                        value={order.status}
                        onValueChange={(v) => handleStatusChange(order.id, v)}
                      >
                        <SelectTrigger
                          data-ocid={`admin.orders.select.${idx + 1}`}
                          className="w-36 text-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
      </div>
    </AdminLayout>
  );
}
