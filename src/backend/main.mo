import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Kept for upgrade compatibility only - no longer used
  stable var ADMIN_PASSWORD : Text = "";
  stable var stableAdminPrincipal : ?Principal = null;

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    discountPercent : Nat;
    category : Text;
    imageId : Text;
    stockQty : Nat;
    isActive : Bool;
    createdAt : Int;
  };
  module Product { public func compare(prod1 : Product, prod2 : Product) : Order.Order { Nat.compare(prod1.id, prod2.id) } };

  type ProductInput = {
    name : Text;
    description : Text;
    price : Nat;
    discountPercent : Nat;
    category : Text;
    imageId : Text;
    stockQty : Nat;
  };

  type ProductUpdateInput = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    discountPercent : Nat;
    category : Text;
    imageId : Text;
    stockQty : Nat;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
    priceAtOrder : Nat;
  };

  public type Order = {
    id : Nat;
    buyerId : Principal;
    items : [CartItem];
    totalAmount : Nat;
    status : Text;
    createdAt : Int;
  };

  type UserProfileV1 = {
    name : Text;
    email : Text;
    address : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    address : Text;
    phone : Text;
  };

  public type PaymentQRs = {
    esewaQrImageId : Text;
    bankQrImageId : Text;
  };

  var nextProductId = 1;
  var nextOrderId = 1;
  // Stable so payment QR codes persist across upgrades
  stable var paymentQRs : PaymentQRs = { esewaQrImageId = ""; bankQrImageId = "" };

  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Principal, List.List<CartItem>>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfileV1>();
  let userProfilesV2 = Map.empty<Principal, UserProfile>();

  func requireLoggedIn(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("You must be logged in to perform this action");
    };
  };

  public shared func setPaymentQRs(esewaQrImageId : Text, bankQrImageId : Text) : async () {
    paymentQRs := { esewaQrImageId; bankQrImageId };
  };

  public query func getPaymentQRs() : async PaymentQRs {
    paymentQRs;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireLoggedIn(caller);
    switch (userProfilesV2.get(caller)) {
      case (?profile) { ?profile };
      case (null) {
        switch (userProfiles.get(caller)) {
          case (null) { null };
          case (?v1) {
            ?{ name = v1.name; email = v1.email; address = v1.address; phone = "" };
          };
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    switch (userProfilesV2.get(user)) {
      case (?profile) { ?profile };
      case (null) {
        switch (userProfiles.get(user)) {
          case (null) { null };
          case (?v1) {
            ?{ name = v1.name; email = v1.email; address = v1.address; phone = "" };
          };
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireLoggedIn(caller);
    userProfilesV2.add(caller, profile);
  };

  public query func getProduct(productId : Nat) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query func getActiveProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.isActive });
  };

  public query func getAllProductsAdmin() : async [Product] {
    products.values().toArray();
  };

  public shared func createProduct(newProduct : ProductInput) : async Nat {
    let product : Product = {
      id = nextProductId;
      name = newProduct.name;
      description = newProduct.description;
      price = newProduct.price;
      discountPercent = newProduct.discountPercent;
      category = newProduct.category;
      imageId = newProduct.imageId;
      stockQty = newProduct.stockQty;
      isActive = true;
      createdAt = Time.now();
    };
    nextProductId += 1;
    products.add(product.id, product);
    product.id;
  };

  public shared func updateProduct(productUpdate : ProductUpdateInput) : async () {
    let currentProduct = switch (products.get(productUpdate.id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
    let updatedProduct : Product = {
      currentProduct with
      name = productUpdate.name;
      description = productUpdate.description;
      price = productUpdate.price;
      discountPercent = productUpdate.discountPercent;
      category = productUpdate.category;
      imageId = productUpdate.imageId;
      stockQty = productUpdate.stockQty;
    };
    products.add(productUpdate.id, updatedProduct);
  };

  public shared func toggleProductActive(id : Nat, isActive : Bool) : async () {
    let product = switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?prod) { prod };
    };
    let updatedProduct : Product = { product with isActive };
    products.add(id, updatedProduct);
  };

  public shared func updateProductStock(id : Nat, newQty : Nat) : async () {
    let product = switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?prod) { prod };
    };
    let updatedProduct : Product = { product with stockQty = newQty };
    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    requireLoggedIn(caller);
    if (quantity == 0) { Runtime.trap("Quantity must be greater than 0") };
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?prod) { prod };
    };
    if (not product.isActive) { Runtime.trap("Product not active") };
    if (quantity > product.stockQty) { Runtime.trap("Quantity exceeds available stock") };
    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };
    var updatedQuantity = quantity;
    let newCartItems = List.empty<CartItem>();
    cart.values().forEach(
      func(item) {
        if (item.productId == productId) { updatedQuantity += item.quantity } else {
          newCartItems.add(item);
        };
      }
    );
    if (updatedQuantity > product.stockQty) { Runtime.trap("Total quantity exceeds available stock") };
    newCartItems.add({ productId; quantity = updatedQuantity; priceAtOrder = product.price });
    carts.add(caller, newCartItems);
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, newQuantity : Nat) : async () {
    requireLoggedIn(caller);
    if (newQuantity == 0) { Runtime.trap("Quantity must be greater than 0") };
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?prod) { prod };
    };
    if (not product.isActive) { Runtime.trap("Product not active") };
    if (newQuantity > product.stockQty) { Runtime.trap("Quantity exceeds available stock") };
    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };
    let updatedCart = List.empty<CartItem>();
    cart.values().forEach(
      func(item) {
        if (item.productId == productId) {
          updatedCart.add({ productId; quantity = newQuantity; priceAtOrder = product.price });
        } else { updatedCart.add(item) };
      }
    );
    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeCartItem(productId : Nat) : async () {
    requireLoggedIn(caller);
    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };
    let updatedCart = List.empty<CartItem>();
    cart.values().forEach(
      func(item) {
        if (item.productId != productId) { updatedCart.add(item) };
      }
    );
    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    requireLoggedIn(caller);
    carts.add(caller, List.empty<CartItem>());
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    requireLoggedIn(caller);
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func placeOrder() : async Nat {
    requireLoggedIn(caller);
    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };
    if (cart.size() == 0) { Runtime.trap("Cart is empty") };
    for (item in cart.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found: " # item.productId.toText()) };
        case (?prod) { prod };
      };
      if (not product.isActive) { Runtime.trap("Product not active: " # item.productId.toText()) };
      if (item.quantity > product.stockQty) { Runtime.trap("Insufficient stock for product: " # item.productId.toText()) };
    };
    var totalAmount = 0;
    let validatedItems = cart.map<CartItem, CartItem>(
      func(item) {
        let product = switch (products.get(item.productId)) {
          case (null) { Runtime.trap("Product not found: " # item.productId.toText()) };
          case (?prod) { prod };
        };
        let discountedPrice = product.price * (100 - product.discountPercent) / 100;
        totalAmount += discountedPrice * item.quantity;
        { productId = item.productId; quantity = item.quantity; priceAtOrder = discountedPrice };
      }
    );
    let order : Order = {
      id = nextOrderId;
      buyerId = caller;
      items = validatedItems.toArray();
      totalAmount;
      status = "Pending";
      createdAt = Time.now();
    };
    orders.add(nextOrderId, order);
    nextOrderId += 1;
    for (item in validatedItems.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found: " # item.productId.toText()) };
        case (?prod) { prod };
      };
      let updatedProduct : Product = { product with stockQty = product.stockQty - item.quantity };
      products.add(item.productId, updatedProduct);
    };
    carts.add(caller, List.empty<CartItem>());
    order.id;
  };

  public shared func updateOrderStatus(orderId : Nat, newStatus : Text) : async () {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?ord) { ord };
    };
    let updatedOrder : Order = { order with status = newStatus };
    orders.add(orderId, updatedOrder);
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    requireLoggedIn(caller);
    orders.values().toArray().filter(func(o) { o.buyerId == caller });
  };

  public query func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public query func getInsights() : async {
    totalOrders : Nat;
    pendingOrders : Nat;
    processingOrders : Nat;
    completedOrders : Nat;
    cancelledOrders : Nat;
  } {
    let allOrders = orders.values().toArray();
    let totalOrders = allOrders.size();
    let pendingOrders = allOrders.filter(func(order) { order.status == "Pending" }).size();
    let processingOrders = allOrders.filter(func(order) { order.status == "Processing" }).size();
    let completedOrders = allOrders.filter(func(order) { order.status == "Completed" }).size();
    let cancelledOrders = allOrders.filter(func(order) { order.status == "Cancelled" }).size();
    { totalOrders; pendingOrders; processingOrders; completedOrders; cancelledOrders };
  };
};
