import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Shield, Truck, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { useActiveProducts } from "../hooks/useQueries";

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports",
  "Beauty",
  "Books",
  "Toys",
];
const SKELETON_KEYS = [
  "sk0",
  "sk1",
  "sk2",
  "sk3",
  "sk4",
  "sk5",
  "sk6",
  "sk7",
  "sk8",
  "sk9",
];

export default function HomePage() {
  const { data: products, isLoading } = useActiveProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onSearch={setSearchQuery} />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative overflow-hidden">
          <img
            src="/assets/generated/hero-banner.dim_1200x400.jpg"
            alt="Easy Shopping A.R.S - Shop Everything"
            className="w-full h-48 md:h-72 lg:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent flex items-center">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="bg-primary text-primary-foreground mb-3">
                  New Arrivals
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
                  Easy Shopping
                  <span className="block text-black">A.R.S</span>
                </h1>
                <p className="text-white/80 mt-2 text-sm md:text-base max-w-xs">
                  Discover amazing deals on thousands of products
                </p>
                <Button
                  className="mt-4 bg-primary hover:bg-primary/90 gap-2"
                  data-ocid="hero.primary_button"
                >
                  Shop Now <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-secondary/50 border-y border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Truck className="w-5 h-5 text-primary" />
                <span className="hidden sm:inline font-medium">
                  Free Delivery
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Shield className="w-5 h-5 text-primary" />
                <span className="hidden sm:inline font-medium">
                  Secure Payment
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Zap className="w-5 h-5 text-primary" />
                <span className="hidden sm:inline font-medium">
                  Fast Checkout
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="container mx-auto px-4 py-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                data-ocid="category.tab"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {selectedCategory === "All" ? "All Products" : selectedCategory}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filtered.length} items
            </span>
          </div>

          {isLoading ? (
            <div
              data-ocid="products.loading_state"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {SKELETON_KEYS.map((skId) => (
                <div
                  key={skId}
                  className="bg-white rounded-xl overflow-hidden shadow-card"
                >
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div data-ocid="products.empty_state" className="text-center py-20">
              <div className="text-5xl mb-4">🛍️</div>
              <h3 className="text-xl font-semibold text-foreground">
                No products found
              </h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : "No products in this category yet"}
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id.toString()}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <ProductCard product={product} index={i + 1} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Down Side Background Banner */}
        <section className="w-full">
          <img
            src="/assets/uploads/IMG-20260318-WA0106-2-1.jpg"
            alt="A.R.S Easy Shopping Delivery"
            className="w-full object-cover max-h-72 md:max-h-96"
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
