import { useQuery } from "@tanstack/react-query";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { patchAdminBackend } from "./useAdminBackend";
import { getOrCreateAdminIdentity } from "./useAdminIdentity";

export function useAdminActor(): {
  actor: backendInterface | null;
  isFetching: boolean;
} {
  const query = useQuery<backendInterface>({
    queryKey: ["adminActor"],
    queryFn: async () => {
      const adminIdentity = getOrCreateAdminIdentity();
      const rawActor = await createActorWithConfig({
        agentOptions: { identity: adminIdentity },
      });
      return patchAdminBackend(rawActor, adminIdentity.getPrincipal());
    },
    staleTime: Number.POSITIVE_INFINITY,
  });

  return { actor: query.data ?? null, isFetching: query.isFetching };
}
