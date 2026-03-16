import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CartItem, Order, Product, UserProfile } from "../backend";
import { UserRole } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export type { Product, CartItem, Order, UserProfile };
export { UserRole };

// Extended profile type that includes phone (supported by backend but not in generated types)
export interface BuyerProfile extends UserProfile {
  phone: string;
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
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const caller = identity.getPrincipal();
      return actor.getAllOrders({ caller });
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useInsights() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      if (!actor || !identity) return null;
      const caller = identity.getPrincipal();
      return actor.getInsights({ caller });
    },
    enabled: !!actor && !isFetching && !!identity,
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
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
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
      if (!actor || !identity) throw new Error("Not connected");
      const caller = identity.getPrincipal();
      return actor.createProduct(
        { caller },
        {
          name: data.name,
          description: data.description,
          price: data.price,
          discountPercent: data.discountPercent,
          category: data.category,
          imageId: data.imageId,
          stockQty: data.stockQty,
        },
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeProducts"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
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
      if (!actor || !identity) throw new Error("Not connected");
      const caller = identity.getPrincipal();
      return actor.updateProduct(
        { caller },
        {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          discountPercent: data.discountPercent,
          category: data.category,
          imageId: data.imageId,
          stockQty: data.stockQty,
        },
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeProducts"] }),
  });
}

export function useToggleProductActive() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: bigint; isActive: boolean }) => {
      if (!actor || !identity) throw new Error("Not connected");
      const caller = identity.getPrincipal();
      return actor.toggleProductActive({ caller }, id, isActive);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeProducts"] }),
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: bigint; status: string }) => {
      if (!actor || !identity) throw new Error("Not connected");
      const caller = identity.getPrincipal();
      return actor.updateOrderStatus({ caller }, orderId, status);
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
