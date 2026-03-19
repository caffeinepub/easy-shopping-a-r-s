import { useQuery } from "@tanstack/react-query";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

const ADMIN_PASSWORD = "A.R.S@12345";

export function useAdminActor(): {
  actor: backendInterface | null;
  isFetching: boolean;
} {
  const query = useQuery<backendInterface>({
    queryKey: ["adminActor"],
    queryFn: async () => {
      // Use default anonymous actor - no custom identity needed
      // The backend grants admin role to the caller's principal after loginAsAdmin
      const actor = await createActorWithConfig();
      // Re-register admin role on every actor creation (handles page refreshes)
      try {
        await actor.loginAsAdmin(ADMIN_PASSWORD);
      } catch {
        // Ignore errors — re-registration is best-effort
      }
      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
  });

  return { actor: query.data ?? null, isFetching: query.isFetching };
}
