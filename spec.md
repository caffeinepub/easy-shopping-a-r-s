# Easy Shopping A.R.S

## Current State
The app has two reported broken features:
1. Cash on Delivery orders fail silently — the `placeOrder` Candid IDL declares zero arguments but the backend requires `(paymentMethod: Text, paymentScreenshotId: Text)`. The actor encodes no args, canister returns a Candid decode error, cart catch block shows generic toast.
2. Admin product photo update — image upload error details are swallowed, admin sees generic "Image upload failed" with no actionable info.

## Requested Changes (Diff)

### Add
- Specific error messages for image upload and product save failures in AdminProducts

### Modify
- `backend.did.js`: Fix `placeOrder` in both IDL service definitions from `IDL.Func([], [IDL.Nat], [])` to `IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], [])`
- `backend.did.d.ts`: Fix `'placeOrder'` from `ActorMethod<[], bigint>` to `ActorMethod<[string, string], bigint>`
- `backend.d.ts`: Fix `placeOrder()` to `placeOrder(paymentMethod: string, paymentScreenshotId: string): Promise<bigint>`
- `useQueries.ts`: Update `usePlaceOrder` to call `actor.placeOrder(paymentMethod, paymentScreenshotId)` with proper typing (no `as any` workaround needed after type fix)
- `AdminProducts.tsx`: Show actual error in `catch (err)` for both image upload and product save

### Remove
- Nothing removed

## Implementation Plan
1. Fix `placeOrder` IDL in `backend.did.js` (2 occurrences)
2. Fix `placeOrder` type in `backend.did.d.ts`
3. Fix `placeOrder` interface in `backend.d.ts`
4. Update `usePlaceOrder` in `useQueries.ts` to use proper typing
5. Add specific error messages in `AdminProducts.tsx` for upload and save failures
