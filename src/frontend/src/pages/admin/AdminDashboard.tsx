import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  Clock,
  Package,
  ShoppingBag,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useInsights } from "../../hooks/useQueries";
import AdminLayout from "./AdminLayout";

const statCards = [
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: ShoppingBag,
    color: "text-blue-600 bg-blue-100",
  },
  {
    key: "pendingOrders",
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-100",
  },
  {
    key: "processingOrders",
    label: "Processing",
    icon: Package,
    color: "text-purple-600 bg-purple-100",
  },
  {
    key: "completedOrders",
    label: "Completed",
    icon: CheckCircle,
    color: "text-green-600 bg-green-100",
  },
  {
    key: "cancelledOrders",
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600 bg-red-100",
  },
] as const;

export default function AdminDashboard() {
  const { data: insights, isLoading } = useInsights();

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your store performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            const value = insights ? Number(insights[stat.key]) : 0;
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  data-ocid={`admin.${stat.key}.card`}
                  className="border-border shadow-card"
                >
                  <CardHeader className="pb-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div data-ocid="admin.insights.loading_state">
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold font-display">
                          {value}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {stat.label}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="/admin/products"
                data-ocid="admin.products.link"
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-secondary/50 transition-all"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Manage Products</div>
                  <div className="text-xs text-muted-foreground">
                    Add, edit, or delete products
                  </div>
                </div>
              </a>
              <a
                href="/admin/orders"
                data-ocid="admin.orders.link"
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-secondary/50 transition-all"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Manage Orders</div>
                  <div className="text-xs text-muted-foreground">
                    View and update order status
                  </div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
