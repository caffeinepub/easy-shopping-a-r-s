import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogOut,
  Search,
  ShoppingCart,
  User,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { UserRole, useCart, useUserRole } from "../hooks/useQueries";

interface HeaderProps {
  onSearch?: (q: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const { data: cart } = useCart();
  const { data: role } = useUserRole();
  const [searchValue, setSearchValue] = useState("");

  const cartCount = cart?.reduce((s, i) => s + Number(i.quantity), 0) ?? 0;
  const isAdminSession = !!sessionStorage.getItem("adminPass");

  const handleLogout = async () => {
    await clear();
    qc.clear();
    navigate({ to: "/" });
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("adminPass");
    navigate({ to: "/" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
      {/* Top bar */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-1 flex items-center justify-between text-xs text-primary-foreground">
          <span>Free delivery on orders above PKR 1,000</span>
          <div className="flex items-center gap-4">
            <span>Customer Support: 0800-EASY</span>
            {isAdminSession ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  data-ocid="nav.admin.link"
                  className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  Admin Panel
                </Link>
                <span>·</span>
                <button
                  type="button"
                  data-ocid="nav.admin.logout.button"
                  onClick={handleAdminLogout}
                  className="hover:opacity-80 transition-opacity"
                >
                  Admin Logout
                </button>
              </div>
            ) : (
              <Link
                to="/admin-login"
                data-ocid="nav.adminlogin.link"
                className="hover:opacity-80 transition-opacity"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          data-ocid="nav.link"
          className="flex items-center shrink-0"
        >
          <img
            src="/assets/uploads/IMG_20260318_185950_387-1.webp"
            alt="Easy Shopping A.R.S"
            className="h-14 w-auto max-w-[160px] object-contain block rounded-md"
          />
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="nav.search_input"
              className="pl-10 rounded-full border-border"
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            data-ocid="nav.primary_button"
            className="rounded-full bg-primary hover:bg-primary/90"
          >
            Search
          </Button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart — only for non-admin buyers */}
          {isAuthenticated && role !== UserRole.admin && (
            <Link to="/cart" data-ocid="nav.cart.link">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {/* Admin dashboard shortcut (if admin session) */}
          {isAdminSession && (
            <Link to="/admin" data-ocid="nav.admindash.link">
              <Button variant="outline" size="sm" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          )}

          {/* Buyer Auth */}
          {!isAdminSession &&
            (isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button data-ocid="nav.toggle" variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent data-ocid="nav.dropdown_menu" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" data-ocid="nav.profile.link">
                      <UserCircle className="w-4 h-4 mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" data-ocid="nav.orders.link">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    data-ocid="nav.logout.button"
                    className="text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                data-ocid="nav.primary_button"
                onClick={() => login()}
                disabled={loginStatus === "logging-in"}
                className="bg-primary hover:bg-primary/90 rounded-full"
                size="sm"
              >
                {loginStatus === "logging-in"
                  ? "Logging in..."
                  : "Login / Sign Up"}
              </Button>
            ))}
        </div>
      </div>
    </header>
  );
}
