# Easy Shopping A.R.S

## Current State
Admin product creation, update, toggle, and order management fail because the frontend mutations check for `identity` (Internet Identity) which was removed in favor of username/password login. Since `identity` is always null, all admin backend calls throw "Not connected" before reaching the backend.

Additionally, backend admin functions take an explicit `{ caller: Principal }` parameter which the frontend passes from `identity.getPrincipal()` — also broken for the same reason.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `main.mo`: Remove the redundant explicit `{ caller : Principal }` parameter from all admin functions; use the built-in `caller` from `shared { caller }` context for permission checks
- `backend.d.ts`: Update signatures to match new Motoko signatures (no extra caller arg)
- `useQueries.ts`: Remove `identity` requirement and `{ caller }` argument passing from all admin mutations

### Remove
- Nothing

## Implementation Plan
1. Update `main.mo` — remove `{ caller : Principal }` param from `createProduct`, `updateProduct`, `toggleProductActive`, `updateProductStock`, `getAllProductsAdmin`, `getAllOrders`, `updateOrderStatus`, `getInsights`
2. Update `backend.d.ts` — remove the `arg0: { caller: Principal }` from those function signatures
3. Update `useQueries.ts` — remove `identity` checks and `{ caller }` passing from admin mutations
