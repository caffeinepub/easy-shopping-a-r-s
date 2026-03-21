import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

let adminActorSingleton: backendInterface | null = null;

export async function getAdminActor(): Promise<backendInterface> {
  if (adminActorSingleton) return adminActorSingleton;
  adminActorSingleton = await createActorWithConfig();
  return adminActorSingleton;
}

export function resetAdminActor() {
  adminActorSingleton = null;
}
