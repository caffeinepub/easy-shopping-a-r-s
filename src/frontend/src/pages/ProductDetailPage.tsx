import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddToCart, useProduct } from "../hooks/useQueries";

export default function ProductDetailPage() {
  const { id } = useParams({ from: "/product/$id" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const productId = BigInt(id);
  const { data: product, isLoading } = useProduct(productId);
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);

  const price = product ? Number(product.price) : 0;
  const discount = product ? Number(product.discountPercent) : 0;
  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
  const stockQty = product ? Number(product.stockQty) : 0;

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error("Please login to add items to cart");
      return;
    }
    if (!product) return;
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(qty),
      });
      toast.success(`${qty}x ${product.name} added to cart!`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div
            data-ocid="product.loading_state"
            className="grid md:grid-cols-2 gap-8"
          >
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            data-ocid="product.secondary_button"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shopping
          </button>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-card"
            >
              {product.imageId ? (
                <img
                  src={product.imageId}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/600x600/f97316/white?text=Product";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary to-accent/20 flex items-center justify-center">
                  <Package className="w-24 h-24 text-primary/30" />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-4"
            >
              <div>
                <Badge variant="outline" className="text-xs mb-2">
                  {product.category}
                </Badge>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  4.0 (24 reviews)
                </span>
              </div>

              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">
                    PKR {discountedPrice.toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        PKR {price.toLocaleString()}
                      </span>
                      <Badge className="bg-destructive text-destructive-foreground">
                        -{discount}%
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Inclusive of all taxes
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Stock:</span>
                <Badge
                  variant={stockQty > 0 ? "default" : "destructive"}
                  className={stockQty > 0 ? "bg-green-100 text-green-700" : ""}
                >
                  {stockQty > 0 ? `${stockQty} available` : "Out of Stock"}
                </Badge>
              </div>

              {stockQty > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center gap-2 border border-border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      data-ocid="product.secondary_button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-medium">{qty}</span>
                    <button
                      type="button"
                      data-ocid="product.secondary_button"
                      onClick={() => setQty((q) => Math.min(stockQty, q + 1))}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <Button
                data-ocid="product.primary_button"
                onClick={handleAddToCart}
                disabled={
                  addToCart.isPending || stockQty === 0 || !product.isActive
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {stockQty === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
