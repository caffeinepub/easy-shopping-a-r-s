import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CartItem, Order, Product, UserProfile } from "../backend";
import { UserRole } from "../backend";
import { useActor } from "./useActor";
import { getAdminActor } from "./useAdminActor";
import { useInternetIdentity } from "./useInternetIdentity";

export type { Product, CartItem, Order, UserProfile };
export { UserRole };

// Extended profile type that includes phone (supported by backend but not in generated types)
export interface BuyerProfile extends UserProfile {
  phone: string;
}

export interface PaymentQRs {
  esewaQrImageId: string;
  bankQrImageId: string;
}

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useActiveProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["activeProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllProductsAdmin() {
  return useQuery<Product[]>({
    queryKey: ["allProductsAdmin"],
    queryFn: async () => {
      const actor = await getAdminActor();
      return actor.getAllProductsAdmin();
    },
    retry: 2,
    staleTime: 30000,
  });
}

export function useProduct(productId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Product | null>({
    queryKey: ["product", productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === null) return null;
      return actor.getProduct(productId);
    },
    enabled: !!actor && !isFetching && productId !== null,
  });
}

export function useCart() {
  const { actor, isFetching } = useActor();
  return useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      const actor = await getAdminActor();
      return actor.getAllOrders();
    },
    retry: 2,
    staleTime: 30000,
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const actor = await getAdminActor();
      return actor.getInsights();
    },
    retry: 2,
    staleTime: 30000,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<BuyerProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getCallerUserProfile();
      return result as BuyerProfile | null;
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: BuyerProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile as any);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useUpdateCartItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      newQuantity,
    }: { productId: bigint; newQuantity: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCartItem(productId, newQuantity);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveCartItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeCartItem(productId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearCart();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      paymentMethod,
      paymentScreenshotId,
    }: { paymentMethod: string; paymentScreenshotId: string }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).placeOrder(paymentMethod, paymentScreenshotId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: bigint;
      discountPercent: bigint;
      category: string;
      imageId: string;
      stockQty: bigint;
    }) => {
      // Always get a fresh actor with admin role registered before mutating
      const actor = await getAdminActor();
      return actor.createProduct({
        name: data.name,
        description: data.description,
        price: data.price,
        discountPercent: data.discountPercent,
        category: data.category,
        imageId: data.imageId,
        stockQty: data.stockQty,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allProductsAdmin"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      description: string;
      price: bigint;
      discountPercent: bigint;
      category: string;
      imageId: string;
      stockQty: bigint;
    }) => {
      const actor = await getAdminActor();
      return actor.updateProduct({
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        discountPercent: data.discountPercent,
        category: data.category,
        imageId: data.imageId,
        stockQty: data.stockQty,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allProductsAdmin"] }),
  });
}

export function useToggleProductActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: bigint; isActive: boolean }) => {
      const actor = await getAdminActor();
      return actor.toggleProductActive(id, isActive);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allProductsAdmin"] }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: bigint; status: string }) => {
      const actor = await getAdminActor();
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allOrders"] }),
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      role,
    }: {
      principal: import("@icp-sdk/core/principal").Principal;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignCallerUserRole(principal, role);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userRole"] });
      qc.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function usePaymentQRs() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentQRs>({
    queryKey: ["paymentQRs"],
    queryFn: async () => {
      if (!actor) return { esewaQrImageId: "", bankQrImageId: "" };
      try {
        const result = await actor.getPaymentQRs();
        return result as PaymentQRs;
      } catch {
        return { esewaQrImageId: "", bankQrImageId: "" };
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetPaymentQRs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      esewaQrImageId,
      bankQrImageId,
    }: { esewaQrImageId: string; bankQrImageId: string }) => {
      const actor = await getAdminActor();
      return actor.setPaymentQRs(esewaQrImageId, bankQrImageId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paymentQRs"] }),
  });
}
