# Easy Shopping A.R.S

## Current State
The app has a full e-commerce platform with:
- Admin panel with product management, order management, payment QR settings
- Buyer features: browsing, cart, order placement with eSewa/Bank/COD payment options
- Buyers can upload payment screenshots for eSewa/Bank orders
- Admin can see order details (buyer name, address, phone, product, payment screenshot)
- Order status: admin can call `updateOrderStatus` to set any status
- Buyers can cancel Pending/Confirmed orders; admin receives cancellation notifications

## Requested Changes (Diff)

### Add
- "Confirm Payment" button in admin Orders panel for eSewa and Bank QR orders (only shown when status is "Pending")
- "Confirm Order" button in admin Orders panel for Cash on Delivery orders (only shown when status is "Pending")
- Buyer order tracking page shows updated status so buyer is notified when admin confirms

### Modify
- Admin Orders UI: Show payment method label clearly on each order card
- Admin Orders UI: For Pending eSewa/Bank orders, show "Confirm Payment" CTA prominently near screenshot
- Admin Orders UI: For Pending COD orders, show "Confirm Order" CTA
- After admin confirms: order status changes to "Confirmed", buyer sees "Confirmed" in their order tracking
- Order status flow enforced in UI: Pending → Confirmed → Shipped → Delivered

### Remove
- Nothing removed

## Implementation Plan
1. Update AdminOrders page: add "Confirm Payment" button for eSewa/Bank pending orders, "Confirm Order" for COD pending orders -- both call `updateOrderStatus(id, "Confirmed")`
2. Update buyer OrdersPage: show status clearly with color coding so buyer sees Confirmed/Shipped/Delivered updates
3. Ensure the existing `updateOrderStatus` backend function is used for the confirm actions
