import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  EyeOff,
  Package,
  Pencil,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useImageUpload } from "../../hooks/useImageUpload";
import {
  type Product,
  useActiveProducts,
  useCreateProduct,
  useToggleProductActive,
  useUpdateProduct,
} from "../../hooks/useQueries";
import AdminLayout from "./AdminLayout";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  discountPercent: string;
  category: string;
  imageId: string;
  stockQty: string;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  discountPercent: "0",
  category: "",
  imageId: "",
  stockQty: "",
};

export default function AdminProducts() {
  const { data: products, isLoading } = useActiveProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const toggleActive = useToggleProductActive();
  const { uploadImage, uploading, progress } = useImageUpload();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = (products ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setImagePreview("");
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: Number(product.price).toString(),
      discountPercent: Number(product.discountPercent).toString(),
      category: product.category,
      imageId: product.imageId,
      stockQty: Number(product.stockQty).toString(),
    });
    setImagePreview(product.imageId);
    setDialogOpen(true);
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, imageId: url }));
      setImagePreview(url);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.stockQty) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          name: form.name,
          description: form.description,
          price: BigInt(Math.round(Number.parseFloat(form.price))),
          discountPercent: BigInt(
            Math.round(Number.parseFloat(form.discountPercent || "0")),
          ),
          category: form.category,
          imageId: form.imageId,
          stockQty: BigInt(Math.round(Number.parseFloat(form.stockQty))),
        });
        toast.success("Product updated!");
      } else {
        await createProduct.mutateAsync({
          name: form.name,
          description: form.description,
          price: BigInt(Math.round(Number.parseFloat(form.price))),
          discountPercent: BigInt(
            Math.round(Number.parseFloat(form.discountPercent || "0")),
          ),
          category: form.category,
          imageId: form.imageId,
          stockQty: BigInt(Math.round(Number.parseFloat(form.stockQty))),
        });
        toast.success("Product created!");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(`Failed: ${err}`);
    }
  };

  const handleToggle = async (product: Product) => {
    try {
      await toggleActive.mutateAsync({
        id: product.id,
        isActive: !product.isActive,
      });
      toast.success(
        `Product ${product.isActive ? "deactivated" : "activated"}`,
      );
    } catch {
      toast.error("Failed to toggle product");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Products
            </h1>
            <p className="text-muted-foreground mt-1">
              {(products ?? []).length} total products
            </p>
          </div>
          <Button
            data-ocid="admin.products.primary_button"
            onClick={openAdd}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="admin.products.search_input"
            className="pl-10"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div data-ocid="admin.products.loading_state" className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="admin.products.empty_state"
            className="text-center py-20"
          >
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-ocid="admin.products.table">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">
                      Product
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">
                      Category
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">
                      Price
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">
                      Stock
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((product, idx) => (
                    <motion.tr
                      key={product.id.toString()}
                      data-ocid={`admin.products.row.${idx + 1}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-muted/30"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                            {product.imageId ? (
                              <img
                                src={product.imageId}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://placehold.co/40x40/f97316/white?text=P";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                                No img
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm line-clamp-1">
                              {product.name}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-sm">
                          PKR {Number(product.price).toLocaleString()}
                        </div>
                        {Number(product.discountPercent) > 0 && (
                          <Badge className="text-xs bg-destructive/10 text-destructive">
                            {Number(product.discountPercent)}% off
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-sm font-medium ${Number(product.stockQty) < 10 ? "text-destructive" : "text-foreground"}`}
                        >
                          {Number(product.stockQty)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            data-ocid={`admin.products.switch.${idx + 1}`}
                            checked={product.isActive}
                            onCheckedChange={() => handleToggle(product)}
                          />
                          <span className="text-xs text-muted-foreground">
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            data-ocid={`admin.products.edit_button.${idx + 1}`}
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(product)}
                            className="w-8 h-8"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            data-ocid={`admin.products.toggle.${idx + 1}`}
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggle(product)}
                            className="w-8 h-8"
                          >
                            {product.isActive ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="admin.products.dialog"
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Product Image</Label>
              <div className="mt-2 flex gap-4 items-start">
                {imagePreview ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setForm((prev) => ({ ...prev, imageId: "" }));
                      }}
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1">
                  <Button
                    type="button"
                    data-ocid="admin.products.upload_button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? `Uploading ${progress}%...` : "Upload Image"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFile}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Or paste image URL:
                  </p>
                  <Input
                    data-ocid="admin.products.input"
                    placeholder="https://..."
                    value={form.imageId}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, imageId: e.target.value }));
                      setImagePreview(e.target.value);
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  data-ocid="admin.products.input"
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Premium Wireless Headphones"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  data-ocid="admin.products.textarea"
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Product description..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="price">Price (PKR) *</Label>
                <Input
                  data-ocid="admin.products.input"
                  id="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="e.g. 5000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  data-ocid="admin.products.input"
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={form.discountPercent}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      discountPercent: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  data-ocid="admin.products.input"
                  id="category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="e.g. Electronics"
                  required
                />
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  data-ocid="admin.products.input"
                  id="stock"
                  type="number"
                  min="0"
                  value={form.stockQty}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, stockQty: e.target.value }))
                  }
                  placeholder="e.g. 100"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                data-ocid="admin.products.cancel_button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="admin.products.submit_button"
                disabled={
                  createProduct.isPending ||
                  updateProduct.isPending ||
                  uploading
                }
                className="bg-primary hover:bg-primary/90"
              >
                {createProduct.isPending || updateProduct.isPending
                  ? "Saving..."
                  : editingProduct
                    ? "Update Product"
                    : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
