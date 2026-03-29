import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    stockQty: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    discountPercent: bigint;
    isActive: boolean;
    category: string;
    imageId: string;
    price: bigint;
}
export interface ProductInput {
    stockQty: bigint;
    name: string;
    description: string;
    discountPercent: bigint;
    category: string;
    imageId: string;
    price: bigint;
}
export interface ProductUpdateInput {
    id: bigint;
    stockQty: bigint;
    name: string;
    description: string;
    discountPercent: bigint;
    category: string;
    imageId: string;
    price: bigint;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
    priceAtOrder: bigint;
}
export interface Order {
    id: bigint;
    status: string;
    createdAt: bigint;
    totalAmount: bigint;
    buyerId: Principal;
    items: Array<CartItem>;
    paymentMethod: string;
    paymentScreenshotId: string;
}
export interface CancelNotification {
    id: bigint;
    orderId: bigint;
    buyerPrincipal: string;
    createdAt: bigint;
    isRead: boolean;
}
export interface ReturnNotification {
    id: bigint;
    orderId: bigint;
    buyerPrincipal: string;
    reason: string;
    createdAt: bigint;
    isRead: boolean;
    status: string;
}
export interface UserProfile {
    name: string;
    email: string;
    address: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface PaymentQRs {
    esewaQrImageId: string;
    bankQrImageId: string;
}
export interface backendInterface {
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelOrder(orderId: bigint): Promise<void>;
    clearCart(): Promise<void>;
    createProduct(newProduct: ProductInput): Promise<bigint>;
    getActiveProducts(): Promise<Array<Product>>;
    getAdminCancelNotifications(): Promise<Array<CancelNotification>>;
    getAdminReturnNotifications(): Promise<Array<ReturnNotification>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProductsAdmin(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getInsights(): Promise<{
        cancelledOrders: bigint;
        totalOrders: bigint;
        pendingOrders: bigint;
        processingOrders: bigint;
        completedOrders: bigint;
    }>;
    getMyOrders(): Promise<Array<Order>>;
    getPaymentQRs(): Promise<PaymentQRs>;
    getProduct(productId: bigint): Promise<Product>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    handleReturnRequest(notifId: bigint, approved: boolean): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markCancelNotificationRead(id: bigint): Promise<void>;
    markReturnNotificationRead(id: bigint): Promise<void>;
    placeOrder(paymentMethod: string, paymentScreenshotId: string): Promise<bigint>;
    removeCartItem(productId: bigint): Promise<void>;
    requestReturn(orderId: bigint, reason: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPaymentQRs(esewaQrImageId: string, bankQrImageId: string): Promise<void>;
    toggleProductActive(id: bigint, isActive: boolean): Promise<void>;
    updateCartItem(productId: bigint, newQuantity: bigint): Promise<void>;
    updateOrderStatus(orderId: bigint, newStatus: string): Promise<void>;
    updateProduct(productUpdate: ProductUpdateInput): Promise<void>;
    updateProductStock(id: bigint, newQty: bigint): Promise<void>;
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    _caffeineStorageCreateCertificate(blobHash: string): Promise<{ method: string; blob_hash: string }>;
}
