import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Banknote,
  CheckCircle,
  Clock,
  CreditCard,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCancelOrder, useMyOrders } from "../hooks/useQueries";

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
  Confirmed: {
    color: "bg-blue-100 text-blue-700",
    icon: CheckCircle,
    label: "Confirmed - Processing",
  },
  Processing: {
    color: "bg-indigo-100 text-indigo-700",
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

const paymentMethodLabels: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  esewa: { label: "Paid via eSewa", icon: ShoppingBag },
  bank: { label: "Paid via Bank Transfer", icon: CreditCard },
  cod: { label: "Cash on Delivery", icon: Banknote },
};

const cancellableStatuses = new Set(["Pending", "Confirmed"]);

export default function OrdersPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading } = useMyOrders();
  const cancelOrder = useCancelOrder();

  if (!identity) {
    navigate({ to: "/" });
    return null;
  }

  const sorted = [...(orders ?? [])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const handleCancel = async (orderId: bigint) => {
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success("Order cancelled successfully");
    } catch {
      toast.error("Failed to cancel order");
    }
  };

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
              const deliveryDate = new Date(
                Number(order.createdAt) / 1_000_000,
              );
              deliveryDate.setDate(deliveryDate.getDate() + 5);
              const deliveryDateStr = deliveryDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              const canCancel = cancellableStatuses.has(order.status);
              const paymentMethod =
                ((order as any).paymentMethod as string) ?? "";
              const pmInfo = paymentMethodLabels[paymentMethod];
              const PaymentMethodIcon = pmInfo?.icon;
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
                      <div className="flex items-center gap-2 flex-wrap">
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
                      {pmInfo && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                          <PaymentMethodIcon className="w-3.5 h-3.5" />
                          <span>{pmInfo.label}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-primary text-lg">
                          Rs. {Number(order.totalAmount).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} item(s)
                        </p>
                      </div>
                      {canCancel && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              data-ocid={`orders.delete_button.${idx + 1}`}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel Order
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent data-ocid="orders.dialog">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Cancel Order #{order.id.toString()}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel Order #
                                {order.id.toString()}? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="orders.cancel_button">
                                Keep Order
                              </AlertDialogCancel>
                              <AlertDialogAction
                                data-ocid="orders.confirm_button"
                                onClick={() => handleCancel(order.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Yes, Cancel Order
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  {/* Payment Confirmed Message */}
                  {order.status === "Confirmed" && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-4 py-2.5">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>
                        Your payment has been confirmed! Your order is now being
                        processed.
                      </span>
                    </div>
                  )}

                  {/* Delivery Estimate */}
                  {order.status !== "Cancelled" &&
                    order.status !== "Delivered" && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-2.5">
                        <Truck className="w-4 h-4 shrink-0" />
                        <span>Estimated delivery: {deliveryDateStr}</span>
                      </div>
                    )}

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
