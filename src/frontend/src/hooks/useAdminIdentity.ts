import { Ed25519KeyIdentity } from "@dfinity/identity";

const ADMIN_IDENTITY_KEY = "easyshop_admin_identity_secret";

/**
 * Gets or creates a persistent Ed25519 identity for the admin.
 * The key is stored in localStorage so the admin keeps the same principal
 * across browser sessions, and the backend remembers their admin role.
 */
export function getOrCreateAdminIdentity(): Ed25519KeyIdentity {
  try {
    const stored = localStorage.getItem(ADMIN_IDENTITY_KEY);
    if (stored) {
      const arr = JSON.parse(stored) as number[];
      const secretKey = new Uint8Array(arr);
      return Ed25519KeyIdentity.fromSecretKey(secretKey);
    }
  } catch {
    // If parsing fails, generate a new one
  }
  const identity = Ed25519KeyIdentity.generate();
  const keyPair = identity.getKeyPair();
  const rawSecretKey = keyPair.secretKey;
  const secretBytes =
    rawSecretKey instanceof Uint8Array
      ? rawSecretKey
      : new Uint8Array(rawSecretKey as unknown as ArrayBuffer);
  localStorage.setItem(
    ADMIN_IDENTITY_KEY,
    JSON.stringify(Array.from(secretBytes)),
  );
  return identity;
}

export function clearAdminIdentity(): void {
  localStorage.removeItem(ADMIN_IDENTITY_KEY);
}

export function hasAdminIdentity(): boolean {
  return !!localStorage.getItem(ADMIN_IDENTITY_KEY);
}
