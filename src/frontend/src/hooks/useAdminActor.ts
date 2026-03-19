import { useQuery } from "@tanstack/react-query";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

export const ADMIN_PASSWORD = "A.R.S@12345";

/**
 * Creates a fresh actor and registers the admin role.
 * Call this before any admin mutation to ensure the backend recognises the caller.
 */
export async function getAdminActor(): Promise<backendInterface> {
  const actor = await createActorWithConfig();
  try {
    await actor.loginAsAdmin(ADMIN_PASSWORD);
  } catch {
    // Best-effort — don't block if backend call fails
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
  });

  return { actor: query.data ?? null, isFetching: query.isFetching };
}
