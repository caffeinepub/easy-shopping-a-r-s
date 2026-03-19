# Easy Shopping A.R.S

## Current State
Full e-commerce app with admin/buyer flow. Cart, orders, products, and admin panel are functional. Payments are COD only.

## Requested Changes (Diff)

### Add
- Backend: `setPaymentQRs(esewaQrImageId, bankQrImageId)` - admin only, stores QR image IDs
- Backend: `getPaymentQRs()` - public query, returns current QR image IDs
- Admin panel: new "Payment Settings" page at `/admin/payments` where admin can upload eSewa QR and Bank Account QR images using blob-storage
- Buyer checkout: before placing order, show payment method selection (eSewa QR / Bank Transfer QR / Cash on Delivery). If eSewa or Bank is chosen, display the respective QR image for the buyer to scan
- Order placed with a payment method note (stored in order or just in frontend flow)
- Admin quick action card on dashboard to go to Payment Settings

### Modify
- App.tsx: add `/admin/payments` route
- AdminDashboard: add Payment Settings quick action card
- CartPage: replace single "Place Order" button with payment method selection flow
- useQueries.ts: add `usePaymentQRs`, `useSetPaymentQRs` hooks

### Remove
- Nothing removed

## Implementation Plan
1. Add `setPaymentQRs` and `getPaymentQRs` to Motoko backend
2. Add AdminPayments page (upload eSewa QR + Bank QR via blob-storage uploader)
3. Update CartPage with 3-step payment flow: select method → view QR (if applicable) → confirm order
4. Add hooks to useQueries.ts
5. Update App.tsx routes
6. Update AdminDashboard quick actions
