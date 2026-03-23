# Easy Shopping A.R.S

## Current State
- Admin orders page shows buyer name, address, phone but only shows product IDs for order items
- Cart payment flow shows QR code but does not allow buyers to upload a payment screenshot
- Order type has no payment method or screenshot fields

## Requested Changes (Diff)

### Add
- `paymentMethod` and `paymentScreenshotId` fields to the Order type in backend
- `placeOrder` now accepts `paymentMethod: Text` and `paymentScreenshotId: Text` parameters
- In CartPage QR modal: file upload input for payment screenshot (eSewa and Bank payment methods)
- In AdminOrders: show product name and image thumbnail for each order item (fetched from product list)
- In AdminOrders: show payment method badge and payment screenshot (if uploaded) on each order card

### Modify
- `placeOrder` backend function signature: add paymentMethod and paymentScreenshotId params
- `usePlaceOrder` hook: accept and pass through paymentMethod and paymentScreenshotId
- CartPage: pass paymentMethod and screenshot when confirming order
- AdminOrders: fetch products to resolve names/images for order items

### Remove
- Nothing removed

## Implementation Plan
1. Update backend Order type and placeOrder signature
2. Update useQueries.ts usePlaceOrder hook
3. Update CartPage.tsx to add screenshot upload in QR modal
4. Update AdminOrders.tsx to show product name/image and payment screenshot
