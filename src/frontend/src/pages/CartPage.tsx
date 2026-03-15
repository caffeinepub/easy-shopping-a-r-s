import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useActiveProducts,
  useCart,
  usePlaceOrder,
  useRemoveCartItem,
  useUpdateCartItem,
} from "../hooks/useQueries";

export default function CartPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cart, isLoading } = useCart();
  const { data: products } = useActiveProducts();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const placeOrder = usePlaceOrder();

  if (!identity) {
    navigate({ to: "/" });
    return null;
  }

  const getProduct = (id: bigint) => products?.find((p) => p.id === id);

  const cartWithProducts =
    cart?.map((item) => ({
      item,
      product: getProduct(item.productId),
    })) ?? [];

  const subtotal = cartWithProducts.reduce((sum, { item, product }) => {
    if (!product) return sum;
    const price = Number(product.price);
    const discount = Number(product.discountPercent);
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
    return sum + finalPrice * Number(item.quantity);
  }, 0);

  const handleUpdateQty = async (
    productId: bigint,
    delta: number,
    currentQty: number,
  ) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await updateItem.mutateAsync({ productId, newQuantity: BigInt(newQty) });
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (productId: bigint) => {
    try {
      await removeItem.mutateAsync(productId);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.length === 0) return;
    try {
      const orderId = await placeOrder.mutateAsync();
      toast.success(`Order #${orderId} placed successfully!`);
      navigate({ to: "/orders" });
    } catch {
      toast.error("Failed to place order");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          data-ocid="cart.secondary_button"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>

        <h1 className="font-display text-3xl font-bold text-foreground mb-8">
          Shopping Cart
          {cart && cart.length > 0 && (
            <span className="text-base font-normal text-muted-foreground ml-2">
              ({cart.length} items)
            </span>
          )}
        </h1>

        {isLoading ? (
          <div data-ocid="cart.loading_state" className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : cartWithProducts.length === 0 ? (
          <div data-ocid="cart.empty_state" className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground mt-2">
              Add some products to get started
            </p>
            <Button
              onClick={() => navigate({ to: "/" })}
              className="mt-6 bg-primary hover:bg-primary/90"
              data-ocid="cart.primary_button"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartWithProducts.map(({ item, product }, idx) => (
                  <motion.div
                    key={item.productId.toString()}
                    data-ocid={`cart.item.${idx + 1}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-xl p-4 shadow-card flex gap-4"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      {product?.imageId ? (
                        <img
                          src={product.imageId}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-primary/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2">
                        {product?.name ?? "Unknown Product"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {product?.category}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 border border-border rounded-lg overflow-hidden">
                          <button
                            type="button"
                            data-ocid={`cart.secondary_button.${idx + 1}`}
                            onClick={() =>
                              handleUpdateQty(
                                item.productId,
                                -1,
                                Number(item.quantity),
                              )
                            }
                            className="p-1 hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm font-medium">
                            {Number(item.quantity)}
                          </span>
                          <button
                            type="button"
                            data-ocid={`cart.secondary_button.${idx + 1}`}
                            onClick={() =>
                              handleUpdateQty(
                                item.productId,
                                1,
                                Number(item.quantity),
                              )
                            }
                            className="p-1 hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-primary text-sm">
                          PKR {(() => {
                            const p = Number(product?.price ?? 0);
                            const d = Number(product?.discountPercent ?? 0);
                            const fp = d > 0 ? p * (1 - d / 100) : p;
                            return (
                              fp * Number(item.quantity)
                            ).toLocaleString();
                          })()}
                        </span>

                        <button
                          type="button"
                          data-ocid={`cart.delete_button.${idx + 1}`}
                          onClick={() => handleRemove(item.productId)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div>
              <div className="bg-white rounded-xl p-6 shadow-card sticky top-24">
                <h2 className="font-display text-xl font-bold mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>PKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">
                      PKR {subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button
                  data-ocid="cart.submit_button"
                  onClick={handlePlaceOrder}
                  disabled={placeOrder.isPending}
                  className="w-full mt-6 bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
                >
                  {placeOrder.isPending ? "Placing Order..." : "Place Order"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Secure checkout guaranteed
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
