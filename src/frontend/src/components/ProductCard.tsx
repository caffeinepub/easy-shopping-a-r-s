import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { Product } from "../hooks/useQueries";
import { useAddToCart } from "../hooks/useQueries";

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const addToCart = useAddToCart();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const price = Number(product.price);
  const discount = Number(product.discountPercent);
  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
  const hasDiscount = discount > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error("Please login to add items to cart");
      navigate({ to: "/" });
      return;
    }
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1n });
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id.toString() }}
      data-ocid={`product.item.${index}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {product.imageId ? (
          <img
            src={product.imageId}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/400x400/f97316/white?text=Product";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-accent/20 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-primary/30" />
          </div>
        )}
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold">
            -{discount}%
          </Badge>
        )}
        {!product.isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="secondary">Out of Stock</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <Badge
          variant="outline"
          className="text-xs mb-2 text-muted-foreground border-border"
        >
          {product.category}
        </Badge>
        <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating placeholder */}
        <div className="flex items-center gap-1 mt-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3 h-3 ${s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
            />
          ))}
          <span className="text-xs text-muted-foreground">(24)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary text-base">
            PKR {discountedPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              PKR {price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <Button
          data-ocid={`product.add_button.${index}`}
          onClick={handleAddToCart}
          disabled={
            addToCart.isPending ||
            !product.isActive ||
            Number(product.stockQty) === 0
          }
          className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8"
          size="sm"
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          {Number(product.stockQty) === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </Link>
  );
}
