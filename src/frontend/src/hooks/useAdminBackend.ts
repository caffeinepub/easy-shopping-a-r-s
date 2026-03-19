/**
 * Admin backend patch.
 * The deployed canister requires an explicit caller Principal as first arg
 * for all admin-only functions. This wrapper injects the caller automatically.
 */
import type { Principal } from "@icp-sdk/core/principal";
import type {
  ProductInput,
  ProductUpdateInput,
  backendInterface,
} from "../backend";

export function patchAdminBackend(
  backend: backendInterface,
  callerPrincipal: Principal,
): backendInterface {
  const caller = { caller: callerPrincipal };
  // Access the raw underlying ICP actor to call methods with explicit caller arg
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawActor = (backend as any).actor;

  return {
    ...backend,
    createProduct: async (input: ProductInput) => {
      return rawActor.createProduct(caller, input) as Promise<bigint>;
    },
    getAllProductsAdmin: async () => {
      return rawActor.getAllProductsAdmin(caller) as Promise<
        import("../backend").Product[]
      >;
    },
    getAllOrders: async () => {
      return rawActor.getAllOrders(caller) as Promise<
        import("../backend").Order[]
      >;
    },
    getInsights: async () => {
      return rawActor.getInsights(caller) as Promise<{
        cancelledOrders: bigint;
        totalOrders: bigint;
        pendingOrders: bigint;
        processingOrders: bigint;
        completedOrders: bigint;
      }>;
    },
    toggleProductActive: async (id: bigint, isActive: boolean) => {
      return rawActor.toggleProductActive(
        caller,
        id,
        isActive,
      ) as Promise<void>;
    },
    updateOrderStatus: async (orderId: bigint, newStatus: string) => {
      return rawActor.updateOrderStatus(
        caller,
        orderId,
        newStatus,
      ) as Promise<void>;
    },
    updateProduct: async (input: ProductUpdateInput) => {
      return rawActor.updateProduct(caller, input) as Promise<void>;
    },
    updateProductStock: async (id: bigint, newQty: bigint) => {
      return rawActor.updateProductStock(caller, id, newQty) as Promise<void>;
    },
  } as backendInterface;
}
