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
export interface backendInterface {
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createProduct(newProduct: ProductInput): Promise<bigint>;
    getActiveProducts(): Promise<Array<Product>>;
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
    getProduct(productId: bigint): Promise<Product>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(): Promise<bigint>;
    removeCartItem(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleProductActive(id: bigint, isActive: boolean): Promise<void>;
    updateCartItem(productId: bigint, newQuantity: bigint): Promise<void>;
    updateOrderStatus(orderId: bigint, newStatus: string): Promise<void>;
    updateProduct(productUpdate: ProductUpdateInput): Promise<void>;
    updateProductStock(id: bigint, newQty: bigint): Promise<void>;
}
