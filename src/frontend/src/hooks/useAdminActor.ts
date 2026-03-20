import { useQuery } from "@tanstack/react-query";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

export const ADMIN_PASSWORD = "A.R.S@12345";

/**
 * Creates a fresh actor and registers the admin principal in stable memory.
 * ALWAYS call this before any admin mutation.
 * Throws if login fails so the user sees an error instead of a silent permission denied.
 */
export async function getAdminActor(): Promise<backendInterface> {
  const actor = await createActorWithConfig();
  let success = false;
  try {
    success = await actor.loginAsAdmin(ADMIN_PASSWORD);
  } catch (err) {
    throw new Error(`Admin authentication failed: ${err}`);
  }
  if (!success) {
    throw new Error("Admin authentication failed: incorrect password");
  }
  return actor;
}

export function useAdminActor(): {
  actor: backendInterface | null;
  isFetching: boolean;
} {
  const query = useQuery<backendInterface>({
    queryKey: ["adminActor"],
    queryFn: () => getAdminActor(),
    // Re-register every 2 minutes so canister upgrades don't break admin actions
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });

  return { actor: query.data ?? null, isFetching: query.isFetching };
}
