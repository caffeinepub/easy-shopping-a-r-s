import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  ImageIcon,
  Loader2,
  Minus,
  Plus,
  QrCode,
  ShoppingBag,
  Trash2,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useActiveProducts,
  useCart,
  usePaymentQRs,
  usePlaceOrder,
  useRemoveCartItem,
  useUpdateCartItem,
} from "../hooks/useQueries";

type PaymentMethod = "esewa" | "bank" | "cod" | null;

export default function CartPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cart, isLoading } = useCart();
  const { data: products } = useActiveProducts();
  const { data: paymentQRs } = usePaymentQRs();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const placeOrder = usePlaceOrder();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>("");
  const screenshotInputRef = useRef<HTMLInputElement>(null);

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

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPaymentScreenshot(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmOrder = async () => {
    if (!cart || cart.length === 0) return;
    try {
      const orderId = await placeOrder.mutateAsync({
        paymentMethod: selectedPayment ?? "cod",
        paymentScreenshotId: paymentScreenshot,
      });
      toast.success(`Order #${orderId} placed successfully!`);
      setQrModalOpen(false);
      setPaymentScreenshot("");
      navigate({ to: "/orders" });
    } catch {
      toast.error("Failed to place order");
    }
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setSelectedPayment(method);
    setPaymentScreenshot("");
  };

  const handleModalClose = (open: boolean) => {
    setQrModalOpen(open);
    if (!open) setPaymentScreenshot("");
  };

  const handleProceed = async () => {
    if (!selectedPayment) {
      toast.error("Please select a payment method");
      return;
    }
    if (selectedPayment === "cod") {
      await placeOrder.mutateAsync({
        paymentMethod: "cod",
        paymentScreenshotId: "",
      });
      toast.success("Order placed successfully!");
      navigate({ to: "/orders" });
    } else {
      setQrModalOpen(true);
    }
  };

  const activeQrImage =
    selectedPayment === "esewa"
      ? paymentQRs?.esewaQrImageId
      : selectedPayment === "bank"
        ? paymentQRs?.bankQrImageId
        : "";

  const paymentLabel =
    selectedPayment === "esewa"
      ? "eSewa"
      : selectedPayment === "bank"
        ? "Bank Transfer"
        : "";

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
            {/* Cart Items */}
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
                          NPR {(() => {
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

            {/* Order Summary + Payment */}
            <div>
              <div className="bg-white rounded-xl p-6 shadow-card sticky top-24 space-y-6">
                {/* Summary */}
                <div>
                  <h2 className="font-display text-xl font-bold mb-4">
                    Order Summary
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>NPR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-primary">
                        NPR {subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Method Selection */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">
                    Select Payment Method
                  </h3>
                  <div className="space-y-2">
                    {/* eSewa */}
                    <button
                      type="button"
                      data-ocid="cart.toggle"
                      onClick={() => handlePaymentSelect("esewa")}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        selectedPayment === "esewa"
                          ? "border-green-500 bg-green-50"
                          : "border-border hover:border-green-300 hover:bg-green-50/50"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-xs">eS</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-green-800">
                          eSewa
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Scan QR to pay
                        </div>
                      </div>
                      {selectedPayment === "esewa" && (
                        <div className="w-4 h-4 rounded-full bg-green-500 shrink-0" />
                      )}
                    </button>

                    {/* Bank Transfer */}
                    <button
                      type="button"
                      data-ocid="cart.toggle"
                      onClick={() => handlePaymentSelect("bank")}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        selectedPayment === "bank"
                          ? "border-blue-500 bg-blue-50"
                          : "border-border hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-blue-800">
                          Bank Transfer
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Scan QR to transfer
                        </div>
                      </div>
                      {selectedPayment === "bank" && (
                        <div className="w-4 h-4 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </button>

                    {/* Cash on Delivery */}
                    <button
                      type="button"
                      data-ocid="cart.toggle"
                      onClick={() => handlePaymentSelect("cod")}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        selectedPayment === "cod"
                          ? "border-orange-500 bg-orange-50"
                          : "border-border hover:border-orange-300 hover:bg-orange-50/50"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                        <Banknote className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-orange-800">
                          Cash on Delivery
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Pay when you receive
                        </div>
                      </div>
                      {selectedPayment === "cod" && (
                        <div className="w-4 h-4 rounded-full bg-orange-500 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  data-ocid="cart.submit_button"
                  onClick={handleProceed}
                  disabled={!selectedPayment || placeOrder.isPending}
                  className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
                >
                  {placeOrder.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : selectedPayment === "cod" ? (
                    "Place Order (COD)"
                  ) : selectedPayment ? (
                    "Proceed to Payment"
                  ) : (
                    "Select Payment Method"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Secure checkout guaranteed
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />

      {/* QR Payment Modal */}
      <Dialog open={qrModalOpen} onOpenChange={handleModalClose}>
        <DialogContent data-ocid="cart.dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              {paymentLabel} Payment
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            {activeQrImage ? (
              <>
                <div className="w-56 h-56 rounded-xl overflow-hidden border-2 border-border bg-white p-2">
                  <img
                    src={activeQrImage}
                    alt={`${paymentLabel} QR Code`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Scan the QR code and complete payment, then upload your
                  screenshot and click{" "}
                  <span className="font-semibold text-foreground">
                    Confirm Order
                  </span>
                </p>
                <div className="bg-muted rounded-lg px-4 py-2 text-center">
                  <span className="text-xs text-muted-foreground">
                    Total Amount
                  </span>
                  <div className="font-bold text-primary text-lg">
                    NPR {subtotal.toLocaleString()}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <QrCode className="w-16 h-16 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground text-center">
                  Payment QR not configured yet. Please contact the seller.
                </p>
              </div>
            )}

            {/* Screenshot Upload */}
            <div className="w-full">
              <p className="text-xs font-semibold mb-1">
                Upload Payment Screenshot
                <span className="font-normal text-muted-foreground ml-1">
                  (Optional but recommended)
                </span>
              </p>
              <input
                ref={screenshotInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotChange}
              />
              <button
                type="button"
                data-ocid="cart.upload_button"
                onClick={() => screenshotInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all"
              >
                {paymentScreenshot ? (
                  <>
                    <img
                      src={paymentScreenshot}
                      alt="Payment screenshot preview"
                      className="w-14 h-14 rounded-lg object-cover border border-border shrink-0"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-green-700">
                        Screenshot uploaded ✓
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click to change
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Tap to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG accepted
                      </p>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              data-ocid="cart.cancel_button"
              variant="outline"
              onClick={() => handleModalClose(false)}
            >
              Cancel
            </Button>
            {activeQrImage && (
              <Button
                data-ocid="cart.confirm_button"
                onClick={handleConfirmOrder}
                disabled={placeOrder.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {placeOrder.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing...
                  </>
                ) : (
                  "Confirm Order"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
