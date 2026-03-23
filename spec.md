# Easy Shopping A.R.S

## Current State
Buyers can place orders and view their order history. Admins can view and update order statuses. There is no way for buyers to cancel orders, and no admin notification system exists.

## Requested Changes (Diff)

### Add
- `cancelOrder(orderId)` backend function: buyer can cancel their own order only if status is Pending or Confirmed
- `CancelNotification` type and stable storage in backend
- `getAdminCancelNotifications()` backend query for admin to fetch cancel notifications
- `markCancelNotificationRead(id)` backend function to mark a notification as read
- Cancel button on OrdersPage for buyer orders with status Pending or Confirmed
- Confirmation dialog before cancellation
- Admin notification bell in AdminLayout header showing unread cancel notifications
- Notifications panel/dropdown showing which orders were cancelled by buyers

### Modify
- OrdersPage: show cancel button on orders that are Pending or Confirmed
- AdminLayout: add notification bell icon with unread count badge
- AdminOrders: highlight recently cancelled orders

### Remove
- Nothing removed

## Implementation Plan
1. Add `CancelNotification` type to backend with fields: id, orderId, buyerName, createdAt, isRead
2. Add `cancelOrder` function: verifies caller owns the order, status is Pending or Confirmed, sets status to Cancelled, creates a notification
3. Add `getAdminCancelNotifications` and `markCancelNotificationRead` backend functions
4. Add `useCancelOrder`, `useAdminCancelNotifications`, `useMarkCancelNotificationRead` hooks to useQueries.ts
5. Update OrdersPage to show a Cancel button with confirmation for Pending/Confirmed orders
6. Update AdminLayout to show a notification bell with unread badge; clicking shows notification list
